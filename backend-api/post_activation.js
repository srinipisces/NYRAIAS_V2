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


router.get("/bags_to_process", authenticate,async (req, res) => {
  const {accountid} = req.user;
  const table = `${accountid}_postactivaton_process_view`;
  const {tabName} = req.query;
   
  try {
    const result = await pool.query(
      `select bag_no,bag_weight as weight,grade,bag_no_created_dttm as screening_out_dt from ${table} 
      where stock_status='${tabName}' order by bag_no_created_dttm
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
    const machine = TAB_TO_MACHINE[tabName];
  
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ error: 'Invalid account id' });
    }

    const rpTable  = `${accountid}_${machine}_in`;
    const outTable = `${accountid}_${machine}_out`;

    try {
      // 1) Active lot (NULL total_out_weight => machine busy)
      const { rows: activeRows } = await pool.query(
        `SELECT lot_id, loaded_dttm, loaded_bags as loaded_bag_details, loaded_weight,
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



router.post('/createlabel', authenticate, checkAccess('Operations.PostActivation.Screening'), async (req, res) => {
  
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

  const rpTable  = `${accountid}_${machine}_in`;
  const outTable = `${accountid}_${machine}_out`;

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
  const outTable = `${accountid}_${machine}_out`;

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

  const rpTable  = `${accountid}_${machine}_in`;
  const outTable = `${accountid}_${machine}_out`;

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
router.post(
  '/load_bags',
  authenticate,
  checkAccess('Operations.PostActivation'),
  async (req, res) => {
    function assertSafeIdent(ident) {
      if (!/^[a-z0-9_]+$/i.test(ident)) throw new Error('unsafe ident');
    }

    const { accountid, userid } = req.user || {};
    const { tabName } = req.query || {};
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ error: 'Invalid account id' });
    }
    if (!tabName) return res.status(400).json({ error: 'Missing tabName' });

    // Tab label -> machine key for "<accountid>_<machine>_in"
    const TAB_TO_MACHINE = {
      Screening: 'screening',
      Crushing: 'crushing',
      'De-Dusting': 'de_dusting',
      'De-Magnetize': 'de_magnetize',
      Blending: 'blending',
      Packaging: 'packaging',
    };
    const machine = TAB_TO_MACHINE?.[tabName];
    if (!machine) return res.status(400).json({ error: 'Invalid tabName' });

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
      const grade = (b?.grade ?? null);
      details.push({ bag_no, weight: w, grade });
      //details.push({ bag_no, weight: w });
      totalWeight += w;
    }

    // Target "in" table
    const rpTable = `${accountid}_${machine}_in`;

    // Prefix -> { table, id column, STATUS COLUMN }
    // DSO uses final_destination; all others use stock_status
    const SRC_BY_PREFIX = {
      DSO: { table: `${accountid}_destoning`,        id_col: 'ds_bag_no', status_col: 'final_destination' },
      SCR: { table: `${accountid}_screening_out`,    id_col: 'bag_no',    status_col: 'stock_status'      },
      CRU: { table: `${accountid}_crushing_out`,     id_col: 'bag_no',    status_col: 'stock_status'      },
      DDU: { table: `${accountid}_de_dusting_out`,   id_col: 'bag_no',    status_col: 'stock_status'      },
      DMZ: { table: `${accountid}_de_magnetize_out`, id_col: 'bag_no',    status_col: 'stock_status'      },
      BLD: { table: `${accountid}_blending_out`, id_col: 'bag_no',    status_col: 'stock_status'      },
    };

    // Group bag_nos by prefix
    const groups = { DSO: [], SCR: [], CRU: [], DDU: [], DMZ: [],BLD: [], _unknown: [] };
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

    const statusValue = `${tabName}_loaded`; // e.g., "Screening_loaded"

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

      // Insert lot (schema default handles loaded_dttm)
      // If your column is "loaded_bags" instead of "loaded_bag_details", swap it here.
      const insertSql = `
        INSERT INTO ${rpTable} (loaded_bags, loaded_weight, bags_loaded_userid)
        VALUES ($1::jsonb, $2, $3)
        RETURNING lot_id, loaded_dttm, loaded_weight, loaded_bags, bags_loaded_userid
      `;
      const { rows: lotRows } = await client.query(insertSql, [
        JSON.stringify(details), totalWeight, userid
      ]);
      const lot = lotRows[0];

      // Mark source bags unavailable (per table’s status column)
      const updatedCounts = { DSO: 0, SCR: 0, CRU: 0, DDU: 0, DMZ: 0 };
      for (const prefix of Object.keys(SRC_BY_PREFIX)) {
        const bagList = groups[prefix];
        if (!bagList.length) continue;

        const { table, id_col, status_col } = SRC_BY_PREFIX[prefix];
        const sql = `
          UPDATE ${table}
             SET ${status_col} = $1
           WHERE ${id_col} = ANY($2)
        `;
        const r = await client.query(sql, [statusValue, bagList]);
        updatedCounts[prefix] = r.rowCount || 0;
      }

      await client.query('COMMIT');
      return res.json({
        success: true,
        lot,
        updated: updatedCounts,
        unknown_prefix: groups._unknown
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('load_bags failed:', err);
      return res.status(500).json({ error: 'Failed to start re-process (load bags).' });
    } finally {
      client.release();
    }
  }
);



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
    
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching post_activation bags:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});





/**
 * POST /api/post_activation/quality_save
 * Body:
 *  - bucket: string (required)
 *  - bag_no or id: string (required)
 *  - quality: object (JSON) (required)
 *  - remarks: string (optional)
 *  - next_destination: string (required)
 */
router.post("/quality_save", authenticate, async (req, res) => {
  const { accountid, userid} = req.user || {};
  const {
    bucket,
    bag_no,
    id: idAlt,
    quality,
    remarks = null,
    next_destination,
  } = req.body || {};
  // Normalize "De-Dusting" / "De Dusting" / "De_Dusting" -> "de_dusting"
    function normalizeBucketToSuffix(bucket = "") {
      return String(bucket)
        .toLowerCase()
        .replace(/[-\s]+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    }

    
  try {
    // Validate inputs
    if (!accountid) {
      return res.status(400).json({ success: false, error: "Missing account context" });
    }
    if (!bucket) {
      return res.status(400).json({ success: false, error: "Missing 'bucket'" });
    }
    const bagNo = bag_no || idAlt;
    if (!bagNo) {
      return res.status(400).json({ success: false, error: "Missing 'bag_no' (or 'id')" });
    }
    if (quality == null || typeof quality !== "object") {
      return res.status(400).json({ success: false, error: "'quality' must be a JSON object" });
    }
    if (!next_destination) {
      return res.status(400).json({ success: false, error: "Missing 'next_destination'" });
    }

    // Normalize bucket -> table suffix
    const suffix = normalizeBucketToSuffix(bucket);
    if (!/^[a-z0-9_]{2,64}$/.test(suffix)) {
      return res.status(400).json({ success: false, error: "Invalid 'bucket' format" });
    }
    const table = `${accountid}_${suffix}_out`;

    const client = await pool.connect();
    try {
      // Ensure table exists
      const existsQ = await client.query("SELECT to_regclass($1) AS reg;", [table]);
      if (!existsQ.rows[0]?.reg) {
        return res.status(404).json({ success: false, error: `Bucket table not found: ${table}` });
      }

      const qualityJson = JSON.stringify(quality);
      // Build UPDATE (identifiers interpolated after validation; values parameterized)
      const sql = `
        UPDATE ${table}
        SET
          quality           = $1::jsonb,
          quality_userid    = $2,
          stock_status       = $3,
          quality_upd_dttime  = CURRENT_TIMESTAMP,
          remarks           = $4
        WHERE bag_no = $5
        RETURNING bag_no, stock_status AS stock_status, quality, remarks, quality_userid, quality_upd_dttime;
      `;

      const params = [qualityJson, userid, next_destination, remarks, bagNo];
      console.log(params);
      const result = await client.query(sql, params);

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: `Bag not found: ${bagNo}` });
      }

      return res.json({ success: true, data: result.rows[0] });
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
  const { accountid } = req.user || {};
  if (!accountid) return res.status(401).json({ error: "Unauthorized" });

  const key = String(req.query.key || "").toLowerCase().trim();
  const VALID_KEYS = new Set(["destoning", "screening", "blending", "de_dusting", "de_magnetize"]);
  if (!VALID_KEYS.has(key)) return res.status(400).json({ error: "Invalid or missing key" });

  const dir = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  try {
    if (key === "destoning") {
      // ---- De-Stoning: different schema/columns ----
      const table = `${accountid}_destoning`;

      // Columns tailored for destoning
      const columns = [
        "ds_bag_no",
        "loaded_weight",
        "weight_out",
        "final_destination",
        "quality",
      ];

      // Safe sort for destoning
      const ALLOWED_SORT = new Set(["ds_bag_no", "weight_out", "loaded_weight"]);
      const sort = ALLOWED_SORT.has(String(req.query.sort)) ? String(req.query.sort) : "ds_bag_no";

      const sql = `
        SELECT
          ds_bag_no,
          loaded_weight,
          weight_out,
          final_destination,
          quality
        FROM ${table}
        WHERE ds_bag_no IS NOT NULL
          AND (final_destination IS DISTINCT FROM 'Packaging')
        ORDER BY ${sort} ${dir};
      `;

      const { rows } = await pool.query(sql);
      return res.json({ columns, rows });
    }

    // ---- Generic *_out tables: screening/blending/dedusting/demagnetize ----
    const table = `${accountid}_${key}_out`;

    // UI-friendly column names (aliasing where needed)
    const columns = [
      "lot_id",
      "bag_no",
      "weight",
      "grade",
      "created_at",
      "status",
      "bag_created_userid",
      "stock_change_userid",
      "stock_change_dttime",
      "quality",
      "quality_userid",
      "quality_upd_dttime",
      "remarks",
    ];

    // Safe sort for generic tables
    const ALLOWED_SORT = new Set(["bag_no_created_dttm", "bag_no", "grade", "stock_status", "lot_id"]);
    const sort = ALLOWED_SORT.has(String(req.query.sort))
      ? String(req.query.sort)
      : "bag_no_created_dttm";

    const sql = `
      SELECT
        lot_id,
        bag_no,
        bag_weight            AS weight,
        grade,
        bag_no_created_dttm   AS created_at,
        stock_status          AS status,
        bag_created_userid,
        stock_change_userid,
        stock_change_dttime,
        quality,
        quality_userid,
        quality_upd_dttime,
        COALESCE(remarks,'')  AS remarks
      FROM ${table}
      WHERE stock_status <> 'Packaging'
      ORDER BY ${sort} ${dir};
    `;

    const { rows } = await pool.query(sql);
    return res.json({ columns, rows });
  } catch (err) {
    if (/relation .* does not exist/i.test(err?.message || "")) {
      return res.status(404).json({ error: `Table not found for key "${key}"` });
    }
    console.error("Error fetching process records:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * GET /api/status_screening
 * - Always uses current day (and yesterday); no ?date
 * - Inward:   <accountid>_destoning (screening_inward_time, screening_bag_weight, ds_bag_no)
 * - Outward:  <accountid>_screening (screening_out_dt, weight, bag_no)
 * - Counters use half-open ranges; last10 lists have NO date filter.
 */
router.get("/status_screening", authenticate, async (req, res) => {
  const safeTable = (base) => {
    if (!/^[a-z0-9_]+$/i.test(base)) throw new Error("Invalid accountid/table name");
    return base;
  };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  };
  const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const ddmmyy = (d) =>
    `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getFullYear()).slice(-2)}`;

  const { accountid } = req.user || {};
  if (!accountid) return res.status(401).json({ error: "Unauthorized: missing accountid" });

  try {
    const destoning = `${safeTable(accountid)}_destoning`;
    const screening = `${safeTable(accountid)}_screening_outward`;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = addDays(todayStart, 1);
    const yestStart = addDays(todayStart, -1);
    const yestEnd = todayStart;

    const pTodayStart = ymd(todayStart);
    const pTodayEnd = ymd(todayEnd);
    const pYestStart = ymd(yestStart);
    const pYestEnd = ymd(yestEnd);

    const todayInwardQ = pool.query(
      `
      SELECT
        COUNT(ds_bag_no)::int                            AS loaded_count,
        COALESCE(SUM(screening_bag_weight), 0.0)::float8 AS loaded_total_weight
      FROM ${destoning}
      WHERE screening_inward_time IS NOT NULL
        AND screening_inward_time >= $1::timestamp
        AND screening_inward_time <  $2::timestamp
      `,
      [pTodayStart, pTodayEnd]
    );

    const todayOutwardQ = pool.query(
      `
      SELECT
        COUNT(bag_no)::int                 AS output_count,
        COALESCE(SUM(weight), 0.0)::float8 AS output_total_weight
      FROM ${screening}
      WHERE screening_out_dt >= $1::timestamp
        AND screening_out_dt <  $2::timestamp
      `,
      [pTodayStart, pTodayEnd]
    );

    const yestInwardQ = pool.query(
      `
      SELECT
        COUNT(ds_bag_no)::int                            AS loaded_count,
        COALESCE(SUM(screening_bag_weight), 0.0)::float8 AS loaded_total_weight
      FROM ${destoning}
      WHERE screening_inward_time IS NOT NULL
        AND screening_inward_time >= $1::timestamp
        AND screening_inward_time <  $2::timestamp
      `,
      [pYestStart, pYestEnd]
    );

    const yestOutwardQ = pool.query(
      `
      SELECT
        COUNT(bag_no)::int                 AS output_count,
        COALESCE(SUM(weight), 0.0)::float8 AS output_total_weight
      FROM ${screening}
      WHERE screening_out_dt >= $1::timestamp
        AND screening_out_dt <  $2::timestamp
      `,
      [pYestStart, pYestEnd]
    );

    // Global last-10 lists (no date filter)
    const last10LoadedQ = pool.query(
      `
      SELECT
        ds_bag_no                   AS bag_no,
        screening_bag_weight        AS weight,
        screening_inward_time::text AS loaded_at
      FROM ${destoning}
      WHERE screening_inward_time IS NOT NULL
      ORDER BY screening_inward_time DESC
      LIMIT 10
      `
    );

    const last10OutputQ = pool.query(
      `
      SELECT
        bag_no,
        weight,
        screening_out_dt::text      AS output_at
      FROM ${screening}
      ORDER BY screening_out_dt DESC
      LIMIT 10
      `
    );

    const [
      tInRes, tOutRes, yInRes, yOutRes, last10LoadedRes, last10OutputRes
    ] = await Promise.all([
      todayInwardQ, todayOutwardQ, yestInwardQ, yestOutwardQ, last10LoadedQ, last10OutputQ
    ]);

    const tIn = tInRes.rows[0] || {};
    const tOut = tOutRes.rows[0] || {};
    const yIn = yInRes.rows[0] || {};
    const yOut = yOutRes.rows[0] || {};

    const todayCounters = {
      loaded: { count: Number(tIn.loaded_count || 0),  totalWeight: Number(tIn.loaded_total_weight || 0) },
      output: { count: Number(tOut.output_count || 0), totalWeight: Number(tOut.output_total_weight || 0) },
      delta:  { weight: (Number(tIn.loaded_total_weight || 0) - Number(tOut.output_total_weight || 0)) }
    };

    const yesterdayCounters = {
      loaded: { count: Number(yIn.loaded_count || 0),  totalWeight: Number(yIn.loaded_total_weight || 0) },
      output: { count: Number(yOut.output_count || 0), totalWeight: Number(yOut.output_total_weight || 0) },
      delta:  { weight: (Number(yIn.loaded_total_weight || 0) - Number(yOut.output_total_weight || 0)) }
    };

    const last10Loaded = (last10LoadedRes.rows || []).map(r => ({
      bagNo: r.bag_no, weight: Number(r.weight) || 0, loadedAt: r.loaded_at
    }));
    const last10Output = (last10OutputRes.rows || []).map(r => ({
      bagNo: r.bag_no, weight: Number(r.weight) || 0, outputAt: r.output_at
    }));

    return res.json({
      today: ddmmyy(todayStart),
      yesterday: ddmmyy(yestStart),
      todayCounters,
      yesterdayCounters,
      last10Loaded,
      last10Output
    });
  } catch (err) {
    console.error(new Date().toLocaleString(), " /status_screening error:", err);
    return res.status(500).json({ error: "Database error" });
  }
});



module.exports = router;






