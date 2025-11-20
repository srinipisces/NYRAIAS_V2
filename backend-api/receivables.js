// routes/rawmaterial.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const { authenticate } = require('./authenticate');
const checkAccess= require('./checkaccess.js');

// ---------- helpers ----------
const columnTypeCache = new Map();
function mapSortKey(k = "") {
  const m = { material_arrival_time: "material_arrivaltime", dc_number: "supplier_dc_number", lab_result_time: "lab_result" };
  return m[k] || k;
}
function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
async function getColumnDataType(client, table, col) {
  const key = `${table}|${col}`;
  if (columnTypeCache.has(key)) return columnTypeCache.get(key);
  const q = `SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`;
  const r = await client.query(q, [table, col]);
  const t = r.rows[0]?.data_type || null;
  columnTypeCache.set(key, t);
  return t;
}

// ✅ NO default lab_result filter here anymore
// ----- helpers -----
function buildWhereAndParams(q) {
  const inwardNumber = (q.inward_number || "").trim();
  const supplierName = (q.supplier_name || "").trim();
  const admit = (q.admit || "All").trim(); // Approve|Deny|All
  const from = (q.from || "").trim();      // YYYY-MM-DD
  const to = (q.to || "").trim();          // YYYY-MM-DD

  const where = [];
  const params = [];

  if (inwardNumber) {
    params.push(`%${inwardNumber}%`);
    where.push(`inward_number ILIKE $${params.length}`);
  }
  if (supplierName) {
    params.push(`%${supplierName}%`);
    where.push(`supplier_name ILIKE $${params.length}`);
  }
  // ✅ works for TEXT or BOOLEAN admit_load
  if (admit === "Approve") {
    where.push(`LOWER(COALESCE(admit_load::text, '')) IN ('approve','true','t','1')`);
  } else if (admit === "Deny") {
    where.push(`LOWER(COALESCE(admit_load::text, '')) IN ('deny','false','f','0')`);
  }
  if (from) {
    params.push(from);
    where.push(`material_arrivaltime >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    where.push(`material_arrivaltime < ($${params.length}::date + INTERVAL '1 day')`);
  }

  return { whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}


// ------------------ GET ------------------
router.get("/RawMaterialIncoming", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(400).json({ error: "Missing accountid" });
    const table = `${accountid}_rawmaterial_rcvd`;

    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? "50", 10), 1), 200);
    const offset = (page - 1) * pageSize;

    const SORTABLE = new Set([
      "inward_number","material_arrivaltime","supplier_name","supplier_dc_number",
      "supplier_weight","our_weight","moisture","dust","ad_value","lab_result",
      "admit_load","material_arrival_time","dc_number","lab_result_time",
    ]);
    const sortByRaw = (req.query.sortBy || "material_arrivaltime").trim();
    const sortBy = SORTABLE.has(sortByRaw) ? mapSortKey(sortByRaw) : "material_arrivaltime";
    const sortDir = (req.query.sortDir || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { whereSql, params } = buildWhereAndParams(req.query);

    const selectSql = `
      SELECT inward_number,
             material_arrivaltime AS material_arrival_time,
             supplier_name,
             supplier_dc_number AS dc_number,
             supplier_weight, our_weight,userid, moisture, dust, ad_value,
             lab_result AS lab_result_time,lab_userid,
             admit_load,remarks,audit_trail
      FROM ${table}
      ${whereSql}
      ORDER BY ${sortBy} ${sortDir}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const countSql = `SELECT COUNT(*) AS total FROM ${table} ${whereSql}`;
    const countAllSql = `SELECT COUNT(*) AS total FROM ${table}`;
    const [countResult, countAllResult, listResult] = await Promise.all([
        pool.query(countSql, params),
        pool.query(countAllSql),
        pool.query(selectSql, [...params, pageSize, offset]),
      ]);
    const total = Number(countResult.rows[0]?.total || 0);
    const totalAll = Number(countAllResult.rows[0]?.total || 0);
    res.json({
      page,
      pageSize,
      total: Number(countResult.rows[0]?.total || 0),
      totalAll,
      sortBy,
      sortDir,
      filtersApplied:
        Boolean(req.query.inward_number) ||
        Boolean(req.query.supplier_name) ||
        (req.query.admit || "All") !== "All" ||
        Boolean(req.query.from) ||
        Boolean(req.query.to),
      columns: listResult.fields.map((f) => ({
        field: f.name,
        headerName: f.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        flex: 1, minWidth: 140,
      })),
      rows: listResult.rows,
    });
  } catch (err) {
    console.error("Error in GET /RawMaterialIncoming:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ------------------ PATCH (no lab_result restriction) ------------------
router.patch(
  "/RawMaterialIncoming/:inward_number",
  authenticate,
  checkAccess("Operations.Receivables.Edit"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { accountid } = req.user || {};
      if (!accountid) return res.status(400).json({ success: false, error: "Missing accountid" });
      const table = `${accountid}_rawmaterial_rcvd`;

      const inwardNumber = String(req.params.inward_number || "").trim();
      if (!inwardNumber) return res.status(400).json({ success: false, error: "Invalid inward_number" });

      const {
        dc_number,
        supplier_weight,
        our_weight,
        moisture,
        dust,
        ad_value,
        admit_load,
      } = req.body || {};

      // Collect provided fields (only allowed/known keys)
      const provided = {};
      if (dc_number !== undefined) provided.supplier_dc_number = dc_number;
      if (supplier_weight !== undefined) provided.supplier_weight = supplier_weight;
      if (our_weight !== undefined) provided.our_weight = our_weight;
      if (moisture !== undefined) provided.moisture = moisture;
      if (dust !== undefined) provided.dust = dust;
      if (ad_value !== undefined) provided.ad_value = ad_value;
      if (admit_load !== undefined) provided.admit_load = admit_load;

      if (Object.keys(provided).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
      }

      // Validate numerics (allow null)
      const numericFields = ["supplier_weight", "our_weight", "moisture", "dust", "ad_value"];
      for (const f of numericFields) {
        if (f in provided && provided[f] !== null) {
          const n = Number(provided[f]);
          if (!Number.isFinite(n)) {
            return res.status(400).json({ success: false, error: `Field ${f} must be a number or null` });
          }
          if (["moisture", "dust"].includes(f) && (n < 0 || n > 100)) {
            return res.status(400).json({ success: false, error: `${f} must be between 0 and 100` });
          }
          provided[f] = n;
        }
      }

      // Normalize admit_load from incoming
      if ("admit_load" in provided) {
        const v = provided.admit_load;
        let norm = null;
        if (v === true || String(v).toLowerCase() === "true" || String(v).toLowerCase() === "approve") norm = "Approve";
        else if (v === false || String(v).toLowerCase() === "false" || String(v).toLowerCase() === "deny") norm = "Deny";
        else if (v === null || v === "" || String(v).toLowerCase() === "all") norm = null;
        else return res.status(400).json({ success: false, error: "admit_load must be Approve or Deny" });
        provided.admit_load = norm; // unified logical value; actual DB cast happens below
      }

      await client.query("BEGIN");

      // Lock and fetch current row (so we can diff + build audit)
      const currentRes = await client.query(
        `
          SELECT
            inward_number,
            supplier_dc_number,
            supplier_weight,
            our_weight,
            moisture,
            dust,
            ad_value,
            admit_load,
            audit_trail
          FROM ${table}
          WHERE inward_number = $1
          FOR UPDATE
        `,
        [inwardNumber]
      );
      if (currentRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, error: "Row not found" });
      }
      const current = currentRes.rows[0];

      // Determine DB type for admit_load so we compare/set correctly
      const admitColType = await getColumnDataType(client, table, "admit_load"); // 'boolean' | 'text' | null

      // Build changes: sets + params and audit entries
      const sets = [];
      const params = [];
      const auditEntries = [];

      const nowIso = new Date().toISOString();
      const updatedUser =
        req.user?.userid ??
        req.user?.user ??
        req.user?.email ??
        req.user?.id ??
        "unknown";

      // Helper to register a change (for audit)
      const registerChange = (col, oldVal, newVal) => {
        // skip if same (strict equality works for primitives/null/boolean/number/string)
        if (oldVal === newVal) return false;
        auditEntries.push({
          column: col,
          old_value: oldVal,
          new_value: newVal,
          updated_time: nowIso,
          updated_user: updatedUser,
          remark: "edited as admin in receivables",
        });
        return true;
      };

      // Go through each provided field and prepare update + audit
      for (const [col, incomingVal] of Object.entries(provided)) {
        if (col === "admit_load") {
          // Convert to actual DB value
          let dbVal = null;
          if (admitColType === "boolean") {
            if (incomingVal === "Approve") dbVal = true;
            else if (incomingVal === "Deny") dbVal = false;
            else dbVal = null;
            if (registerChange("admit_load", current.admit_load, dbVal)) {
              params.push(dbVal);
              sets.push(`admit_load = $${params.length}::boolean`);
            }
          } else {
            // treat as text
            const newText = incomingVal; // "Approve" | "Deny" | null
            if (registerChange("admit_load", current.admit_load, newText)) {
              params.push(newText);
              sets.push(`admit_load = $${params.length}::text`);
            }
          }
          continue;
        }

        // all other columns (numbers/text)
        const newVal = incomingVal;
        const oldVal = current[col];
        if (registerChange(col, oldVal, newVal)) {
          params.push(newVal);
          sets.push(`${col} = $${params.length}`);
        }
      }

      // If nothing actually changed, short-circuit
      if (sets.length === 0) {
        await client.query("ROLLBACK");
        return res.json({ success: true, row: {
          inward_number: current.inward_number,
          material_arrivaltime: current.material_arrivaltime,
          supplier_name: current.supplier_name,
          supplier_dc_number: current.supplier_dc_number,
          supplier_weight: current.supplier_weight,
          our_weight: current.our_weight,
          moisture: current.moisture,
          dust: current.dust,
          ad_value: current.ad_value,
          lab_result_time: current.lab_result, // keep naming aligned with your GET
          admit_load: current.admit_load,
        }});
      }

      // Append audit entries
      if (auditEntries.length > 0) {
        params.push(JSON.stringify(auditEntries));
        sets.push(`audit_trail = COALESCE(audit_trail, '[]'::jsonb) || $${params.length}::jsonb`);
      }

      // Final UPDATE
      params.push(inwardNumber);
      const sql = `
        UPDATE ${table}
        SET ${sets.join(", ")}
        WHERE inward_number = $${params.length}
        RETURNING
          inward_number,
          material_arrivaltime AS material_arrival_time,
          supplier_name,
          supplier_dc_number AS dc_number,
          supplier_weight,
          our_weight,
          moisture,
          dust,
          ad_value,
          lab_result AS lab_result_time,
          admit_load
      `;
      const upd = await client.query(sql, params);
      await client.query("COMMIT");

      return res.json({ success: true, row: upd.rows[0] });
    } catch (err) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("Error in PATCH /RawMaterialIncoming/:inward_number:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    } finally {
      client.release();
    }
  }
);


// ------------------ CSV download (no base filter) ------------------
router.get("/RawMaterialIncoming/download.csv", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    if (!accountid) return res.status(400).json({ error: "Missing accountid" });
    const table = `${accountid}_rawmaterial_rcvd`;

    const SORTABLE = new Set([
      "inward_number","material_arrivaltime","supplier_name","supplier_dc_number",
      "supplier_weight","our_weight","moisture","dust","ad_value","lab_result",
      "admit_load","material_arrival_time","dc_number","lab_result_time",
    ]);
    const sortByRaw = (req.query.sortBy || "material_arrivaltime").trim();
    const sortBy = SORTABLE.has(sortByRaw) ? mapSortKey(sortByRaw) : "material_arrivaltime";
    const sortDir = (req.query.sortDir || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { whereSql, params } = buildWhereAndParams(req.query);

    const sql = `
      SELECT inward_number,
             material_arrivaltime AS material_arrival_time,
             supplier_name,
             supplier_dc_number AS dc_number,
             supplier_weight, our_weight, userid,moisture, dust, ad_value,
             lab_result AS lab_result_time,lab_userid,
             admit_load,remarks
      FROM ${table}
      ${whereSql}
      ORDER BY ${sortBy} ${sortDir}
    `;
    const { rows } = await pool.query(sql, params);

    const headers = [
      "inward_number","material_arrival_time","supplier_name","dc_number",
      "supplier_weight","our_weight","moisture","dust","ad_value","lab_result_time","admit_load",
    ];

    const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="raw-material-incoming-${ts}.csv"`);

    res.write(headers.join(",") + "\n");
    for (const r of rows) res.write(headers.map((h) => csvEscape(r[h])).join(",") + "\n");
    res.end();
  } catch (err) {
    console.error("Error in GET /RawMaterialIncoming/download.csv:", err);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
});

module.exports = router;
