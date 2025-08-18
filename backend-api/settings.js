const express = require('express');
const router = express.Router();

const { authenticate } = require('./authenticate');
const { logUserActivity } = require('./auditlogger');
const bcrypt = require('bcrypt');

const pool = require('./db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

function tSettings(accountid) {
  if (!/^[a-z0-9_]+$/i.test(accountid)) throw new Error('Bad accountid');
  return `${accountid}_settings`;
}

async function ensureSingletonRow(client, table) {
  await client.query(
    `INSERT INTO ${table} (settings)
     SELECT '{}'::jsonb
     WHERE NOT EXISTS (SELECT 1 FROM ${table});`
  );
}

router.get('/dropdown', authenticate, async (req, res) => {
  const { tabname } = req.query;
  const { accountid } = req.user;

  if (!tabname) return res.status(400).json({ error: 'tabname is required' });

  const tableName = `${accountid}_dropdown`;

  try {
    const result = await pool.query(
      `SELECT settings FROM ${tableName} WHERE tabname = $1`,
      [tabname]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No settings found for this tab' });
    }

    res.json({ settings: result.rows[0].settings });
  } catch (err) {
    console.error('Error fetching dropdown settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/dropdown', authenticate,checkAccess('Settings'), async (req, res) => {
  const { tabname, settings } = req.body;
  const { accountid } = req.user;

  if (!tabname || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'tabname and settings array are required' });
  }

  const tableName = `${accountid}_dropdown`;

  try {
    await pool.query(
      `UPDATE ${tableName} SET settings = $1 WHERE tabname = $2`,
      [JSON.stringify(settings), tabname]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating dropdown settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/dropdown/update', authenticate, checkAccess('Settings'),async (req, res) => {
  const { tabname, settings } = req.body;
  const { accountid } = req.user;

  if (!tabname || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'tabname and valid settings array are required' });
  }

  const tableName = `${accountid}_dropdown`;

  try {
    // Overwrite the full settings array for that tab
    await pool.query(
      `UPDATE ${tableName} SET settings = $1 WHERE tabname = $2`,
      [JSON.stringify(settings), tabname]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Append one audit item to a JSON array path inside settings
async function appendAudit(client, table, pathArr, entryObj) {
  await client.query(
    `UPDATE ${table}
       SET settings = jsonb_set(
         settings,
         $1::text[],
         COALESCE(settings #> $1::text[], '[]'::jsonb) || jsonb_build_array($2::jsonb),
         true
       );`,
    [pathArr, JSON.stringify(entryObj)]
  );
}

/**
 * 1) Get Output_Grades (all or active-only)
 *    GET /api/settings/output-grades?activeOnly=true|false   (default true)
 */
router.get('/output-grades', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = tSettings(accountid);
  const activeOnly = String(req.query.activeOnly ?? 'true').toLowerCase() === 'true';

  try {
    const { rows } = await pool.query(
      `
      WITH og AS (
        SELECT COALESCE(settings->'Output_Grades','{}'::jsonb) AS og
        FROM ${table} LIMIT 1
      )
      SELECT CASE WHEN $1::bool THEN
        COALESCE(
          (SELECT jsonb_object_agg(k, v)
           FROM jsonb_each_text((SELECT og FROM og)) AS e(k,v)
           WHERE v = 'Active'),
          '{}'::jsonb
        )
      ELSE
        (SELECT og FROM og)
      END AS result;
      `,
      [activeOnly]
    );
    res.json({ success: true, data: rows[0].result });
  } catch (e) {
    console.error('GET /output-grades', e);
    res.status(500).json({ success: false, error: 'Failed to fetch Output_Grades' });
  }
});

/**
 * 2) Insert new grade (default Active; idempotent)
 *    POST /api/settings/output-grades
 *    Body: { "grade": "3x4", "remarks": "..." }
 */
// routes/settings.output-grades.js



// --- route ----------------------------------------------
router.post('/output-grades', authenticate, async (req, res) => {
  
    // --- utils (inline, no external helpers) ----------------
    function assertSafeIdent(s) {
      if (!/^[a-zA-Z0-9_]+$/.test(s || '')) throw new Error('unsafe ident');
    }
    function settingsTable(accountid) {
      assertSafeIdent(accountid);
      return `${accountid}_settings`;
    }
    /** Ensure the table has exactly one row (or at least one).
     *  No assumption of an id column; inserts a default row if table is empty. */
    async function ensureSingletonRow(client, table) {
      await client.query(`
        INSERT INTO ${table} (settings)
        SELECT '{}'::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM ${table});
      `);
    }
  
  const { accountid, userid } = req.user || {};
  if (!accountid) return res.status(400).json({ success: false, error: 'Missing account id' });

  let table;
  try { table = settingsTable(accountid); } catch {
    return res.status(400).json({ success: false, error: 'Invalid account id' });
  }

  const { grade, remarks } = req.body || {};
  if (typeof grade !== 'string' || !grade.trim()) {
    return res.status(400).json({ success: false, error: 'grade must be a non-empty string' });
  }
  const g = grade.trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Make sure a single settings row exists
    await ensureSingletonRow(client, table);

    // Lock the (single) row and check for duplicate
    const dup = await client.query(
      `SELECT settings #>> $1::text[] AS existing
         FROM ${table}
        FOR UPDATE
        LIMIT 1;`,
      [[ 'Output_Grades', g ]]
    );
    const existing = dup.rows[0]?.existing || null;
    if (existing) {
      await client.query('ROLLBACK');
      return res
        .status(409)
        .json({ success: false, error: `Grade "${g}" already exists (status: ${existing}).` });
    }

    const auditEntry = {
      ts: new Date().toISOString(),
      userid,
      action: 'ADD_GRADE',
      grade: g,
      old: null,
      new: 'Active',
      remarks: remarks || null
    };

    // Update settings JSON atomically
    const sql = `
      WITH cur AS (
        SELECT settings
          FROM ${table}
         FOR UPDATE
         LIMIT 1
      ),
      oldbits AS (
        SELECT
          COALESCE(cur.settings->'Output_Grades','{}'::jsonb) AS og,
          cur.settings->'Output_Grades_Auditrail'            AS audit_arr,
          cur.settings                                       AS s
        FROM cur
      ),
      og2 AS (
        SELECT
          oldbits.s,
          oldbits.audit_arr,
          (oldbits.og || jsonb_build_object($1::text, 'Active')) AS new_og
        FROM oldbits
      ),
      s1 AS (
        SELECT
          jsonb_set(og2.s, '{Output_Grades}', og2.new_og, true) AS j,
          og2.audit_arr
        FROM og2
      ),
      s2 AS (
        SELECT
          jsonb_set(
            s1.j,
            '{Output_Grades_Auditrail}',
            COALESCE(s1.audit_arr, '[]'::jsonb) || jsonb_build_array(to_jsonb($2::json)),
            true
          ) AS j
        FROM s1
      )
      UPDATE ${table} t
         SET settings = s2.j
      FROM s2
      RETURNING t.settings->'Output_Grades' AS output_grades;
    `;

    const { rows } = await client.query(sql, [g, JSON.stringify(auditEntry)]);
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: { grade: g, status: 'Active', output_grades: rows[0].output_grades }
    });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('POST /settings/output-grades', e);
    return res.status(500).json({ success: false, error: 'Failed to insert grade' });
  } finally {
    client.release();
  }
});






/**
 * 3) Change status of a grade (toggle or set)
 *    PATCH /api/settings/output-grades/:grade
 *    Body: { "status": "Active" | "De-Active" }  // if omitted => toggle
 */
router.patch('/output-grades/:grade', authenticate, async (req, res) => {
  const { accountid, userid } = req.user;
  const table = tSettings(accountid);
  const g = req.params.grade;
  let { status, remarks } = req.body || {};

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureSingletonRow(client, table);

    const cur = await client.query(
      `SELECT settings->'Output_Grades'->>$1 AS cur FROM ${table} LIMIT 1;`, [g]
    );
    const curStatus = cur.rows[0].cur;
    if (!curStatus) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: `Grade "${g}" not found` });
    }

    if (!status) status = (curStatus === 'Active' ? 'De-Active' : 'Active');
    if (status !== 'Active' && status !== 'De-Active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'status must be "Active" or "De-Active"' });
    }

    await client.query(
      `UPDATE ${table}
         SET settings = jsonb_set(settings, $1::text[], to_jsonb($2::text), true);`,
      [[ 'Output_Grades', g ], status]
    );

    await appendAudit(client, table, ['Output_Grades_Auditrail'], {
      ts: new Date().toISOString(),
      userid,
      action: 'UPDATE_GRADE_STATUS',
      grade: g,
      old: curStatus,
      new: status,
      remarks: remarks || null
    });

    await client.query('COMMIT');
    res.json({ success: true, data: { grade: g, status } });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('PATCH /output-grades/:grade', e);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  } finally {
    client.release();
  }
});

