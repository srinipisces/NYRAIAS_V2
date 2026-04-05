const express = require('express');
const router = express.Router();
const pool = require('./db');

const checkAccess= require('./checkaccess.js');
const { Parser: Json2CsvParser } = require('json2csv');


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');
console.log("Kiln_yield");
/* =================== KILN FEED QUALITY (JSON + CSV) =================== */

// local helpers (scoped to this file)
function assertSafeIdent_kfq(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_kfq(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPagedQuery_kfq({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql, vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

// shared SQL builders
function buildWhere_kfq(q) {
  const where = [];
  const vals  = [];

  // Optional date range (inclusive start, inclusive end-of-day)
  if (q.from) {
    vals.push(q.from);
    where.push(`p.kiln_feed_quality_sysentry >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`p.kiln_feed_quality_sysentry < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  // Optional userid
  if (q.userid) {
    vals.push(q.userid);
    where.push(`p.kiln_quality_updt_user = $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

function baseSql_kfq(table) {
  // Use safe field keys in JSON (columns labels handled separately)
  return `
    SELECT
      p.bag_no,
      p.write_timestamp        AS created_date,
      p.grade_plus2            AS plus2,
      p.grade_2by3             AS g2_3,
      p.grade_3by6             AS g3_6,
      p.grade_6by8             AS g6_8,
      p.grade_8by10            AS g8_10,
      p.grade_10by12           AS g10_12,
      p.grade_12by14           AS g12_14,
      p.grade_minus14          AS minus14,
      p.feed_moisture,
      p.dust,
      p.feed_volatile,
      p.remarks,
      p.kiln_feed_quality_sysentry AS data_entry_time,
      p.kiln_quality_updt_user     AS userid
    FROM ${table} p
  `;
}

const ORDER_BY_KFQ = `ORDER BY p.write_timestamp DESC NULLS LAST, p.bag_no`;

/** JSON (paged) */
router.get("/kiln_feed_quality", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kfq(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;
  const { page, pageSize, offset } = getPaging_kfq(req);

  const { whereSql, vals } = buildWhere_kfq(req.query || {});
  const { rows, total } = await runPagedQuery_kfq({
    baseSql: baseSql_kfq(table),
    whereSql,
    orderBySql: ORDER_BY_KFQ,
    vals,
    page,
    pageSize,
    offset,
  });

  // Column headers to match your requested display (+2, 2/3, etc.)
  const columns = [
    { field: "bag_no",         headerName: "Bag No",        flex: 1 },
    { field: "created_date",   headerName: "Created Date",  flex: 1 },
    { field: "plus2",          headerName: "+2",            flex: 1 },
    { field: "g2_3",           headerName: "2/3",           flex: 1 },
    { field: "g3_6",           headerName: "3/6",           flex: 1 },
    { field: "g6_8",           headerName: "6/8",           flex: 1 },
    { field: "g8_10",          headerName: "8/10",          flex: 1 },
    { field: "g10_12",         headerName: "10/12",         flex: 1 },
    { field: "g12_14",         headerName: "12/14",         flex: 1 },
    { field: "minus14",        headerName: "-14",           flex: 1 },
    { field: "feed_moisture",  headerName: "Feed Moisture", flex: 1 },
    { field: "dust",           headerName: "Dust",          flex: 1 },
    { field: "feed_volatile",  headerName: "Feed Volatile", flex: 1 },
    { field: "remarks",        headerName: "Remarks",       flex: 1 },
    { field: "data_entry_time",headerName: "Data Entry Time", flex: 1 },
    { field: "userid",         headerName: "User",          flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/kiln_feed_quality.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kfq(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;

  const { whereSql, vals } = buildWhere_kfq(req.query || {});
  const sql = `${baseSql_kfq(table)} ${whereSql} ${ORDER_BY_KFQ}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    //const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="kiln_feed_quality.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ================= /KILN FEED QUALITY (JSON + CSV) ================= */


/* ======================= KILN FEED (JSON + CSV) ======================= */

function assertSafeIdent_kilnFeed(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_kilnFeed(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_kilnFeed({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

function baseSql_kilnFeed(table) {
  return `
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
  `;
}

// WHERE with your defaults
function buildWhere_kilnFeed(q) {
  const where = [];
  const vals  = [];

  // Always required
  where.push(`b.kiln_load_time IS NOT NULL`);

  // Grade logic
  const DEFAULT_GRADES = [
    'Grade 1st stage - Rotary A',
    'Grade 2nd stage - Rotary B'
  ];
  const grade = (q.grade ?? "").trim();
  if (!grade || grade.toLowerCase() === "all") {
    // default or explicit "All"
    vals.push(DEFAULT_GRADES);
    where.push(`b.grade = ANY($${vals.length})`);
  } else {
    vals.push(grade);
    where.push(`b.grade = $${vals.length}`);
  }

  // Optional: kiln exactly "Kiln A" | "Kiln B" | "Kiln C"
  if (q.kiln) {
    const kiln = String(q.kiln).trim(); // expect full label from UI
    vals.push(kiln);
    where.push(`b.kiln = $${vals.length}`);
  }

  // Optional: date range on kiln_load_time (inclusive start, inclusive end-of-day)
  if (q.from) {
    vals.push(q.from);
    where.push(`b.kiln_load_time >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`b.kiln_load_time < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;
  return { whereSql, vals };
}

const ORDER_BY_KILN_FEED = `ORDER BY b.kiln_load_time DESC NULLS LAST, b.bag_no`;

/** JSON (paged) */
router.get("/kiln_feed", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kilnFeed(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_material_outward_bag`;
  const { page, pageSize, offset } = getPaging_kilnFeed(req);
  const { whereSql, vals } = buildWhere_kilnFeed(req.query || {});

  const { rows, total } = await runPaged_kilnFeed({
    baseSql: baseSql_kilnFeed(table),
    whereSql,
    orderBySql: ORDER_BY_KILN_FEED,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "inward_number",      headerName: "Inward No",        flex: 1 },
    { field: "bag_no",             headerName: "Bag No",           flex: 1 },
    { field: "grade",              headerName: "Grade",            flex: 1 },
    { field: "weight",             headerName: "Weight",           flex: 1 },
    { field: "kiln",               headerName: "Kiln",             flex: 1 },
    { field: "kiln_loaded_weight", headerName: "Kiln Loaded Wt",   flex: 1 },
    { field: "kiln_load_time",     headerName: "Kiln Load Time",   flex: 1 },
    { field: "kiln_load_user",     headerName: "Kiln Load User",   flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/kiln_feed.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kilnFeed(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;
  const { whereSql, vals } = buildWhere_kilnFeed(req.query || {});
  const sql = `${baseSql_kilnFeed(table)} ${whereSql} ${ORDER_BY_KILN_FEED}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="kiln_feed.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ===================== /KILN FEED (JSON + CSV) ===================== */

/* =================== KILN OUTPUT RECORDS (JSON + CSV) =================== */

function assertSafeIdent_kor(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_kor(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_kor({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

function baseSql_kor(table) {
  return `
    SELECT
      kiln_output_dt,
      from_the_kiln          AS kiln,
      bag_no,
      weight_with_stones,
      userid_kilnoutput      AS userid
    FROM ${table}
  `;
}

// WHERE builder (all optional)
function buildWhere_kor(q) {
  const where = [];
  const vals  = [];
  let i = 1;

  if (q.kiln)   { where.push(`LOWER(from_the_kiln) LIKE LOWER($${i++})`); vals.push(`%${q.kiln}%`); }
  if (q.userid) { where.push(`LOWER(userid_kilnoutput) LIKE LOWER($${i++})`); vals.push(`%${q.userid}%`); }
  if (q.from)   { where.push(`kiln_output_dt >= $${i++}`); vals.push(`${q.from} 00:00:00`); }
  if (q.to)     { where.push(`kiln_output_dt <= $${i++}`); vals.push(`${q.to} 23:59:59.999`); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_KOR = `ORDER BY kiln_output_dt DESC NULLS LAST`;

/** JSON (paged) */
router.get("/kiln_output_records", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kor(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_kiln_output`; // <-- change if your table name differs

  const { page, pageSize, offset } = getPaging_kor(req);
  const { whereSql, vals } = buildWhere_kor(req.query || {});
  const { rows, total } = await runPaged_kor({
    baseSql: baseSql_kor(table),
    whereSql,
    orderBySql: ORDER_BY_KOR,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "kiln_output_dt",   headerName: "Output Time",      flex: 1 },
    { field: "kiln",             headerName: "Kiln",             flex: 1 },
    { field: "bag_no",           headerName: "Bag No",           flex: 1 },
    { field: "weight_with_stones", headerName: "Weight (with stones)", flex: 1 },
    { field: "userid",           headerName: "User",             flex: 1 },
  ];
  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/kiln_output_records.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kor(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_kiln_output`; // <-- change if needed
  const { whereSql, vals } = buildWhere_kor(req.query || {});
  const sql = `${baseSql_kor(table)} ${whereSql} ${ORDER_BY_KOR}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="kiln_output_records.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ================= /KILN OUTPUT RECORDS (JSON + CSV) ================= */

/* ========== KILN FEED vs OUTPUT — DAY-WISE (JSON + CSV) ========== */

function assertSafeIdent_kfvo(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_kfvo(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_kfvo({ baseSql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql}) t`;
  const dataSql  = `${baseSql} ORDER BY dt DESC NULLS LAST, kiln LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

/**
 * Build FULL OUTER JOIN of day-wise aggregates:
 *  - input:  <accountid>_material_outward_bag (date = write_timestamp::date)
 *  - output: <accountid>_kiln_output         (date = kiln_output_dt::date)
 * Optional filters:
 *  - kiln: "Kiln A" | "Kiln B" | "Kiln C" (empty = ALL)
 *  - from/to: YYYY-MM-DD (inclusive range)
 */
function buildSql_kfvo(accountid, q) {
  const inTable  = `${accountid}_material_outward_bag`;
  const outTable = `${accountid}_kiln_output`;

  const vals = [];
  let idx = 1;

  // Subquery WHEREs assembled independently but share the same vals[]
  const inWhere  = [];
  const outWhere = [];

  // Kiln filter (optional)
  if (q.kiln) {
    vals.push(q.kiln);
    inWhere.push(`b.kiln = $${idx}`);
    outWhere.push(`o.from_the_kiln = $${idx}`);
    idx++;
  }

  // Date range (optional, inclusive)
  if (q.from) {
    vals.push(q.from);
    inWhere.push(`b.write_timestamp::date >= to_date($${idx}, 'YYYY-MM-DD')`);
    outWhere.push(`o.kiln_output_dt::date >= to_date($${idx}, 'YYYY-MM-DD')`);
    idx++;
  }
  if (q.to) {
    vals.push(q.to);
    inWhere.push(`b.write_timestamp::date <= to_date($${idx}, 'YYYY-MM-DD')`);
    outWhere.push(`o.kiln_output_dt::date <= to_date($${idx}, 'YYYY-MM-DD')`);
    idx++;
  }

  const inWhereSql  = inWhere.length  ? `WHERE ${inWhere.join(" AND ")}`  : "";
  const outWhereSql = outWhere.length ? `WHERE ${outWhere.join(" AND ")}` : "";

  // Day-wise aggregates for input and output
  const baseSql = `
    WITH input_agg AS (
      SELECT
        b.write_timestamp::date AS dt,
        b.kiln                  AS kiln,
        COUNT(*)                AS bags_loaded,
        SUM(b.weight)           AS weight_loaded
      FROM ${inTable} b
      ${inWhereSql}
      GROUP BY b.write_timestamp::date, b.kiln
    ),
    output_agg AS (
      SELECT
        o.kiln_output_dt::date  AS dt,
        o.from_the_kiln         AS kiln,
        COUNT(*)                AS bags_output,
        SUM(o.weight_with_stones) AS output_weight_with_stones
      FROM ${outTable} o
      ${outWhereSql}
      GROUP BY o.kiln_output_dt::date, o.from_the_kiln
    )
    SELECT
      COALESCE(i.dt,  o.dt)  AS dt,
      COALESCE(i.kiln,o.kiln) AS kiln,
      COALESCE(i.bags_loaded, 0)                AS bags_loaded,
      COALESCE(i.weight_loaded, 0)              AS weight_loaded,
      COALESCE(o.bags_output, 0)                AS bags_output,
      COALESCE(o.output_weight_with_stones, 0)  AS output_weight_with_stones
    FROM input_agg i
    FULL OUTER JOIN output_agg o
      ON i.dt = o.dt AND i.kiln = o.kiln
  `;
  return { baseSql, vals };
}

/** JSON (paged, default 50) */
router.get("/kiln_feed_vs_output", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kfvo(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const { page, pageSize, offset } = getPaging_kfvo(req);
  const kiln = req.query?.Kiln || req.query?.kiln || ""; // accept either casing
  const from = req.query?.from || "";
  const to   = req.query?.to   || "";

  const { baseSql, vals } = buildSql_kfvo(accountid, { kiln, from, to });
  const { rows, total } = await runPaged_kfvo({
    baseSql,
    vals,
    page,
    pageSize,
    offset,
  });

  // Format date as DD-MM-YYYY for display; keep a raw sort dt on server order
  const fmt = (d) => d ? new Date(d).toISOString().slice(0,10).split("-").reverse().join("-") : "";
  const shaped = rows.map(r => ({
    date: fmt(r.dt),
    kiln: r.kiln,
    bags_loaded: r.bags_loaded,
    weight_loaded: r.weight_loaded,
    bags_output: r.bags_output,
    output_weight_with_stones: r.output_weight_with_stones,
  }));

  const columns = [
    { field: "date",                      headerName: "Date (DD-MM-YYYY)", flex: 1 },
    { field: "kiln",                      headerName: "Kiln",              flex: 1 },
    { field: "bags_loaded",               headerName: "Bags Loaded",       flex: 1 },
    { field: "weight_loaded",             headerName: "Weight Loaded",     flex: 1 },
    { field: "bags_output",               headerName: "Bags Output",       flex: 1 },
    { field: "output_weight_with_stones", headerName: "Output Wt (stones)",flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows: shaped, columns });
});

/** CSV (full filtered set) */
router.get("/kiln_feed_vs_output.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kfvo(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const kiln = req.query?.Kiln || req.query?.kiln || "";
  const from = req.query?.from || "";
  const to   = req.query?.to   || "";

  const { baseSql, vals } = buildSql_kfvo(accountid, { kiln, from, to });
  const sql = `${baseSql} ORDER BY dt DESC NULLS LAST, kiln`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const fmt = (d) => d ? new Date(d).toISOString().slice(0,10).split("-").reverse().join("-") : "";
    const shaped = rows.map(r => ({
      date: fmt(r.dt),
      kiln: r.kiln,
      bags_loaded: r.bags_loaded,
      weight_loaded: r.weight_loaded,
      bags_output: r.bags_output,
      output_weight_with_stones: r.output_weight_with_stones,
    }));

    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(shaped);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="kiln_feed_vs_output.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ======== /KILN FEED vs OUTPUT — DAY-WISE (JSON + CSV) ======== */


/* ================== KILN OUTPUT QUALITY (JSON + CSV) ================== */

// scoped helpers to avoid collisions
function assertSafeIdent_koq(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_koq(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_koq({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

// Base SELECT (use safe field names in JSON; headers handled in columns)
function baseSql_koq(table) {
  return `
    SELECT
      write_timestamp                  AS bag_created_time,
      bag_no,
      weight_with_stones,
      quality_updt_user               AS userid,
      quality_updt_time,
      quality_plus_3                  AS plus3,
      quality_3by4                    AS q3_4,
      quality_4by8                    AS q4_8,
      quality_8by12                   AS q8_12,
      quality_12by30                  AS q12_30,
      quality_minus_30                AS minus30,
      quality_cbd                     AS cbd,
      quality_ctc                     AS ctc
    FROM ${table}
  `;
}

// WHERE builder (both filters optional)
function buildWhere_koq(q) {
  const where = [];
  const vals  = [];
  let i = 1;

  // Date range on write_timestamp (inclusive start, inclusive end-of-day)
  if (q.from) { where.push(`write_timestamp >= to_date($${i++}, 'YYYY-MM-DD')`); vals.push(q.from); }
  if (q.to)   { where.push(`write_timestamp <  (to_date($${i++}, 'YYYY-MM-DD') + interval '1 day')`); vals.push(q.to); }

  // CTC range (supports min-only, max-only, or both)
  const hasMin = q.ctc_min !== undefined && q.ctc_min !== "" && q.ctc_min !== null;
  const hasMax = q.ctc_max !== undefined && q.ctc_max !== "" && q.ctc_max !== null;
  if (hasMin && hasMax) {
    where.push(`quality_ctc BETWEEN $${i++} AND $${i++}`);
    vals.push(Number(q.ctc_min), Number(q.ctc_max));
  } else if (hasMin) {
    where.push(`quality_ctc >= $${i++}`);
    vals.push(Number(q.ctc_min));
  } else if (hasMax) {
    where.push(`quality_ctc <= $${i++}`);
    vals.push(Number(q.ctc_max));
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_KOQ = `ORDER BY write_timestamp DESC NULLS LAST`;

/** JSON (paged, 50 by default) */
router.get("/kiln_output_quality", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_koq(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_kiln_output`; // adjust if your table name differs
  const { page, pageSize, offset } = getPaging_koq(req);

  const { whereSql, vals } = buildWhere_koq(req.query || {});
  const { rows, total } = await runPaged_koq({
    baseSql: baseSql_koq(table),
    whereSql,
    orderBySql: ORDER_BY_KOQ,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "bag_created_time", headerName: "Bag Created Time", flex: 1 },
    { field: "bag_no",           headerName: "Bag No",           flex: 1 },
    { field: "weight_with_stones", headerName: "Weight (with stones)", flex: 1 },
    { field: "userid",           headerName: "User",             flex: 1 },
    { field: "quality_updt_time",headerName: "Quality Update Time", flex: 1 },
    { field: "plus3",            headerName: "+3",               flex: 1 },
    { field: "q3_4",             headerName: "3/4",              flex: 1 },
    { field: "q4_8",             headerName: "4/8",              flex: 1 },
    { field: "q8_12",            headerName: "8/12",             flex: 1 },
    { field: "q12_30",           headerName: "12/30",            flex: 1 },
    { field: "minus30",          headerName: "-30",              flex: 1 },
    { field: "cbd",              headerName: "CBD",              flex: 1 },
    { field: "ctc",              headerName: "CTC",              flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set, same filters) */
router.get("/kiln_output_quality.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_koq(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_kiln_output`;
  const { whereSql, vals } = buildWhere_koq(req.query || {});
  const sql = `${baseSql_koq(table)} ${whereSql} ${ORDER_BY_KOQ}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="kiln_output_quality.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});

/* ================= /KILN OUTPUT QUALITY (JSON + CSV) ================= */

/* ========== DE-STONING BAGS LOADED / INQUE (JSON + CSV) ========== */

function assertSafeIdent_dst(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_dst(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_dst({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

function baseSql_dst(table) {
  return `
    SELECT
      write_timestamp     AS kiln_bag_output_time,
      bag_no,
      weight_with_stones,
      exkiln_stock        AS status,
      destoning_in_updt   AS destoning_input_time,
      destoning_in_weight,
      destoning_in_user
    FROM ${table}
  `;
}

function buildWhere_dst(q) {
  const where = [];
  const vals  = [];
  let i = 1;

  // Status default: ('De-Stoning','DeStoningCompleted')
  const DEFAULT_STATUSES = ['De-Stoning', 'DeStoningCompleted'];
  const rawStatus = (q.status ?? "").trim();
  if (!rawStatus || rawStatus.toLowerCase() === "all") {
    vals.push(DEFAULT_STATUSES);
    where.push(`exkiln_stock = ANY($${i++})`);
  } else {
    // exact one status value
    vals.push(rawStatus);
    where.push(`exkiln_stock = $${i++}`);
  }

  // Optional date range on destoning_in_updt (inclusive start, inclusive end-of-day)
  if (q.from) { where.push(`destoning_in_updt >= to_date($${i++}, 'YYYY-MM-DD')`); vals.push(q.from); }
  if (q.to)   { where.push(`destoning_in_updt <  (to_date($${i++}, 'YYYY-MM-DD') + interval '1 day')`); vals.push(q.to); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_DST = `ORDER BY destoning_in_updt DESC NULLS LAST, bag_no`;

/** JSON (paged) */
router.get("/destoning_loaded_inque", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_dst(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_kiln_output`;
  const { page, pageSize, offset } = getPaging_dst(req);
  const { whereSql, vals } = buildWhere_dst(req.query || {});
  const { rows, total } = await runPaged_dst({
    baseSql: baseSql_dst(table),
    whereSql,
    orderBySql: ORDER_BY_DST,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "kiln_bag_output_time", headerName: "Kiln Bag Output Time", flex: 1 },
    { field: "bag_no",               headerName: "Bag No",               flex: 1 },
    { field: "weight_with_stones",   headerName: "Weight (with stones)", flex: 1 },
    { field: "status",               headerName: "Status",               flex: 1 },
    { field: "destoning_input_time", headerName: "Destoning Input Time", flex: 1 },
    { field: "destoning_in_weight",  headerName: "Destoning In Weight",  flex: 1 },
    { field: "destoning_in_user",    headerName: "Destoning In User",    flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/destoning_loaded_inque.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_dst(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_kiln_output`;
  const { whereSql, vals } = buildWhere_dst(req.query || {});
  const sql = `${baseSql_dst(table)} ${whereSql} ${ORDER_BY_DST}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="destoning_loaded_inque.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ======= /DE-STONING BAGS LOADED / INQUE (JSON + CSV) ======= */

/* ======================= RMS PERFORMANCE (JSON + CSV) ======================= */

function assertSafeIdent_rms(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_rms(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_rms({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

// 👉 If your legacy route had a SELECT ... JOIN ... etc., put that SELECT here
//    and keep the WHERE/ORDER/LIMIT/OFFSET applied by this wrapper.
function baseSql_rms(table) {
  return `
    SELECT
      *
    FROM ${table} r
  `;
}

// WHERE builder for optional material_arrivaltime range
function buildWhere_rms(q) {
  const where = [];
  const vals  = [];
  let i = 1;

  if (q.from) { where.push(`r.material_arrivaltime >= to_date($${i++}, 'YYYY-MM-DD')`); vals.push(q.from); }
  if (q.to)   { where.push(`r.material_arrivaltime <  (to_date($${i++}, 'YYYY-MM-DD') + interval '1 day')`); vals.push(q.to); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_RMS = `ORDER BY r.material_arrivaltime DESC NULLS LAST`;

// Build a simple columns array from the first row (keeps your hub table happy)
function columnsFromFirstRow_rms(rows) {
  if (!rows?.length) return [];
  return Object.keys(rows[0]).map(k => ({
    field: k,
    headerName: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    flex: 1,
  }));
}

/** JSON (paged) */
router.get("/rms_performance", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_rms(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  // If your RMS lives in a different table/view, change this name:
  const table = `${accountid}_rms_summary_view_v2`;

  const { page, pageSize, offset } = getPaging_rms(req);
  const { whereSql, vals } = buildWhere_rms(req.query || {});
  const { rows, total } = await runPaged_rms({
    baseSql: baseSql_rms(table),
    whereSql,
    orderBySql: ORDER_BY_RMS,
    vals,
    page,
    pageSize,
    offset,
  });

  return res.json({
    page,
    pageSize,
    total,
    rows,
    columns: columnsFromFirstRow_rms(rows),
  });
});

/** CSV (full filtered set) */
router.get("/rms_performance.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_rms(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_rms_summary_view_v2`;
  const { whereSql, vals } = buildWhere_rms(req.query || {});
  const sql = `${baseSql_rms(table)} ${whereSql} ${ORDER_BY_RMS}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="rms_performance.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ==================== /RMS PERFORMANCE (JSON + CSV) ==================== */

/* ======================= KILN YIELD (JSON + CSV) ======================= */

function assertSafeIdent_kilnYield(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}

function getPaging_kilnYield(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.body?.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.body?.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

async function runPaged_kilnYield({ baseSql, whereSql, orderSql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderSql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    const total = parseInt(tot?.[0]?.n ?? "0", 10);
    return { rows, total };
  } finally {
    client.release();
  }
}

function buildWhere_kilnYield(body) {
  const where = [];
  const vals  = [];

  // Optional: start_date / end_date on date_str (stored as 'dd-mm-yyyy')
  if (body.start_date) {
    vals.push(body.start_date);
    where.push(`TO_DATE(date_str, 'dd-mm-yyyy') >= $${vals.length}`);
  }
  if (body.end_date) {
    vals.push(body.end_date);
    where.push(`TO_DATE(date_str, 'dd-mm-yyyy') <= $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

function baseSql_kilnYield(table) {
  // select * then add computed columns, or explicitly list the columns you need
  return `
    SELECT
      *,
      ROUND((kiln_output_weight / NULLIF(raw_material_out_weight, 0)) * 100, 2) AS actual_yield,
      ROUND((kiln_output_weight / NULLIF(kiln_loaded_weight, 0)) * 100, 2)       AS kiln_yield,
      (kiln_loaded_weight - raw_material_out_weight)                             AS kiln_input_loss
    FROM ${table}
  `;
}

const ORDER_BY_KILN_YIELD = `ORDER BY TO_DATE(date_str, 'dd-mm-yyyy') ASC`;

/** JSON (paged) */
router.post("/kiln_yield", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    assertSafeIdent_kilnYield(accountid);

    const kiln_summary_view = `${accountid}_kiln_daily_summary`;
    const { page, pageSize, offset } = getPaging_kilnYield(req);
    const { whereSql, vals } = buildWhere_kilnYield(req.body || {});

    const { rows, total } = await runPaged_kilnYield({
      baseSql: baseSql_kilnYield(kiln_summary_view),
      whereSql,
      orderSql: ORDER_BY_KILN_YIELD,
      vals,
      page,
      pageSize,
      offset,
    });

    // Columns list (stable order for grid). Adjust as needed to match your view shape.
    const columns = [
      { field: "date_str",                 headerName: "Date",               flex: 1 },
      { field: "raw_material_out_weight",  headerName: "Raw Material Out",   flex: 1 },
      { field: "kiln_loaded_weight",       headerName: "Kiln Loaded",        flex: 1 },
      { field: "kiln_output_weight",       headerName: "Kiln Output",        flex: 1 },
      { field: "actual_yield",             headerName: "Actual Yield (%)",   flex: 1 },
      { field: "kiln_yield",               headerName: "Kiln Yield (%)",     flex: 1 },
      { field: "kiln_input_loss",          headerName: "Kiln Input Loss",    flex: 1 },
      // include any other fields present in your view that you want visible
    ];

    return res.json({ page, pageSize, total, rows, columns });
  } catch (err) {
    console.error("Error in /kiln_yield:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

/** CSV (full filtered set) */
router.post("/kiln_yield.csv", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    assertSafeIdent_kilnYield(accountid);

    const kiln_summary_view = `${accountid}_kiln_daily_summary`;
    const { whereSql, vals } = buildWhere_kilnYield(req.body || {});
    const sql = `${baseSql_kilnYield(kiln_summary_view)} ${whereSql} ${ORDER_BY_KILN_YIELD}`;

    const client = await pool.connect();
    try {
      const { rows } = await client.query(sql, vals);
      const { Parser: Json2CsvParser } = await import("json2csv");
      const parser = new Json2CsvParser({ header: true });
      const csv = parser.parse(rows);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="kiln_yield.csv"`);
      return res.send(csv);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in /kiln_yield.csv:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

/* ===================== /KILN YIELD (JSON + CSV) ===================== */


/* =================== DE-STONING OUTPUT (JSON + CSV) =================== */

function assertSafeIdent_ds(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_ds(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_ds({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

function baseSql_ds(table) {
  return `
    SELECT
      d.bag_generated_timestamp        AS bag_gen_date,
      d.ds_bag_no                      AS bag_no,
      d.weight_out                     AS bag_weight,
      d.loaded_bags,
      d.loaded_weight,
      d.userid,
      d.quality_updt_time,
      d.quality_plus_3                 AS plus3,
      d.quality_3by4                   AS g3_4,
      d.quality_4by8                   AS g4_8,
      d.quality_8by12                  AS g8_12,
      d.quality_12by30                 AS g12_30,
      d.quality_minus_30               AS minus30,
      d.quality_cbd                    AS cbd,
      d.quality_ctc                    AS ctc,
      d.quality_updt_user,
      d.final_destination              AS status
    FROM ${table} d
  `;
}

// WHERE builder (both filters optional)
function buildWhere_ds(q) {
  const where = [];
  const vals  = [];

  // Date range on bag_generated_timestamp
  if (q.from) {
    vals.push(q.from);
    where.push(`d.bag_generated_timestamp >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`d.bag_generated_timestamp < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  // CTC numeric between (allow min only, max only, or both)
  const hasMin = q.ctcMin !== undefined && q.ctcMin !== "";
  const hasMax = q.ctcMax !== undefined && q.ctcMax !== "";
  if (hasMin && hasMax) {
    vals.push(Number(q.ctcMin));
    vals.push(Number(q.ctcMax));
    where.push(`(d.quality_ctc)::numeric BETWEEN $${vals.length-1} AND $${vals.length}`);
  } else if (hasMin) {
    vals.push(Number(q.ctcMin));
    where.push(`(d.quality_ctc)::numeric >= $${vals.length}`);
  } else if (hasMax) {
    vals.push(Number(q.ctcMax));
    where.push(`(d.quality_ctc)::numeric <= $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_DS = `ORDER BY d.bag_generated_timestamp DESC NULLS LAST, d.ds_bag_no`;

/** JSON (paged) */
router.get("/destoning_output", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_ds(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_destoning`;
  const { page, pageSize, offset } = getPaging_ds(req);
  const { whereSql, vals } = buildWhere_ds(req.query || {});
  const { rows, total } = await runPaged_ds({
    baseSql: baseSql_ds(table),
    whereSql,
    orderBySql: ORDER_BY_DS,
    vals,
    page,
    pageSize,
    offset,
  });

  // Column labels to match UI (alias keys -> friendly headers with + and /)
  const columns = [
    { field: "bag_gen_date",    headerName: "Bag Gen Date", flex: 1 },
    { field: "bag_no",          headerName: "Bag No",       flex: 1 },
    { field: "bag_weight",      headerName: "Bag Weight",   flex: 1 },
    { field: "loaded_bags",     headerName: "Loaded Bags",  flex: 1 },
    { field: "loaded_weight",   headerName: "Loaded Weight",flex: 1 },
    { field: "userid",          headerName: "User",         flex: 1 },
    { field: "quality_updt_time", headerName: "Quality Updt Time", flex: 1 },
    { field: "plus3",           headerName: "+3",           flex: 1 },
    { field: "g3_4",            headerName: "3/4",          flex: 1 },
    { field: "g4_8",            headerName: "4/8",          flex: 1 },
    { field: "g8_12",           headerName: "8/12",         flex: 1 },
    { field: "g12_30",          headerName: "12/30",        flex: 1 },
    { field: "minus30",         headerName: "-30",          flex: 1 },
    { field: "cbd",             headerName: "CBD",          flex: 1 },
    { field: "ctc",             headerName: "CTC",          flex: 1 },
    { field: "quality_updt_user",headerName: "Quality User", flex: 1 },
    { field: "status",          headerName: "Status",       flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/destoning_output.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_ds(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_destoning`;
  const { whereSql, vals } = buildWhere_ds(req.query || {});
  const sql = `${baseSql_ds(table)} ${whereSql} ${ORDER_BY_DS}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="destoning_output.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ================= /DE-STONING OUTPUT (JSON + CSV) ================= */

/* ======================= KILN PARAMETERS (JSON + CSV) ======================= */

function assertSafeIdent_kilnParams(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_kilnParams(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_kilnParams({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql}) t`;
  const dataSql  = `${baseSql} ${whereSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: tot }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql,  vals),
    ]);
    return { rows, total: parseInt(tot?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

function baseSql_kilnParams(table) {
  return `
    SELECT
      temp_dt                 AS entry_datetime,
      kiln,
      t1, t2, t3, t4,
      chamber,               -- (column name as given)
      feed_rate,
      kiln_rpm,
      main_damper_open_per,
      boiler_damper_open_per,
      steam_pressure,
      remarks,
      userid
    FROM ${table}
  `;
}

// WHERE (both optional): date range on temp_dt and kiln exact match if provided
function buildWhere_kilnParams(q) {
  const where = [];
  const vals  = [];

  if (q.from) {
    vals.push(q.from);
    where.push(`temp_dt >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`temp_dt < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  // kiln exact match only when provided; “All”/empty = no condition
  if (q.kiln && String(q.kiln).trim()) {
    vals.push(String(q.kiln).trim());      // expected: "Kiln A" | "Kiln B" | "Kiln C"
    where.push(`kiln = $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_KILN_PARAMS = `ORDER BY temp_dt DESC NULLS LAST, kiln`;

/** JSON (paged) */
router.get("/kiln_parameters", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kilnParams(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_kiln_temp`;
  const { page, pageSize, offset } = getPaging_kilnParams(req);
  const { whereSql, vals } = buildWhere_kilnParams(req.query || {});

  const { rows, total } = await runPaged_kilnParams({
    baseSql: baseSql_kilnParams(table),
    whereSql,
    orderBySql: ORDER_BY_KILN_PARAMS,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "entry_datetime",        headerName: "Entry Date/Time",   flex: 1 },
    { field: "kiln",                  headerName: "Kiln",              flex: 1 },
    { field: "t1",                    headerName: "T1",                flex: 1 },
    { field: "t2",                    headerName: "T2",                flex: 1 },
    { field: "t3",                    headerName: "T3",                flex: 1 },
    { field: "t4",                    headerName: "T4",                flex: 1 },
    { field: "chamber",               headerName: "Chamber",           flex: 1 },
    { field: "feed_rate",             headerName: "Feed Rate",         flex: 1 },
    { field: "kiln_rpm",              headerName: "Kiln RPM",          flex: 1 },
    { field: "main_damper_open_per",  headerName: "Main Damper %",     flex: 1 },
    { field: "boiler_damper_open_per",headerName: "Boiler Damper %",   flex: 1 },
    { field: "steam_pressure",        headerName: "Steam Pressure",    flex: 1 },
    { field: "remarks",               headerName: "Remarks",           flex: 1 },
    { field: "userid",                headerName: "User",              flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/kiln_parameters.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_kilnParams(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_kiln_temp`;
  const { whereSql, vals } = buildWhere_kilnParams(req.query || {});
  const sql = `${baseSql_kilnParams(table)} ${whereSql} ${ORDER_BY_KILN_PARAMS}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="kiln_parameters.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ===================== /KILN PARAMETERS (JSON + CSV) ===================== */


module.exports = router;
