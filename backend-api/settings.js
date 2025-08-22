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



// --- utils (inline, no external helpers) ----------------
function assertSafeIdent(s) {
  if (!/^[a-zA-Z0-9_]+$/.test(s || '')) throw new Error('unsafe ident');
}
function settingsTable(accountid) {
  assertSafeIdent(accountid);
  return `${accountid}_settings`;
}
/** Ensure the table has exactly one row (or at least one). */
async function ensureSingletonRow(client, table) {
  await client.query(`
    INSERT INTO ${table} (settings)
    SELECT '{}'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM ${table});
  `);
}

// -------------------- GET (list) --------------------
router.get('/output-grades', authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  const { activeOnly } = req.query || {};
  if (!accountid) return res.status(400).json({ success: false, error: 'Missing account id' });

  let table;
  try { table = settingsTable(accountid); } catch {
    return res.status(400).json({ success: false, error: 'Invalid account id' });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      WITH cur AS (
        SELECT COALESCE(settings->'Output_Grades','{}'::jsonb) AS og
        FROM ${table}
        LIMIT 1
      ),
      -- Normalize legacy string -> {status, quality:[]}
      norm AS (
        SELECT COALESCE(
          (
            SELECT jsonb_object_agg(k, 
              CASE 
                WHEN jsonb_typeof(v) = 'string' 
                  THEN jsonb_build_object('status', v, 'quality', '[]'::jsonb)
                ELSE v
              END
            )
            FROM jsonb_each(cur.og) AS t(k, v)
          ),
          '{}'::jsonb
        ) AS og
        FROM cur
      ),
      filtered AS (
        SELECT CASE 
          WHEN $1::boolean IS TRUE THEN (
            SELECT COALESCE(jsonb_object_agg(k, v), '{}'::jsonb)
            FROM jsonb_each(norm.og) e(k, v)
            WHERE lower(e.v->>'status') = 'active'
          )
          ELSE norm.og
        END AS og
        FROM norm
      )
      SELECT og FROM filtered;
    `, [String(activeOnly) === 'true']);

    const og = rows[0]?.og || {};
    return res.json({ success: true, data: { Output_Grades: og } });
  } catch (e) {
    console.error('GET /settings/output-grades', e);
    return res.status(500).json({ success: false, error: 'Failed to load Output_Grades' });
  } finally {
    client.release();
  }
});

// -------------------- POST (add grade) --------------------
// Body: { grade: string, status? ('Active'|'De-Active'), quality?: string[], alias?: string, remarks? }
router.post('/output-grades', authenticate,checkAccess('Settings'), async (req, res) => {
  const { accountid, userid } = req.user || {};
  if (!accountid) return res.status(400).json({ success: false, error: 'Missing account id' });

  let table;
  try { table = settingsTable(accountid); } catch {
    return res.status(400).json({ success: false, error: 'Invalid account id' });
  }

  const { grade, remarks } = req.body || {};
  const status = (req.body?.status || 'Active').trim();
  const quality = Array.isArray(req.body?.quality) ? req.body.quality.map(String) : [];
  const alias = typeof req.body?.alias === 'string' ? req.body.alias.trim() : null;

  if (typeof grade !== 'string' || !grade.trim()) {
    return res.status(400).json({ success: false, error: 'grade must be a non-empty string' });
  }
  const g = grade.trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureSingletonRow(client, table);

    // Check duplicate (key presence)
    const dup = await client.query(
      `SELECT (COALESCE(settings->'Output_Grades','{}'::jsonb) ? $1) AS exists
         FROM ${table}
        FOR UPDATE
        LIMIT 1;`,
      [g]
    );
    if (dup.rows[0]?.exists) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: `Grade "${g}" already exists.` });
    }

    const auditEntry = {
      ts: new Date().toISOString(),
      userid,
      action: 'ADD_GRADE',
      grade: g,
      old: null,
      new: { status, quality, ...(alias ? { alias } : {}) },
      remarks: remarks || null
    };

    const sql = `
      WITH cur AS (
        SELECT settings
          FROM ${table}
         FOR UPDATE
         LIMIT 1
      ),
      s1 AS (
        SELECT jsonb_set(
          cur.settings,
          '{Output_Grades}',
          COALESCE(cur.settings->'Output_Grades','{}'::jsonb)
          || jsonb_build_object(
               $1::text,
               jsonb_strip_nulls(
                 jsonb_build_object('status',$2::text,'quality',$3::jsonb,'alias',$4::text)
               )
             ),
          true
        ) AS j
        FROM cur
      ),
      s2 AS (
        SELECT jsonb_set(
          s1.j,
          '{Output_Grades_Auditrail}',
          COALESCE(s1.j->'Output_Grades_Auditrail','[]'::jsonb) || jsonb_build_array(to_jsonb($5::json)),
          true
        ) AS j
        FROM s1
      )
      UPDATE ${table} t
         SET settings = s2.j
      FROM s2
      RETURNING t.settings->'Output_Grades' AS output_grades;
    `;

    const { rows } = await client.query(sql, [
      g,
      status,
      JSON.stringify(quality),
      alias, // may be null -> removed by jsonb_strip_nulls
      JSON.stringify(auditEntry),
    ]);

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      data: { grade: g, status, quality, ...(alias ? { alias } : {}), output_grades: rows[0].output_grades }
    });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('POST /settings/output-grades', e);
    return res.status(500).json({ success: false, error: 'Failed to insert grade' });
  } finally {
    client.release();
  }
});

// -------------------- PATCH (update grade) --------------------
// Body: { status?: 'Active'|'De-Active', quality?: string[], alias?: string|null, remarks? }
// alias: '' or null => remove field; non-empty string => set/update
// PATCH /api/settings/output-grades/:grade
router.patch('/output-grades/:grade', authenticate,checkAccess('Settings'), async (req, res) => {
  // --- utils (inline, no external helpers) ----------------
  function assertSafeIdent(s) {
    if (!/^[a-zA-Z0-9_]+$/.test(s || '')) throw new Error('unsafe ident');
  }
  function settingsTable(accountid) {
    assertSafeIdent(accountid);
    return `${accountid}_settings`;
  }

  const { accountid, userid } = req.user || {};
  if (!accountid) return res.status(400).json({ success: false, error: 'Missing account id' });

  let table;
  try { table = settingsTable(accountid); } catch {
    return res.status(400).json({ success: false, error: 'Invalid account id' });
  }

  const grade = decodeURIComponent(req.params?.grade || '').trim();
  if (!grade) {
    return res.status(400).json({ success: false, error: 'Invalid grade' });
  }

  const nextStatus =
    typeof req.body?.status === 'string' ? req.body.status.trim() : null;

  const hasQuality = Array.isArray(req.body?.quality);
  const nextQuality = hasQuality ? req.body.quality.map(String) : null;

  // alias: presence controls action; '' or null = remove
  const hasAlias = Object.prototype.hasOwnProperty.call(req.body || {}, 'alias');
  const aliasRaw = hasAlias ? (req.body.alias ?? '') : undefined;
  const nextAlias = hasAlias ? String(aliasRaw).trim().toUpperCase() : undefined;

  const remarks = req.body?.remarks || null;

  if (!nextStatus && !hasQuality && !hasAlias) {
    return res.status(400).json({
      success: false,
      error: 'Nothing to update (status, quality, or alias required)',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sql = `
      WITH cur AS (
        SELECT settings
          FROM ${table}
         FOR UPDATE
         LIMIT 1
      ),
      og AS (
        SELECT COALESCE(cur.settings->'Output_Grades','{}'::jsonb) AS og, cur.settings AS s
        FROM cur
      ),
      ex AS (
        SELECT og.og-> $1::text AS ex_val, og.og, og.s
        FROM og
      ),
      -- normalize legacy string into object {status, quality:[]}
      ex_norm AS (
        SELECT CASE 
                 WHEN ex.ex_val IS NULL THEN NULL
                 WHEN jsonb_typeof(ex.ex_val) = 'string'
                   THEN jsonb_build_object('status', ex.ex_val, 'quality', '[]'::jsonb)
                 ELSE ex.ex_val
               END AS obj,
               ex.og,
               ex.s
        FROM ex
      ),
      -- merge status/quality patches
      patched1 AS (
        SELECT 
          CASE 
            WHEN ex_norm.obj IS NULL THEN NULL
            ELSE
              ex_norm.obj
              || COALESCE( (CASE WHEN $2::text IS NULL THEN NULL ELSE jsonb_build_object('status',$2::text) END), '{}'::jsonb)
              || COALESCE( (CASE WHEN $3::jsonb IS NULL THEN NULL ELSE jsonb_build_object('quality',$3::jsonb) END), '{}'::jsonb)
          END AS obj,
          ex_norm.og,
          ex_norm.s
        FROM ex_norm
      ),
      -- alias handling (explicit cast for $5)
      patched2 AS (
        SELECT 
          CASE
            WHEN $4::boolean IS TRUE AND COALESCE($5::text, '') = ''
              THEN patched1.obj - 'alias'  -- remove alias
            WHEN $4::boolean IS TRUE AND COALESCE($5::text, '') <> ''
              THEN jsonb_set(patched1.obj, '{alias}', to_jsonb($5::text), true)  -- set alias
            ELSE patched1.obj
          END AS obj,
          patched1.og,
          patched1.s
        FROM patched1
      ),
      og2 AS (
        SELECT 
          jsonb_set(
            patched2.s,
            '{Output_Grades}',
            patched2.og || jsonb_build_object($1::text, patched2.obj),
            true
          ) AS j,
          patched2.obj AS new_obj
        FROM patched2
      ),
      s2 AS (
        SELECT jsonb_set(
          og2.j,
          '{Output_Grades_Auditrail}',
          COALESCE(og2.j->'Output_Grades_Auditrail','[]'::jsonb) 
            || jsonb_build_array(
                jsonb_build_object(
                  'ts', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                  'userid', $6::text,
                  'action', 'UPDATE_GRADE',
                  'grade', $1::text,
                  'new', og2.new_obj,
                  'remarks', $7::text
                )
              ),
          true
        ) AS j,
        og2.new_obj
        FROM og2
      )
      UPDATE ${table} t
         SET settings = s2.j
      FROM s2
      RETURNING s2.new_obj AS updated;
    `;

    const params = [
      grade,                                                        // $1
      nextStatus,                                                   // $2 (text or null)
      nextQuality ? JSON.stringify(nextQuality) : null,             // $3 (jsonb or null)
      hasAlias,                                                     // $4 (boolean)
      hasAlias ? nextAlias : null,                                  // $5 (text or null) - CASTED in SQL
      String(userid || ''),                                         // $6
      remarks                                                       // $7
    ];

    const { rows } = await client.query(sql, params);
    const updated = rows[0]?.updated || null;
    if (!updated) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: `Grade "${grade}" not found` });
    }

    await client.query('COMMIT');
    return res.json({ success: true, data: { grade, ...updated } });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('PATCH /settings/output-grades/:grade', e);
    return res.status(500).json({ success: false, error: 'Failed to update grade' });
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


/**
 * GET /api/settings/quality-params?alias=P
 * Response: { success: true, data: [{key,label,min,max,step}, ...] }
 */
router.get("/quality-params", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  const aliasRaw = (req.query.alias ?? "").toString().trim();
  const table = tSettings(accountid);

  const STEP = 0.01;

    function normalizeQualityList(list) {
      if (!Array.isArray(list) || !list.length) {
        return [{ key: "CTC", label: "CTC", min: 0, max: 100, step: STEP }];
      }
      const normalized = list.map((item) => {
        if (typeof item === "string") {
          return { key: item, label: item, min: 0, max: 100, step: STEP };
        }
        const key = item?.key ?? item?.label ?? "CTC";
        return {
          key,
          label: item?.label ?? key,
          min: Number.isFinite(item?.min) ? item.min : 0,
          max: Number.isFinite(item?.max) ? item.max : 100,
          step: Number.isFinite(item?.step) ? item.step : STEP,
        };
      });
      // dedupe by key
      const seen = new Set();
      return normalized.filter((m) => (seen.has(m.key) ? false : (seen.add(m.key), true)));
    }

    function collectByAlias(outputGrades = {}, aliasRaw = "") {
      if (!aliasRaw) return [];
      const want = aliasRaw.toLowerCase();
      const acc = [];
      for (const [, obj] of Object.entries(outputGrades)) {
        if (!obj || typeof obj !== "object") continue;
        const a = (obj.alias || "").toString().toLowerCase();
        if (a === want) {
          const q = Array.isArray(obj.quality) ? obj.quality : [];
          acc.push(...q);
        }
      }
      const uniq = [];
      const seen = new Set();
      for (const it of acc) {
        const k = typeof it === "string" ? it : (it?.key ?? JSON.stringify(it));
        if (!seen.has(k)) { seen.add(k); uniq.push(it); }
      }
      return uniq;
    }

  try {
    const client = await pool.connect();
    try {
      // No id column — just read the first row's settings jsonb
      const { rows } = await client.query(
        `SELECT settings
         FROM ${table}
         FOR SHARE
         LIMIT 1;`
      );
      const settings = rows?.[0]?.settings || {};
      const outputGrades = settings?.Output_Grades || {};
      let list = collectByAlias(outputGrades, aliasRaw);

      if (!list.length) {
        // Optional: if you want a default list from somewhere else, add it here.
        list = ["CTC"];
      }

      const normalized = normalizeQualityList(list);
    
      return res.json({
        success: true,
        data: normalized,
        meta: { alias: aliasRaw || null, source: "Output_Grades" },
      });
    } finally {
      // always release
      res.locals && res.locals.clientReleased ? null : client.release();
    }
  } catch (err) {
    console.error("GET /api/settings/quality-params failed:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// routes/settings.quality.params.all.js




router.get("/quality-params/all", authenticate, async (req, res) => {
 
    const STEP = 0.01;

    const norm = (list) => {
      if (!Array.isArray(list) || !list.length) return [{ key: "CTC", label: "CTC", min: 0, max: 100, step: STEP }];
      const out = [];
      const seen = new Set();
      for (const item of list) {
        const m = typeof item === "string"
          ? { key: item, label: item, min: 0, max: 100, step: STEP }
          : {
              key: item?.key ?? item?.label ?? "CTC",
              label: item?.label ?? item?.key ?? "CTC",
              min: Number.isFinite(item?.min) ? item.min : 0,
              max: Number.isFinite(item?.max) ? item.max : 100,
              step: Number.isFinite(item?.step) ? item.step : STEP,
            };
        if (!seen.has(m.key)) { seen.add(m.key); out.push(m); }
      }
      return out;
    };
  
  
  const { accountid } = req.user || {};
  const includeInactive = ["1","true","yes"].includes(String(req.query.includeInactive || "").toLowerCase());
  const table = `${accountid}_settings`;

  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT settings FROM ${table} FOR SHARE LIMIT 1;`
      );
      const settings = rows?.[0]?.settings || {};
      const grades = settings?.Output_Grades || {};

      // Build alias -> merged quality array (union across grades sharing same alias)
      const aliasMapRaw = {};
      for (const [, obj] of Object.entries(grades)) {
        if (!obj || typeof obj !== "object") continue;
        const alias = (obj.alias || "").toString().trim();
        const status = (obj.status || "").toString().toLowerCase();
        if (!alias) continue;
        if (!includeInactive && status === "de-active") continue;

        const q = Array.isArray(obj.quality) ? obj.quality : [];
        aliasMapRaw[alias] = (aliasMapRaw[alias] || []).concat(q);
      }

      // Normalize & dedupe each alias’s list; also provide a default key
      const aliasMap = {};
      for (const [alias, list] of Object.entries(aliasMapRaw)) {
        aliasMap[alias] = norm(list);
      }
      // include a default fallback (CTC only)
      aliasMap["__DEFAULT__"] = norm(["CTC"]);

      return res.json({ success: true, data: aliasMap, meta: { includeInactive } });
    } finally {
      res.locals && res.locals.clientReleased ? null : client.release();
    }
  } catch (err) {
    console.error("GET /api/settings/quality-params/all failed:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;







