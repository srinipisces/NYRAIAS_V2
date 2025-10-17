const express = require('express');
const router = express.Router();
const pool = require('./db');

const checkAccess= require('./checkaccess.js');


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');

/**
 * Ensure an identifier (e.g., accountid) is safe to interpolate in SQL identifiers.
 * Allows only A–Z, a–z, 0–9, and underscore.
 */
function assertSafeIdent(ident) {
  const s = String(ident ?? "");
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}

/**
 * Format a JS Date as YYYY-MM-DD using UTC calendar fields.
 * (Keeps output stable regardless of server local timezone.)
 */
function yyyyMmDd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Return the IST (Asia/Kolkata) calendar day for "yesterday" as YYYY-MM-DD.
 * Uses fixed UTC+05:30 offset (no DST in IST).
 */
function defaultIstDateString() {
  const nowUtc = new Date();                         // current UTC clock
  const istMs = nowUtc.getTime() + 5.5 * 60 * 60 * 1000; // shift to IST
  const ist = new Date(istMs);

  // Move back one IST calendar day
  ist.setUTCDate(ist.getUTCDate() - 1);

  // Format using UTC accessors (we're treating 'ist' as a UTC-framed instant after shifting)
  return yyyyMmDd(ist);
}

/**
 * Parse an operations query param into a validated list (or null).
 * - Accepts string or array (e.g., "Screening,Crushing" or ["Screening","Crushing"])
 * - Trims, deduplicates (preserves original order), and filters by an allowed set
 *
 * @param {string|string[]|undefined|null} opsParam
 * @param {Set<string>} [allowed=new Set(['Screening','Crushing','De-Dusting','De-Magnetize','Blending'])]
 * @returns {string[] | null}  validated list or null (meaning: no filter / all)
 */
function parseOpsParam(
  opsParam,
  allowed = new Set(["Screening", "Crushing", "De-Dusting", "De-Magnetize", "Blending"])
) {
  if (opsParam == null) return null;

  // normalize to a single comma-joined string
  const raw =
    Array.isArray(opsParam) ? opsParam.join(",") : String(opsParam);

  const seen = new Set();
  const out = [];
  for (const part of raw.split(",").map(s => s.trim()).filter(Boolean)) {
    if (!allowed.has(part)) continue;
    if (seen.has(part)) continue;
    seen.add(part);
    out.push(part);
  }
  return out.length ? out : null;
}

// Optional: export the commonly used allowed set
const GLOBAL_ALLOWED_OPS = new Set([
  "Screening",
  "Crushing",
  "De-Dusting",
  "De-Magnetize",
  "Blending",
]);

// Example specialized allow-lists you can reuse per route:
//   const SCR_CRU = new Set(['Screening','Crushing']);
//   const BLD_DD_DM = new Set(['Blending','De-Dusting','De-Magnetize']);