/**
 * 4) Get Output_Grades_Live
 *    GET /api/settings/output-grades-live
 */
router.get('/output-grades-live', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = tSettings(accountid);
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(settings->'Output_Grades_Live','[]'::jsonb) AS live
       FROM ${table} LIMIT 1;`
    );
    res.json({ success: true, data: rows[0].live });
  } catch (e) {
    console.error('GET /output-grades-live', e);
    res.status(500).json({ success: false, error: 'Failed to fetch Output_Grades_Live' });
  }
});

/**
 * 5) Replace Output_Grades_Live completely
 *    PUT /api/settings/output-grades-live
 *    Body: { "grades": ["3x4","4x16"], "remarks": "Start session" }
 *    (Validates against Active Output_Grades)
 */
router.put('/output-grades-live', authenticate, async (req, res) => {
  const { accountid, userid } = req.user;
  const table = tSettings(accountid);
  const { grades, remarks } = req.body || {};
  if (!Array.isArray(grades)) {
    return res.status(400).json({ success: false, error: 'grades must be an array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureSingletonRow(client, table);

    // validate against Active grades
    const activeRes = await client.query(
      `WITH og AS (
         SELECT COALESCE(settings->'Output_Grades','{}'::jsonb) AS og
         FROM ${table} LIMIT 1
       )
       SELECT ARRAY(
         SELECT key FROM jsonb_each_text((SELECT og FROM og)) WHERE value = 'Active'
       ) AS active;`
    );
    const activeSet = new Set(activeRes.rows[0].active || []);
    const invalid = grades.filter(g => !activeSet.has(g));
    if (invalid.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `These grades are not Active: ${invalid.join(', ')}`
      });
    }

    const oldLiveRes = await client.query(
      `SELECT COALESCE(settings->'Output_Grades_Live','[]'::jsonb) AS old_live
       FROM ${table} LIMIT 1;`
    );
    const oldLive = oldLiveRes.rows[0].old_live;

    await client.query(
      `UPDATE ${table}
         SET settings = jsonb_set(
           settings, '{Output_Grades_Live}', to_jsonb($1::text[]), true
         );`,
      [grades]
    );

    await appendAudit(client, table, ['Output_Grades_Live_Auditrail'], {
      ts: new Date().toISOString(),
      userid,
      action: 'REPLACE_LIVE',
      old: oldLive,
      new: grades,
      remarks: remarks || null
    });

    await client.query('COMMIT');
    res.json({ success: true, data: grades });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('PUT /output-grades-live', e);
    res.status(500).json({ success: false, error: 'Failed to replace Output_Grades_Live' });
  } finally {
    client.release();
  }
});

/* (Optional) Read audit trails */
router.get('/output-grades/audit', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = tSettings(accountid);
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(settings->'Output_Grades_Auditrail','[]'::jsonb) AS audit
       FROM ${table} LIMIT 1;`
    );
    res.json({ success: true, data: rows[0].audit });
  } catch (e) {
    console.error('GET /output-grades/audit', e);
    res.status(500).json({ success: false, error: 'Failed to fetch audit' });
  }
});
router.get('/output-grades-live/audit', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = tSettings(accountid);
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(settings->'Output_Grades_Live_Auditrail','[]'::jsonb) AS audit
       FROM ${table} LIMIT 1;`
    );
    res.json({ success: true, data: rows[0].audit });
  } catch (e) {
    console.error('GET /output-grades-live/audit', e);
    res.status(500).json({ success: false, error: 'Failed to fetch audit' });
  }
});

module.exports = router;





