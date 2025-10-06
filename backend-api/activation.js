// routes/kilnLoads.js
const express = require("express");
const router = express.Router();
// import your pg pool and authenticate middleware
const pool = require("./db");          // adjust path
const { authenticate } = require("./authenticate"); // adjust path
const checkAccess= require('./checkaccess.js');
const { getKolkataDayString, formatToKolkataDay } = require('./date');

// GET /api/kiln/loads?k
// Query params:
//   kiln=A|B|C (required)
//   minutes=1..720 (optional; default 360)
//   round=0..3 (optional; default 2)
// GET /api/kiln/loads?k iln=Kiln%20A
router.get("/kiln/loads", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (!/^[a-z0-9_]+$/i.test(accountid)) {
      return res.status(400).json({ success: false, error: "Invalid account id" });
    }
    const table = `${accountid}_material_outward_bag`;

    const kilnParam = String(req.query.kiln || "").trim();
    if (!["Kiln A", "Kiln B", "Kiln C"].includes(kilnParam)) {
      return res.status(400).json({ success: false, error: "kiln must be one of A, B, C" });
    }

    const sql = `
      SELECT
        mob.bag_no,
        mob.kiln,
        mob.kiln_loaded_weight,
        mob.kiln_feed_status,
        mob.kiln_load_time,
        ROUND(
          (EXTRACT(EPOCH FROM (NOW() - mob.kiln_load_time)) / 3600.0)::numeric,
          2
        )::float AS "hoursAgo"
      FROM ${table} AS mob
      WHERE mob.kiln_feed_status = 'loaded'
        AND mob.kiln = '${kilnParam}'
        AND mob.kiln_load_time >= NOW() - INTERVAL '6 hours'
      ORDER BY mob.kiln_load_time DESC
      LIMIT 500;
    `;
    
    const { rows } = await pool.query(sql);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/kiln/loads error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});


router.post("/kilnfeed", authenticate, checkAccess('Operations.Activation.Kiln Feed'), async (req, res) => {
  const { userid, accountid } = req.user;
  const rawtable = `${accountid}_rawmaterial_rcvd`;
  const table = `${accountid}_material_outward_bag`;
  const historyTable = `${accountid}_rawmaterial_inward_history`;

  const { inward_number, bag_no, bags_loaded_for, kiln_loaded_bag_weight } = req.body;
  const day = getKolkataDayString(); // 'YYYY-MM-DD'

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // ✅ Pre-check: is this bag already loaded?
    const preCheck = await client.query(
      `SELECT 1 FROM ${table}
       WHERE inward_number = $1 AND bag_no = $2 AND kiln_feed_status = 'loaded'`,
      [inward_number, bag_no]
    );

    if (preCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Bag is already loaded in kiln" });
    }

    // ✅ 1. Mark bag as loaded
    await client.query(
      `UPDATE ${table} 
       SET kiln_load_time = current_timestamp,
           kiln = $3,
           kiln_feed_status = 'loaded',
           kiln_loaded_weight = $4,
           kiln_load_user = $5 
       WHERE inward_number = $1 AND bag_no = $2`,
      [inward_number, bag_no, bags_loaded_for, kiln_loaded_bag_weight,userid]
    );

    // ✅ 2. Check if all bags for this inward_number are loaded
    const checkResult = await client.query(
      `SELECT COUNT(*) FILTER (WHERE kiln_feed_status IS DISTINCT FROM 'loaded') AS pending
       FROM ${table}
       WHERE inward_number = $1
         AND grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
      [inward_number]
    );

    const pending = parseInt(checkResult.rows[0].pending, 10);

    if (pending === 0) {
      await client.query(
        `UPDATE ${rawtable}
         SET kiln_feed_status = 'completed',
             kiln_feed_status_upddt = current_timestamp,
             kiln_feed_userid = $2
         WHERE inward_number = $1`,
        [inward_number, userid]
      );
    }

    // ✅ 3. Update or insert into history
    const historyCheck = await client.query(
      `SELECT * FROM ${historyTable} WHERE inward_number = $1 AND day::date = $2`,
      [inward_number, day]
    );

    if (historyCheck.rowCount > 0) {
      // 🔄 Update existing history row
      await client.query(
        `UPDATE ${historyTable}
         SET kiln_loaded_weight = COALESCE(kiln_loaded_weight, 0) + $1,
             kiln_load_no_bags = COALESCE(kiln_load_no_bags, 0) + 1,
             Gcharcoal_stock = COALESCE(Gcharcoal_stock, 0) - $1
         WHERE inward_number = $2 AND day::date = $3`,
        [Number(kiln_loaded_bag_weight), inward_number, day]
      );
    } else {
      // ➕ Insert new row for today
      const latest = await client.query(
        `SELECT * FROM ${historyTable} WHERE inward_number = $1 ORDER BY day DESC LIMIT 1`,
        [inward_number]
      );

      const base = latest.rows[0] || {};

      const aggResult = await client.query(
        `SELECT 
           SUM(kiln_loaded_weight) AS total_weight
         FROM ${table}
         WHERE inward_number = $1 
           AND kiln_feed_status = 'loaded'
           AND grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
        [inward_number]
      );

      const totalWeight = Number(aggResult.rows[0]?.total_weight || 0);
      const totalBags = 1; // reset for the day
      const newGCharcoalStock = (base.gcharcoal_weight_after_crusher || 0) - totalWeight;

      await client.query(
        `INSERT INTO ${historyTable}
          (day, inward_number, supplier_name, supplier_weight, weight_at_security,
           raw_material_inward_no_bags, raw_material_inward_weight, raw_material_inward_stock,
           raw_material_inward_loss_or_gain, raw_material_inward_status,
           raw_material_outward_status, raw_material_outward_no_bags,
           Gcharcoal_Weight_after_crusher, Physical_Loss_in_crusher, Total_weight_from_crusher,
           kiln_loaded_weight, kiln_load_no_bags, Gcharcoal_stock)
         VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8,
           $9, $10,
           $11, $12,
           $13, $14, $15,
           $16, $17, $18
         )`,
        [
          day,
          inward_number,
          base.supplier_name || '',
          base.supplier_weight || 0,
          base.weight_at_security || 0,
          base.raw_material_inward_no_bags || 0,
          base.raw_material_inward_weight || 0,
          base.raw_material_inward_stock || 0,
          base.raw_material_inward_loss_or_gain || 0,
          base.raw_material_inward_status || null,
          base.raw_material_outward_status || null,
          base.raw_material_outward_no_bags || 0,
          base.gcharcoal_weight_after_crusher || 0,
          base.physical_loss_in_crusher || 0,
          base.total_weight_from_crusher || 0,
          totalWeight,
          totalBags,
          newGCharcoalStock
        ]
      );
    }

    await client.query("COMMIT");
    res.json({ operation: 'success' });

  } catch (err) {
    console.error(new Date().toLocaleString(), ":", err);
    if (client) await client.query("ROLLBACK");
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
});