// GET /api/operations_loaded?operations=Screening_Loaded,Blending_Loaded&from=2025-10-01&to=2025-10-15&bag_no=I-10&page=1&pageSize=50&sort=loaded_time&dir=desc
// GET /api/operations_loaded?operations=Screening_Loaded,Blending_Loaded&from=2025-10-01&to=2025-10-15&bag_no=I-10&page=1&pageSize=50&sort=loaded_time&dir=desc
router.get("/operations_loaded", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch { return res.status(400).json({ error: "Invalid account id" }); }

  // Parse operations: single string or comma-separated; if absent => all
  let opsRaw = req.query.operations;
  let ops = [];
  if (Array.isArray(opsRaw)) ops = opsRaw.flatMap(s => String(s).split(","));
  else if (typeof opsRaw === "string" && opsRaw.trim()) ops = opsRaw.split(",");
  ops = ops.map(s => String(s).trim()).filter(Boolean);

  // Filters
  const bagNo = (req.query.bag_no || "").trim();
  const from  = (req.query.from   || "").trim();
  const to    = (req.query.to     || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // Sort
  const dir = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const ALLOWED_SORT = new Set(["bag_no","grade","status","loaded_time","machine","userid","bag_weight","reloaded_weight"]);
  const sort = ALLOWED_SORT.has(String(req.query.sort)) ? String(req.query.sort) : "loaded_time";

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  // Base UNION
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
    /**WHERE_DESTONING**/
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
    /**WHERE_POSTACT**/
  `;

  // WHERE builders
  const whereDes = [];
  const wherePA  = [];
  const params = [];
  let i = 0;

  if (ops.length) {
    params.push(ops); i++;
    whereDes.push(`d.final_destination = ANY($${i})`);
    wherePA.push(`p.stock_status      = ANY($${i})`);
  }

  // ✅ Standard condition: only *_Loaded
  whereDes.push(`d.final_destination LIKE '%Loaded'`);
  wherePA.push(`p.stock_status      LIKE '%Loaded'`);

  const desClause = `WHERE ${whereDes.join(" AND ")}`;
  const paClause  = `WHERE ${wherePA.join(" AND ")}`;

  const unionReady = unionSql
    .replace("/**WHERE_DESTONING**/", desClause)
    .replace("/**WHERE_POSTACT**/",  paClause);

  // After-UNION filters
  const afterWhere = [];
  if (bagNo) { params.push(`%${bagNo}%`); i++; afterWhere.push(`bag_no ILIKE $${i}`); }
  if (from && to) { params.push(from, to); i += 2; afterWhere.push(`loaded_time::date BETWEEN $${i-1}::date AND $${i}::date`); }
  const afterSql = afterWhere.length ? `WHERE ${afterWhere.join(" AND ")}` : "";

  try {
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM (${unionReady}) u
      ${afterSql}
    `;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    const pageSql = `
      SELECT bag_no, grade, status, loaded_time, machine, userid, bag_weight, reloaded_weight
      FROM (${unionReady}) u
      ${afterSql}
      ORDER BY ${sort} ${dir}, bag_no ${dir}
      LIMIT $${i + 1} OFFSET $${i + 2}
    `;
    const rows = (await pool.query(pageSql, [...params, pageSize, offset])).rows;

    res.json({ rows, total, page, pageSize, sort, dir });
  } catch (err) {
    console.error("GET /api/operations_loaded error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// CSV mirror
router.get("/operations_loaded.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch { return res.status(400).json({ error: "Invalid account id" }); }

  let opsRaw = req.query.operations;
  let ops = [];
  if (Array.isArray(opsRaw)) ops = opsRaw.flatMap(s => String(s).split(","));
  else if (typeof opsRaw === "string" && opsRaw.trim()) ops = opsRaw.split(",");
  ops = ops.map(s => String(s).trim()).filter(Boolean);

  const bagNo = (req.query.bag_no || "").trim();
  const from  = (req.query.from   || "").trim();
  const to    = (req.query.to     || "").trim();
  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

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
    /**WHERE_DESTONING**/
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
    /**WHERE_POSTACT**/
  `;

  const whereDes = [];
  const wherePA  = [];
  const params = [];
  let i = 0;

  if (ops.length) {
    params.push(ops); i++;
    whereDes.push(`d.final_destination = ANY($${i})`);
    wherePA.push(`p.stock_status      = ANY($${i})`);
  }

  // ✅ Standard condition: only *_Loaded
  whereDes.push(`d.final_destination LIKE '%Loaded'`);
  wherePA.push(`p.stock_status      LIKE '%Loaded'`);

  const unionReady = unionSql
    .replace("/**WHERE_DESTONING**/", `WHERE ${whereDes.join(" AND ")}`)
    .replace("/**WHERE_POSTACT**/",  `WHERE ${wherePA.join(" AND ")}`);

  const afterWhere = [];
  if (bagNo) { params.push(`%${bagNo}%`); i++; afterWhere.push(`bag_no ILIKE $${i}`); }
  if (from && to) { params.push(from, to); i += 2; afterWhere.push(`loaded_time::date BETWEEN $${i-1}::date AND $${i}::date`); }
  const afterSql = afterWhere.length ? `WHERE ${afterWhere.join(" AND ")}` : "";

  try {
    const sql = `
      SELECT bag_no, grade, status, loaded_time, machine, userid, bag_weight, reloaded_weight
      FROM (${unionReady}) u
      ${afterSql}
      ORDER BY loaded_time DESC, bag_no DESC
    `;
    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="operations_loaded.csv"`);
    res.write("bag_no,grade,status,loaded_time,machine,userid,bag_weight,reloaded_weight\n");
    const esc = (v) => v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);

    for (const r of rows) {
      res.write([
        esc(r.bag_no),
        esc(r.grade),
        esc(r.status),
        esc(r.loaded_time?.toISOString?.() ?? r.loaded_time),
        esc(r.machine),
        esc(r.userid),
        esc(r.bag_weight),
        esc(r.reloaded_weight),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/operations_loaded.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/reports_postactivation/operations_loaded_summary?operations=Blending_Loaded&from=2025-10-01&to=2025-10-15&page=1&pageSize=50&sort=loaded_date&dir=desc
router.get("/operations_loaded_summary", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  // operations: optional; if absent => all
  let opsRaw = req.query.operations;
  let ops = [];
  if (Array.isArray(opsRaw)) ops = opsRaw.flatMap(s => String(s).split(","));
  else if (typeof opsRaw === "string" && opsRaw.trim()) ops = opsRaw.split(",");
  ops = ops.map(s => String(s).trim()).filter(Boolean);

  const from = (req.query.from || "").trim();
  const to   = (req.query.to   || "").trim();
  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  // Paging & sorting
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  const dir = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const ALLOWED_SORT = new Set(["loaded_date","status","machine","num_bags","bag_weight","reloaded_weight"]);
  const sort = ALLOWED_SORT.has(String(req.query.sort)) ? String(req.query.sort) : "loaded_date";

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  const baseUnion = `
    SELECT
      d.final_destination       AS status,
      (d.screening_inward_time)::date AS loaded_date,
      d.screening_machine       AS machine,
      1                         AS num_bags,
      COALESCE(d.weight_out, 0)           AS bag_weight,
      COALESCE(d.screening_bag_weight, 0) AS reloaded_weight
    FROM ${desTable} d
    /**WHERE_DESTONING**/
    UNION ALL
    SELECT
      p.stock_status            AS status,
      (p.reload_time)::date     AS loaded_date,
      p.reload_machine          AS machine,
      1                         AS num_bags,
      COALESCE(p.bag_weight, 0)   AS bag_weight,
      COALESCE(p.reload_weight, 0) AS reloaded_weight
    FROM ${paTable} p
    /**WHERE_POSTACT**/
  `;

  const whereDes = [];
  const wherePA  = [];
  const params = [];
  let i = 0;

  if (ops.length) {
    params.push(ops); i++;
    whereDes.push(`d.final_destination = ANY($${i})`);
    wherePA.push(`p.stock_status      = ANY($${i})`);
  }

  // ✅ Standard condition: only *_Loaded
  whereDes.push(`d.final_destination LIKE '%Loaded'`);
  wherePA.push(`p.stock_status      LIKE '%Loaded'`);

  const unionSql = baseUnion
    .replace("/**WHERE_DESTONING**/", `WHERE ${whereDes.join(" AND ")}`)
    .replace("/**WHERE_POSTACT**/",  `WHERE ${wherePA.join(" AND ")}`);

  // After-union filters (date-only)
  const afterWhere = [];
  if (from && to) { params.push(from, to); i += 2; afterWhere.push(`loaded_date BETWEEN $${i-1}::date AND $${i}::date`); }
  const afterSql = afterWhere.length ? `WHERE ${afterWhere.join(" AND ")}` : "";

  // Aggregate per day / status / machine
  const aggregated = `
    SELECT
      status,
      loaded_date,
      machine,
      COUNT(*)                         AS num_bags,
      ROUND(SUM(bag_weight)::numeric, 2)       AS bag_weight,
      ROUND(SUM(reloaded_weight)::numeric, 2)  AS reloaded_weight
    FROM (${unionSql}) u
    ${afterSql}
    GROUP BY status, loaded_date, machine
  `;

  try {
    const countSql = `SELECT COUNT(*)::int AS total FROM (${aggregated}) g`;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    const pageSql = `
      SELECT status, to_char(loaded_date, 'YYYY-MM-DD') AS loaded_date, machine, num_bags, bag_weight, reloaded_weight
      FROM (${aggregated}) g
      ORDER BY ${sort} ${dir}, status ${dir}, machine ${dir}
      LIMIT $${i + 1} OFFSET $${i + 2}
    `;
    const rows = (await pool.query(pageSql, [...params, pageSize, offset])).rows;

    res.json({ rows, total, page, pageSize, sort, dir });
  } catch (err) {
    console.error("GET /api/reports_postactivation/operations_loaded_summary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/operations_loaded_summary.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  let opsRaw = req.query.operations;
  let ops = [];
  if (Array.isArray(opsRaw)) ops = opsRaw.flatMap(s => String(s).split(","));
  else if (typeof opsRaw === "string" && opsRaw.trim()) ops = opsRaw.split(",");
  ops = ops.map(s => String(s).trim()).filter(Boolean);

  const from = (req.query.from || "").trim();
  const to   = (req.query.to   || "").trim();
  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  const baseUnion = `
    SELECT
      d.final_destination       AS status,
      (d.screening_inward_time)::date AS loaded_date,
      d.screening_machine       AS machine,
      1                         AS num_bags,
      COALESCE(d.weight_out, 0)           AS bag_weight,
      COALESCE(d.screening_bag_weight, 0) AS reloaded_weight
    FROM ${desTable} d
    /**WHERE_DESTONING**/
    UNION ALL
    SELECT
      p.stock_status            AS status,
      (p.reload_time)::date     AS loaded_date,
      p.reload_machine          AS machine,
      1                         AS num_bags,
      COALESCE(p.bag_weight, 0)   AS bag_weight,
      COALESCE(p.reload_weight, 0) AS reloaded_weight
    FROM ${paTable} p
    /**WHERE_POSTACT**/
  `;

  const whereDes = [];
  const wherePA  = [];
  const params = [];
  let i = 0;

  if (ops.length) {
    params.push(ops); i++;
    whereDes.push(`d.final_destination = ANY($${i})`);
    wherePA.push(`p.stock_status      = ANY($${i})`);
  }

  // ✅ Standard condition: only *_Loaded
  whereDes.push(`d.final_destination LIKE '%Loaded'`);
  wherePA.push(`p.stock_status      LIKE '%Loaded'`);

  const unionSql = baseUnion
    .replace("/**WHERE_DESTONING**/", `WHERE ${whereDes.join(" AND ")}`)
    .replace("/**WHERE_POSTACT**/",  `WHERE ${wherePA.join(" AND ")}`);

  const afterWhere = [];
  if (from && to) { params.push(from, to); i += 2; afterWhere.push(`loaded_date BETWEEN $${i-1}::date AND $${i}::date`); }
  const afterSql = afterWhere.length ? `WHERE ${afterWhere.join(" AND ")}` : "";

  const aggregated = `
    SELECT
      status,
      loaded_date,
      machine,
      COUNT(*)                        AS num_bags,
      ROUND(SUM(bag_weight)::numeric, 2)      AS bag_weight,
      ROUND(SUM(reloaded_weight)::numeric, 2) AS reloaded_weight
    FROM (${unionSql}) u
    ${afterSql}
    GROUP BY status, loaded_date, machine
    ORDER BY loaded_date DESC, status DESC, machine DESC
  `;

  try {
    const { rows } = await pool.query(aggregated, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="loaded_bags_daywise_summary.csv"`);

    res.write("status,loaded_date,machine,num_bags,bag_weight,reloaded_weight\n");
    const esc = (v) => v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);

    for (const r of rows) {
      const dateStr = r.loaded_date instanceof Date
        ? r.loaded_date.toISOString().slice(0,10)
        : String(r.loaded_date);
      res.write([
        esc(r.status),
        esc(dateStr),
        esc(r.machine),
        esc(r.num_bags),
        esc(r.bag_weight),
        esc(r.reloaded_weight),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/reports_postactivation/operations_loaded_summary.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/operations_output_bags?operations=Blending&from=2025-10-01&to=2025-10-15&page=1&pageSize=50
router.get("/operations_output_bags", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_postactivation`;

  // Filters
  const ops = String(req.query.operations || "").trim(); // "", "Screening", "Crushing", ...
  const from = String(req.query.from || "").trim();
  const to   = String(req.query.to   || "").trim();

  // Require both dates if either present
  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // WHERE + params
  const where = [];
  const params = [];
  let i = 0;

  // Operation (optional)
  if (ops) {
    params.push(ops); i++;
    where.push(`operations = $${i}`);
  }

  // Date window on created_at (date-only)
  if (from && to) {
    params.push(from, to); i += 2;
    where.push(`bag_no_created_dttm::date BETWEEN $${i-1}::date AND $${i}::date`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    // Count
    const countSql = `SELECT COUNT(*)::int AS total FROM ${table} ${whereSql}`;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    // Page (ALWAYS descending by created_at, then bag_no)
    const pageSql = `
      SELECT
        operations,
        bag_no,
        bag_weight            AS weight,
        grade,
        bag_no_created_dttm   AS created_at,
        stock_status          AS status,
        bag_created_userid
      FROM ${table}
      ${whereSql}
      ORDER BY bag_no_created_dttm DESC, bag_no DESC
      LIMIT $${i + 1} OFFSET $${i + 2}
    `;
    const rows = (await pool.query(pageSql, [...params, pageSize, offset])).rows;

    res.json({ rows, total, page, pageSize, sort: "bag_no_created_dttm", dir: "desc" });
  } catch (err) {
    console.error("GET /api/reports_postactivation/operations_output_bags error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/operations_output_bags.csv?operations=Blending&from=2025-10-01&to=2025-10-15
router.get("/operations_output_bags.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_postactivation`;

  const ops  = String(req.query.operations || "").trim();
  const from = String(req.query.from || "").trim();
  const to   = String(req.query.to   || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  const where = [];
  const params = [];
  let i = 0;

  if (ops) { params.push(ops); i++; where.push(`operations = $${i}`); }
  if (from && to) { params.push(from, to); i += 2; where.push(`bag_no_created_dttm::date BETWEEN $${i-1}::date AND $${i}::date`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const sql = `
      SELECT
        operations,
        bag_no,
        bag_weight            AS weight,
        grade,
        bag_no_created_dttm   AS created_at,
        stock_status          AS status,
        bag_created_userid
      FROM ${table}
      ${whereSql}
      ORDER BY bag_no_created_dttm DESC, bag_no DESC
    `;
    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="output_bags.csv"`);

    res.write("operations,bag_no,weight,grade,created_at,status,bag_created_userid\n");
    const esc = (v) => v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);

    for (const r of rows) {
      // created_at is a timestamp; keep full ISO or slice to date if you prefer:
      // const created = r.created_at?.toISOString?.() ?? r.created_at;
      const created = r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at);
      res.write([
        esc(r.operations),
        esc(r.bag_no),
        esc(r.weight),
        esc(r.grade),
        esc(created),
        esc(r.status),
        esc(r.bag_created_userid),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/reports_postactivation/operations_output_bags.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/operations_output_bags_summary?operations=Blending&from=2025-10-01&to=2025-10-15&page=1&pageSize=50
router.get("/operations_output_bags_summary", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_postactivation`;

  // Filters
  const ops  = String(req.query.operations || "").trim(); // e.g., "Screening" | "" (all)
  const from = String(req.query.from || "").trim();
  const to   = String(req.query.to   || "").trim();

  // Require both dates if either present
  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // WHERE + params
  const where = [];
  const params = [];
  let i = 0;

  if (ops) { params.push(ops); i++; where.push(`operations = $${i}`); }
  if (from && to) { params.push(from, to); i += 2; where.push(`bag_no_created_dttm::date BETWEEN $${i-1}::date AND $${i}::date`); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Aggregated subquery (group by day + operation)
  const aggregated = `
    SELECT
      operations,
      (bag_no_created_dttm)::date AS day,
      COUNT(*) AS num_bags,
      ROUND(SUM(COALESCE(bag_weight,0))::numeric, 2) AS total_weight
    FROM ${table}
    ${whereSql}
    GROUP BY operations, day
  `;

  try {
    // Count total groups
    const countSql = `SELECT COUNT(*)::int AS total FROM (${aggregated}) g`;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    // Page the groups; format day as YYYY-MM-DD string
    const pageSql = `
      SELECT
        operations,
        to_char(day, 'YYYY-MM-DD') AS date,
        num_bags,
        total_weight
      FROM (${aggregated}) g
      ORDER BY day DESC, operations DESC
      LIMIT $${i + 1} OFFSET $${i + 2}
    `;
    const rows = (await pool.query(pageSql, [...params, pageSize, offset])).rows;

    res.json({ rows, total, page, pageSize, sort: "date", dir: "desc" });
  } catch (err) {
    console.error("GET /api/reports_postactivation/operations_output_bags_summary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/operations_output_bags_summary.csv?operations=Blending&from=2025-10-01&to=2025-10-15
router.get("/operations_output_bags_summary.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const table = `${accountid}_postactivation`;

  const ops  = String(req.query.operations || "").trim();
  const from = String(req.query.from || "").trim();
  const to   = String(req.query.to   || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  const where = [];
  const params = [];
  let i = 0;

  if (ops) { params.push(ops); i++; where.push(`operations = $${i}`); }
  if (from && to) { params.push(from, to); i += 2; where.push(`bag_no_created_dttm::date BETWEEN $${i-1}::date AND $${i}::date`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Build full CSV set (no pagination)
  const sql = `
    SELECT
      operations,
      to_char((bag_no_created_dttm)::date, 'YYYY-MM-DD') AS date,
      COUNT(*) AS num_bags,
      ROUND(SUM(COALESCE(bag_weight,0))::numeric, 2) AS total_weight
    FROM ${table}
    ${whereSql}
    GROUP BY operations, (bag_no_created_dttm)::date
    ORDER BY (bag_no_created_dttm)::date DESC, operations DESC
  `;

  try {
    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="output_bags_daywise_summary.csv"`
    );

    res.write("operations,date,num_bags,total_weight\n");
    const esc = (v) =>
      v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);

    for (const r of rows) {
      res.write([esc(r.operations), esc(r.date), esc(r.num_bags), esc(r.total_weight)].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/reports_postactivation/operations_output_bags_summary.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/loaded_vs_output_scr_cru?operations=Screening&from=2025-10-01&to=2025-10-15&page=1&pageSize=50
router.get("/loaded_vs_output_scr_cru", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch { return res.status(400).json({ error: "Invalid account id" }); }

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  // Parse filters
  const op = String(req.query.operations || "").trim(); // 'Screening' | 'Crushing' | ''(all)
  const from = (req.query.from || "").trim();
  const to   = (req.query.to   || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // Build operations lists per your rules
  const ALL_LOADED   = ['Screening_Loaded', 'Crushing_Loaded'];
  const ALL_OUTPUT   = ['Screening', 'Crushing'];

  let loadedStatuses = ALL_LOADED.slice();
  let outputOps      = ALL_OUTPUT.slice();

  if (op === 'Screening') {
    loadedStatuses = ['Screening_Loaded'];
    outputOps      = ['Screening'];
  } else if (op === 'Crushing') {
    loadedStatuses = ['Crushing_Loaded'];
    outputOps      = ['Crushing'];
  } // else: all

  // Params: $1 loadedStatuses[], $2 outputOps[], $3 from, $4 to
  const params = [loadedStatuses, outputOps, from || null, to || null];

  // If you want IST days, replace each "::date" with "(... AT TIME ZONE 'Asia/Kolkata')::date"
  const withCtes = `
    WITH loaded_raw AS (
      /* LOADED from destoning (Screening_Loaded) */
      SELECT
        regexp_replace(d.final_destination, '_Loaded$', '')::text AS operation,
        (d.screening_inward_time)::date                          AS day,
        COUNT(*)                                                 AS loaded_num_bags,
        SUM(COALESCE(d.weight_out, 0))                           AS loaded_bag_weight,
        SUM(COALESCE(d.screening_bag_weight, 0))                 AS loaded_reloaded_weight
      FROM ${desTable} d
      WHERE d.final_destination = ANY($1::text[])
        AND ( $3::date IS NULL OR (d.screening_inward_time)::date BETWEEN $3::date AND $4::date )
      GROUP BY operation, day

      UNION ALL

      /* LOADED from postactivation (Crushing_Loaded) */
      SELECT
        regexp_replace(p.stock_status, '_Loaded$', '')::text     AS operation,
        (p.reload_time)::date                                    AS day,
        COUNT(*)                                                 AS loaded_num_bags,
        SUM(COALESCE(p.bag_weight, 0))                           AS loaded_bag_weight,
        SUM(COALESCE(p.reload_weight, 0))                        AS loaded_reloaded_weight
      FROM ${paTable} p
      WHERE p.stock_status = ANY($1::text[])
        AND ( $3::date IS NULL OR (p.reload_time)::date BETWEEN $3::date AND $4::date )
      GROUP BY operation, day
    ),
    loaded_by_day AS (
      SELECT
        operation,
        day,
        SUM(loaded_num_bags)                          AS loaded_num_bags,
        ROUND(SUM(loaded_bag_weight)::numeric, 2)     AS loaded_weight,
        ROUND(SUM(loaded_reloaded_weight)::numeric,2) AS loaded_reloaded_weight
      FROM loaded_raw
      GROUP BY operation, day
    ),
    output_by_day AS (
      SELECT
        p.operations::text                            AS operation,
        (p.bag_no_created_dttm)::date                 AS day,
        COUNT(*)                                      AS output_num_bags,
        ROUND(SUM(COALESCE(p.bag_weight,0))::numeric,2) AS output_total_weight
      FROM ${paTable} p
      WHERE p.operations = ANY($2::text[])
        AND ( $3::date IS NULL OR (p.bag_no_created_dttm)::date BETWEEN $3::date AND $4::date )
      GROUP BY operation, day
    ),
    final_rows AS (
      SELECT
        COALESCE(o.operation, l.operation)            AS operations,
        COALESCE(o.day,       l.day)                  AS day,
        COALESCE(l.loaded_num_bags,   0)              AS loaded_num_bags,
        COALESCE(l.loaded_weight,      0)             AS loaded_weight,
        COALESCE(l.loaded_reloaded_weight, 0)         AS loaded_reloaded_weight,
        COALESCE(o.output_num_bags,   0)              AS output_num_bags,
        COALESCE(o.output_total_weight, 0)            AS output_total_weight
      FROM loaded_by_day l
      FULL OUTER JOIN output_by_day o
        ON o.operation = l.operation
       AND o.day       = l.day
    )
  `;

  const countSql = `
    ${withCtes}
    SELECT COUNT(*)::int AS total FROM final_rows
  `;

  const pageSql = `
    ${withCtes}
    SELECT
      operations,
      to_char(day, 'DD-MM-YYYY') AS date,
      loaded_num_bags,
      loaded_weight,
      loaded_reloaded_weight,
      output_num_bags,
      output_total_weight
    FROM final_rows
    ORDER BY day DESC, operations DESC
    LIMIT $5 OFFSET $6
  `;

  try {
    const totalRes = await pool.query(countSql, params);
    const total = totalRes.rows?.[0]?.total ?? 0;

    const rowsRes = await pool.query(pageSql, [...params, pageSize, offset]);
    const rows = rowsRes.rows;

    res.json({ rows, total, page, pageSize, sort: "date", dir: "desc" });
  } catch (err) {
    console.error("GET /api/reports_postactivation/loaded_vs_output_scr_cru error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/reports_postactivation/loaded_vs_output_scr_cru.csv?operations=Crushing&from=2025-10-01&to=2025-10-15
router.get("/reports_postactivation/loaded_vs_output_scr_cru.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch { return res.status(400).json({ error: "Invalid account id" }); }

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;

  const op = String(req.query.operations || "").trim();
  const from = (req.query.from || "").trim();
  const to   = (req.query.to   || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  const ALL_LOADED = ['Screening_Loaded', 'Crushing_Loaded'];
  const ALL_OUTPUT = ['Screening', 'Crushing'];

  let loadedStatuses = ALL_LOADED.slice();
  let outputOps      = ALL_OUTPUT.slice();

  if (op === 'Screening') {
    loadedStatuses = ['Screening_Loaded'];
    outputOps      = ['Screening'];
  } else if (op === 'Crushing') {
    loadedStatuses = ['Crushing_Loaded'];
    outputOps      = ['Crushing'];
  }

  const params = [loadedStatuses, outputOps, from || null, to || null];

  const sql = `
    WITH loaded_raw AS (
      SELECT
        regexp_replace(d.final_destination, '_Loaded$', '')::text AS operation,
        (d.screening_inward_time)::date                          AS day,
        COUNT(*)                                                 AS loaded_num_bags,
        SUM(COALESCE(d.weight_out, 0))                           AS loaded_bag_weight,
        SUM(COALESCE(d.screening_bag_weight, 0))                 AS loaded_reloaded_weight
      FROM ${desTable} d
      WHERE d.final_destination = ANY($1::text[])
        AND ( $3::date IS NULL OR (d.screening_inward_time)::date BETWEEN $3::date AND $4::date )
      GROUP BY operation, day

      UNION ALL

      SELECT
        regexp_replace(p.stock_status, '_Loaded$', '')::text     AS operation,
        (p.reload_time)::date                                    AS day,
        COUNT(*)                                                 AS loaded_num_bags,
        SUM(COALESCE(p.bag_weight, 0))                           AS loaded_bag_weight,
        SUM(COALESCE(p.reload_weight, 0))                        AS loaded_reloaded_weight
      FROM ${paTable} p
      WHERE p.stock_status = ANY($1::text[])
        AND ( $3::date IS NULL OR (p.reload_time)::date BETWEEN $3::date AND $4::date )
      GROUP BY operation, day
    ),
    loaded_by_day AS (
      SELECT
        operation,
        day,
        SUM(loaded_num_bags)                          AS loaded_num_bags,
        ROUND(SUM(loaded_bag_weight)::numeric, 2)     AS loaded_weight,
        ROUND(SUM(loaded_reloaded_weight)::numeric,2) AS loaded_reloaded_weight
      FROM loaded_raw
      GROUP BY operation, day
    ),
    output_by_day AS (
      SELECT
        p.operations::text                            AS operation,
        (p.bag_no_created_dttm)::date                 AS day,
        COUNT(*)                                      AS output_num_bags,
        ROUND(SUM(COALESCE(p.bag_weight,0))::numeric,2) AS output_total_weight
      FROM ${paTable} p
      WHERE p.operations = ANY($2::text[])
        AND ( $3::date IS NULL OR (p.bag_no_created_dttm)::date BETWEEN $3::date AND $4::date )
      GROUP BY operation, day
    )
    SELECT
      COALESCE(o.operation, l.operation)            AS operations,
      to_char(COALESCE(o.day, l.day), 'DD-MM-YYYY') AS date,
      COALESCE(l.loaded_num_bags,   0)              AS loaded_num_bags,
      COALESCE(l.loaded_weight,      0)             AS loaded_weight,
      COALESCE(l.loaded_reloaded_weight, 0)         AS loaded_reloaded_weight,
      COALESCE(o.output_num_bags,   0)              AS output_num_bags,
      COALESCE(o.output_total_weight, 0)            AS output_total_weight
    FROM loaded_by_day l
    FULL OUTER JOIN output_by_day o
      ON o.operation = l.operation
     AND o.day       = l.day
    ORDER BY COALESCE(o.day, l.day) DESC, COALESCE(o.operation, l.operation) DESC
  `;

  try {
    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="loaded_vs_output_scr_cru.csv"`);

    res.write("operations,date,loaded_num_bags,loaded_weight,loaded_reloaded_weight,output_num_bags,output_total_weight\n");
    const esc = (v) => v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
    for (const r of rows) {
      res.write([
        esc(r.operations),
        esc(r.date),
        esc(r.loaded_num_bags),
        esc(r.loaded_weight),
        esc(r.loaded_reloaded_weight),
        esc(r.output_num_bags),
        esc(r.output_total_weight),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/reports_postactivation/loaded_vs_output_scr_cru.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/loaded_vs_output_bld_dd_dm?operations=Blending&from=2025-10-01&to=2025-10-15&page=1&pageSize=50
router.get("/loaded_vs_output_bld_dd_dm", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch { return res.status(400).json({ error: "Invalid account id" }); }

  const table = `${accountid}_postactivation_in`;

  // Filters
  const op   = String(req.query.operations || "").trim(); // "Blending" | "De-Dusting" | "De-Magnetize" | ""
  const from = String(req.query.from || "").trim();
  const to   = String(req.query.to   || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  // Pagination
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // WHERE
  const where = [];
  const params = [];
  let i = 0;

  // Always constrain to the allowed ops; if no specific op, include all three
  const ALLOWED = ['Blending', 'De-Dusting', 'De-Magnetize'];
  if (op) {
    params.push(op); i++;
    where.push(`operations = $${i}`);
  } else {
    params.push(ALLOWED); i++;
    where.push(`operations = ANY($${i}::text[])`);
  }

  if (from && to) {
    params.push(from, to); i += 2;
    // If you need IST days, replace ::date with "(bag_out_datetime AT TIME ZONE 'Asia/Kolkata')::date"
    where.push(`(bag_out_datetime)::date BETWEEN $${i-1}::date AND $${i}::date`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  // Aggregate by operation + day; format date only in the outer select
  const aggregated = `
    SELECT
      operations,
      (bag_out_datetime)::date AS day,
      ROUND(SUM(COALESCE(loaded_weight, 0))::numeric, 2)     AS loaded_weight,
      ROUND(SUM(COALESCE(total_out_weight, 0))::numeric, 2)  AS total_out_weight
    FROM ${table}
    ${whereSql}
    GROUP BY operations, day
  `;

  try {
    // Total groups
    const countSql = `SELECT COUNT(*)::int AS total FROM (${aggregated}) g`;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    // Page (always by date DESC, then operations DESC)
    const pageSql = `
      SELECT
        operations,
        to_char(day, 'MM-DD-YYYY') AS date,
        loaded_weight,
        total_out_weight
      FROM (${aggregated}) g
      ORDER BY day DESC, operations DESC
      LIMIT $${i + 1} OFFSET $${i + 2}
    `;
    const rows = (await pool.query(pageSql, [...params, pageSize, offset])).rows;

    res.json({ rows, total, page, pageSize, sort: "date", dir: "desc" });
  } catch (err) {
    console.error("GET /api/reports_postactivation/loaded_vs_output_bld_dd_dm error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/loaded_vs_output_bld_dd_dm.csv?operations=De-Dusting&from=2025-10-01&to=2025-10-15
router.get("/loaded_vs_output_bld_dd_dm.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident"); }
  const { accountid } = req.user || {};
  try { assertSafeIdent(accountid); } catch { return res.status(400).json({ error: "Invalid account id" }); }

  const table = `${accountid}_postactivation_in`;

  const op   = String(req.query.operations || "").trim();
  const from = String(req.query.from || "").trim();
  const to   = String(req.query.to   || "").trim();

  if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: "Both 'from' and 'to' dates are required" });
  }

  const where = [];
  const params = [];
  let i = 0;

  const ALLOWED = ['Blending', 'De-Dusting', 'De-Magnetize'];
  if (op) { params.push(op); i++; where.push(`operations = $${i}`); }
  else    { params.push(ALLOWED); i++; where.push(`operations = ANY($${i}::text[])`); }

  if (from && to) { params.push(from, to); i += 2; where.push(`(bag_out_datetime)::date BETWEEN $${i-1}::date AND $${i}::date`); }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const sql = `
    SELECT
      operations,
      to_char((bag_out_datetime)::date, 'MM-DD-YYYY') AS date,
      ROUND(SUM(COALESCE(loaded_weight, 0))::numeric, 2)     AS loaded_weight,
      ROUND(SUM(COALESCE(total_out_weight, 0))::numeric, 2)  AS total_out_weight
    FROM ${table}
    ${whereSql}
    GROUP BY operations, (bag_out_datetime)::date
    ORDER BY (bag_out_datetime)::date DESC, operations DESC
  `;

  try {
    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="loaded_vs_output_bld_dd_dm.csv"`);

    // Header
    res.write("operations,date,loaded_weight,total_out_weight\n");

    // CSV rows
    const esc = (v) => v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
    for (const r of rows) {
      res.write([esc(r.operations), esc(r.date), esc(r.loaded_weight), esc(r.total_out_weight)].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/reports_postactivation/loaded_vs_output_bld_dd_dm.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/reports/lots?date=2025-10-15&page=1&pageSize=50
// GET /api/reports/lots?from=2025-10-01&to=2025-10-15&operations=Blending,De-Dusting&page=1&pageSize=50
router.get('/lots', authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: 'Unauthorized' });
    assertSafeIdent(accountid);

    // ---- Filters ----
    const dateStr = (req.query.date || "").trim();   // single day (YYYY-MM-DD)
    const from    = (req.query.from || "").trim();   // range start
    const to      = (req.query.to   || "").trim();   // range end
    const rawOps  = (req.query.operations ?? req.query.ops ?? "").toString().trim();
    const opsList = rawOps ? rawOps.split(',').map(s => s.trim()).filter(Boolean) : null;

    if ((from && !to) || (!from && to)) {
      return res.status(400).json({ error: "Both 'from' and 'to' are required when using a date range" });
    }
    const useRange   = !!(from && to);
    const dayDefault = dateStr || defaultIstDateString(); // fallback to IST-yesterday

    // ---- Paging ----
    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize, 10) || 50));
    const offset   = (page - 1) * pageSize;

    // ---- Tables ----
    const inTbl  = `${accountid}_postactivation_in`;
    const outTbl = `${accountid}_postactivation`;

    // ---- WHERE fragments & params ----
    const where = [];
    const params = [];
    let i = 0;

    if (useRange) {
      params.push(from, to); i += 2;
      // If days should be IST, change to: (a.loaded_dttm AT TIME ZONE 'Asia/Kolkata')::date ...
      where.push(`(a.loaded_dttm)::date BETWEEN $${i-1}::date AND $${i}::date`);
    } else {
      params.push(dayDefault); i++;
      where.push(`a.loaded_dttm >= $${i}::date AND a.loaded_dttm < ($${i}::date + INTERVAL '1 day')`);
    }

    if (opsList && opsList.length) {
      params.push(opsList); i++;
      where.push(`a.operations = ANY($${i}::text[])`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // ---- Count for pagination ----
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM ${inTbl} a
      ${whereSql}
    `;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    // ---- Page window + outputs aggregation (build ONLY out_bag_items) ----
    const dataSql = `
      WITH lot_window AS (
        SELECT
          a.lot_id,
          a.operations,
          a.loaded_dttm,
          a.loaded_bags,                  -- JSONB array (kept as-is)
          a.loaded_weight,
          a.total_out_weight,
          jsonb_array_length(a.loaded_bags) AS loaded_count
        FROM ${inTbl} a
        ${whereSql}
        ORDER BY a.loaded_dttm DESC, a.lot_id DESC
        LIMIT $${i + 1} OFFSET $${i + 2}
      )
      SELECT
        w.lot_id,
        w.operations,
        w.loaded_dttm,
        w.loaded_weight,
        w.total_out_weight AS out_weight,
        w.loaded_bags,          -- unchanged
        w.loaded_count,
        COALESCE(COUNT(b.bag_no), 0)::int AS output_count,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'bag_no',     b.bag_no,
              'grade',      b.grade,
              'weight',     b.bag_weight,
              'created_at', b.bag_no_created_dttm
            )
            ORDER BY b.bag_no
          ) FILTER (WHERE b.bag_no IS NOT NULL),
          '[]'::json
        ) AS out_bag_items      -- array of objects (only this is created)
      FROM lot_window w
      LEFT JOIN ${outTbl} b
        ON b.lot_id = w.lot_id
      GROUP BY
        w.lot_id, w.operations, w.loaded_dttm, w.loaded_weight, w.total_out_weight, w.loaded_bags, w.loaded_count
      ORDER BY w.loaded_dttm DESC, w.lot_id DESC
    `;
    const rows = (await pool.query(dataSql, [...params, pageSize, offset])).rows;
    // add string versions for easy display (optional)
    const rowsWithText = rows.map(({ loaded_bags, out_bag_items, ...rest }) => ({
        ...rest,
        loaded_bags_text: JSON.stringify(loaded_bags ?? []),
        out_bag_items_text: JSON.stringify(out_bag_items ?? []),
        }));
    return res.json({
      date: useRange ? undefined : dayDefault,
      range: useRange ? { from, to } : undefined,
      filters: { operations: opsList },
      page,
      pageSize,
      total,
      rows: rowsWithText || []
    });
  } catch (err) {
    console.error('/reports/lots error:', err);
    return res.status(500).json({ error: 'Failed to fetch lot report' });
  }
});




// GET /api/reports/lots.csv?date=2025-10-15
// GET /api/reports/lots.csv?from=2025-10-01&to=2025-10-15&operations=Blending,De-Dusting
router.get('/lots.csv', authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: 'Unauthorized' });
    assertSafeIdent(accountid);

    const inTbl  = `${accountid}_postactivation_in`;
    const outTbl = `${accountid}_postactivation`;

    const dateStr = (req.query.date || "").trim();
    const from    = (req.query.from || "").trim();
    const to      = (req.query.to   || "").trim();

    const rawOps  = (req.query.operations ?? req.query.ops ?? "").toString().trim();
    const opsList = rawOps ? rawOps.split(',').map(s => s.trim()).filter(Boolean) : null;

    if ((from && !to) || (!from && to)) {
      return res.status(400).json({ error: "Both 'from' and 'to' are required when using a date range" });
    }
    const useRange   = !!(from && to);
    const dayDefault = dateStr || defaultIstDateString();

    const where = [];
    const params = [];
    let i = 0;

    if (useRange) {
      params.push(from, to); i += 2;
      where.push(`(a.loaded_dttm)::date BETWEEN $${i-1}::date AND $${i}::date`);
    } else {
      params.push(dayDefault); i++;
      where.push(`a.loaded_dttm >= $${i}::date AND a.loaded_dttm < ($${i}::date + INTERVAL '1 day')`);
    }

    if (opsList && opsList.length) {
      params.push(opsList); i++;
      where.push(`a.operations = ANY($${i}::text[])`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      WITH lot_window AS (
        SELECT
          a.lot_id,
          a.operations,
          a.loaded_dttm,
          a.loaded_bags,
          a.loaded_weight,
          a.total_out_weight,
          jsonb_array_length(a.loaded_bags) AS loaded_count
        FROM ${inTbl} a
        ${whereSql}
        ORDER BY a.loaded_dttm DESC, a.lot_id DESC
      )
      SELECT
        w.lot_id,
        w.operations,
        w.loaded_dttm,
        w.loaded_weight,
        w.total_out_weight AS out_weight,
        w.loaded_bags,          -- keep as-is (JSONB)
        w.loaded_count,
        COALESCE(COUNT(b.bag_no), 0)::int AS output_count,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'bag_no',     b.bag_no,
              'grade',      b.grade,
              'weight',     b.bag_weight,
              'created_at', b.bag_no_created_dttm
            )
            ORDER BY b.bag_no
          ) FILTER (WHERE b.bag_no IS NOT NULL),
          '[]'::json
        ) AS out_bag_items
      FROM lot_window w
      LEFT JOIN ${outTbl} b
        ON b.lot_id = w.lot_id
      GROUP BY
        w.lot_id, w.operations, w.loaded_dttm, w.loaded_weight, w.total_out_weight, w.loaded_bags, w.loaded_count
      ORDER BY w.loaded_dttm DESC, w.lot_id DESC
    `;

    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="lots_${useRange ? `${from}_to_${to}` : dayDefault}.csv"`
    );

    // header
    res.write("lot_id,operations,loaded_dttm,loaded_weight,out_weight,loaded_count,output_count,loaded_bags,out_bag_items\n");

    const esc = (v) =>
      v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);

    for (const r of rows) {
      // stringify JSON columns for CSV
      const loadedBagsStr = JSON.stringify(r.loaded_bags ?? []);   // kept "as-is"
      const outItemsStr   = JSON.stringify(r.out_bag_items ?? []); // built array of objects

      res.write([
        esc(r.lot_id),
        esc(r.operations),
        esc(r.loaded_dttm?.toISOString?.() ?? r.loaded_dttm),
        esc(r.loaded_weight),
        esc(r.out_weight),
        esc(r.loaded_count),
        esc(r.output_count),
        esc(loadedBagsStr),
        esc(outItemsStr),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error('/reports/lots.csv error:', err);
    return res.status(500).json({ error: 'Failed to export lot report' });
  }
});

// GET /api/reports_postactivation/reprocessed_bags?operations=Screening,Blending&from=2025-10-01&to=2025-10-15&page=1&pageSize=50
router.get("/reprocessed_bags", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(String(s || ""))) throw new Error("unsafe ident"); }
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: "Unauthorized" });
    assertSafeIdent(accountid);

    const table = `${accountid}_postactivation`;

    // --- filters ---
    const rawOps = (req.query.operations ?? "").toString().trim(); // "" => no filter
    const ops = rawOps
      ? rawOps.split(",").map(s => s.trim()).filter(Boolean)
      : null;

    const from = String(req.query.from || "").trim();
    const to   = String(req.query.to   || "").trim();
    if ((from && !to) || (!from && to)) {
      return res.status(400).json({ error: "Both 'from' and 'to' dates are required when filtering by date range" });
    }

    // --- paging ---
    const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
    const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const offset   = (page - 1) * pageSize;

    // --- sorting (whitelist) ---
    const dir = String(req.query.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const ALLOWED_SORT = new Set([
      "operations","bag_no","grade","bag_weight","stock_status",
      "bag_created_userid","bag_no_created_dttm",
      "reload_time","reload_weight","reload_userid",
      "quality_userid","quality_upd_dttime","quality"
    ]);
    const sort = ALLOWED_SORT.has(String(req.query.sort))
      ? String(req.query.sort)
      : "quality_upd_dttime";

    // --- where + params ---
    const where = [`stock_status LIKE '%_Loaded'`]; // always
    const params = [];
    let i = 0;

    if (ops && ops.length) {
      params.push(ops); i++;
      where.push(`operations = ANY($${i}::text[])`);
    }
    if (from && to) {
      params.push(from, to); i += 2;
      where.push(`(quality_upd_dttime)::date BETWEEN $${i-1}::date AND $${i}::date`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // --- count ---
    const countSql = `SELECT COUNT(*)::int AS total FROM ${table} ${whereSql}`;
    const total = (await pool.query(countSql, params)).rows?.[0]?.total ?? 0;

    // --- page ---
    const selectSql = `
      SELECT
        operations,
        bag_no,
        grade,
        bag_weight,
        stock_status,
        bag_created_userid,
        bag_no_created_dttm,
        reload_time,
        reload_weight,
        reload_userid,
        quality_userid,
        quality_upd_dttime,
        quality
      FROM ${table}
      ${whereSql}
      ORDER BY ${sort} ${dir}, bag_no ${dir}
      LIMIT $${i + 1} OFFSET $${i + 2}
    `;
    const rows = (await pool.query(selectSql, [...params, pageSize, offset])).rows;
    const rowsWithText = rows.map(({ quality, ...rest }) => ({
        ...rest,
        quality_text: JSON.stringify( quality ?? []),
    
        }));
    res.json({ rows:rowsWithText || [], total, page, pageSize, sort, dir });
  } catch (err) {
    console.error("GET /api/reports_postactivation/reprocessed_bags error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports_postactivation/reprocessed_bags.csv?operations=Crushing&from=2025-10-01&to=2025-10-15
router.get("/reprocessed_bags.csv", authenticate, async (req, res) => {
  function assertSafeIdent(s) { if (!/^[a-z0-9_]+$/i.test(String(s || ""))) throw new Error("unsafe ident"); }
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(401).json({ error: "Unauthorized" });
    assertSafeIdent(accountid);

    const table = `${accountid}_postactivation`;

    const rawOps = (req.query.operations ?? "").toString().trim();
    const ops = rawOps ? rawOps.split(",").map(s => s.trim()).filter(Boolean) : null;

    const from = String(req.query.from || "").trim();
    const to   = String(req.query.to   || "").trim();
    if ((from && !to) || (!from && to)) {
      return res.status(400).json({ error: "Both 'from' and 'to' dates are required when filtering by date range" });
    }

    const where = [`stock_status LIKE '%_Loaded'`];
    const params = [];
    let i = 0;

    if (ops && ops.length) { params.push(ops); i++; where.push(`operations = ANY($${i}::text[])`); }
    if (from && to)        { params.push(from, to); i += 2; where.push(`(quality_upd_dttime)::date BETWEEN $${i-1}::date AND $${i}::date`); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT
        operations,
        bag_no,
        grade,
        bag_weight,
        stock_status,
        bag_created_userid,
        bag_no_created_dttm,
        reload_time,
        reload_weight,
        reload_userid,
        quality_userid,
        quality_upd_dttime,
        quality
      FROM ${table}
      ${whereSql}
      ORDER BY quality_upd_dttime DESC, bag_no DESC
    `;

    const { rows } = await pool.query(sql, params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="reprocessed_bags.csv"`);

    const esc = (v) => v == null ? "" : /[\",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
    res.write("operations,bag_no,grade,bag_weight,stock_status,bag_created_userid,bag_no_created_dttm,reload_time,reload_weight,reload_userid,quality_userid,quality_upd_dttime,quality\n");
    for (const r of rows) {
      res.write([
        esc(r.operations),
        esc(r.bag_no),
        esc(r.grade),
        esc(r.bag_weight),
        esc(r.stock_status),
        esc(r.bag_created_userid),
        esc(r.bag_no_created_dttm?.toISOString?.() ?? r.bag_no_created_dttm),
        esc(r.reload_time?.toISOString?.() ?? r.reload_time),
        esc(r.reload_weight),
        esc(r.reload_userid),
        esc(r.quality_userid),
        esc(r.quality_upd_dttime?.toISOString?.() ?? r.quality_upd_dttime),
        esc(r.quality),
      ].join(",") + "\n");
    }
    res.end();
  } catch (err) {
    console.error("GET /api/reports_postactivation/reprocessed_bags.csv error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




/* ==== Bags Waiting to be Processed (JSON + CSV) ==== */
/* Helpers are local-scoped with unique names to avoid collisions in this file */

const OPS_WAITING = ["Screening", "Crushing", "Blending", "De-Dusting", "De-Magnetize"];

function assertSafeIdent_waiting(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}

function getPaging_waiting(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

async function runPagedQuery_waiting({ baseSql, orderBySql, vals, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql}) t`;
  const dataSql  = `${baseSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
  const client = await pool.connect();
  try {
    const [{ rows: totalRows }, { rows }] = await Promise.all([
      client.query(totalSql, vals),
      client.query(dataSql, vals),
    ]);
    return { rows, total: parseInt(totalRows?.[0]?.n ?? "0", 10) };
  } finally {
    client.release();
  }
}

function parseOperation_waiting(q) {
  const op = (q || "All").trim();
  return op === "All" ? OPS_WAITING : (OPS_WAITING.includes(op) ? [op] : OPS_WAITING);
}

function buildBaseSQL_waiting(desTable, paTable) {
  // Only condition: final_destination (destoning) OR stock_status (postactivation)
  // Both filtered by the same op list via ANY($1)
  return `
    (
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
      WHERE d.final_destination = ANY($1)
    )
    UNION ALL
    (
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
      WHERE p.stock_status = ANY($1)
    )
  `;
}

const ORDER_BY_WAITING = `ORDER BY loaded_time DESC NULLS LAST, bag_no`;

/**
 * JSON (paged)
 * GET /api/reports_postactivation/waiting_to_process
 * Query: operation=All|Screening|Crushing|Blending|De-Dusting|De-Magnetize, page, pageSize
 */
router.get("/waiting_to_process", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_waiting(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;
  const opList   = parseOperation_waiting(req.query.operation);

  const baseSql = buildBaseSQL_waiting(desTable, paTable);
  const { page, pageSize, offset } = getPaging_waiting(req);

  const { rows, total } = await runPagedQuery_waiting({
    baseSql,
    orderBySql: ORDER_BY_WAITING,
    vals: [opList],
    page,
    pageSize,
    offset,
  });

  const columns = [
    { field: "bag_no", headerName: "Bag No", flex: 1 },
    { field: "grade", headerName: "Grade", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "loaded_time", headerName: "Loaded Time", flex: 1 },
    { field: "machine", headerName: "Machine", flex: 1 },
    { field: "userid", headerName: "User", flex: 1 },
    { field: "bag_weight", headerName: "Weight", flex: 1 },
    { field: "reloaded_weight", headerName: "Reloaded Weight", flex: 1 },
  ];

  return res.json({ page, pageSize, total, rows, columns });
});

/**
 * CSV (no pagination; same filter)
 * GET /api/reports_postactivation/waiting_to_process.csv
 * Query: operation=All|Screening|Crushing|Blending|De-Dusting|De-Magnetize
 */
router.get("/waiting_to_process.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_waiting(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const desTable = `${accountid}_destoning`;
  const paTable  = `${accountid}_postactivation`;
  const opList   = parseOperation_waiting(req.query.operation);

  const client = await pool.connect();
  try {
    const sql = `${buildBaseSQL_waiting(desTable, paTable)} ${ORDER_BY_WAITING}`;
    const { rows } = await client.query(sql, [opList]);

    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(rows);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="waiting_to_process.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});
/* ==== /Bags Waiting to be Processed ==== */


/* ======================= QUALITY REPORT (JSON + CSV) ======================= */


function assertSafeIdent_quality(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("unsafe ident");
}
function qpPaging_quality(req) {
  const pageSize = Math.max(1, Math.min(200, parseInt(req.body?.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.body?.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;
  return { page, pageSize, offset };
}
async function runPaged_quality({ baseSql, vals, orderBySql, page, pageSize, offset }) {
  const totalSql = `SELECT COUNT(*) AS n FROM (${baseSql}) t`;
  const dataSql  = `${baseSql} ${orderBySql} LIMIT ${pageSize} OFFSET ${offset}`;
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

/**
 * Build dynamic WHERE for grade (required), optional statuses, optional numeric quality conditions.
 * Body:
 *   { grade: string, statuses?: "ALL" | string | string[], conditions?: [{ key, op, min?, max? }], page?, pageSize? }
 */
function buildQualitySql_andVals(accountid, body) {
  const table = `${accountid}_postactivation`;
  const where = [];
  const vals  = [];

  // grade (required)
  vals.push(body.grade);
  where.push(`p.grade = $${vals.length}`);

  // statuses (optional). If "ALL" or missing/empty, no predicate.
  // statuses (optional). If "ALL", force allowed set; if empty/missing, treat as "ALL".
    const ALL_STATUSES = [
    "Screening","Crushing","Blending","De-Dusting","De-Magnetize","Quality","InStock","Instock"
    ];

    let rawStatuses = body.statuses;
    if (rawStatuses === undefined || (Array.isArray(rawStatuses) && rawStatuses.length === 0)) {
    rawStatuses = "ALL";
    }

    if (rawStatuses === "ALL") {
        // Force ONLY the allowed statuses; excludes things like *_Loaded
        vals.push(ALL_STATUSES);
        where.push(`p.stock_status = ANY($${vals.length})`);
    } else if (Array.isArray(rawStatuses)) {
        vals.push(rawStatuses);
        where.push(`p.stock_status = ANY($${vals.length})`);
    } else if (typeof rawStatuses === "string" && rawStatuses.trim()) {
        vals.push(rawStatuses.trim());
        where.push(`p.stock_status = $${vals.length}`);
    }


  // quality conditions (optional)
  const ops = { ge: ">=", le: "<=", gt: ">", lt: "<", eq: "=" };
  (body.conditions || []).forEach((c) => {
    if (!c || !c.key || !c.op) return;
    vals.push(String(c.key));
    const keyRef = `$${vals.length}`;
    if (c.op === "between") {
      if (c.min == null || c.max == null) return;
      vals.push(Number(c.min)); const minRef = `$${vals.length}`;
      vals.push(Number(c.max)); const maxRef = `$${vals.length}`;
      where.push(`(p.quality ? ${keyRef} AND (p.quality->>${keyRef})::numeric BETWEEN ${minRef} AND ${maxRef})`);
    } else {
      const sqlOp = ops[c.op];
      if (!sqlOp || c.min == null) return;
      vals.push(Number(c.min)); const vRef = `$${vals.length}`;
      where.push(`(p.quality ? ${keyRef} AND (p.quality->>${keyRef})::numeric ${sqlOp} ${vRef})`);
    }
  });

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const baseSql  = `
    SELECT
      p.bag_no,
      p.grade,
      p.stock_status,
      p.quality
    FROM ${table} p
    ${whereSql}
  `;
  return { baseSql, vals };
}

const ORDER_BY_QUALITY = `ORDER BY p.bag_no_created_dttm DESC NULLS LAST, p.bag_no`;

// JSON (paged) — ✅ only grade is required
router.post("/quality_report", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_quality(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const body = req.body || {};
  if (!body.grade) return res.status(400).json({ error: "grade is required" });

  const { page, pageSize, offset } = qpPaging_quality(req);
  const { baseSql, vals } = buildQualitySql_andVals(accountid, body);
  const { rows, total } = await runPaged_quality({
    baseSql, vals, orderBySql: ORDER_BY_QUALITY, page, pageSize, offset,
  });

  const columns = [
    { field: "bag_no", headerName: "Bag No", flex: 1 },
    { field: "grade", headerName: "Grade", flex: 1 },
    { field: "stock_status", headerName: "Status", flex: 1 },
    { field: "quality", headerName: "Quality (JSON)", flex: 1 },
  ];
  return res.json({ page, pageSize, total, rows, columns });
});

// CSV (full filtered set) — ✅ only grade is required
router.post("/quality_report.csv", authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  try { assertSafeIdent_quality(accountid); } catch {
    return res.status(400).json({ error: "Invalid account id" });
  }
  const body = req.body || {};
  if (!body.grade) return res.status(400).json({ error: "grade is required" });

  const { baseSql, vals } = buildQualitySql_andVals(accountid, body);
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`${baseSql} ${ORDER_BY_QUALITY}`, vals);
    const safeRows = rows.map(r => ({
      ...r,
      quality: typeof r.quality === "string" ? r.quality : JSON.stringify(r.quality ?? {}),
    }));
    const { Parser: Json2CsvParser } = await import("json2csv");
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(safeRows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="quality_report.csv"`);
    return res.send(csv);
  } finally {
    client.release();
  }
});

/* ===================== /QUALITY REPORT (JSON + CSV) ===================== */






module.exports = router;
