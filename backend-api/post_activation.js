const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db.js');
const {getCounters} = require('./postactivation_counters.js')

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

const { getKolkataDayString, formatToKolkataDay } = require('./date.js');
let dbConnected = false;


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate.js');


router.get("/bags_to_process", authenticate,async (req, res) => {
  const {accountid} = req.user;
  const table = `${accountid}_postactivation_loading_ready`;
  const {tabName} = req.query;
   
  try {
    const result = await pool.query(
      `select bag_no,weight,grade,create_date_time as screening_out_dt from ${table} 
      where status='${tabName}' order by create_date_time
       `
       
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching re_process bags:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


function assertSafeIdent(id) {
  if (!/^[a-z0-9_]+$/i.test(id)) throw new Error('Unsafe identifier');
}

router.get('/status',authenticate,async (req, res) => {
    const { accountid } = req.user || {};
    const { tabName } = req.query;
    const TAB_TO_MACHINE = {
      Screening: 'screening',
      Crushing: 'crushing',
      'De-Dusting': 'de_dusting',
      'De-Magnetize': 'de_magnetize',
      Blending: 'blending',
      Packaging: 'packaging',
    };
    //const machine = TAB_TO_MACHINE[tabName];
  
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ error: 'Invalid account id' });
    }

    const rpTable  = `${accountid}_postactivation_in`;
    const outTable = `${accountid}_postactivation`;

    try {
      // 1) Active lot (NULL total_out_weight => machine busy)
      const { rows: activeRows } = await pool.query(
        `SELECT lot_id, loaded_dttm, loaded_bags as loaded_bag_details, loaded_weight,
                bags_loaded_userid, total_out_weight, bags_out_datetime, bags_out_userid
           FROM ${rpTable}
          WHERE total_out_weight IS NULL
          and operations = '${tabName}'
          ORDER BY loaded_dttm DESC
          LIMIT 1`
      );

      if (activeRows.length === 0) {
        return res.json({ busy: false, lot: null });
      }

      const lot = activeRows[0];

      // 2) OUT bags (created so far for this lot)
      const { rows: outBags } = await pool.query(
        `SELECT bag_no, bag_weight, grade, bag_no_created_dttm, stock_status, bag_created_userid
           FROM ${outTable}
          WHERE lot_id = $1
          ORDER BY bag_no_created_dttm NULLS LAST, bag_no ASC`,
        [lot.lot_id]
      );

      // 3) Per-grade summary
      const { rows: sumRows } = await pool.query(
        `SELECT grade,
                COUNT(*)::int AS count,
                COALESCE(SUM(bag_weight), 0)::numeric AS total_weight
           FROM ${outTable}
          WHERE lot_id = $1
          GROUP BY grade
          ORDER BY grade`,
        [lot.lot_id]
      );

      // 4) Loaded bag details (JSONB array of { bag_no, weight, created_dttm })
      let loadedBags = lot.loaded_bag_details;
      if (typeof loadedBags === 'string') {
        try { loadedBags = JSON.parse(loadedBags); } catch { loadedBags = []; }
      }
      if (!Array.isArray(loadedBags)) loadedBags = [];

      return res.json({
        busy: true,
        lot: {
          lot_id: lot.lot_id,
          loaded_dttm: lot.loaded_dttm,
          loaded_weight: lot.loaded_weight == null ? null : Number(lot.loaded_weight),
          bags_loaded_userid: lot.bags_loaded_userid
        },
        loaded: {
          total_loaded_weight: lot.loaded_weight == null ? null : Number(lot.loaded_weight),
          bags: loadedBags // [{ bag_no, weight, created_dttm }]
        },
        out_summary: sumRows.map(r => ({
          grade: r.grade,
          count: r.count,
          total_weight: Number(r.total_weight)
        })),
        out_bags: outBags
      });
    } catch (err) {
      console.error('Status check failed:', err);
      return res.status(500).json({ error: 'Failed to check machine status' });
    }
  }
);



router.post('/createlabel', authenticate, async (req, res) => {
  
  function assertSafeIdent(ident) {
  if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error('unsafe ident');
  }
  
  const { accountid, userid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: 'Invalid account id' });
  }

  const { lot_id, bag_weight, grade } = req.body || {};
  const weightNum = Number(bag_weight);
  const { tabName } = req.query;
  const TAB_TO_MACHINE = {
      Screening: 'screening',
      Crushing: 'crushing',
      'De-Dusting': 'de_dusting',
      'De-Magnetize': 'de_magnetize',
      Blending: 'blending',
      Packaging: 'packaging',
    };
    const machine = TAB_TO_MACHINE[tabName];

  if (!lot_id || typeof lot_id !== 'string' || !lot_id.trim()) {
    console.log(lot_id, bag_weight, grade);
    return res.status(400).json({ error: 'lot_id is required' });
  }
  if (!grade || typeof grade !== 'string' || !grade.trim()) {
    console.log(lot_id, bag_weight, grade);
    return res.status(400).json({ error: 'grade is required' });
  }
  if (!Number.isFinite(weightNum) || weightNum <= 0) {
    console.log(lot_id, bag_weight, grade);
    return res.status(400).json({ error: 'bag_weight must be a positive number' });
  }

  const rpTable  = `${accountid}_postactivation_in`;
  const outTable = `${accountid}_postactivation`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize by lot to avoid race conditions
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${accountid}:${lot_id}:reprocess_out`]);

    // Lot must exist & be active
    const { rowCount: active } = await client.query(
      `SELECT 1 FROM ${rpTable} WHERE lot_id = $1 AND total_out_weight IS NULL`,
      [lot_id]
    );
    if (active === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Lot is not active (machine not busy or already finished).' });
    }

    // Insert; trigger fills bag_no
    const { rows } = await client.query(
      `INSERT INTO ${outTable} (lot_id, bag_weight, grade, bag_created_userid,operations)
       VALUES ($1, $2, $3, $4,$5)
       RETURNING lot_id, bag_no, bag_weight, grade, bag_no_created_dttm, stock_status, bag_created_userid`,
      [lot_id, weightNum, grade.trim(), userid,tabName]
    );

    await client.query('COMMIT');
    return res.json({ success: true, out_bag: rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Create out bag failed:', e);
    console.log(lot_id, bag_weight, grade);
    return res.status(500).json({ error: 'Failed to create output bag' });
  } finally {
    client.release();
  }
});


router.post('/delete_bag', authenticate, checkAccess('Operations.Re-Process'), async (req, res) => {
  function assertSafeIdent(s) {
    if (!/^[a-z0-9_]+$/i.test(s)) throw new Error('unsafe ident');
  }

  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: 'Invalid account id' });
  }

  const { bag_no } = req.body || {};
  if (!bag_no || typeof bag_no !== 'string' || !bag_no.trim()) {
    return res.status(400).json({ error: 'bag_no is required' });
  }
  const { tabName } = req.query;
  const TAB_TO_MACHINE = {
      Screening: 'screening',
      Crushing: 'crushing',
      'De-Dusting': 'de_dusting',
      'De-Magnetize': 'de_magnetize',
      Blending: 'blending',
      Packaging: 'packaging',
    };
    const machine = TAB_TO_MACHINE[tabName];
  const outTable = `${accountid}_postactivation`;

  try {
    // Delete by bag_no only
    const { rows } = await pool.query(
      `DELETE FROM ${outTable} WHERE bag_no = $1 RETURNING lot_id, bag_no`,
      [bag_no.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bag not found' });
    }

    return res.json({ success: true, ...rows[0] });
  } catch (err) {
    console.error('Delete bag failed:', err);
    return res.status(500).json({ error: 'Failed to delete output bag' });
  }
});





/**
 * POST /api/re_process/move_to_stock
 * Body: { lot_id: string }
 */
router.post('/move_to_stock', authenticate, async (req, res) => {
  function assertSafeIdent(ident) {
    if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error('unsafe ident');
  }
  const { accountid, userid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: 'Invalid account id' });
  }

  const { lot_id } = req.body || {};
  if (!lot_id || typeof lot_id !== 'string' || !lot_id.trim()) {
    return res.status(400).json({ error: 'lot_id is required' });
  }
  const { tabName } = req.query;
  const TAB_TO_MACHINE = {
      Screening: 'screening',
      Crushing: 'crushing',
      'De-Dusting': 'de_dusting',
      'De-Magnetize': 'de_magnetize',
      Blending: 'blending',
      Packaging: 'packaging',
    };
    const machine = TAB_TO_MACHINE[tabName];

  const rpTable  = `${accountid}_postactivation_in`;
  const outTable = `${accountid}_postactivation`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Serialize actions for this lot
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${accountid}:${lot_id}:move_to_stock`]);

    // 1) Verify lot exists & is not already finished
    const { rows: lotRows } = await client.query(
      `SELECT lot_id, total_out_weight FROM ${rpTable} WHERE lot_id = $1 FOR UPDATE`,
      [lot_id]
    );
    if (lotRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lot not found.' });
    }
    if (lotRows[0].total_out_weight !== null) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Lot already finished.' });
    }

    // 2) (Optional safety) ensure provided lot_id is the current active one
    // Remove this block if you *don’t* want the check.
    const { rows: activeRows } = await client.query(
      `SELECT lot_id FROM ${rpTable}
        WHERE total_out_weight IS NULL
        ORDER BY loaded_dttm DESC
        LIMIT 1`
    );
    if (activeRows.length && activeRows[0].lot_id !== lot_id) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'Provided lot_id is not the current active lot.',
        active_lot_id: activeRows[0].lot_id
      });
    }

    // 3) Aggregate output bags for this lot
    const { rows: aggRows } = await client.query(
      `SELECT COUNT(*)::int AS count_bags,
              COALESCE(SUM(bag_weight), 0)::numeric AS total_weight
         FROM ${outTable}
        WHERE lot_id = $1`,
      [lot_id]
    );
    const countBags   = aggRows[0].count_bags;
    const totalWeight = aggRows[0].total_weight;

    if (countBags === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No output bags for this lot.' });
    }

    // 4) Mark all out-bags as InStock
    await client.query(
      `UPDATE ${outTable}
          SET stock_status = 'Quality',
              stock_change_userid = $2,
              stock_status_change_dttime = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
        WHERE lot_id = $1`,
      [lot_id, userid]
    );

    // 5) Close the lot with totals + stamps
    await client.query(
      `UPDATE ${rpTable}
          SET total_out_weight = $2,
              bags_out_datetime = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
              bags_out_userid = $3
        WHERE lot_id = $1`,
      [lot_id, totalWeight, userid]
    );

    await client.query('COMMIT');
    return res.json({
      success: true,
      lot_id,
      total_out_weight: Number(totalWeight),
      bags_out_count: countBags
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('move_to_stock failed:', err);
    return res.status(500).json({ error: 'Failed to move to stock' });
  } finally {
    client.release();
  }
});




