const express = require('express');
const router = express.Router();
const pool = require('./db');

const checkAccess= require('./checkaccess.js');


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');

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
    const { Parser: Json2CsvParser } = await import("json2csv");
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




module.exports = router;