router.get("/inwardnumber_kilnfeed_bag_no_select", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  if (!accountid) return res.status(401).json({ error: "Unauthorized" });

  if (!/^[a-z0-9_]+$/i.test(accountid)) {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;

  try {
    // Build: { "I-10422": ["KOA_...014","KOA_...015"], "I-10408": ["KOA_...003"] }
    const sql = `
      SELECT COALESCE(
        json_object_agg(inward_number, bag_list ORDER BY inward_number),
        '{}'::json
      ) AS grouped
      FROM (
        SELECT
          inward_number,
          array_agg(bag_no ORDER BY bag_no DESC) AS bag_list
        FROM ${table}
        WHERE kiln_feed_status IS NULL
          AND grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')
          AND inward_number IS NOT NULL
        GROUP BY inward_number
        -- optional: keep payload bounded (e.g., newest 100 inward_numbers)
        ORDER BY MAX(kiln_load_time) DESC
        LIMIT 100
      ) s;
    `;

    const { rows } = await pool.query(sql);
    // rows[0]?.grouped is already the desired JSON object
    console.log(rows);
    res.json(rows[0]?.grouped ?? {});
  } catch (err) {
    console.error(new Date().toISOString(), err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/kilnoutput", authenticate,checkAccess('Operations.Activation.Kiln Feed'),async (req, res) => {
  const {userid,accountid} = req.user;
  const table = `${accountid}_kiln_output`;
  try {
    const text = `
    INSERT INTO ${table}
      (
       write_timestamp,
       kiln_output_dt,
       from_the_kiln,
       weight_with_stones,
       userid_kilnoutput,
       exkiln_stock)
    VALUES
      (
       current_timestamp,
       current_timestamp,                     
       $1,                     
       $2,                    
       $3,
       'De-Stoning'                                    
       )                     
    RETURNING bag_no;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.kiln,
      req.body.bag_weight,
      userid
    ];
      
    const result = await pool.query(text, values);
    const newInwardNumber = result.rows[0].bag_no;
    res.json({
      operation: 'success',
      bag_no: newInwardNumber
    });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }


})

router.get("/kilnoutput", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_kiln_output`;
  try {
    const kiln = String(req.query.kiln || "");
    const sql = `
      SELECT bag_no, weight_with_stones
      FROM ${table}
      WHERE from_the_kiln = $1
      ORDER BY write_timestamp DESC
      LIMIT 10
    `;
    const { rows } = await pool.query(sql, [kiln]);
    res.json({ rows }); // no columns/time
  } catch (err) {
    console.error(new Date().toISOString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/activation/kilnFeedQuality
// Query params:
//   page=1&pageSize=50
//   inward=<partial match>
//   from=YYYY-MM-DD
//   to=YYYY-MM-DD
//   download=1   (optional; returns ALL filtered rows, ignoring pagination)
router.get("/kilnFeedQuality", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_material_outward_bag`;

  // Pagination (default 50)
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset = (page - 1) * pageSize;

  // Filters
  const inward = (req.query.inward ?? "").trim(); // partial match
  const from = (req.query.from ?? "").trim();      // YYYY-MM-DD
  const to = (req.query.to ?? "").trim();          // YYYY-MM-DD (inclusive)
  const download = String(req.query.download ?? "") === "1";

  // Build WHERE safely
  const whereParts = [
    `kiln_quality_updt IS NOT NULL`,
    `grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`
  ];
  const values = [];
  let idx = 1;

  if (inward) {
    whereParts.push(`LOWER(inward_number) LIKE LOWER($${idx++})`);
    values.push(`%${inward}%`);
  }
  if (from) {
    // inclusive from 00:00:00
    whereParts.push(`kiln_quality_updt >= $${idx++}`);
    values.push(`${from} 00:00:00`);
  }
  if (to) {
    // inclusive to 23:59:59.999
    whereParts.push(`kiln_quality_updt <= $${idx++}`);
    values.push(`${to} 23:59:59.999`);
  }
  const WHERE = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

  try {
    const base = `
      SELECT
        inward_number,
        bag_no,
        grade,
        weight,
        kiln,
        kiln_loaded_weight,
        grade_plus2, grade_2by3, grade_3by6, grade_6by8, grade_8by10, grade_10by12, grade_12by14,
        grade_minus14, feed_moisture, dust, feed_volatile, remarks, kiln_load_time, kiln_quality_updt,
        kiln_feed_quality_sysentry
      FROM ${table}
      ${WHERE}
    `;

    // Count total first (without limit/offset)
    const countSql = `SELECT COUNT(*)::int AS cnt FROM (${base}) x`;
    const countRes = await pool.query(countSql, values);
    const total = countRes.rows?.[0]?.cnt ?? 0;

    // Now fetch rows
    const orderSql = ` ORDER BY kiln_feed_quality_sysentry DESC NULLS LAST`;
    const pageSql = download ? "" : ` LIMIT $${idx++} OFFSET $${idx++}`;
    const pageVals = download ? [] : [pageSize, offset];

    const rowsSql = `${base} ${orderSql} ${pageSql}`;
    const result = await pool.query(rowsSql, [...values, ...pageVals]);

    const rows = result.rows;

    // Build columns from fields (hide helper sysentry column)
    const columns = result.fields
      .map((f) => ({
        field: f.name,
        headerName: f.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        flex: 1,
      }))
      .filter((c) => c.field !== "kiln_feed_quality_sysentry");

    // Tidy rows (remove helper)
    const cleanedRows = rows.map(({ kiln_feed_quality_sysentry, ...rest }) => rest);

    // If download mode, just return rows+columns (no paging UI metadata needed)
    if (download) {
      return res.json({ columns, rows: cleanedRows, total });
    }

    const totalPages = total ? Math.ceil(total / pageSize) : 0;

    res.json({
      columns,
      rows: cleanedRows,
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    console.error(new Date().toISOString(), "kilnFeedQuality error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// routes/activation.js (or wherever your routes live)

router.get("/kilnFeedQuality.csv", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_material_outward_bag`;

  // Filters
  const inward = (req.query.inward ?? "").trim();
  const from   = (req.query.from ?? "").trim(); // YYYY-MM-DD
  const to     = (req.query.to ?? "").trim();   // YYYY-MM-DD

  const whereParts = [
    `kiln_quality_updt IS NOT NULL`,
    `grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`
  ];
  const values = [];
  let i = 1;

  if (inward) {
    whereParts.push(`LOWER(inward_number) LIKE LOWER($${i++})`);
    values.push(`%${inward}%`);
  }
  if (from) {
    whereParts.push(`kiln_quality_updt >= $${i++}`);
    values.push(`${from} 00:00:00`);
  }
  if (to) {
    whereParts.push(`kiln_quality_updt <= $${i++}`);
    values.push(`${to} 23:59:59.999`);
  }
  const WHERE = `WHERE ${whereParts.join(" AND ")}`;

  // Column order for CSV (and SQL select)
  const columns = [
    "inward_number","bag_no","grade","weight","kiln","kiln_loaded_weight",
    "grade_plus2","grade_2by3","grade_3by6","grade_6by8","grade_8by10","grade_10by12","grade_12by14",
    "grade_minus14","feed_moisture","dust","feed_volatile","remarks",
    // dates at the end; format them in SQL so CSV is clean
    `to_char(kiln_load_time, 'YYYY-MM-DD HH24:MI:SS') AS kiln_load_time`,
    `to_char(kiln_quality_updt, 'YYYY-MM-DD HH24:MI:SS') AS kiln_quality_updt`
  ];

  try {
    const sql = `
      SELECT
        ${columns.join(",\n        ")},
        kiln_feed_quality_sysentry
      FROM ${table}
      ${WHERE}
      ORDER BY kiln_feed_quality_sysentry DESC NULLS LAST
    `;

    const { rows } = await pool.query(sql, values);

    // Prepare CSV response
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kiln_feed_quality.csv"');

    // CSV header (match the exported field names)
    const header = [
      "inward_number","bag_no","grade","weight","kiln","kiln_loaded_weight",
      "grade_plus2","grade_2by3","grade_3by6","grade_6by8","grade_8by10","grade_10by12","grade_12by14",
      "grade_minus14","feed_moisture","dust","feed_volatile","remarks",
      "kiln_load_time","kiln_quality_updt"
    ];

    // Helper: CSV escape per RFC 4180
    const csvEsc = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\r\n]/.test(s) ? `"${s}"` : s;
    };

    // UTF-8 BOM for Excel friendliness
    res.write("\uFEFF" + header.join(",") + "\r\n");

    for (const r of rows) {
      const line = [
        r.inward_number, r.bag_no, r.grade, r.weight, r.kiln, r.kiln_loaded_weight,
        r.grade_plus2, r.grade_2by3, r.grade_3by6, r.grade_6by8, r.grade_8by10, r.grade_10by12, r.grade_12by14,
        r.grade_minus14, r.feed_moisture, r.dust, r.feed_volatile, r.remarks,
        r.kiln_load_time, r.kiln_quality_updt
      ].map(csvEsc).join(",");
      res.write(line + "\r\n");
    }

    res.end();
  } catch (err) {
    console.error(new Date().toISOString(), "kilnFeedQuality.csv error:", err);
    res.status(500).json({ error: "CSV export failed" });
  }
});


router.post("/kilntemp", authenticate,checkAccess('Operations.Activation.Kiln Temperature'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_kiln_temp`;
    const que = `insert into ${table}
    (temp_dt,
    kiln,
    t1,
    t2,
    t3,
    t4,
    chamber ,
    feed_rate ,
    kiln_rpm ,
    main_damper_open_per ,
    boiler_damper_open_per ,
    steam_pressure,
    remarks ,
    userid ,
    entry_dt  )
    values
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,current_timestamp)
     `
    const values = [req.body.temp_entryDateTime,
        req.body.kiln,
        req.body.t1,
        req.body.t2,
        req.body.t3,
        req.body.t4,
        req.body.chamber,
        req.body.feed_rate,
        req.body.kiln_rpm,
        req.body.main_damper_open_per,
        req.body.boiler_damper_open_per,
        req.body.steam_pressure,
        req.body.remarks,userid];
    
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.post("/kilnfeedquality", authenticate,checkAccess('Operations.Activation.Kiln Feed Quality'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_material_outward_bag`;
    const que = `update ${table}
    set kiln_quality_updt = $12,
    grade_plus2 = $1,
    grade_2by3 = $2,
    grade_3by6 = $3,
    grade_6by8 =$4,
    grade_8by10 = $5,
    grade_10by12 = $6,
    grade_12by14 = $7,
    grade_minus14 = $8,
    feed_moisture = $8,
    dust = $9,
    feed_volatile = $10,
    remarks = $11,
    kiln_feed_quality_sysentry = current_timestamp,
    kiln_quality_updt_user = $14
    where bag_no = $13  `
    const values = [req.body.g_plus_2,req.body.g_2by3,req.body.g_3by6,req.body.g_6by8,req.body.g_8by10,
      req.body.g_10by12,req.body.g_12by14,req.body.g_minus_14,req.body.feed_moisture,
      req.body.dust,req.body.remarks,req.body.kiln_quality_entryDateTime,req.body.bag_no,userid];
  
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})


router.get("/inwardnumber_kilnfeedquality_select",authenticate, async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_material_outward_bag`;
    const que = `select distinct(inward_number) from ${table} where kiln_quality_updt is null and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') `
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/inwardnumber_kilnfeedquality_bag_no_select", authenticate,async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_material_outward_bag`;
    const que = `select bag_no from ${table} where inward_number = $1 and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') and kiln_quality_updt is null`
    const values = [req.query.inward_number];
    
    const result = await pool.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

// Put these near the top of your routes file:
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Common CSV escaper
const csvEsc = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\r\n]/.test(s) ? `"${s}"` : s;
};


router.get("/kilnFeedTable", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_material_outward_bag`;

  // Pagination (defaults)
  const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
  const pageSize = clamp(parseInt(req.query.pageSize ?? '50', 10), 1, 200);
  const offset = (page - 1) * pageSize;

  // Filters
  const {
    inward = "",
    bag_no = "",
    grade = "",
    kiln = "",
    userid = "",
    from = "", // YYYY-MM-DD
    to = "",   // YYYY-MM-DD
  } = req.query;

  try {
    // WHERE builder
    const where = [
      `b.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
      `b.kiln_load_time IS NOT NULL`
    ];
    const vals = [];
    let i = 1;

    if (inward) { where.push(`LOWER(b.inward_number) LIKE LOWER($${i++})`); vals.push(`%${inward}%`); }
    if (bag_no) { where.push(`LOWER(b.bag_no) LIKE LOWER($${i++})`); vals.push(`%${bag_no}%`); }
    if (grade)  { where.push(`LOWER(b.grade) LIKE LOWER($${i++})`); vals.push(`%${grade}%`); }
    if (kiln)   { where.push(`LOWER(b.kiln) LIKE LOWER($${i++})`); vals.push(`%${kiln}%`); }
    if (userid) { where.push(`LOWER(b.kiln_load_user) LIKE LOWER($${i++})`); vals.push(`%${userid}%`); }
    if (from)   { where.push(`b.kiln_load_time >= $${i++}`); vals.push(`${from} 00:00:00`); }
    if (to)     { where.push(`b.kiln_load_time <= $${i++}`); vals.push(`${to} 23:59:59.999`); }

    const WHERE = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Count for pagination
    const countSql = `SELECT COUNT(*)::int AS cnt FROM ${table} b ${WHERE};`;
    const { rows: countRows } = await pool.query(countSql, vals);
    const total = countRows[0]?.cnt ?? 0;

    // Page of rows
    const dataSql = `
      SELECT
        b.inward_number,
        b.bag_no,
        b.grade,
        b.weight,
        b.kiln,
        b.kiln_loaded_weight,
        b.kiln_load_time,
        b.kiln_load_user
      FROM ${table} b
      ${WHERE}
      ORDER BY b.kiln_load_time DESC NULLS LAST
      LIMIT $${i++} OFFSET $${i++};
    `;
    const { rows } = await pool.query(dataSql, [...vals, pageSize, offset]);

    // Columns from fields (only once, using a dummy query is fine – here we build it manually)
    const columns = [
      'inward_number','bag_no','grade','weight','kiln','kiln_loaded_weight','kiln_load_time','kiln_load_user'
    ].map((name) => ({
      field: name,
      headerName: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));

    res.json({ columns, rows, page, pageSize, total });
  } catch (err) {
    console.error(new Date().toISOString(), "kilnFeedTable error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/kilnFeedTable.csv", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_material_outward_bag`;

  const {
    inward = "",
    bag_no = "",
    grade = "",
    kiln = "",
    userid = "",
    from = "",
    to = "",
  } = req.query;

  try {
    const where = [
      `b.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
      `b.kiln_load_time IS NOT NULL`
    ];
    const vals = [];
    let i = 1;

    if (inward) { where.push(`LOWER(b.inward_number) LIKE LOWER($${i++})`); vals.push(`%${inward}%`); }
    if (bag_no) { where.push(`LOWER(b.bag_no) LIKE LOWER($${i++})`); vals.push(`%${bag_no}%`); }
    if (grade)  { where.push(`LOWER(b.grade) LIKE LOWER($${i++})`); vals.push(`%${grade}%`); }
    if (kiln)   { where.push(`LOWER(b.kiln) LIKE LOWER($${i++})`); vals.push(`%${kiln}%`); }
    if (userid) { where.push(`LOWER(b.kiln_load_user) LIKE LOWER($${i++})`); vals.push(`%${userid}%`); }
    if (from)   { where.push(`b.kiln_load_time >= $${i++}`); vals.push(`${from} 00:00:00`); }
    if (to)     { where.push(`b.kiln_load_time <= $${i++}`); vals.push(`${to} 23:59:59.999`); }

    const WHERE = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT
        b.inward_number,
        b.bag_no,
        b.grade,
        b.weight,
        b.kiln,
        b.kiln_loaded_weight,
        to_char(b.kiln_load_time, 'YYYY-MM-DD HH24:MI:SS') AS kiln_load_time,
        b.kiln_load_user
      FROM ${table} b
      ${WHERE}
      ORDER BY b.kiln_load_time DESC NULLS LAST;
    `;
    const { rows } = await pool.query(sql, vals);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kiln_feed.csv"');

    const header = [
      "inward_number","bag_no","grade","weight","kiln","kiln_loaded_weight","kiln_load_time","kiln_load_user"
    ];
    res.write("\uFEFF" + header.join(",") + "\r\n");
    for (const r of rows) {
      res.write([
        r.inward_number, r.bag_no, r.grade, r.weight, r.kiln, r.kiln_loaded_weight, r.kiln_load_time, r.kiln_load_user
      ].map(csvEsc).join(",") + "\r\n");
    }
    res.end();
  } catch (err) {
    console.error(new Date().toISOString(), "kilnFeedTable.csv error:", err);
    res.status(500).json({ error: "CSV export failed" });
  }
});


router.get("/kilnoutputrecords", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_kiln_output`;

  const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
  const pageSize = clamp(parseInt(req.query.pageSize ?? '50', 10), 1, 200);
  const offset = (page - 1) * pageSize;

  const {
    kiln = "",
    userid = "",
    from = "",
    to = "",
  } = req.query;

  try {
    const where = [];
    const vals = [];
    let i = 1;

    if (kiln)   { where.push(`LOWER(from_the_kiln) LIKE LOWER($${i++})`); vals.push(`%${kiln}%`); }
    if (userid) { where.push(`LOWER(userid_kilnoutput) LIKE LOWER($${i++})`); vals.push(`%${userid}%`); }
    if (from)   { where.push(`kiln_output_dt >= $${i++}`); vals.push(`${from} 00:00:00`); }
    if (to)     { where.push(`kiln_output_dt <= $${i++}`); vals.push(`${to} 23:59:59.999`); }

    const WHERE = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*)::int AS cnt FROM ${table} ${WHERE};`;
    const { rows: countRows } = await pool.query(countSql, vals);
    const total = countRows[0]?.cnt ?? 0;

    const dataSql = `
      SELECT
        kiln_output_dt,
        from_the_kiln AS kiln,
        bag_no,
        weight_with_stones,
        userid_kilnoutput AS userid
      FROM ${table}
      ${WHERE}
      ORDER BY kiln_output_dt DESC NULLS LAST
      LIMIT $${i++} OFFSET $${i++};
    `;
    const { rows } = await pool.query(dataSql, [...vals, pageSize, offset]);

    const columns = [
      'kiln_output_dt','kiln','bag_no','weight_with_stones','userid'
    ].map((name) => ({
      field: name,
      headerName: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));

    res.json({ columns, rows, page, pageSize, total });
  } catch (err) {
    console.error(new Date().toISOString(), "kilnoutputrecords error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/kilnoutputrecords.csv", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_kiln_output`;

  const {
    kiln = "",
    userid = "",
    from = "",
    to = "",
  } = req.query;

  try {
    const where = [];
    const vals = [];
    let i = 1;

    if (kiln)   { where.push(`LOWER(from_the_kiln) LIKE LOWER($${i++})`); vals.push(`%${kiln}%`); }
    if (userid) { where.push(`LOWER(userid_kilnoutput) LIKE LOWER($${i++})`); vals.push(`%${userid}%`); }
    if (from)   { where.push(`kiln_output_dt >= $${i++}`); vals.push(`${from} 00:00:00`); }
    if (to)     { where.push(`kiln_output_dt <= $${i++}`); vals.push(`${to} 23:59:59.999`); }

    const WHERE = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT
        to_char(kiln_output_dt, 'YYYY-MM-DD HH24:MI:SS') AS kiln_output_dt,
        from_the_kiln AS kiln,
        bag_no,
        weight_with_stones,
        userid_kilnoutput AS userid
      FROM ${table}
      ${WHERE}
      ORDER BY kiln_output_dt DESC NULLS LAST;
    `;
    const { rows } = await pool.query(sql, vals);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kiln_output.csv"');

    const header = ["kiln_output_dt","kiln","bag_no","weight_with_stones","userid"];
    res.write("\uFEFF" + header.join(",") + "\r\n");
    for (const r of rows) {
      res.write([r.kiln_output_dt, r.kiln, r.bag_no, r.weight_with_stones, r.userid]
        .map(csvEsc).join(",") + "\r\n");
    }
    res.end();
  } catch (err) {
    console.error(new Date().toISOString(), "kilnoutputrecords.csv error:", err);
    res.status(500).json({ error: "CSV export failed" });
  }
});

// helpers (optional)
const asNumberOrNull = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

/**
 * POST /kilnFeedTable/update
 * body: { bag_no: string, changes: { kiln?: string, kiln_loaded_weight?: number|string } }
 */
router.post('/kilnFeedTable/update', authenticate, checkAccess('Operations.Activation.Edit'),async (req, res) => {
  const { accountid, userid, id, email } = req.user || {};
  const actor = userid || id || email || 'unknown';
  const feedTable = `${accountid}_material_outward_bag`;
  const auditTable = `${accountid}_audittrail`;

  const { bag_no, changes } = req.body || {};
  if (!bag_no || typeof changes !== 'object' || changes === null) {
    return res.status(400).json({ error: 'bag_no and changes are required' });
  }

  // Only allow whitelisted fields
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(changes, 'kiln')) {
    patch.kiln = changes.kiln;
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'kiln_loaded_weight')) {
    patch.kiln_loaded_weight = asNumberOrNull(changes.kiln_loaded_weight);
  }
  const fields = Object.keys(patch);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No allowed fields in changes (kiln, kiln_loaded_weight)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // fetch current
    const { rows: currRows } = await client.query(
      `SELECT kiln, kiln_loaded_weight FROM ${feedTable} WHERE bag_no = $1 LIMIT 1`,
      [bag_no]
    );
    if (currRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }
    const current = currRows[0];

    // build SET clause and values
    const setParts = [];
    const values = [];
    let i = 1;

    if (fields.includes('kiln')) {
      setParts.push(`kiln = $${i++}`);
      values.push(patch.kiln);
    }
    if (fields.includes('kiln_loaded_weight')) {
      setParts.push(`kiln_loaded_weight = $${i++}`);
      values.push(patch.kiln_loaded_weight);
    }

    // Optionally update kiln_load_user (who performed change)
    setParts.push(`kiln_load_user = $${i++}`);
    values.push(actor);

    values.push(bag_no);

    const updateSql = `
      UPDATE ${feedTable}
      SET ${setParts.join(', ')}
      WHERE bag_no = $${i}
      RETURNING inward_number, bag_no, grade, weight, kiln, kiln_loaded_weight, kiln_load_time, kiln_load_user
    `;
    const { rows: updated } = await client.query(updateSql, values);
    if (updated.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found after update' });
    }

    // Insert an audit record per changed field
    for (const field of fields) {
      const activity = {
        operation: 'update',
        bag_no,
        fieldname: field,
        old_value: current[field],
        new_value: patch[field],
        userid: actor,
      };
      await client.query(
        `INSERT INTO ${auditTable} (location, activity, datetime)
         VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)`,
        ['kiln_feed', JSON.stringify(activity)]
      );
    }

    await client.query('COMMIT');
    return res.json({ ok: true, row: updated[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(new Date().toISOString(), 'kilnFeedTable/update error:', err);
    return res.status(500).json({ error: 'Update failed' });
  } finally {
    client.release();
  }
});

/**
 * POST /kilnFeedTable/delete
 * body: { bag_no: string }
 *  -> logical remove: set kiln_load_time, kiln, kiln_loaded_weight, kiln_load_user to NULL
 */
router.post('/kilnFeedTable/delete', authenticate, checkAccess('Operations.Activation.Edit'),async (req, res) => {
  const { accountid, userid, id, email } = req.user || {};
  const actor = userid || id || email || 'unknown';
  const feedTable = `${accountid}_material_outward_bag`;
  const auditTable = `${accountid}_audittrail`;

  const { bag_no } = req.body || {};
  if (!bag_no) {
    return res.status(400).json({ error: 'bag_no is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure exists (optional, but nicer error)
    const { rowCount } = await client.query(
      `SELECT 1 FROM ${feedTable} WHERE bag_no = $1`,
      [bag_no]
    );
    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const { rowCount: updCount } = await client.query(
      `UPDATE ${feedTable}
       SET kiln_load_time = NULL,
           kiln = NULL,
           kiln_loaded_weight = NULL,
           kiln_load_user = NULL,
           kiln_feed_status = null
       WHERE bag_no = $1`,
      [bag_no]
    );

    if (updCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Nothing updated' });
    }

    const activity = { operation: 'delete', bag_no };
    await client.query(
      `INSERT INTO ${auditTable} (location, activity, datetime)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)`,
      ['kiln_feed', JSON.stringify(activity)]
    );

    await client.query('COMMIT');
    return res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(new Date().toISOString(), 'kilnFeedTable/delete error:', err);
    return res.status(500).json({ error: 'Delete failed' });
  } finally {
    client.release();
  }
});

// helper (near top of file if not already present)
//const asNumberOrNull = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

/**
 * POST /api/activation/kilnoutputrecords/update
 * body: {
 *   bag_no: string,
 *   changes: {
 *     kiln?: string,                // maps to from_the_kiln
 *     weight_with_stones?: number|string
 *   }
 * }
 * New rule:
 * - If destoning_in_updt IS NOT NULL -> DO NOT UPDATE, return 409.
 */
router.post('/kilnoutputrecords/update', authenticate, async (req, res) => {
  const { accountid, userid, id, email } = req.user || {};
  const actor = userid || id || email || 'unknown';

  const outTable = `${accountid}_kiln_output`;
  const desTable = `${accountid}_destoning`;
  const audit    = `${accountid}_audittrail`;

  const asNumberOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const { bag_no, changes } = req.body || {};
  if (!bag_no || !changes || typeof changes !== 'object') {
    return res.status(400).json({ error: 'bag_no and changes are required' });
  }

  // Whitelist incoming → DB columns
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(changes, 'kiln')) {
    patch.from_the_kiln = changes.kiln; // API "kiln" → DB "from_the_kiln"
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'weight_with_stones')) {
    patch.weight_with_stones = asNumberOrNull(changes.weight_with_stones);
  }
  const fields = Object.keys(patch);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No allowed fields in changes (kiln, weight_with_stones)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Load current kiln_output row
    const { rows: curRows } = await client.query(
      `SELECT bag_no,
              from_the_kiln,
              weight_with_stones,
              destoning_in_updt,
              destoning_in_weight
         FROM ${outTable}
        WHERE bag_no = $1
        LIMIT 1`,
      [bag_no]
    );
    if (curRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }
    const current = curRows[0];

    // >>> NEW RULE: Block update if destoning_in_updt is set
    if (current.destoning_in_updt) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'Cannot update: this bag has already been loaded into De-Stoning.',
        detail: { bag_no, destoning_in_updt: current.destoning_in_updt }
      });
    }

    // 2) Build UPDATE for kiln_output
    const setParts = [];
    const vals = [];
    let i = 1;
    const changedFields = []; // for kiln_output audit rows

    if (fields.includes('from_the_kiln') && patch.from_the_kiln !== current.from_the_kiln) {
      setParts.push(`from_the_kiln = $${i++}`);
      vals.push(patch.from_the_kiln);
      changedFields.push({
        fieldname: 'kiln',
        old_value: current.from_the_kiln,
        new_value: patch.from_the_kiln
      });
    }

    let willChangeWeightWS = false;
    if (fields.includes('weight_with_stones') && patch.weight_with_stones !== current.weight_with_stones) {
      setParts.push(`weight_with_stones = $${i++}`);
      vals.push(patch.weight_with_stones);
      willChangeWeightWS = true;
      changedFields.push({
        fieldname: 'weight_with_stones',
        old_value: current.weight_with_stones,
        new_value: patch.weight_with_stones
      });
    }

    // Note: Since updates are blocked once destoning_in_updt is set,
    // the destoning sync path below will never run now. Leaving as a comment for clarity:
    // if (current.destoning_in_updt && willChangeWeightWS) { ... sync ... }

    // If nothing effectively changes, short-circuit
    if (setParts.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ ok: true, row: current });
    }

    vals.push(bag_no);
    const updSql = `
      UPDATE ${outTable}
         SET ${setParts.join(', ')}
       WHERE bag_no = $${i}
      RETURNING kiln_output_dt,
                from_the_kiln AS kiln,
                bag_no,
                weight_with_stones,
                destoning_in_weight,
                userid_kilnoutput AS userid`;
    const { rows: updated } = await client.query(updSql, vals);

    // 4) Audit rows for kiln_output (one per changed field)
    for (const ch of changedFields) {
      await client.query(
        `INSERT INTO ${audit} (location, activity, datetime)
         VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)`,
        [
          'kiln_output',
          JSON.stringify({
            Operation: 'update',
            bag_no,
            fieldname: ch.fieldname,
            old_value: ch.old_value,
            new_value: ch.new_value,
            userid: actor
          })
        ]
      );
    }

    await client.query('COMMIT');
    return res.json({ ok: true, row: updated[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(new Date().toISOString(), 'kilnoutputrecords/update error:', err);
    return res.status(500).json({ error: 'Update failed' });
  } finally {
    client.release();
  }
});




/**
 POST /api/activation/kilnoutputrecords/delete
  body: { bag_no: string }
 
 * New rule:
 * - If destoning_in_updt IS NOT NULL -> DO NOT DELETE, return 409.
 * - Otherwise, delete kiln_output row and write an audit entry.
 */
router.post('/kilnoutputrecords/delete', authenticate, async (req, res) => {
  const { accountid, userid, id, email } = req.user || {};
  const actor = userid || id || email || 'unknown';

  const outTable = `${accountid}_kiln_output`;
  const audit    = `${accountid}_audittrail`;

  const { bag_no } = req.body || {};
  if (!bag_no) return res.status(400).json({ error: 'bag_no is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Read kiln_output row (we only need to decide if it's deletable)
    const { rows: outRows } = await client.query(
      `SELECT bag_no, destoning_in_updt, destoning_in_weight
         FROM ${outTable}
        WHERE bag_no = $1
        LIMIT 1`,
      [bag_no]
    );
    if (outRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Record not found' });
    }

    const outRow = outRows[0];

    // >>> NEW RULE: Block delete if destoning_in_updt is set
    if (outRow.destoning_in_updt) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'Cannot delete: this bag has already been loaded into De-Stoning.',
        detail: { bag_no, destoning_in_updt: outRow.destoning_in_updt }
      });
    }

    // 3) Safe to delete kiln_output row (no destoning link)
    const { rowCount: delCnt } = await client.query(
      `DELETE FROM ${outTable} WHERE bag_no = $1`,
      [bag_no]
    );
    if (delCnt === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Nothing deleted' });
    }

    // 4) Audit kiln_output delete
    await client.query(
      `INSERT INTO ${audit} (location, activity, datetime)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)`,
      [
        'kiln_output',
        JSON.stringify({ Operation: 'delete', bag_no, userid: actor })
      ]
    );

    await client.query('COMMIT');
    return res.json({ ok: true, deleted: delCnt });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error(new Date().toISOString(), 'kilnoutputrecords/delete error:', err);
    return res.status(500).json({ error: 'Delete failed' });
  } finally {
    client.release();
  }
});



router.get("/ds_bag_quality", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_destoning`;

  // helper: Title Case from snake_case
  const toHeader = (name) =>
    name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  try {
    const sql = `
      SELECT
        bag_generated_timestamp AS time_generated,
        ds_bag_no,
        weight_out AS weight,
        userid
      FROM ${table}
      WHERE quality_updt_time IS NULL
      ORDER BY bag_generated_timestamp DESC NULLS LAST
    `;

    const result = await pool.query(sql);
    const rows = result.rows;

    // Build column metadata from result fields
    const columns = result.fields.map((f) => {
      const field = f.name; // uses the aliased names above
      // optional basic typing hints (clients can ignore if not needed)
      let type = "string";
      if (field === "time_generated") type = "datetime";
      else if (field === "weight") type = "number";

      return {
        field,
        headerName: toHeader(field), // e.g., "Time Generated"
        // UI hints your frontend can use (flexible)
        flex: 1,
        minWidth: field === "time_generated" ? 180 : 140,
        type,
      };
    });

    res.json({ columns, rows });
  } catch (err) {
    const now = new Date();
    console.error(now.toLocaleString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update de-stoning bag quality (adds quality_ctc, quality_remarks, quality_updt_user, final_destination)
router.post("/ds_bag_quality", authenticate, checkAccess('Operations.Activation.De-Stoning Quality'),async (req, res) => {
  const { accountid, userid} = req.user || {};
  const table = `${accountid}_destoning`;

  const {
    ds_bag_no,          // required
    three_four,         // -> quality_3by4
    four_eight,         // -> quality_4by8  (may be quaility_4by8 in some schemas)
    eight_twelve,       // -> quality_8by12
    twelve_thirty,      // -> quality_12by30
    minus30,            // -> quality_minus_30
    cbd,                // -> quality_cbd
    ctc,                // -> quality_ctc
    remarks,            // -> quality_remarks
    destination,        // -> final_destination
  } = req.body || {};

  if (!ds_bag_no) {
    return res.status(400).json({ error: "ds_bag_no is required" });
  }



  // canonical SQL (with quality_4by8)
  const sql = `
    UPDATE ${table}
    SET
      quality_updt_time = CURRENT_TIMESTAMP,
      quality_updt_user = $8,
      quality_3by4      = $2,
      quality_4by8      = $3,
      quality_8by12     = $4,
      quality_12by30    = $5,
      quality_minus_30  = $6,
      quality_cbd       = $7,
      quality_ctc       = $9,
      quality_remarks   = $10,
      final_destination = $11
    WHERE ds_bag_no = $1
    RETURNING
      ds_bag_no,
      quality_updt_time,
      quality_updt_user,
      quality_3by4,
      quality_4by8,
      quality_8by12,
      quality_12by30,
      quality_minus_30,
      quality_cbd,
      quality_ctc,
      quality_remarks,
      final_destination
  `;

  const params = [
    ds_bag_no,
    three_four ?? null,
    four_eight ?? null,
    eight_twelve ?? null,
    twelve_thirty ?? null,
    minus30 ?? null,
    cbd ?? null,
    userid,
    ctc ?? null,
    (typeof remarks === "string" ? remarks.trim() : remarks) ?? null,
    (typeof destination === "string" ? destination.trim() : destination) ?? null,
  ];

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Bag not found" });
    }
    return res.json({ success: true, updated: result.rows[0] });
  } catch (err) {
    // Fallback: if your schema uses the misspelled column `quaility_4by8`
    if (String(err.message || "").includes('column "quality_4by8" does not exist')) {
      try {
        const altSql = `
          UPDATE ${table}
          SET
            quality_updt_time = CURRENT_TIMESTAMP,
            quality_updt_user = $8,
            quality_3by4      = $2,
            quaility_4by8     = $3,  -- fallback spelling
            quality_8by12     = $4,
            quality_12by30    = $5,
            quality_minus_30  = $6,
            quality_cbd       = $7,
            quality_ctc       = $9,
            quality_remarks   = $10,
            final_destination = $11
          WHERE ds_bag_no = $1
          RETURNING
            ds_bag_no,
            quality_updt_time,
            quality_updt_user,
            quality_3by4,
            quaility_4by8 as quality_4by8,
            quality_8by12,
            quality_12by30,
            quality_minus_30,
            quality_cbd,
            quality_ctc,
            quality_remarks,
            final_destination
        `;
        const alt = await pool.query(altSql, params);
        if (alt.rowCount === 0) {
          return res.status(404).json({ error: "Bag not found" });
        }
        return res.json({ success: true, updated: alt.rows[0] });
      } catch (err2) {
        const now = new Date();
        console.error(now.toLocaleString(), ":", err2);
        return res.status(500).json({ error: "Database error" });
      }
    }

    const now = new Date();
    console.error(now.toLocaleString(), ":", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// GET /api/activation/destoning/records
router.get("/destoning/records", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  const table = `${accountid}_destoning`;

  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset = (page - 1) * pageSize;

  const {
    timeFrom,
    timeTo,
    bag_no,
    final_destination,
    ctc_min,
    ctc_max,
    userid,
  } = req.query || {};

  const where = [];
  const params = [];

  // Helpers
  const hasText = (v) => typeof v === "string" && v.trim() !== "";
  const hasNumber = (v) => v !== undefined && v !== "" && Number.isFinite(Number(v));

  if (hasText(timeFrom)) {
    params.push(timeFrom);
    where.push(`bag_generated_timestamp >= $${params.length}::timestamptz`);
  }
  if (hasText(timeTo)) {
    params.push(timeTo);
    where.push(`bag_generated_timestamp <= $${params.length}::timestamptz`);
  }
  if (hasText(bag_no)) {
    params.push(`%${bag_no.trim()}%`);
    where.push(`ds_bag_no ILIKE $${params.length}`);
  }
  if (final_destination === "InStock" || final_destination === "Screening") {
    params.push(final_destination);
    where.push(`final_destination = $${params.length}`);
  }
  if (hasNumber(ctc_min)) {
    params.push(Number(ctc_min));
    where.push(`quality_ctc >= $${params.length}`);
  }
  if (hasNumber(ctc_max)) {
    params.push(Number(ctc_max));
    where.push(`quality_ctc <= $${params.length}`);
  }
  if (hasText(userid)) {
    params.push(`%${userid.trim()}%`);
    where.push(`userid ILIKE $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const selectCols = `
    bag_generated_timestamp AS time_generated,
    ds_bag_no,
    loaded_weight,
    loaded_bags,
    weight_out,
    userid,
    final_destination,
    quality_updt_time,
    quality_updt_user,
    quality_3by4,
    quality_4by8,
    quality_8by12,
    quality_12by30,
    quality_minus_30,
    quality_cbd,
    quality_ctc,
    quality_remarks,
    screening_inward_time
  `;

  const visibleFields = [
    "time_generated","ds_bag_no","loaded_weight","loaded_bags","weight_out","userid","final_destination",
    "quality_updt_time","quality_updt_user","quality_3by4","quality_4by8","quality_8by12","quality_12by30",
    "quality_minus_30","quality_cbd","quality_ctc","quality_remarks"
  ];

  const toHeader = (name) => name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  try {
    const countSql = `SELECT COUNT(*)::int AS n FROM ${table} ${whereSql}`;
    const { rows: cntRows } = await pool.query(countSql, params);
    const total = cntRows?.[0]?.n ?? 0;

    const dataSql = `
      SELECT ${selectCols}
      FROM ${table}
      ${whereSql}
      ORDER BY bag_generated_timestamp DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const { rows } = await pool.query(dataSql, [...params, pageSize, offset]);

    const columns = visibleFields.map((f) => {
      let type = "string";
      if (["time_generated","quality_updt_time"].includes(f)) type = "datetime";
      if (["loaded_weight","weight_out","quality_3by4","quality_4by8","quality_8by12","quality_12by30","quality_minus_30","quality_cbd","quality_ctc"].includes(f)) type = "number";
      if (f === "loaded_bags") type = "array";
      return { field: f, headerName: toHeader(f), type, flex: 1, minWidth: 140 };
    });

    res.json({ columns, rows, total, page, pageSize });
  } catch (err) {
    const now = new Date();
    console.error(now.toLocaleString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});



// POST /api/activation/destoningrecords/update
router.post("/destoningrecords/update", authenticate, async (req, res) => {
  const { accountid, userid, userId, username } = req.user || {};
  const table = `${accountid}_destoning`;

  const { ds_bag_no, changes } = req.body || {};
  if (!ds_bag_no || !changes || typeof changes !== "object") {
    return res.status(400).json({ error: "ds_bag_no and changes are required" });
  }

  const updater = userid || userId || username || "unknown";

  const QUALITY_FIELDS = new Set([
    "quality_cbd","quality_ctc","quality_3by4","quality_4by8","quality_8by12","quality_12by30","quality_minus_30","quality_remarks"
  ]);
  const EDITABLE_FIELDS = new Set([
    "weight_out","final_destination", ...QUALITY_FIELDS
  ]);

  // Load current row to check screening status
  const { rows: curRows } = await pool.query(
    `SELECT screening_inward_time FROM ${table} WHERE ds_bag_no = $1 LIMIT 1`,
    [ds_bag_no]
  );
  if (curRows.length === 0) return res.status(404).json({ error: "Bag not found" });

  const screeningStarted = !!curRows[0].screening_inward_time;

  // Build patch safely
  const patch = {};
  for (const [k, v] of Object.entries(changes)) {
    if (!EDITABLE_FIELDS.has(k)) continue; // ignore unknown/unsafe fields
    if (screeningStarted && !QUALITY_FIELDS.has(k)) continue; // lock non-quality fields after screening
    if (k === "final_destination") {
      const val = String(v || "").trim();
      if (val !== "InStock" && val !== "Screening") continue; // enforce allow-list
      patch.final_destination = val;
    } else if (k === "weight_out") {
      patch.weight_out = (v === null || v === "" || Number.isNaN(Number(v))) ? null : Number(v);
    } else {
      patch[k] = v === "" ? null : v;
    }
  }

  // Always set audit fields when any quality_x changes
  const qualityTouched = Object.keys(patch).some((k) => QUALITY_FIELDS.has(k));
  if (qualityTouched) {
    patch.quality_updt_time = { raw: "CURRENT_TIMESTAMP" };
    patch.quality_updt_user = updater;
  }

  if (Object.keys(patch).length === 0) {
    return res.json({ success: true, updated: 0, message: "No permitted changes" });
  }

  // Dynamic UPDATE
  const keys = Object.keys(patch);
  const sets = [];
  const params = [ds_bag_no];
  let i = 2;
  for (const k of keys) {
    if (patch[k] && patch[k].raw === "CURRENT_TIMESTAMP") {
      sets.push(`${k} = CURRENT_TIMESTAMP`);
    } else {
      sets.push(`${k} = $${i++}`);
      params.push(patch[k]);
    }
  }
  const sql = `UPDATE ${table} SET ${sets.join(", ")} WHERE ds_bag_no = $1 RETURNING ds_bag_no`;

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) return res.status(404).json({ error: "Bag not found" });
    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    const now = new Date();
    console.error(now.toLocaleString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});
// POST /api/activation/destoningrecords/delete
router.post("/destoningrecords/delete", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  const destoningTable = `${accountid}_destoning`;
  const kilnTable = `${accountid}_kiln_output`; // <-- adjust if your table is named differently

  const { ds_bag_no } = req.body || {};
  if (!ds_bag_no) return res.status(400).json({ error: "ds_bag_no is required" });

  const client = await pool.connect();
  try {
    // Load the record to check rules and get loaded_bags
    const sel = await client.query(
      `SELECT screening_inward_time, loaded_bags
       FROM ${destoningTable}
       WHERE ds_bag_no = $1
       LIMIT 1`,
      [ds_bag_no]
    );

    if (sel.rowCount === 0) {
      return res.status(404).json({ error: "Bag not found" });
    }

    const { screening_inward_time, loaded_bags } = sel.rows[0];

    if (screening_inward_time) {
      return res.status(409).json({ error: "Cannot delete: screening already started for this bag" });
    }

    await client.query("BEGIN");

    let kilnUpdated = 0;

    // If there are loaded_bags, update kiln output in bulk
    if (Array.isArray(loaded_bags) && loaded_bags.length > 0) {
      // Normalize values to strings (covers numeric/text bag_no schemas)
      const bagArr = loaded_bags.map(String);

      // Use ANY(array) so it’s one statement
      const upd = await client.query(
        `UPDATE ${kilnTable}
           SET exkiln_stock = 'De-Stoning',
               destoning_in_user = NULL,
               destoning_in_updt = NULL
         WHERE bag_no = ANY($1::text[])`,
        [bagArr]
      );
      kilnUpdated = upd.rowCount;
    }

    // Delete the destoning record
    const del = await client.query(
      `DELETE FROM ${destoningTable} WHERE ds_bag_no = $1`,
      [ds_bag_no]
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: "Destoning record deleted and kiln output updated.",
      kiln_updated: kilnUpdated,
      deleted: del.rowCount,
    });
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    const now = new Date();
    console.error(now.toLocaleString(), ":", err);
    return res.status(500).json({ error: "Database error" });
  } finally {
    client.release();
  }
});


// GET /api/activation/destoning/records.csv
router.get("/destoning/records.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  const table = `${accountid}_destoning`;

  // ---- parse filters (same as records route) ----
  const {
    timeFrom,
    timeTo,
    bag_no,
    final_destination,
    ctc_min,
    ctc_max,
    userid,
  } = req.query || {};

  const where = [];
  const params = [];

  const hasText = (v) => typeof v === "string" && v.trim() !== "";
  const hasNumber = (v) => v !== undefined && v !== "" && Number.isFinite(Number(v));

  if (hasText(timeFrom)) {
    params.push(timeFrom);
    where.push(`bag_generated_timestamp >= $${params.length}::timestamptz`);
  }
  if (hasText(timeTo)) {
    params.push(timeTo);
    where.push(`bag_generated_timestamp <= $${params.length}::timestamptz`);
  }
  if (hasText(bag_no)) {
    params.push(`%${bag_no.trim()}%`);
    where.push(`ds_bag_no ILIKE $${params.length}`);
  }
  if (final_destination === "InStock" || final_destination === "Screening") {
    params.push(final_destination);
    where.push(`final_destination = $${params.length}`);
  }
  if (hasNumber(ctc_min)) {
    params.push(Number(ctc_min));
    where.push(`quality_ctc >= $${params.length}`);
  }
  if (hasNumber(ctc_max)) {
    params.push(Number(ctc_max));
    where.push(`quality_ctc <= $${params.length}`);
  }
  if (hasText(userid)) {
    params.push(`%${userid.trim()}%`);
    where.push(`userid ILIKE $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // ---- columns (same visible list) ----
  const visibleFields = [
    "time_generated","ds_bag_no","loaded_weight","loaded_bags","weight_out","userid","final_destination",
    "quality_updt_time","quality_updt_user","quality_3by4","quality_4by8","quality_8by12","quality_12by30",
    "quality_minus_30","quality_cbd","quality_ctc","quality_remarks"
  ];

  // Use to_char for timestamps so CSV is clean & consistent (UTC ISO-like)
  const selectColsCsv = `
    to_char(bag_generated_timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS time_generated,
    ds_bag_no,
    loaded_weight,
    loaded_bags,
    weight_out,
    userid,
    final_destination,
    to_char(quality_updt_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS quality_updt_time,
    quality_updt_user,
    quality_3by4,
    quality_4by8,
    quality_8by12,
    quality_12by30,
    quality_minus_30,
    quality_cbd,
    quality_ctc,
    quality_remarks
  `;

  try {
    const dataSql = `
      SELECT ${selectColsCsv}
      FROM ${table}
      ${whereSql}
      ORDER BY bag_generated_timestamp DESC NULLS LAST
    `;
    const { rows } = await pool.query(dataSql, params);

    // ---- CSV build ----
    const headerName = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const headers = visibleFields.map(headerName);

    const esc = (val) => {
      if (val === null || val === undefined) return "";
      if (Array.isArray(val)) val = val.join(","); // flatten arrays like loaded_bags
      let s = String(val);
      if (/[",\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    let csv = headers.join(",") + "\n";
    for (const r of rows) {
      const line = visibleFields.map((f) => esc(r[f])).join(",");
      csv += line + "\n";
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="destoning_records.csv"`);
    return res.send(csv);
  } catch (err) {
    const now = new Date();
    console.error(now.toLocaleString(), ":", err);
    return res.status(500).json({ error: "CSV export error" });
  }
});

module.exports = router;
