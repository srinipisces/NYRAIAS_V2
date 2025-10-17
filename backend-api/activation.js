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
// GET /api/activation/kiln/loads?kiln=Kiln%20A
router.get("/kiln/loads", authenticate, async (req, res) => {
  function assertSafeIdent(s) {
    if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
  }

  try {
    const { accountid } = req.user || {};
    if (!accountid) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ success: false, error: "Invalid account id" });
    }

    const table = `${accountid}_material_outward_bag`;
    const kilnParam = String(req.query.kiln || "").trim();
    const VALID_KILNS = new Set(["Kiln A", "Kiln B", "Kiln C"]);

    if (!VALID_KILNS.has(kilnParam)) {
      return res.status(400).json({
        success: false,
        error: "kiln must be one of 'Kiln A', 'Kiln B', or 'Kiln C'",
      });
    }

    // Recent (last 6 hours), newest first — same as your existing logic
    const recentSql = `
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
        AND mob.kiln = $1
        AND mob.kiln_load_time >= NOW() - INTERVAL '6 hours'
      ORDER BY mob.kiln_load_time DESC
      LIMIT 500;
    `;

    // "Today" in IST (Asia/Kolkata) local date
    const todaySql = `
      SELECT
        COUNT(*)::int AS "bagCount",
        COALESCE(
          ROUND(SUM(COALESCE(mob.kiln_loaded_weight, 0))::numeric, 2),
          0
        )::float AS "totalWeightKg"
      FROM ${table} AS mob
      WHERE mob.kiln_feed_status = 'loaded'
        AND mob.kiln = $1
        AND (mob.kiln_load_time AT TIME ZONE 'Asia/Kolkata')::date
            = (NOW() AT TIME ZONE 'Asia/Kolkata')::date;
    `;

    const [recentRes, todayRes] = await Promise.all([
      pool.query(recentSql, [kilnParam]),
      pool.query(todaySql, [kilnParam]),
    ]);

    const loads = recentRes.rows;
    const today = todayRes.rows[0] || { bagCount: 0, totalWeightKg: 0 };

    return res.json({
      success: true,
      kiln: kilnParam,
      loads,
      today,
    });
  } catch (err) {
    console.error("GET /api/activation/kiln/loads error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/activation/kilnfeed
router.post(
  "/kilnfeed",
  authenticate,
  checkAccess("Operations.Activation.Kiln Feed"),
  async (req, res) => {
    function assertSafeIdent(s) {
      if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
    }

    const { userid, accountid } = req.user || {};
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ success: false, error: "Invalid account id" });
    }

    const rawtable     = `${accountid}_rawmaterial_rcvd`;
    const table        = `${accountid}_material_outward_bag`;
    const historyTable = `${accountid}_rawmaterial_inward_history`;

    const { inward_number, bag_no, bags_loaded_for, kiln_loaded_bag_weight } = req.body || {};
    const VALID_KILNS = new Set(["Kiln A", "Kiln B", "Kiln C"]);

    if (!inward_number || !bag_no) {
      return res.status(400).json({ success: false, error: "inward_number and bag_no are required" });
    }
    if (!VALID_KILNS.has(String(bags_loaded_for))) {
      return res.status(400).json({ success: false, error: "bags_loaded_for must be 'Kiln A' | 'Kiln B' | 'Kiln C'" });
    }
    const w = Number(kiln_loaded_bag_weight);
    if (!Number.isFinite(w) || w <= 0) {
      return res.status(400).json({ success: false, error: "kiln_loaded_bag_weight must be a positive number" });
    }

    // Helper: 'YYYY-MM-DD' for IST
    const getKolkataDayString = () =>
      new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });

    const day = getKolkataDayString(); // 'YYYY-MM-DD'

    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      // ✅ Pre-check: already loaded?
      const preCheck = await client.query(
        `SELECT 1 FROM ${table}
         WHERE inward_number = $1 AND bag_no = $2 AND kiln_feed_status = 'loaded'`,
        [inward_number, bag_no]
      );
      if (preCheck.rowCount > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ success: false, error: "Bag is already loaded in kiln" });
      }

      // ✅ 1) Mark bag as loaded
      const upd = await client.query(
        `UPDATE ${table}
           SET kiln_load_time    = current_timestamp,
               kiln              = $3,
               kiln_feed_status  = 'loaded',
               kiln_loaded_weight= $4,
               kiln_load_user    = $5
         WHERE inward_number = $1 AND bag_no = $2`,
        [inward_number, bag_no, bags_loaded_for, w, userid]
      );

      if (upd.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, error: "Bag not found for the given inward_number" });
      }

      // ✅ 2) If all bags for this inward are loaded, mark inward complete
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
              SET kiln_feed_status      = 'completed',
                  kiln_feed_status_upddt= current_timestamp,
                  kiln_feed_userid      = $2
            WHERE inward_number = $1`,
          [inward_number, userid]
        );
      }

      // ✅ 3) Upsert history for IST "today"
      const historyCheck = await client.query(
        `SELECT 1 FROM ${historyTable} WHERE inward_number = $1 AND day::date = $2`,
        [inward_number, day]
      );

      if (historyCheck.rowCount > 0) {
        await client.query(
          `UPDATE ${historyTable}
              SET kiln_loaded_weight = COALESCE(kiln_loaded_weight, 0) + $1,
                  kiln_load_no_bags = COALESCE(kiln_load_no_bags, 0) + 1,
                  Gcharcoal_stock   = COALESCE(Gcharcoal_stock, 0) - $1
            WHERE inward_number = $2 AND day::date = $3`,
          [w, inward_number, day]
        );
      } else {
        const latest = await client.query(
          `SELECT * FROM ${historyTable}
            WHERE inward_number = $1
            ORDER BY day DESC
            LIMIT 1`,
          [inward_number]
        );
        const base = latest.rows[0] || {};

        const aggResult = await client.query(
          `SELECT SUM(kiln_loaded_weight) AS total_weight
             FROM ${table}
            WHERE inward_number = $1
              AND kiln_feed_status = 'loaded'
              AND grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
          [inward_number]
        );

        const totalWeight = Number(aggResult.rows[0]?.total_weight || 0);
        const totalBags   = 1; // for "today"
        const newGStock   = (base.gcharcoal_weight_after_crusher || 0) - totalWeight;

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
            base?.supplier_name || "",
            base?.supplier_weight || 0,
            base?.weight_at_security || 0,
            base?.raw_material_inward_no_bags || 0,
            base?.raw_material_inward_weight || 0,
            base?.raw_material_inward_stock || 0,
            base?.raw_material_inward_loss_or_gain || 0,
            base?.raw_material_inward_status || null,
            base?.raw_material_outward_status || null,
            base?.raw_material_outward_no_bags || 0,
            base?.gcharcoal_weight_after_crusher || 0,
            base?.physical_loss_in_crusher || 0,
            base?.total_weight_from_crusher || 0,
            totalWeight,
            totalBags,
            newGStock
          ]
        );
      }

      // ✅ 4) Build the same response shape as GET /kiln/loads — do it
      //     inside the transaction for immediate read-your-writes.
      const recentSql = `
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
          AND mob.kiln = $1
          AND mob.kiln_load_time >= NOW() - INTERVAL '6 hours'
        ORDER BY mob.kiln_load_time DESC
        LIMIT 500;
      `;

      const todaySql = `
        SELECT
          COUNT(*)::int AS "bagCount",
          COALESCE(ROUND(SUM(COALESCE(mob.kiln_loaded_weight, 0))::numeric, 2), 0)::float
            AS "totalWeightKg"
        FROM ${table} AS mob
        WHERE mob.kiln_feed_status = 'loaded'
          AND mob.kiln = $1
          AND (mob.kiln_load_time AT TIME ZONE 'Asia/Kolkata')::date
              = (NOW() AT TIME ZONE 'Asia/Kolkata')::date;
      `;

      const [recentRes, todayRes] = await Promise.all([
        client.query(recentSql, [bags_loaded_for]),
        client.query(todaySql,  [bags_loaded_for]),
      ]);

      await client.query("COMMIT");

      return res.json({
        success: true,
        kiln: bags_loaded_for,
        loads: recentRes.rows,
        today: todayRes.rows[0] || { bagCount: 0, totalWeightKg: 0 },
      });
    } catch (err) {
      console.error(new Date().toLocaleString(), ":", err);
      if (client) await client.query("ROLLBACK");
      return res.status(500).json({ success: false, error: "Database error" });
    } finally {
      if (client) client.release();
    }
  }
);


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
  const { accountid } = req.user || {};
  const kiln = String(req.query.kiln || "");

  // guards
  if (!/^[a-z0-9_]+$/i.test(accountid)) {
    return res.status(400).json({ error: "Invalid account id" });
  }
  if (!/^[a-z0-9 _-]+$/i.test(kiln) || kiln.length > 100) {
    return res.status(400).json({ error: "Invalid kiln" });
  }

  const table = `${accountid}_kiln_output`;

  const sql = `
    WITH ist AS (
      SELECT date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AS d0
    ),
    last10 AS (
      SELECT
        bag_no,
        weight_with_stones AS weight,
        write_timestamp
      FROM ${table}
      WHERE from_the_kiln = $1
      ORDER BY write_timestamp DESC
      LIMIT 10
    ),
    today AS (
      SELECT
        COUNT(*)::int AS c,
        COALESCE(SUM(weight_with_stones), 0)::numeric AS w
      FROM ${table}, ist
      WHERE from_the_kiln = $1
        AND (write_timestamp AT TIME ZONE 'Asia/Kolkata') >= ist.d0
        AND (write_timestamp AT TIME ZONE 'Asia/Kolkata') <  ist.d0 + INTERVAL '1 day'
    )
    SELECT
      (SELECT json_agg(l ORDER BY l.write_timestamp DESC) FROM last10 l) AS rows,
      (SELECT c FROM today)  AS today_count,
      (SELECT w FROM today)  AS today_weight
  `;

  try {
    const { rows } = await pool.query(sql, [kiln]);
    const payload = rows?.[0] || { rows: [], today_count: 0, today_weight: 0 };
    res.json(payload);
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

router.get("/kiln_feed_bag_quality", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_material_outward_bag`;

  const PAGE_SIZE = 50;                            // fixed size
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const toHeader = (name) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  try {
    const where = `kiln_quality_updt IS NULL`;

    // total count for current filter
    const { rows: cntRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ${table} WHERE ${where}`
    );
    const total = cntRows?.[0]?.total ?? 0;

    // page data
    const dataSql = `
      SELECT
        write_timestamp            AS time_generated,
        bag_no,
        weight        AS weight,
        userid         AS userid
      FROM ${table}
      WHERE ${where}
      ORDER BY write_timestamp DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(dataSql, [PAGE_SIZE, offset]);

    // columns (minimal; keep your aliases)
    const columns = result.fields.map((f) => {
      const field = f.name;
      let type = "string";
      if (field === "time_generated") type = "datetime";
      else if (field === "weight") type = "number";
      return { field, headerName: toHeader(field), type };
    });

    res.json({
      columns,
      rows: result.rows,
      pagination: {
        page,                   // 1-based
        pageSize: PAGE_SIZE,    // fixed 50
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        hasMore: offset + result.rows.length < total,
      },
    });
  } catch (err) {
    console.error(new Date().toLocaleString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/kiln_feed_bag_quality", authenticate, checkAccess('Operations.Activation.Kiln Feed Quality'),async (req, res) => {
  const { accountid, userid} = req.user || {};
  const table = `${accountid}_material_outward_bag`;

  const {
    bag_no,          // required
    grade_plus2,
    grade_2by3,
    grade_3by6,
    grade_6by8,
    grade_8by10,
    grade_10by12,
    grade_12by14,
    grade_minus14,
    feed_moisture,
    dust,
    feed_volatile,
    remarks,            // -> quality_remarks
  } = req.body || {};

  if (!bag_no) {
    return res.status(400).json({ error: "bag_no is required" });
  }



  // canonical SQL (with quality_4by8)
  const sql = `
    UPDATE ${table}
    SET
      kiln_quality_updt = CURRENT_TIMESTAMP,
      kiln_feed_quality_sysentry = CURRENT_TIMESTAMP,
      kiln_quality_updt_user = $14,
      grade_plus2 = $2,
      grade_2by3 = $3,
      grade_3by6 = $4,
      grade_6by8 = $5,
      grade_8by10 = $6,
      grade_10by12 = $7,
      grade_12by14 = $8,
      grade_minus14 = $9,
      feed_moisture = $10,
      dust = $11,
      feed_volatile = $12,
      remarks = $13
    WHERE bag_no = $1
    RETURNING
      bag_no
      
  `;

  const params = [
    bag_no,
    grade_plus2 ?? null,
    grade_2by3 ?? null,
    grade_3by6 ?? null,
    grade_6by8 ?? null,
    grade_8by10 ?? null,
    grade_10by12 ?? null,
    grade_12by14 ?? null,
    grade_minus14 ?? null,
    feed_moisture ?? null,
    dust ?? null,
    feed_volatile ?? null,
    (typeof remarks === "string" ? remarks.trim() : remarks) ?? null,
    userid
  ];

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Bag not found" });
    }
    return res.json({ success: true, updated: result.rows[0] });
  } catch (err) {
    
        const now = new Date();
        console.error(now.toLocaleString(), ":", err);
        return res.status(500).json({ error: "Database error" });
      
    }

});

// GET /api/activation/kiln_output_bag_quality?page=1
router.get("/kiln_output_bag_quality", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_kiln_output`;

  const PAGE_SIZE = 50;                            // fixed size
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const toHeader = (name) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  try {
    const where = `quality_updt_time IS NULL`;

    // total count for current filter
    const { rows: cntRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ${table} WHERE ${where}`
    );
    const total = cntRows?.[0]?.total ?? 0;

    // page data
    const dataSql = `
      SELECT
        kiln_output_dt            AS time_generated,
        bag_no,
        weight_with_stones        AS weight,
        userid_kilnoutput         AS userid
      FROM ${table}
      WHERE ${where}
      ORDER BY kiln_output_dt DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(dataSql, [PAGE_SIZE, offset]);

    // columns (minimal; keep your aliases)
    const columns = result.fields.map((f) => {
      const field = f.name;
      let type = "string";
      if (field === "time_generated") type = "datetime";
      else if (field === "weight") type = "number";
      return { field, headerName: toHeader(field), type };
    });

    res.json({
      columns,
      rows: result.rows,
      pagination: {
        page,                   // 1-based
        pageSize: PAGE_SIZE,    // fixed 50
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        hasMore: offset + result.rows.length < total,
      },
    });
  } catch (err) {
    console.error(new Date().toLocaleString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});



router.post("/kiln_output_bag_quality", authenticate, checkAccess('Operations.Activation.Kiln Output Quality'),async (req, res) => {
  const { accountid, userid} = req.user || {};
  const table = `${accountid}_kiln_output`;

  const {
    bag_no,          // required
    plus3,
    three_four,         // -> quality_3by4
    four_eight,         // -> quality_4by8  (may be quaility_4by8 in some schemas)
    eight_twelve,       // -> quality_8by12
    twelve_thirty,      // -> quality_12by30
    minus30,            // -> quality_minus_30
    cbd,                // -> quality_cbd
    ctc,                // -> quality_ctc
    remarks,            // -> quality_remarks
  } = req.body || {};

  if (!bag_no) {
    return res.status(400).json({ error: "bag_no is required" });
  }



  // canonical SQL (with quality_4by8)
  const sql = `
    UPDATE ${table}
    SET
      quality_updt_time = CURRENT_TIMESTAMP,
      quality_updt_user = $8,
      quality_plus_3 = $11,
      quality_3by4      = $2,
      quality_4by8      = $3,
      quality_8by12     = $4,
      quality_12by30    = $5,
      quality_minus_30  = $6,
      quality_cbd       = $7,
      quality_ctc       = $9,
      quality_remarks   = $10
    WHERE bag_no = $1
    RETURNING
      bag_no,
      quality_updt_time,
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

  const params = [
    bag_no,
    three_four ?? null,
    four_eight ?? null,
    eight_twelve ?? null,
    twelve_thirty ?? null,
    minus30 ?? null,
    cbd ?? null,
    userid,
    ctc ?? null,
    (typeof remarks === "string" ? remarks.trim() : remarks) ?? null,
    plus3 ?? null,
  ];

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Bag not found" });
    }
    return res.json({ success: true, updated: result.rows[0] });
  } catch (err) {
    
        const now = new Date();
        console.error(now.toLocaleString(), ":", err);
        return res.status(500).json({ error: "Database error" });
      
    }

});


// GET /api/activation/ds_bag_quality?page=1
// GET /api/activation/ds_bag_quality?page=1
router.get("/ds_bag_quality", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_destoning`;

  const PAGE_SIZE = 50;                           // fixed to 50 rows
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const toHeader = (name) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  try {
    const where = `quality_updt_time IS NULL`;

    // Total rows for current filter
    const { rows: cntRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ${table} WHERE ${where}`
    );
    const total = cntRows?.[0]?.total ?? 0;

    // Page query: include loaded_bags (jsonb -> json for clean serialization)
    const dataSql = `
      SELECT
        bag_generated_timestamp AS time_generated,
        ds_bag_no,
        weight_out AS weight,
        userid,
        to_json(loaded_bags) as loaded_bags
      FROM ${table}
      WHERE ${where}
      ORDER BY bag_generated_timestamp DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(dataSql, [PAGE_SIZE, offset]);

    // Columns metadata: exclude loaded_bags, no width hints at all
    const columns = result.fields
      .map((f) => f.name)
      .filter((name) => name !== "loaded_bags")
      .map((field) => {
        let type = "string";
        if (field === "time_generated") type = "datetime";
        else if (field === "weight") type = "number";
        return {
          field,
          headerName: toHeader(field),
          type,
        };
      });

    res.json({
      columns,                 // no loaded_bags column
      rows: result.rows,       // rows DO include loaded_bags
      pagination: {
        page,                  // 1-based
        pageSize: PAGE_SIZE,   // fixed
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        hasMore: offset + result.rows.length < total,
      },
    });
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
    plus3,
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
      final_destination = $11,
      quality_plus_3 = $12
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
    plus3 ?? null
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

// GET /api/activation/kiln_output/quality?bag_no=KOA_290925_014
router.get("/kiln_output/quality", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_kiln_output`;

  const bagNo = (req.query.bag_no || "").trim();
  if (!bagNo) return res.status(400).json({ error: "bag_no is required" });

  try {
    const sql = `
      SELECT
        bag_no,
        quality_plus_3   AS plus3,
        quality_3by4     AS three_four,
        quality_4by8     AS four_eight,
        quality_8by12    AS eight_twelve,
        quality_12by30   AS twelve_thirty,
        quality_minus_30 AS minus30,
        quality_cbd      AS cbd,
        quality_ctc      AS ctc
      FROM ${table}
      WHERE bag_no = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(sql, [bagNo]);
    if (!rows.length) return res.status(404).json({ error: "kiln bag not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(new Date().toLocaleString(), ":", err);
    res.status(500).json({ error: "Database error" });
  }
});


module.exports = router;
