const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db.js');

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

const { getKolkataDayString, formatToKolkataDay } = require('./date.js');
let dbConnected = false;


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate.js');


router.get("/re_process", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_screening_outward`;
  const table1 = `${accountid}_destoning`;

  try {
    const result = await pool.query(
      `SELECT bag_no, weight,screening_out_dt
       FROM ${table}
       WHERE delivery_status = 'Re-Processing'
       
       union
       select ds_bag_no as bag_no,weight_out as weight,bag_generated_timestamp as screening_out_dt
       from ${table1} where final_destination = 'Re-Processing' 
       ORDER BY screening_out_dt  
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
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ error: 'Invalid account id' });
    }

    const rpTable  = `${accountid}_re_process`;
    const outTable = `${accountid}_re_process_out`;

    try {
      // 1) Active lot (NULL total_out_weight => machine busy)
      const { rows: activeRows } = await pool.query(
        `SELECT lot_id, loaded_dttm, loaded_bag_details, loaded_weight,
                bags_loaded_userid, total_out_weight, bags_out_datetime, bags_out_userid
           FROM ${rpTable}
          WHERE total_out_weight IS NULL
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



router.post('/createlabel', authenticate, checkAccess('Operations.Re-Process'), async (req, res) => {
  
  function assertSafeIdent(ident) {
  if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error('unsafe ident');
  }
  
  const { accountid, userid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: 'Invalid account id' });
  }

  const { lot_id, bag_weight, grade } = req.body || {};
  const weightNum = Number(bag_weight);

  if (!lot_id || typeof lot_id !== 'string' || !lot_id.trim()) {
    return res.status(400).json({ error: 'lot_id is required' });
  }
  if (!grade || typeof grade !== 'string' || !grade.trim()) {
    return res.status(400).json({ error: 'grade is required' });
  }
  if (!Number.isFinite(weightNum) || weightNum <= 0) {
    return res.status(400).json({ error: 'bag_weight must be a positive number' });
  }

  const rpTable  = `${accountid}_re_process`;
  const outTable = `${accountid}_re_process_out`;

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
      `INSERT INTO ${outTable} (lot_id, bag_weight, grade, bag_created_userid)
       VALUES ($1, $2, $3, $4)
       RETURNING lot_id, bag_no, bag_weight, grade, bag_no_created_dttm, stock_status, bag_created_userid`,
      [lot_id, weightNum, grade.trim(), userid]
    );

    await client.query('COMMIT');
    return res.json({ success: true, out_bag: rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Create out bag failed:', e);
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

  const outTable = `${accountid}_re_process_out`;

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
router.post('/move_to_stock', authenticate, checkAccess('Operations.Re-Process'), async (req, res) => {
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

  const rpTable  = `${accountid}_re_process`;
  const outTable = `${accountid}_re_process_out`;

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
          SET stock_status = 'InStock',
              stock_change_userid = $2
        WHERE lot_id = $1`,
      [lot_id, userid]
    );

    // 5) Close the lot with totals + stamps
    await client.query(
      `UPDATE ${rpTable}
          SET total_out_weight = $2,
              bags_out_datetime = NOW(),
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
router.post('/load_bags', authenticate, checkAccess('Operations.Re-Process'), async (req, res) => {
  
  function assertSafeIdent(ident) {
    if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error('unsafe ident');
  }
  const { accountid, userid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: 'Invalid account id' });
  }

  // Accept "bags" (preferred) or "loaded_bag_details" for flexibility
  const incoming = Array.isArray(req.body?.bags)
    ? req.body.bags
    : (Array.isArray(req.body?.loaded_bag_details) ? req.body.loaded_bag_details : []);

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: 'No bags provided.' });
  }

  // Normalize + validate (NO created_dttm here)
  const details = [];
  let totalWeight = 0;
  for (const b of incoming) {
    const bag_no = (b?.bag_no || '').trim();
    const w = Number(b?.weight);
    if (!bag_no) {
      return res.status(400).json({ error: 'Each bag must have a bag_no.' });
    }
    if (!Number.isFinite(w) || w <= 0) {
      return res.status(400).json({ error: `Invalid weight for bag ${bag_no}.` });
    }
    details.push({ bag_no, weight: w });
    totalWeight += w;
  }

  const rpTable        = `${accountid}_re_process`;
  const outScreenTable = `${accountid}_screening_outward`;
  const destoningTable = `${accountid}_destoning`;

  // Split by source prefix (case-insensitive)
  const sBags = details.map(d => d.bag_no).filter(b => /^s/i.test(b));
  const dBags = details.map(d => d.bag_no).filter(b => /^d/i.test(b));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Prevent double-start if a lot is already active
    const { rows: active } = await client.query(
      `SELECT 1 FROM ${rpTable} WHERE total_out_weight IS NULL LIMIT 1`
    );
    if (active.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Machine is busy with an active lot.' });
    }

    // Insert new lot (loaded_dttm defaults to CURRENT_TIMESTAMP in schema)
    const insertSql = `
      INSERT INTO ${rpTable} (loaded_bag_details, loaded_weight, bags_loaded_userid)
      VALUES ($1::jsonb, $2, $3)
      RETURNING lot_id, loaded_dttm, loaded_weight, loaded_bag_details, bags_loaded_userid
    `;
    const { rows: lotRows } = await client.query(insertSql, [
      JSON.stringify(details), totalWeight, userid
    ]);
    const lot = lotRows[0];

    // Update sources
    if (sBags.length) {
      await client.query(
        `UPDATE ${outScreenTable}
            SET delivery_status = 'Re-Processed'
          WHERE bag_no = ANY($1)`,
        [sBags]
      );
    }
    if (dBags.length) {
      await client.query(
        `UPDATE ${destoningTable}
            SET final_destination = 'Re-Processed'
          WHERE ds_bag_no = ANY($1)`,
        [dBags]
      );
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      lot,
      updated: { screening: sBags.length, destoning: dBags.length }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('load_bags failed:', err);
    res.status(500).json({ error: 'Failed to start re-process (load bags).' });
  } finally {
    client.release();
  }
});


router.get("/bags", authenticate, async (req, res) => {
  function normalizeBucketToSuffix(bucket = "") {
    return String(bucket)
      .toLowerCase()
      .replace(/-/g, "_")        // hyphens -> underscores
      .replace(/\s+/g, "_")      // spaces -> underscores
      .replace(/[^a-z0-9_]/g, "")// strip anything else (hardening)
      .replace(/_+/g, "_")       // collapse multiple _
      .replace(/^_+|_+$/g, "");  // trim leading/trailing _
  }
  try {
    const { accountid } = req.user || {};
    const bucketParam = req.query.bucket;

    if (!bucketParam) {
      return res.status(400).json({ success: false, error: "Missing 'bucket' query param" });
    }

    const suffix = normalizeBucketToSuffix(bucketParam);

    // Validate suffix (only a-z, 0-9, _; length guard)
    if (!/^[a-z0-9_]{2,64}$/.test(suffix)) {
      return res.status(400).json({ success: false, error: "Invalid bucket value" });
    }

    const table = `${accountid}_${suffix}_out`;

    // Optional: check that the table exists to return a clean 404 instead of a PG error
    const existsQ = await pool.query("SELECT to_regclass($1) AS reg;", [table]);
    if (!existsQ.rows[0]?.reg) {
      return res.status(404).json({ success: false, error: `Bucket table not found: ${table}` });
    }

    // NOTE: table name is safe after strict validation above
    const sql = `
      SELECT bag_no as id, bag_weight as weightKg , grade, '${bucketParam}' as stage
      FROM ${table}
      WHERE stock_status = 'Quality'
    `;

    const result = await pool.query(sql);
    console.log(result.rows);
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching post_activation bags:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;




