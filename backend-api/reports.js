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
    const materialInwardTable = `${accountid}_material_inward_bag`;

    // Main paginated query
    const dataQuery = `
      SELECT
          a.inward_number,
          c.supplier_name,
          SUM(CASE WHEN a.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS Grade_Weight,
          SUM(CASE WHEN a.grade = 'Grade 1st stage - Rotary A' THEN a.weight ELSE 0 END) AS Grade_A,
          SUM(CASE WHEN a.grade = 'Grade 2nd stage - Rotary B' THEN a.weight ELSE 0 END) AS Grade_B
          
      FROM ${materialOutwardTable} a
      LEFT JOIN (
          SELECT inward_number, supplier_name
          FROM ${rawMaterialTable}
      ) c ON a.inward_number = c.inward_number
      WHERE a.kiln_feed_status IS NULL
      GROUP BY a.inward_number, c.supplier_name
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
    const table1 = `${accountid}_material_inward_bag`

    // Paginated data query
    const dataQuery = `SELECT 
        a.inward_number,
        a.supplier_name,
        a.our_weight as weight_at_security,
        COALESCE(b.total_weight, 0) as inward_weight,
        a.our_weight - COALESCE(b.total_weight, 0) AS stock
      FROM 
        ${table} a
      LEFT JOIN (
        SELECT 
          inward_number, 
          SUM(weight) AS total_weight
        FROM 
          ${table1}
        GROUP BY 
          inward_number
      ) b ON a.inward_number = b.inward_number
      WHERE 
        a.material_inward_status IS NULL
        LIMIT $1 OFFSET $2;
      `;

    // Count total eligible rows
    const countQuery = `
      SELECT COUNT(*) FROM ${table}
      WHERE material_inward_status IS NULL;
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
    const table1 = `${accountid}_material_inward_bag`;

    const query = `
        WITH date_series AS (
          SELECT generate_series($1::date, $2::date, interval '1 day') AS day
        ),
        inward_data AS (
          SELECT
            inward_number,
            supplier_name,
            our_weight,
            material_arrivaltime::date AS arrival_day,
            COALESCE(material_inward_status_upddt::date, '2999-12-31') AS complete_day,
            material_inward_status_upddt::date AS actual_complete_day
          FROM ${table}
        ),
        bag_data AS (
          SELECT
            inward_number,
            DATE(write_timestamp) AS bag_day,
            SUM(weight) AS total_bag_weight
          FROM ${table1}
          GROUP BY inward_number, DATE(write_timestamp)
        ),
        expanded AS (
          SELECT
            d.day,
            i.inward_number,
            i.supplier_name,
            i.our_weight,
            i.arrival_day,
            i.complete_day,
            i.actual_complete_day
          FROM date_series d
          JOIN inward_data i
            ON d.day >= i.arrival_day AND d.day <= i.complete_day
        ),
        final AS (
          SELECT
            e.day,
            e.inward_number,
            e.supplier_name,
            e.our_weight AS weight_at_security,
            COALESCE(SUM(b.total_bag_weight), 0) AS inward_weight,
            e.our_weight - COALESCE(SUM(b.total_bag_weight), 0) AS stock,
            CASE
              WHEN e.day = e.actual_complete_day THEN
                COALESCE(SUM(b.total_bag_weight), 0) - e.our_weight
              ELSE NULL
            END AS loss_or_gain
          FROM expanded e
          LEFT JOIN bag_data b
            ON b.inward_number = e.inward_number AND b.bag_day <= e.day
          GROUP BY e.day, e.inward_number, e.supplier_name, e.our_weight, e.actual_complete_day
        )
        SELECT 
          TO_CHAR(day, 'DD-MM-YYYY') AS day,
          inward_number,
          supplier_name,
          weight_at_security,
          inward_weight,
          stock,
          loss_or_gain
        FROM final
        ORDER BY day, inward_number;

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


router.post("/Granulated Charcoal Stock History", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Missing date range" });
    }

    const table = `${accountid}_rawmaterial_rcvd`;
    const table1 = `${accountid}_material_inward_bag`;

    const query = `
      SELECT
          TO_CHAR(a.material_arrivaltime, 'DD-MM-YYYY') AS day,
          a.inward_number,
          a.supplier_name,
          a.our_weight as weight_at_security,
          COALESCE(b.total_weight, 0) AS inward_weight,
          a.our_weight - COALESCE(b.total_weight, 0) AS inward_loss/gain
        FROM ${table} a
        LEFT JOIN (
          SELECT
            inward_number,
            SUM(weight) AS total_weight
          FROM ${table1}
          GROUP BY inward_number
        ) b ON a.inward_number = b.inward_number
        WHERE a.material_arrivaltime BETWEEN $1::date AND $2::date
        ORDER BY a.material_arrivaltime, a.inward_number, a.supplier_name;


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

router.post("/rms_performance", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;

    const materialOutwardTable = `${accountid}_material_outward_bag`;
    const rawMaterialTable = `${accountid}_rawmaterial_rcvd`;
    const materialInwardTable = `${accountid}_material_inward_bag`;

    // Main paginated query
    const dataQuery = `
      SELECT
          a.inward_number,
          c.material_outward_status,
          c.material_inward_status,
          c.kiln_feed_status,
          c.supplier_name,
          c.supplier_weight as supplier_weight,
          c.our_weight as weight_at_security,
          COALESCE(b.inward_weight, 0) AS RMS_inward_weight,
          (COALESCE(b.inward_weight, 0)-c.our_weight) as RMS_inward_loss,
          SUM(CASE WHEN a.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS Grade_Weight,
          SUM(CASE WHEN a.grade = 'Grade 1st stage - Rotary A' THEN a.weight ELSE 0 END) AS Grade_A,
          SUM(CASE WHEN a.grade = 'Grade 2nd stage - Rotary B' THEN a.weight ELSE 0 END) AS Grade_B,
          SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) AS total_stone_weight,
          SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) AS total_unburnt_weight,
          SUM(CASE WHEN a.grade = '-20 2nd Stage - Rotary B' THEN a.weight ELSE 0 END) AS total_20B,
          SUM(CASE WHEN a.grade = '-20  1st Stage - Rotary A' THEN a.weight ELSE 0 END) AS total_20A,
          SUM(CASE WHEN a.grade NOT IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS Total_Physical_Loss,
          SUM(a.weight) AS RMS_outward_weight,
          SUM(a.weight)-COALESCE(b.inward_weight, 0)  as RMS_Processing_Loss,
          SUM(a.weight)-COALESCE(b.inward_weight, 0) + (COALESCE(b.inward_weight, 0)-c.our_weight) as RMS_Total_Loss,
          round(((SUM(a.weight)-COALESCE(b.inward_weight, 0) + (COALESCE(b.inward_weight, 0)-c.our_weight)) / our_weight)*100,2)
          SUM(a.kiln_loaded_weight) as kiln_loaded_weight
      FROM ${materialOutwardTable} a
      LEFT JOIN (
          SELECT inward_number, SUM(weight) AS inward_weight
          FROM ${materialInwardTable}
          GROUP BY inward_number
      ) b ON a.inward_number = b.inward_number
      LEFT JOIN (
          SELECT inward_number, supplier_name,our_weight,supplier_weight,material_outward_status,
          material_inward_status,kiln_feed_status
          FROM ${rawMaterialTable}
      ) c ON a.inward_number = c.inward_number
      GROUP BY a.inward_number, c.supplier_name, b.inward_weight,c.supplier_weight,c.our_weight,c.material_outward_status,
          c.material_inward_status,c.kiln_feed_status
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
module.exports = router;