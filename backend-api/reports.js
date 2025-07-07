const express = require('express');
const router = express.Router();
const pool = require('./db');

const checkAccess= require('./checkaccess.js');


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');

router.post("/grade_wise_in-stock", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;

    const table = `${accountid}_screening_outward`;

    // Get paginated data
    const dataQuery = `
      SELECT grade, SUM(weight) AS weight
      FROM ${table}
      WHERE delivery_status = 'InStock'
      GROUP BY grade
      ORDER BY grade
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(dataQuery, [limit, offset]);

    // Get total count of grouped records
    const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT grade
        FROM ${table}
        WHERE delivery_status = 'InStock'
        GROUP BY grade
      ) AS subquery
    `;
    const totalResult = await pool.query(countQuery);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Return columns, rows, and total
    const rows = result.rows;
    const columns = Object.keys(rows[0] || {});

    res.json({ columns, rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/granulated_charcoal_in-stock", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;

    const materialOutwardTable = `${accountid}_material_outward_bag`;
    const rawMaterialTable = `${accountid}_rawmaterial_rcvd`;

    // Main paginated query
    const dataQuery = `
      SELECT
        a.inward_number,
        b.supplier_name,
        SUM(CASE WHEN a.grade NOT IN ('Stones', 'Unburnt') THEN a.weight ELSE 0 END) AS weight,
        SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) AS total_stone_weight,
        SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) AS total_unburnt_weight,
        SUM(a.weight) AS total_weight,
        ROUND(SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_stone,
        ROUND(SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_unburnt,
        ROUND(SUM(CASE WHEN a.grade NOT IN ('Stones', 'Unburnt') THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_gcharcoal
      FROM ${materialOutwardTable} a
      LEFT JOIN ${rawMaterialTable} b
        ON a.inward_number = b.inward_number
      WHERE a.kiln_feed_status IS NULL
      GROUP BY a.inward_number, b.supplier_name
      ORDER BY a.inward_number
      LIMIT $1 OFFSET $2;
    `;

    // Total count (without LIMIT/OFFSET)
    const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT a.inward_number
        FROM ${materialOutwardTable} a
        LEFT JOIN ${rawMaterialTable} b
          ON a.inward_number = b.inward_number
        WHERE a.kiln_feed_status IS NULL
        GROUP BY a.inward_number, b.supplier_name
      ) AS subquery;
    `;

    const dataResult = await pool.query(dataQuery, [limit, offset]);
    const countResult = await pool.query(countQuery);

    const rows = dataResult.rows;
    const total = parseInt(countResult.rows[0].count, 10);
    const columns = Object.keys(rows[0] || {});

    res.json({ columns, rows, total });
  } catch (err) {
    console.error('Error in /granulated_charcoal_in-stock:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post("/rawmaterial_in-stock", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;

    const table = `${accountid}_rawmaterial_rcvd`;

    // Paginated data query
    const dataQuery = `
      SELECT
        inward_number,
        supplier_name,
        moisture,
        dust,
        ad_value,
        our_weight AS weight
      FROM ${table}
      WHERE material_outward_status IS NULL
      ORDER BY inward_number
      LIMIT $1 OFFSET $2;
    `;

    // Count total eligible rows
    const countQuery = `
      SELECT COUNT(*) FROM ${table}
      WHERE material_outward_status IS NULL;
    `;

    const result = await pool.query(dataQuery, [limit, offset]);
    const countResult = await pool.query(countQuery);

    const rows = result.rows;
    const total = parseInt(countResult.rows[0].count, 10);
    const columns = Object.keys(rows[0] || {});

    res.json({ columns, rows, total });
  } catch (err) {
    console.error('Error in /rawmaterial_in-stock:', err);
    res.status(500).json({ error: "Database error" });
  }
});


router.post("/raw-material_stock_history", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Missing date range" });
    }

    const table = `${accountid}_rawmaterial_rcvd`;

    const query = `
      SELECT
        d.report_date,
        COALESCE(SUM(r.our_weight), 0) AS total_stock_weight
      FROM (
        SELECT generate_series($1::date, $2::date, interval '1 day') AS report_date
      ) d
      LEFT JOIN ${table} r
        ON r.material_arrivaltime <= d.report_date
        AND (r.material_outward_status_upddt IS NULL OR r.material_outward_status_upddt > d.report_date)
        AND r.deleted = false
      GROUP BY d.report_date
      ORDER BY d.report_date;
    `;

    const result = await pool.query(query, [start_date, end_date]);

    const rows = result.rows;
    const columns = Object.keys(rows[0] || {});
    const total = rows.length;

    res.json({ columns, rows, total });
  } catch (err) {
    console.error("Error in /rawmaterial_stock_history:", err);
    res.status(500).json({ error: "Database error" });
  }
});



module.exports = router;