/**
 * POST /api/re_process/load_bags
 * Body:
 *   {
 *     "bags": [
 *       { "bag_no": "S123...", "weight": 12.3 },
 *       { "bag_no": "D456...", "weight": 10.0 }
 *     ]
 *   }
 *
 * Effects (single transaction):
 *  - Insert one row into <accountid>_re_process:
 *      loaded_bag_details: JSONB array of { bag_no, weight }       ← no created_dttm
 *      loaded_weight: SUM(weight)
 *      bags_loaded_userid: req.user.userid
 *  - Update sources:
 *      if bag_no starts with 'S' → <accountid>_screening_outward.delivery_status = 'Re-Processed'
 *      if bag_no starts with 'D' → <accountid>_destoning.final_destination = 'Re-Processed'
 *  - Returns: { success, lot: { lot_id, ... }, updated: { screening, destoning } }
 */
router.post('/load_bags', authenticate, async (req, res) => {
  function assertSafeIdent(ident) {
    if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error('unsafe ident');
  }

  const { accountid, userid } = req.user || {};
  const { tabName } = req.query || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: 'Invalid account id' });
  }
  if (!tabName) return res.status(400).json({ error: 'Missing tabName' });

  // Validate tabName using your known set (optional but recommended)
  const ALLOWED_TABS = new Set(['Screening','Crushing','De-Dusting','De-Magnetize','Blending','Packaging']);
  if (!ALLOWED_TABS.has(tabName)) {
    return res.status(400).json({ error: 'Invalid tabName' });
  }

  // Accept "bags" or "loaded_bag_details"
  const incoming = Array.isArray(req.body?.bags)
    ? req.body.bags
    : (Array.isArray(req.body?.loaded_bag_details) ? req.body.loaded_bag_details : []);
  if (!incoming.length) return res.status(400).json({ error: 'No bags provided.' });

  // Normalize & validate
  const details = [];
  let totalWeight = 0;
  for (const b of incoming) {
    const bag_no = (b?.bag_no || '').trim();
    const w = Number(b?.weight);
    if (!bag_no) return res.status(400).json({ error: 'Each bag must have a bag_no.' });
    if (!Number.isFinite(w) || w <= 0) {
      return res.status(400).json({ error: `Invalid weight for bag ${bag_no}.` });
    }
    const grade = (b?.grade ?? null); // kept if you need it later
    details.push({ bag_no, weight: w, grade });
    totalWeight += w;
  }

  // Tables
  const rpTable   = `${accountid}_postactivation_in`;
  const destoning = `${accountid}_destoning`;
  const postact   = `${accountid}_postactivation`;

  // Group bag_nos by prefix
  const groups = { DSO: [], SCR: [], CRU: [], DDU: [], DMZ: [], BLD: [], _unknown: [] };
  for (const { bag_no } of details) {
    const up = bag_no.toUpperCase();
    if      (up.startsWith('DSO')) groups.DSO.push(bag_no);
    else if (up.startsWith('SCR')) groups.SCR.push(bag_no);
    else if (up.startsWith('CRU')) groups.CRU.push(bag_no);
    else if (up.startsWith('DDU')) groups.DDU.push(bag_no);
    else if (up.startsWith('DMZ')) groups.DMZ.push(bag_no);
    else if (up.startsWith('BLD')) groups.BLD.push(bag_no);
    else groups._unknown.push(bag_no);
  }

  // Statuses
  const statusPlain  = tabName;             // e.g. "Screening"
  const statusLoaded = `${tabName}_Loaded`; // e.g. "Screening_loaded" (matches your view/flag style)

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Prevent double-start if a lot is already active
    const { rows: active } = await client.query(
      `SELECT 1 FROM ${rpTable} WHERE operations = '${tabName}' and total_out_weight IS NULL LIMIT 1`
    );
    if (active.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Machine is busy with an active lot.' });
    }

    // Insert lot (IST stamping for loaded_dttm should be handled by default/trigger; we also include operations)
    const insertSql = `
      INSERT INTO ${rpTable} (loaded_bags, loaded_weight, bags_loaded_userid, operations)
      VALUES ($1::jsonb, $2, $3, $4)
      RETURNING lot_id, loaded_dttm, loaded_weight, loaded_bags, bags_loaded_userid
    `;
    const { rows: lotRows } = await client.query(insertSql, [
      JSON.stringify(details), totalWeight, userid, tabName
    ]);
    const lot = lotRows[0];

    // ---- Two-table update phase ----
    const updatedCounts = { DSO: 0, SCR: 0, CRU: 0, DDU: 0, DMZ: 0, BLD: 0 };

    // 1) DSO → destoning
    if (groups.DSO.length) {
      const sqlDSO = `
        UPDATE ${destoning}
           SET screening_inward_time   = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
               userid_screening_inward = $2,
               final_destination       = $3,
               screening_bag_weight = weight_out
         WHERE ds_bag_no = ANY($1)
           AND final_destination = $4
           AND is_loaded = false
        RETURNING ds_bag_no
      `;
      const r = await client.query(sqlDSO, [groups.DSO, userid || null, statusLoaded, statusPlain]);
      updatedCounts.DSO = r.rowCount || 0;
    }

    // 2) Non-DSO → postactivation (SCR/CRU/DDU/DMZ/BLD together)
    const otherBags = [...groups.SCR, ...groups.CRU, ...groups.DDU, ...groups.DMZ, ...groups.BLD];
    if (otherBags.length) {
      const sqlPA = `
        UPDATE ${postact}
           SET stock_status  = $2,
               reload_time   = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
               reload_userid = $3,
               reload_weight = bag_weight
         WHERE bag_no = ANY($1)
           AND stock_status = $4
           AND is_loaded = false
        RETURNING bag_no
      `;
      const ro = await client.query(sqlPA, [otherBags, statusLoaded, userid || null, statusPlain]);

      // classify updated rows to per-prefix counts
      for (const row of ro.rows) {
        const up = String(row.bag_no || '').toUpperCase();
        if      (up.startsWith('SCR')) updatedCounts.SCR++;
        else if (up.startsWith('CRU')) updatedCounts.CRU++;
        else if (up.startsWith('DDU')) updatedCounts.DDU++;
        else if (up.startsWith('DMZ')) updatedCounts.DMZ++;
        else if (up.startsWith('BLD')) updatedCounts.BLD++;
      }
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      lot,
      updated: updatedCounts,
      unknown_prefix: groups._unknown
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('load_bags failed:', err);
    return res.status(500).json({ error: 'Failed to start re-process (load bags).' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/post_activation/bag_counts
 * Returns counts per operation for rows in stock_status='Quality'
 */
router.get('/bag_counts', authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  
  // The panel keys you show in UI (used to zero-fill counts)
  const PANEL_KEYS = ['Screening', 'Crushing', 'De-Dusting', 'De-Magnetize', 'Blending'];

  const table = `${accountid}_postactivation`;

  try {
    // Table exists?
    const existsQ = await pool.query('SELECT to_regclass($1) AS reg;', [table]);
    if (!existsQ.rows[0]?.reg) {
      return res.status(404).json({ success: false, error: `Bucket table not found: ${table}` });
    }

    const { rows } = await pool.query(
      `SELECT operations, COUNT(*)::int AS n
       FROM ${table}
       WHERE stock_status = 'Quality'
       GROUP BY operations`
    );

    // Deterministic result with zeros for known panels
    const counts = {};
    PANEL_KEYS.forEach((k) => { counts[k] = 0; });
    for (const r of rows) {
      if (r.operations && Object.prototype.hasOwnProperty.call(counts, r.operations)) {
        counts[r.operations] = r.n;
      }
    }

    return res.json({ success: true, counts, asOf: new Date().toISOString() });
  } catch (err) {
    console.error('Error fetching bag_counts:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


/**
 * GET /api/post_activation/bags
 * Query: bucket (required), page (1-based), pageSize (default 50, max 100)
 * Returns: { success, data, page, pageSize, total }
 */
router.get('/bags', authenticate, async (req, res) => {
  const { accountid } = req.user || {};

  const bucket = req.query.bucket;
  if (typeof bucket !== 'string' || !bucket.trim()) {
    return res.status(400).json({ success: false, error: "Missing or invalid 'bucket' query param" });
  }

  const table = `${accountid}_postactivation`;

  // Pagination (server-side)
  const pageSizeMax = 100;
  const pageSizeDefault = 50;
  const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
  const pageSize = Math.max(1, Math.min(pageSizeMax, parseInt(req.query.pageSize ?? String(pageSizeDefault), 10)));
  const offset = (page - 1) * pageSize;

  try {
    // Table exists?
    const existsQ = await pool.query('SELECT to_regclass($1) AS reg;', [table]);
    if (!existsQ.rows[0]?.reg) {
      return res.status(404).json({ success: false, error: `Bucket table not found: ${table}` });
    }

    // Total for this bucket
    const totalQ = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM ${table}
       WHERE stock_status = 'Quality' AND operations = $1`,
      [bucket] // parameterized (no normalization)
    );
    const total = totalQ.rows[0]?.total ?? 0;

    // Page rows
    const rowsQ = await pool.query(
      `SELECT
          bag_no               AS id,
          bag_weight           AS weightKg,
          grade,
          bag_no_created_dttm  AS created_date
       FROM ${table}
       WHERE stock_status = 'Quality' AND operations = $1
       ORDER BY bag_no_created_dttm DESC
       OFFSET $2 LIMIT $3`,
      [bucket, offset, pageSize] // parameterized
    );

    return res.json({
      success: true,
      data: rowsQ.rows,
      page,
      pageSize,
      total,
    });
  } catch (err) {
    console.error('Error fetching post_activation bags:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});





// POST /api/post_activation/quality_save
router.post("/quality_save", authenticate, async (req, res) => {
  const { accountid, userid } = req.user || {};
  const { bucket, bag_no, id: idAlt, quality, remarks = null, next_destination } = req.body || {};

  try {
    if (!accountid) return res.status(400).json({ success: false, error: "Missing account context" });
    if (!bucket) return res.status(400).json({ success: false, error: "Missing 'bucket'" });
    const bagNo = bag_no || idAlt;
    if (!bagNo) return res.status(400).json({ success: false, error: "Missing 'bag_no' (or 'id')" });
    if (quality == null || typeof quality !== "object") {
      return res.status(400).json({ success: false, error: "'quality' must be a JSON object" });
    }
    if (!next_destination) return res.status(400).json({ success: false, error: "Missing 'next_destination'" });

    const table = `${accountid}_postactivation`;
    const client = await pool.connect();
    try {
      // ensure table exists
      const existsQ = await client.query("SELECT to_regclass($1) AS reg;", [table]);
      if (!existsQ.rows[0]?.reg) {
        return res.status(404).json({ success: false, error: `Bucket table not found: ${table}` });
      }

      // read previous bucket/stock_status to compute the correct count AFTER update
      const prevQ = await client.query(
        `SELECT operations, stock_status FROM ${table} WHERE bag_no = $1`,
        [bagNo]
      );
      if (prevQ.rowCount === 0) {
        return res.status(404).json({ success: false, error: `Bag not found: ${bagNo}` });
      }
      const prevOp = prevQ.rows[0].operations; // e.g., "Screening"

      await client.query('BEGIN');

      const qualityJson = JSON.stringify(quality);
      // here we set stock_status to the user's chosen next_destination (e.g., 'InStock' or another stage)
      const upQ = await client.query(
        `UPDATE ${table}
           SET quality            = $1::jsonb,
               quality_userid     = $2,
               stock_status       = $3,
               quality_upd_dttime = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
         WHERE bag_no = $4
         RETURNING bag_no, stock_status, quality, quality_userid, quality_upd_dttime`,
        [qualityJson, userid, next_destination, bagNo]
      );

      if (upQ.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: `Bag not found: ${bagNo}` });
      }

      // recompute count for the prev operation in 'Quality'
      const cntQ = await client.query(
        `SELECT COUNT(*)::int AS n
           FROM ${table}
          WHERE stock_status = 'Quality' AND operations = $1`,
        [prevOp]
      );
      const newCount = cntQ.rows[0]?.n ?? 0;

      await client.query('COMMIT');
      return res.json({
        success: true,
        affectedOperation: prevOp,
        newCount,
        data: upQ.rows[0],
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("POST /api/post_activation/quality_save failed:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});


// GET /api/records?key=destoning&sort=ds_bag_no&dir=desc
router.get("/records", authenticate, async (req, res) => {
  function assertSafeIdent(ident) {
    if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error("unsafe ident");
  }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const key = String(req.query.key || "");
  if (!key) return res.status(400).json({ error: "Missing key" });

  // Sorting (whitelist)
  const dir  = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const ALLOWED_SORT = new Set(["bag_no_created_dttm", "bag_no", "grade", "stock_status"]);
  const sort = ALLOWED_SORT.has(String(req.query.sort)) ? String(req.query.sort) : "bag_no_created_dttm";

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // Filters
  const bagNo        = req.query.bag_no?.trim();
  const statusParam  = req.query.status; // string or array
  const createdFrom  = req.query.created_from?.trim(); // ISO or YYYY-MM-DD
  const createdTo    = req.query.created_to?.trim();   // ISO or YYYY-MM-DD

  // Helper: parse date-only into day bounds; pass through ISO timestamps
  const parseDateStart = (s) => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00.000Z`);
    const d = new Date(s); return isNaN(d) ? null : d;
  };
  const parseDateEndExclusive = (s) => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() + 1); // next day (exclusive)
      return d;
    }
    const d = new Date(s); return isNaN(d) ? null : d;
  };

  const fromTs = parseDateStart(createdFrom);
  const toTs   = parseDateEndExclusive(createdTo);

  try {
    const table = `${accountid}_postactivation`;

    // Column aliases (unchanged)
    const columns = [
      "bag_no",
      "weight",
      "grade",
      "created_at",
      "status",
      "bag_created_userid",
      "stock_change_userid",
      "stock_status_change_dttime",
      "quality",
      "quality_userid",
      "quality_upd_dttime",
    ];

    // WHERE clause + params (always exclude Packaging to match current UI)
    const where = [`operations = $1`, `stock_status != 'Packaging'`];
    const params = [key];

    console.log(where);

    if (bagNo) {
      params.push(`%${bagNo}%`);
      where.push(`bag_no ILIKE $${params.length}`);
    }

    if (statusParam) {
      if (Array.isArray(statusParam)) {
        params.push(statusParam);
        where.push(`stock_status = ANY($${params.length})`);
      } else {
        params.push(String(statusParam));
        where.push(`stock_status = $${params.length}`);
      }
    }

    if (fromTs) {
      params.push(fromTs);
      where.push(`bag_no_created_dttm >= $${params.length}`);
    }
    if (toTs) {
      params.push(toTs);
      where.push(`bag_no_created_dttm < $${params.length}`);
    }

    const whereSql = where.join(" AND ");

    // Total for the filtered set
    const countSql = `SELECT COUNT(*)::int AS total FROM ${table} WHERE ${whereSql}`;
    const totalRes = await pool.query(countSql, params);
    const total = totalRes.rows?.[0]?.total ?? 0;

    // Data page (stable tie-break on bag_no)
    const selectSql = `
      SELECT
        bag_no,
        bag_weight            AS weight,
        grade,
        bag_no_created_dttm   AS created_at,
        stock_status          AS status,
        bag_created_userid,
        stock_change_userid,
        stock_status_change_dttime,
        quality,
        quality_userid,
        quality_upd_dttime
      FROM ${table}
      WHERE ${whereSql}
      ORDER BY ${sort} ${dir}, bag_no ${dir}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const { rows } = await pool.query(selectSql, [...params, pageSize, offset]);
    console.log(whereSql);
    return res.json({ columns, rows, total, page, pageSize });
  } catch (err) {
    if (/relation .* does not exist/i.test(err?.message || "")) {
      return res.status(404).json({ error: `Table not found for key "${key}"` });
    }
    console.error("Error fetching process records:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/records/download", authenticate, async (req, res) => {
  function assertSafeIdent(ident) {
    if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error("unsafe ident");
  }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const key = String(req.query.key || "");
  if (!key) return res.status(400).json({ error: "Missing key" });

  // Same whitelist sort; default newest first for exports
  const dir  = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const ALLOWED_SORT = new Set(["bag_no_created_dttm", "bag_no", "grade", "stock_status"]);
  const sort = ALLOWED_SORT.has(String(req.query.sort)) ? String(req.query.sort) : "bag_no_created_dttm";

  // Filters (same as list route)
  const bagNo        = req.query.bag_no?.trim();
  const statusParam  = req.query.status;
  const createdFrom  = req.query.created_from?.trim();
  const createdTo    = req.query.created_to?.trim();

  const parseDateStart = (s) => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00.000Z`);
    const d = new Date(s); return isNaN(d) ? null : d;
  };
  const parseDateEndExclusive = (s) => {
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() + 1);
      return d;
    }
    const d = new Date(s); return isNaN(d) ? null : d;
  };

  const fromTs = parseDateStart(createdFrom);
  const toTs   = parseDateEndExclusive(createdTo);

  try {
    const table = `${accountid}_postactivation`;

    // WHERE + params
    const where = [`operations = $1`, `stock_status != 'Packaging'`];
    const params = [key];

    if (bagNo) {
      params.push(`%${bagNo}%`);
      where.push(`bag_no ILIKE $${params.length}`);
    }
    if (statusParam) {
      if (Array.isArray(statusParam)) {
        params.push(statusParam);
        where.push(`stock_status = ANY($${params.length})`);
      } else {
        params.push(String(statusParam));
        where.push(`stock_status = $${params.length}`);
      }
    }
    if (fromTs) {
      params.push(fromTs);
      where.push(`bag_no_created_dttm >= $${params.length}`);
    }
    if (toTs) {
      params.push(toTs);
      where.push(`bag_no_created_dttm < $${params.length}`);
    }

    const whereSql = where.join(" AND ");

    // Use same columns (alias names)
    const columns = [
      "bag_no",
      "weight",
      "grade",
      "created_at",
      "status",
      "bag_created_userid",
      "stock_change_userid",
      "stock_status_change_dttime",
      "quality",
      "quality_userid",
      "quality_upd_dttime",
    ];

    const sql = `
      SELECT
        bag_no,
        bag_weight            AS weight,
        grade,
        bag_no_created_dttm   AS created_at,
        stock_status          AS status,
        bag_created_userid,
        stock_change_userid,
        stock_status_change_dttime,
        quality,
        quality_userid,
        quality_upd_dttime
      FROM ${table}
      WHERE ${whereSql}
      ORDER BY ${sort} ${dir}, bag_no ${dir}
    `;

    const { rows } = await pool.query(sql, params);

    // CSV build (simple & safe escaping)
    const escapeCsv = (val) => {
      if (val == null) return "";
      const v = typeof val === "object" ? JSON.stringify(val) : String(val);
      return /[\",\n]/.test(v) ? `"${v.replace(/\"/g, "\"\"")}"` : v;
    };

    // Optional: format timestamps consistently (ISO)
    const serialize = (row) => ({
      ...row,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      stock_status_change_dttime: row.stock_status_change_dttime
        ? new Date(row.stock_status_change_dttime).toISOString()
        : "",
    });

    const header = columns.join(",") + "\n";
    const body   = rows
      .map(serialize)
      .map((r) => columns.map((c) => escapeCsv(r[c])).join(","))
      .join("\n");
    const csv    = header + body + (rows.length ? "\n" : "");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${key}_records.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    if (/relation .* does not exist/i.test(err?.message || "")) {
      return res.status(404).json({ error: `Table not found for key "${key}"` });
    }
    console.error("Error exporting process records:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});




/**
 * GET /api/status_cont_load
 * - Always uses current day (and yesterday); no ?date
 * - Inward:   <accountid>_destoning (screening_inward_time, screening_bag_weight, ds_bag_no)
 * - Outward:  <accountid>_screening (screening_out_dt, weight, bag_no)
 * - Counters use half-open ranges; last10 lists have NO date filter.
 */
router.get("/status_cont_load", authenticate, async (req, res) => {
    
  try{
    const { accountid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: 'Unauthorized: missing accountid' });
    const tabname = String(req.query.tabname || 'Screening').trim();
    const counters = await getCounters(pool, accountid, tabname);

    return res.json({
      tabname,
      ...counters
    });
  } catch (err) {
    console.error(new Date().toLocaleString(), " /status_screening error:", err);
    return res.status(500).json({ error: "Database error" });
  }
});


// routes/post_activation.js
router.post('/load_bags_cont', authenticate, async (req, res) => {
  const safeIdent = (s) => {
    if (!/^[a-z0-9_]+$/i.test(String(s || ''))) throw new Error('Invalid identifier');
    return s;
  };
  

  try {
    const { accountid, userid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: 'Unauthorized: missing accountid' });

    const tabName = String(req.query.tabName || '').trim();                  // e.g., Screening, Crushing, De-Dusting, De-Magnetize, Blending
    if (!tabName) return res.status(400).json({ error: 'Missing tabName' });

    const { bag_no, weight, machine } = req.body || {};
    const w = Number(weight);
    if (!bag_no || !Number.isFinite(w) || w <= 0) {
      return res.status(400).json({ error: 'bag_no and positive weight are required' });
    }
    // Machine is required only for Screening
    const needsMachine = tabName === 'Screening';
    if (needsMachine && !machine) {
      return res.status(400).json({ error: 'machine is required for Screening' });
    }

    const statusValueLoaded = `${tabName}_Loaded`;

    const destoning = `${safeIdent(accountid)}_destoning`;
    const postact   = `${safeIdent(accountid)}_postactivation`;
    const loadedView = `${safeIdent(accountid)}_postactivation_loaded`;

    const isDSO = /^DSO_/i.test(String(bag_no));

    // Step 1: guard — make sure the bag is still available for this tab (not already loaded)
    if (isDSO) {
      // Must exist in destoning with final_destination = <tabName> and is_loaded = false
      const chk = await pool.query(
        `
        SELECT 1
          FROM ${destoning}
         WHERE ds_bag_no = $1
           AND final_destination = $2
           AND is_loaded = false
         LIMIT 1
        `,
        [bag_no, tabName]
      );
      if (chk.rowCount === 0) {
        return res.status(409).json({
          error: 'This bag is not available to load for the selected tab. Please refresh the available list.',
        });
      }
    } else {
      // Must exist in postactivation with stock_status = <tabName> and is_loaded = false
      const chk = await pool.query(
        `
        SELECT 1
          FROM ${postact}
         WHERE bag_no = $1
           AND stock_status = $2
           AND is_loaded = false
         LIMIT 1
        `,
        [bag_no, tabName]
      );
      if (chk.rowCount === 0) {
        return res.status(409).json({
          error: 'This bag is not available to load for the selected tab. Please refresh the available list.',
        });
      }
    }

    // Step 2: update
    const nowIso = new Date().toISOString();
    let updatedSource = null;

    if (isDSO) {
      // destoning update
      const upd = await pool.query(
        `
        UPDATE ${destoning}
           SET screening_inward_time   = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
               screening_machine       = CASE WHEN $4 THEN $2 ELSE screening_machine END,
               userid_screening_inward = $3,
               screening_bag_weight    = $5,
               final_destination       = $6
         WHERE ds_bag_no = $1
           AND is_loaded = false          -- still ensure race safety
        RETURNING ds_bag_no
        `,
        [
          bag_no,
          needsMachine ? machine : null,  // will be ignored by CASE if not Screening
          userid || null,
          needsMachine,                   // only Screening should write machine
          w,
          statusValueLoaded
        ]
      );
      if (upd.rowCount === 0) {
        return res.status(409).json({ error: 'Bag already loaded by someone else. Please refresh.' });
      }
      updatedSource = 'destoning';
    } else {
      // postactivation update
      const upd = await pool.query(
        `
        UPDATE ${postact}
           SET stock_status  = $2,
               reload_time   = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
               reload_weight = $3,
               reload_userid = $4,
               reload_machine= CASE WHEN $6 THEN $5 ELSE NULL END
         WHERE bag_no = $1
           AND is_loaded = false          -- still ensure race safety
        RETURNING bag_no
        `,
        [
          bag_no,
          statusValueLoaded,
          w,
          userid || null,
          needsMachine ? machine : null,
          needsMachine
        ]
      );
      if (upd.rowCount === 0) {
        return res.status(409).json({ error: 'Bag already loaded by someone else. Please refresh.' });
      }
      updatedSource = 'postactivation';
    }

    // Success: client can remove the bag from available + update counters silently
    const counters = await getCounters(pool, accountid, tabName);

    return res.json({
      success: true,
      updatedSource,
      bag_no,
      removedFromAvailable: true,
      counters
    });
  } catch (err) {
    console.error(new Date().toISOString(), '/post_activation/load_bags_cont error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// routes/post_activation.js
router.post('/createlabel_cont', authenticate, async (req, res) => {
  const safeIdent = (s) => {
    if (!/^[a-z0-9_]+$/i.test(String(s || ''))) throw new Error('Invalid identifier');
    return s;
  };
  

  try {
    const { accountid, userid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: 'Unauthorized: missing accountid' });

    // Params
    const tabName = String(req.query.tabName || '').trim(); // Screening / Crushing / De-Dusting / De-Magnetize / Blending
    if (!tabName) return res.status(400).json({ error: 'Missing tabName' });

    const { weight, grade, bag_no } = req.body || {};
    // DO NOT allow bag_no from client (trigger must create it)
    if (bag_no) return res.status(400).json({ error: 'bag_no must not be provided (auto-generated)' });

    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) return res.status(400).json({ error: 'Positive weight is required' });

    const g = (grade ?? '').toString().trim();
    if (!g) return res.status(400).json({ error: 'grade is required' });

    const postactTbl = `${safeIdent(accountid)}_postactivation`;
    const loadedView = `${safeIdent(accountid)}_postactivation_loaded`;

    // Insert row; trigger generates bag_no. stock_status starts at 'Quality'.
    const insertSql = `
      INSERT INTO ${postactTbl}
        (operations, bag_weight, grade, bag_no_created_dttm, bag_created_userid, stock_status)
      VALUES
        ($1, $2, $3, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'), $4, 'Quality')
      RETURNING bag_no, operations, grade, bag_weight, bag_no_created_dttm
    `;

    const ins = await pool.query(insertSql, [tabName, w, g, userid || null]);
    const created = ins.rows?.[0];
    if (!created) {
      return res.status(500).json({ error: 'Failed to create label' });
    }

    // ----- Build fresh counters (same as /status_cont_load) -----
    const counters = await getCounters(pool, accountid, tabName);

    return res.status(201).json({
      success: true,
      created,
      counters
    });

  } catch (err) {
    console.error(new Date().toISOString(), '/post_activation/create_label error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/records_loaded?tabName=Blending_Loaded&bag_no=I-10&from=2025-10-01&to=2025-10-15&page=1&pageSize=50&sort=loaded_time&dir=desc
router.get("/records_loaded", authenticate, async (req, res) => {
  function assertSafeIdent(s) {
    if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
  }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  // REQUIRED: tabName already includes '_Loaded'
  const loadedStatus = String(req.query.key || "").trim();
  if (!loadedStatus) return res.status(400).json({ error: "tabName is required" });
  if (!/_Loaded$/.test(loadedStatus)) {
    return res.status(400).json({ error: "tabName must include '_Loaded' suffix" });
  }

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // Sorting (whitelist)
  const dir = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const ALLOWED_SORT = new Set(["bag_no","status","loaded_time","machine","userid","bag_weight","reloaded_weight"]);
  const sort = ALLOWED_SORT.has(String(req.query.sort)) ? String(req.query.sort) : "loaded_time";

  // Filters
  const bagNo = (req.query.bag_no || "").trim();
  const from  = (req.query.from   || "").trim(); // YYYY-MM-DD or castable to DATE
  const to    = (req.query.to     || "").trim(); // YYYY-MM-DD or castable to DATE

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  // Normalize columns via UNION ALL
  const unionSql = `
    SELECT
      d.ds_bag_no               AS bag_no,
      'exkiln'                  AS grade,
      d.final_destination       AS status,
      d.screening_inward_time   AS loaded_time,
      d.screening_machine       AS machine,
      d.userid_screening_inward AS userid,
      d.weight_out              AS bag_weight,
      d.screening_bag_weight    AS reloaded_weight
    FROM ${desTable} d
    WHERE d.final_destination = $1
    UNION ALL
    SELECT
      p.bag_no                  AS bag_no,
      p.grade                   AS grade, 
      p.stock_status            AS status,
      p.reload_time             AS loaded_time,
      p.reload_machine          AS machine,
      p.reload_userid           AS userid,
      p.bag_weight              AS bag_weight,
      p.reload_weight           AS reloaded_weight
    FROM ${paTable} p
    WHERE p.stock_status = $1
  `;

  // Build WHERE on aliased columns (date-only)
  const where = [];
  const params = [loadedStatus]; // $1 used twice in UNION
  let idx = 1;

  if (bagNo) { params.push(`%${bagNo}%`); idx++; where.push(`bag_no ILIKE $${idx}`); }

  // DATE-only comparisons (inclusive)
  // If you want IST boundaries instead of UTC, change to:
  // (loaded_time AT TIME ZONE 'Asia/Kolkata')::date
  if (from && to) {
    params.push(from, to); idx += 2;
    where.push(`loaded_time::date BETWEEN $${idx-1}::date AND $${idx}::date`);
  } else if (from) {
    params.push(from); idx++;
    where.push(`loaded_time::date >= $${idx}::date`);
  } else if (to) {
    params.push(to); idx++;
    where.push(`loaded_time::date <= $${idx}::date`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    // Count
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM (${unionSql}) u
      ${whereSql}
    `;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    // Page
    const pageSql = `
      SELECT bag_no, grade,status, loaded_time, machine, userid, bag_weight, reloaded_weight
      FROM (${unionSql}) u
      ${whereSql}
      ORDER BY ${sort} ${dir}, bag_no ${dir}
      LIMIT $${idx + 1} OFFSET $${idx + 2}
    `;
    const rows = (await pool.query(pageSql, [...params, pageSize, offset])).rows;

    const columns = ["bag_no","grade","status","loaded_time","machine","userid","bag_weight","reloaded_weight"];
    res.json({ columns, rows, total, page, pageSize, sort, dir });
  } catch (err) {
    console.error("GET /api/records_loaded error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/records_loaded.csv?tabName=Blending_Loaded&bag_no=I-10&from=2025-10-01&to=2025-10-15
router.get("/records_loaded.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) {
    if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
  }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const loadedStatus = String(req.query.key || "").trim();
  if (!loadedStatus) return res.status(400).json({ error: "tabName is required" });
  if (!/_Loaded$/.test(loadedStatus)) {
    return res.status(400).json({ error: "tabName must include '_Loaded' suffix" });
  }

  const bagNo = (req.query.bag_no || "").trim();
  const from  = (req.query.from   || "").trim();
  const to    = (req.query.to     || "").trim();

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  const unionSql = `
    SELECT
      d.ds_bag_no               AS bag_no,
      'exkiln'.  as grade,
      d.final_destination       AS status,
      d.screening_inward_time   AS loaded_time,
      d.screening_machine       AS machine,
      d.userid_screening_inward AS userid,
      d.weight_out              AS bag_weight,
      d.screening_bag_weight    AS reloaded_weight
    FROM ${desTable} d
    WHERE d.final_destination = $1
    UNION ALL
    SELECT
      p.bag_no                  AS bag_no,
      p.grade as grade,
      p.stock_status            AS status,
      p.reload_time             AS loaded_time,
      p.reload_machine          AS machine,
      p.reload_userid           AS userid,
      p.bag_weight              AS bag_weight,
      p.reload_weight           AS reloaded_weight
    FROM ${paTable} p
    WHERE p.stock_status = $1
  `;

  const where = [];
  const params = [loadedStatus];
  let idx = 1;

  if (bagNo) { params.push(`%${bagNo}%`); idx++; where.push(`bag_no ILIKE $${idx}`); }

  // DATE-only (inclusive). For IST: replace with (loaded_time AT TIME ZONE 'Asia/Kolkata')::date
  if (from && to) {
    params.push(from, to); idx += 2;
    where.push(`loaded_time::date BETWEEN $${idx-1}::date AND $${idx}::date`);
  } else if (from) {
    params.push(from); idx++;
    where.push(`loaded_time::date >= $${idx}::date`);
  } else if (to) {
    params.push(to); idx++;
    where.push(`loaded_time::date <= $${idx}::date`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const sql = `
      SELECT bag_no, grade,status, loaded_time, machine, userid, bag_weight, reloaded_weight
      FROM (${unionSql}) u
      ${whereSql}
      ORDER BY loaded_time DESC, bag_no DESC
    `;
    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="records_loaded_${loadedStatus}.csv"`);

    // write header
    res.write("bag_no,grade,status,loaded_time,machine,userid,bag_weight,reloaded_weight\n");
    const esc = (v) => {
      if (v == null) return "";
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    for (const r of rows) {
      res.write([
        esc(r.bag_no),
        esc(r.status),
        // Make sure timestamps are printable; if PG returns Date objects, .toISOString() is fine
        esc(r.loaded_time?.toISOString?.() ?? r.loaded_time),
        esc(r.machine),
        esc(r.userid),
        esc(r.bag_weight),
        esc(r.reloaded_weight),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/records_loaded.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;






