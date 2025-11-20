const express = require('express');
const router = express.Router();
const pool = require('./db');

const checkAccess= require('./checkaccess.js');


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');

/* ======================= INWARD BAGS (JSON + CSV) ======================= */

function assertSafeIdent_inward(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_inward(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_inward({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
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

function baseSql_inward(table) {
  return `
    SELECT
      write_timestamp AS bag_created_datetime,
      inward_number,
      bag_no,
      weight,
      userid
    FROM ${table} b
  `;
}

// WHERE (both optional): date range on write_timestamp, inward_number text search
function buildWhere_inward(q) {
  const where = [];
  const vals  = [];
  let i = 1;

  if (q.from) { where.push(`b.write_timestamp >= to_date($${i++}, 'YYYY-MM-DD')`);          vals.push(q.from); }
  if (q.to)   { where.push(`b.write_timestamp < (to_date($${i++}, 'YYYY-MM-DD') + interval '1 day')`); vals.push(q.to); }

  // inward_number: free text; case-insensitive contains
  if (q.inward_number) {
    where.push(`LOWER(b.inward_number) LIKE LOWER($${i++})`);
    vals.push(`%${q.inward_number}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_INWARD = `ORDER BY b.write_timestamp DESC NULLS LAST, b.bag_no`;

/** JSON (paged) */
router.get("/inward_bags", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_inward(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_inward_bag`;
  const { page, pageSize, offset } = getPaging_inward(req);
  const { whereSql, vals } = buildWhere_inward(req.query || {});
  const { rows, total } = await runPaged_inward({
    baseSql: baseSql_inward(table),
    whereSql,
    orderBySql: ORDER_BY_INWARD,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "bag_created_datetime", headerName: "Bag Created Date/Time", flex: 1 },
    { field: "inward_number",        headerName: "Inward Number",        flex: 1 },
    { field: "bag_no",               headerName: "Bag No",               flex: 1 },
    { field: "weight",               headerName: "Weight",               flex: 1 },
    { field: "userid",               headerName: "User",                 flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/inward_bags.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_inward(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_inward_bag`;
  const { whereSql, vals } = buildWhere_inward(req.query || {});
  const sql = `${baseSql_inward(table)} ${whereSql} ${ORDER_BY_INWARD}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="inward_bags.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ===================== /INWARD BAGS (JSON + CSV) ===================== */

/* =================== MATERIAL OUTWARD (JSON + CSV) =================== */

function assertSafeIdent_mo(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_mo(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_mo({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
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

function baseSql_mo(table) {
  return `
    SELECT
      b.write_timestamp AS bag_created_datetime,
      b.inward_number,
      b.bag_no,
      b.grade,
      b.weight,
      b.userid
    FROM ${table} b
  `;
}

const MATERIAL_OUTWARD_DEFAULT_GRADES = [
  "Stones",
  "Grade 2nd stage - Rotary B",
  "Grade 1st stage - Rotary A",
  "-20 2nd Stage - Rotary B",
  "-20  1st Stage - Rotary A", // note the double space per your spec
  "Unburnt",
];

// WHERE (all optional): date range, inward_number contains, grade (with default list)
function buildWhere_mo(q) {
  const where = [];
  const vals  = [];

  // Date range on write_timestamp
  if (q.from) {
    vals.push(q.from);
    where.push(`b.write_timestamp >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`b.write_timestamp < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  // inward_number contains (case-insensitive)
  if (q.inward_number) {
    vals.push(`%${q.inward_number}%`);
    where.push(`LOWER(b.inward_number) LIKE LOWER($${vals.length})`);
  }

  // Grade: if none or "All", use default IN list; else exact match
  const grade = (q.grade ?? "").trim();
  if (!grade || grade.toLowerCase() === "all") {
    vals.push(MATERIAL_OUTWARD_DEFAULT_GRADES);
    where.push(`b.grade = ANY($${vals.length})`);
  } else {
    vals.push(grade);
    where.push(`b.grade = $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_MO = `ORDER BY b.write_timestamp DESC NULLS LAST, b.bag_no`;

/** JSON (paged) */
router.get("/material_outward", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_mo(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;
  const { page, pageSize, offset } = getPaging_mo(req);
  const { whereSql, vals } = buildWhere_mo(req.query || {});
  const { rows, total } = await runPaged_mo({
    baseSql: baseSql_mo(table),
    whereSql,
    orderBySql: ORDER_BY_MO,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "bag_created_datetime", headerName: "Bag Created Date/Time", flex: 1 },
    { field: "inward_number",        headerName: "Inward Number",        flex: 1 },
    { field: "bag_no",               headerName: "Bag No",               flex: 1 },
    { field: "grade",                headerName: "Grade",                flex: 1 },
    { field: "weight",               headerName: "Weight",               flex: 1 },
    { field: "userid",               headerName: "User",                 flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/material_outward.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_mo(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;
  const { whereSql, vals } = buildWhere_mo(req.query || {});
  const sql = `${baseSql_mo(table)} ${whereSql} ${ORDER_BY_MO}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="material_outward.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ================= /MATERIAL OUTWARD (JSON + CSV) ================= */

/* ============ MATERIAL OUTWARD — SUMMARISED (JSON + CSV) ============ */

function assertSafeIdent_mos(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_mos(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_mos({ baseSql, whereSql, groupOrderSql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql} ${whereSql} ${groupOrderSql.groupBy}) g`;
  const dataSql  = `${baseSql} ${whereSql} ${groupOrderSql.groupBy} ${groupOrderSql.orderBy} LIMIT ${pageSize} OFFSET ${offset}`;
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



function baseSql_mos(table) {
  return `
    SELECT
      to_char(b.write_timestamp, 'dd-mm-yyyy') AS date_str,
      b.inward_number,
      b.grade,
      COUNT(*) AS num_of_bags,
      SUM(b.weight) AS sum_weight
    FROM ${table} b
  `;
}

// WHERE (all optional): date range, inward_number contains, grade (with default list if All/empty)
function buildWhere_mos(q) {
  const where = [];
  const vals  = [];

  if (q.from) {
    vals.push(q.from);
    where.push(`b.write_timestamp >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`b.write_timestamp < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  if (q.inward_number) {
    vals.push(`%${q.inward_number}%`);
    where.push(`LOWER(b.inward_number) LIKE LOWER($${vals.length})`);
  }

  const grade = (q.grade ?? "").trim();
  if (!grade || grade.toLowerCase() === "all") {
    vals.push(MATERIAL_OUTWARD_DEFAULT_GRADES);
    where.push(`b.grade = ANY($${vals.length})`);
  } else {
    vals.push(grade);
    where.push(`b.grade = $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const GROUP_ORDER_MOS = {
  groupBy: `GROUP BY to_char(b.write_timestamp, 'dd-mm-yyyy'), b.inward_number, b.grade`,
  orderBy: `ORDER BY to_char(b.write_timestamp, 'dd-mm-yyyy') DESC, b.inward_number, b.grade`
};

/** JSON (paged) */
router.get("/material_outward_summary", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_mos(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;
  const { page, pageSize, offset } = getPaging_mos(req);
  const { whereSql, vals } = buildWhere_mos(req.query || {});
  const { rows, total } = await runPaged_mos({
    baseSql: baseSql_mos(table),
    whereSql,
    groupOrderSql: GROUP_ORDER_MOS,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "date_str",      headerName: "Date (dd-mm-yyyy)", flex: 1 },
    { field: "inward_number", headerName: "Inward Number",     flex: 1 },
    { field: "grade",         headerName: "Grade",             flex: 1 },
    { field: "num_of_bags",   headerName: "# Bags",            flex: 1 },
    { field: "sum_weight",    headerName: "Total Weight",      flex: 1 },
  ];
  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/material_outward_summary.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_mos(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const table = `${accountid}_material_outward_bag`;
  const { whereSql, vals } = buildWhere_mos(req.query || {});
  const sql = `${baseSql_mos(table)} ${whereSql} ${GROUP_ORDER_MOS.groupBy} ${GROUP_ORDER_MOS.orderBy}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="material_outward_summary.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ========== /MATERIAL OUTWARD — SUMMARISED (JSON + CSV) ========== */


module.exports = router;
