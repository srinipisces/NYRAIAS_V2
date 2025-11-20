// routes/reports_instock_ctc.js
const express = require("express");
const router = express.Router();
const pool = require('./db.js'); // <- your pg Pool
const { authenticate } = require('./authenticate.js');

// ---- GET /api/reports/instock-ctc -----------------------------------------
// Server-side paging (50/page default), optional filters.
router.get("/instock-ctc", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  if (!accountid) return res.status(401).json({ error: "unauthorized" });

  // Parse query params (all optional)
  const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? "50", 10), 1), 200);
  const dateFrom = req.query.dateFrom && String(req.query.dateFrom).trim() || null; // 'YYYY-MM-DD' or ISO
  const dateTo = req.query.dateTo && String(req.query.dateTo).trim() || null;       // inclusive
  const gradeParam = req.query.grade && String(req.query.grade).trim();
  const gradeArray = gradeParam ? gradeParam.split(",").map(s => s.trim()).filter(Boolean) : null;
  const offset = (page - 1) * pageSize;

  // Build safe identifiers
  const desTable = `${accountid}_destoning`;
  const postTable = `${accountid}_postactivation`;

  const sql = `
    WITH base AS (
      -- A) De-Stoning: InStock + positive CTC
      SELECT
        d.bag_generated_timestamp              AS bag_created_time,
        d.ds_bag_no                            AS bag_no,
        'exkiln'::text                         AS grade,
        d.weight_out                           AS weight,
        COALESCE(d.quality_ctc, 0)::numeric    AS ctc,
        d.final_destination                    AS status,
        'destoning'::text                      AS source
      FROM ${desTable} d
      WHERE d.final_destination = 'InStock'
        AND COALESCE(d.quality_ctc, 0) > 0

      UNION ALL

      -- B) Post-Activation: InStock + positive CTC in JSONB (CTC/ctc)
      SELECT
        p.bag_no_created_dttm                  AS bag_created_time,
        p.bag_no                               AS bag_no,
        p.grade                                AS grade,
        p.bag_weight                           AS weight,
        COALESCE(
          NULLIF(p.quality->>'CTC', ''),
          NULLIF(p.quality->>'ctc', '')
        )::numeric                             AS ctc,
        p.stock_status                         AS status,
        'postactivation'::text                 AS source
      FROM ${postTable} p
      WHERE p.stock_status = 'InStock'
        AND COALESCE(
          NULLIF(p.quality->>'CTC', ''),
          NULLIF(p.quality->>'ctc', '')
        )::numeric > 0
    ),
    filtered AS (
      SELECT *
      FROM base
      WHERE ($1::timestamptz IS NULL OR bag_created_time >= $1)
        AND ($2::timestamptz IS NULL OR bag_created_time < ($2::timestamptz + INTERVAL '1 day'))
        AND ($3::text[]      IS NULL OR grade = ANY($3))
    )
    SELECT
      bag_created_time, bag_no, grade, weight, ctc, status, source,
      COUNT(*) OVER() AS total_count
    FROM filtered
    ORDER BY bag_created_time DESC
    OFFSET $4
    LIMIT  $5
  `;

  const params = [
    dateFrom,                          // $1
    dateTo,                            // $2
    gradeArray ? gradeArray : null,    // $3
    offset,                            // $4
    pageSize,                          // $5
  ];

  try {
    const { rows } = await pool.query(sql, params);
    const total = rows.length ? Number(rows[0].total_count) : 0;
    const payload = rows.map(({ total_count, ...r }) => r);
    res.json({
      page,
      pageSize,
      total,
      rows: payload,
    });
  } catch (err) {
    console.error("instock-ctc GET error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ---- PUT /api/reports/instock-ctc/move ------------------------------------
// Bulk move selected rows to a new status.
router.put("/instock-ctc/move", authenticate, async (req, res) => {
  const { accountid, userid } = req.user || {};
  if (!accountid) return res.status(401).json({ error: "unauthorized" });

  const ALLOWED = new Set(["Packaging", "Screening", "De-Dusting", "De-Magnetize", "Blending"]);
  const { target, items } = req.body || {};

  if (!ALLOWED.has(target)) {
    return res.status(400).json({ error: "Invalid target", allowed: Array.from(ALLOWED) });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array required" });
  }

  const desTable = `${accountid}_destoning`;
  const postTable = `${accountid}_postactivation`;

  const desBagNos = [];
  const postBagNos = [];
  for (const it of items) {
    if (!it || !it.bag_no || !it.source) continue;
    if (it.source === "destoning") desBagNos.push(it.bag_no);
    else if (it.source === "postactivation") postBagNos.push(it.bag_no);
  }

  try {
    await pool.query("BEGIN");

    let updatedDestoning = 0;
    let updatedPostAct = 0;

    if (desBagNos.length) {
      const q = `
        UPDATE ${desTable}
        SET
          final_destination = $1,
          stock_upd_dt      = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata',
          stock_upd_user    = $3
        WHERE ds_bag_no = ANY($2::text[])
      `;
      const r = await pool.query(q, [target, desBagNos, userid]);
      updatedDestoning = r.rowCount;
    }

    if (postBagNos.length) {
      const q = `
        UPDATE ${postTable}
        SET
          stock_status                 = $1,
          stock_status_change_dttime   = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata',
          stock_change_userid          = $3
        WHERE bag_no = ANY($2::text[])
      `;
      const r = await pool.query(q, [target, postBagNos, userid]);
      updatedPostAct = r.rowCount;
    }

    await pool.query("COMMIT");
    const updated = updatedDestoning + updatedPostAct;
    res.json({
      updated,
      updated_destoning: updatedDestoning,
      updated_postactivation: updatedPostAct,
      requested: items.length,
      target
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("instock-ctc MOVE error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* =================== STOCK IN PACKAGING (JSON + CSV) =================== */

function assertSafeIdent_sip(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function getPaging_sip(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_sip({ baseSql, whereSql, orderBySql, vals, page, pageSize, offset }) {
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

// Build UNION as a subquery so we can filter/order on stock_upd_dt outside
function baseSql_sip(accountid) {
  const dTable = `${accountid}_destoning`;
  const pTable = `${accountid}_postactivation`;
  return `
    SELECT
      s.bag_created_time,
      s.bag_no,
      s.grade,
      s.weight,
      s.ctc,
      s.status,
      s.stock_upd_dt,
      s.stock_upd_user
    FROM (
      SELECT
        d.bag_generated_timestamp            AS bag_created_time,
        d.ds_bag_no                          AS bag_no,
        'exkiln'                             AS grade,
        d.weight_out                         AS weight,
        d.quality_ctc                        AS ctc,
        d.final_destination                  AS status,
        d.stock_upd_dt                       AS stock_upd_dt,
        d.stock_upd_user                     AS stock_upd_user
      FROM ${dTable} d
      WHERE d.final_destination = 'Packaging'

      UNION ALL

      SELECT
        p.bag_no_created_dttm                AS bag_created_time,
        p.bag_no                             AS bag_no,
        p.grade                              AS grade,
        p.bag_weight                         AS weight,
        /* quality JSONB -> CTC */
        NULLIF((p.quality->>'CTC'), '')::numeric AS ctc,
        p.stock_status                       AS status,
        p.stock_status_change_dttime         AS stock_upd_dt,
        p.stock_change_userid                AS stock_upd_user
      FROM ${pTable} p
      WHERE p.stock_status = 'Packaging'
    ) s
  `;
}

// Optional WHERE on stock_upd_dt (outer WHERE on subquery "s")
function buildWhere_sip(q) {
  const where = [];
  const vals  = [];

  if (q.from) {
    vals.push(q.from);
    where.push(`s.stock_upd_dt >= to_date($${vals.length}, 'YYYY-MM-DD')`);
  }
  if (q.to) {
    vals.push(q.to);
    where.push(`s.stock_upd_dt < (to_date($${vals.length}, 'YYYY-MM-DD') + interval '1 day')`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, vals };
}

const ORDER_BY_SIP = `ORDER BY s.stock_upd_dt DESC NULLS LAST, s.bag_no`;

/** JSON (paged) */
router.get("/stock_in_packaging", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_sip(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const { page, pageSize, offset } = getPaging_sip(req);
  const { whereSql, vals } = buildWhere_sip(req.query || {});
  const { rows, total } = await runPaged_sip({
    baseSql: baseSql_sip(accountid),
    whereSql,
    orderBySql: ORDER_BY_SIP,
    vals,
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "bag_created_time", headerName: "Bag Created Time", flex: 1 },
    { field: "bag_no",           headerName: "Bag No",          flex: 1 },
    { field: "grade",            headerName: "Grade",           flex: 1 },
    { field: "weight",           headerName: "Weight",          flex: 1 },
    { field: "ctc",              headerName: "CTC",             flex: 1 },
    { field: "status",           headerName: "Status",          flex: 1 },
    { field: "stock_upd_dt",     headerName: "Stock Updated",   flex: 1 },
    { field: "stock_upd_user",   headerName: "Stock Upd User",  flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/** CSV (full filtered set) */
router.get("/stock_in_packaging.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_sip(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const { whereSql, vals } = buildWhere_sip(req.query || {});
  const sql = `${baseSql_sip(accountid)} ${whereSql} ${ORDER_BY_SIP}`;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, vals);
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="stock_in_packaging.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ================= /STOCK IN PACKAGING (JSON + CSV) ================= */



module.exports = router;
