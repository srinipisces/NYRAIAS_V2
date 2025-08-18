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
    const rep_view = `${accountid}_rms_summary_view_v2`;
    // Main paginated query
    const dataQuery = `
      select * from ${rep_view}
    `;
    const dataResult = await pool.query(dataQuery);
    const rows = dataResult.rows;
    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows});
  } catch (err) {
    console.error('Error in /rms_performance:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post("/kiln_yield", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;
    const kiln_summary_view = `${accountid}_kiln_daily_summary`;

    const conditions = [];
    const values = [];

    if (start_date) {
      values.push(start_date);
      conditions.push(`TO_DATE(date_str, 'dd-mm-yyyy') >= $${values.length}`);
    }

    if (end_date) {
      values.push(end_date);
      conditions.push(`TO_DATE(date_str, 'dd-mm-yyyy') <= $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT *,
        ROUND((kiln_output_weight / NULLIF(raw_material_out_weight, 0)) * 100, 2) AS actual_yield,
        ROUND((kiln_output_weight / NULLIF(kiln_loaded_weight, 0)) * 100, 2) AS kiln_yield,
        (kiln_loaded_weight - raw_material_out_weight) AS kiln_input_loss
      FROM ${kiln_summary_view}
      ${whereClause}
      ORDER BY TO_DATE(date_str, 'dd-mm-yyyy') ASC
    `;

    const result = await pool.query(query, values);
    const rows = result.rows;
    const columns = Object.keys(rows[0] || {});

    res.json({ columns, rows });
  } catch (err) {
    console.error('Error in /kiln_yield:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


router.post("/raw-material_inward_daywise", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;
    const table = `${accountid}_rawmaterial_rcvd`;

    const conditions = [];
    const values = [];

    if (start_date) {
      values.push(start_date);
      conditions.push(`material_arrivaltime::date >= TO_DATE($${values.length}, 'ddmmyy')`);
    }

    if (end_date) {
      values.push(end_date);
      conditions.push(`material_arrivaltime::date <= TO_DATE($${values.length}, 'ddmmyy')`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        TO_CHAR(material_arrivaltime, 'dd-mm-yyyy hh24:mi:ss') AS arrival_time,
        supplier_name, 
        supplier_weight, 
        supplier_value,
        supplier_dc_number,
        inward_number, 
        our_weight, 
        userid,
        TO_CHAR(lab_result, 'dd-mm-yyyy hh24:mi:ss') AS lab_result,
        moisture, 
        dust, 
        ad_value, 
        admit_load, 
        lab_userid, 
        remarks 
      FROM ${table}
      ${whereClause}
      ORDER BY material_arrivaltime DESC
    `;

    const result = await pool.query(query, values);
    const rows = result.rows;
    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in raw-material_inward_daywise:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


router.post("/kiln_output_bags_daywise", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;
    const table = `${accountid}_kiln_output`;

    const conditions = [];
    const values = [];

    if (start_date) {
      values.push(start_date);
      conditions.push(`kiln_output_dt::date >= TO_DATE($${values.length}, 'ddmmyy')`);
    }

    if (end_date) {
      values.push(end_date);
      conditions.push(`kiln_output_dt::date <= TO_DATE($${values.length}, 'ddmmyy')`);
    }


    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        TO_CHAR(kiln_output_dt, 'dd-mm-yyyy hh24:mm:ss') AS datetime,
        from_the_kiln AS kiln,
        bag_no,
        weight_with_stones,
        userid_kilnoutput AS userid
      FROM ${table}
      ${whereClause}
      ORDER BY kiln_output_dt DESC
    `;

    const result = await pool.query(query, values);
    const rows = result.rows;
    const columns = Object.keys(rows[0] || {});

    res.json({ columns, rows });
  } catch (err) {
    console.error('Error in /kiln_output_bags_daywise:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



router.post("/kiln_output_vs_destoning", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { datecode } = req.body;  // expected in 'ddmmyy' format

    if (!datecode || !/^\d{6}$/.test(datecode)) {
      console.log("Bad date format :",datecode);
      return res.status(400).json({ error: "Invalid or missing datecode (expected DDMMYY)"});
    }

    const query = `SELECT * FROM get_destoning_summary($1, $2)`;
    const { rows } = await pool.query(query, [accountid, datecode]);

    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in /kiln_output_vs_destoning:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


router.post("/bags_waiting_for_destoning", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const table = `${accountid}_kiln_output`;

    const query = `SELECT bag_no,to_char(kiln_output_dt,'dd-mm-yyyy hh:mm:ss') as kiln_output_date,exkiln_stock FROM ${table} where exkiln_stock = 'De-Stoning'`;
    const { rows } = await pool.query(query);

    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in /bags_waiting_for_destoning:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



router.post("/destoning_summary", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;
    const table = `${accountid}_destoning`;

    const query = `SELECT TO_CHAR(bag_generated_timestamp, 'dd-mm-yyyy') AS date,
                      SUM(loaded_weight) AS loaded_weight,
                      SUM(weight_out) AS weight_after_destoned,
                      COUNT(*) AS number_of_bags
                    FROM ${table}
                    WHERE bag_generated_timestamp::date BETWEEN TO_DATE($1, 'ddmmyy') 
                    AND TO_DATE($2, 'ddmmyy')
                    GROUP BY TO_CHAR(bag_generated_timestamp, 'dd-mm-yyyy');`;
    const { rows } = await pool.query(query,[start_date,end_date]);

    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in /destoning_summary:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post("/kiln_load", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;
    const table = `${accountid}_material_outward_bag`;

    const query = `SELECT TO_CHAR(kiln_load_time, 'dd-mm-yyyy hh24:mm:ss') AS kiln_load_time,
                      bag_no,kiln_loaded_weight,kiln
                    FROM ${table}
                    WHERE kiln_load_time::date BETWEEN TO_DATE($1, 'ddmmyy') 
                    AND TO_DATE($2, 'ddmmyy')`;
    const { rows } = await pool.query(query,[start_date,end_date]);

    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in /destoning_summary:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post("/bagwise_current_stock", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const table = `${accountid}_screening_outward`;

    const query = `SELECT screening_out_dt,bag_no,weight,grade, ctc 
      FROM ${table}
      WHERE delivery_status = 'InStock'  `;
    const { rows } = await pool.query(query);

    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in /destoning_summary:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post("/bagwise_delivered", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body;
    const table = `${accountid}_screening_outward`;
    const table1 = `${accountid}_destoning`;

    const query =  `SELECT screening_out_dt as bag_gen_time,bag_no,weight,grade,ctc,
                    stock_change_userid as stock_upd_user,stock_change_dt as stock_upd_dt
                    FROM ${table}
                    WHERE delivery_status = 'Delivered'  
                    and screening_out_dt::date BETWEEN TO_DATE($1, 'ddmmyy') 
                    AND TO_DATE($2, 'ddmmyy')
                    UNION 
                    select bag_generated_timestamp as bag_gen_time,ds_bag_no as bag_no,
                    weight_out as weight,'exkiln' as grade,quality_ctc as ctc ,
                    stock_upd_user,stock_upd_dt
                    FROM ${table1} where final_destination = 'Delivered' 
                    and bag_generated_timestamp::date between to_date($1,'ddmmyy') AND TO_DATE($2, 'ddmmyy')
                    `;
    const { rows } = await pool.query(query,[start_date,end_date]);

    const columns = Object.keys(rows[0] || {});
    res.json({ columns, rows });

  } catch (err) {
    console.error('Error in /destoning_summary:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post("/screening_inward", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body || {};

    // Expect 'DDMMYY' per your standard
    const ddmmyy = /^\d{6}$/;
    if (!ddmmyy.test(start_date) || !ddmmyy.test(end_date)) {
      return res.status(400).json({ success: false, error: "start_date and end_date must be DDMMYY (e.g., '170825')" });
    }

    const table = `${accountid}_destoning`;
    const table1 = `${accountid}_screening_outward`;

    // Sargable half-open range: >= start AND < (end + 1 day) covers the full end_date
    const query = `
      SELECT
        ds_bag_no AS bag_no,
        weight_out AS destoning_weight,
        screening_inward_bag_weight,
        screening_inward_time,
        screening_machine,
        userid_screening_inward AS userid
      FROM ${table}
      WHERE screening_inward_time >= TO_DATE($1, 'DDMMYY')
        AND screening_inward_time <  TO_DATE($2, 'DDMMYY') + INTERVAL '1 day'
      union
      select bag_no,0 as weight_out,reload_bag_weight as screening_bag_weight,
      reload_time as screening_inward_time,reload_machine as screening_machine,
      reload_userid as userid
      from ${table1}
      WHERE reload_time >= TO_DATE($1, 'DDMMYY')
        AND reload_time <  TO_DATE($2, 'DDMMYY') + INTERVAL '1 day'
      ORDER BY screening_inward_time;
    `;

    const { rows } = await pool.query(query, [start_date, end_date]);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    res.json({ columns, rows });
  } catch (err) {
    console.error('Error in /screening_inward:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


router.post("/screening_outward", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const { start_date, end_date } = req.body || {};

    // Expect 'DDMMYY' per your standard
    const ddmmyy = /^\d{6}$/;
    if (!ddmmyy.test(start_date) || !ddmmyy.test(end_date)) {
      return res.status(400).json({ success: false, error: "start_date and end_date must be DDMMYY (e.g., '170825')" });
    }

    const table = `${accountid}_screening_outward`;

    // Sargable half-open range: >= start AND < (end + 1 day) covers the full end_date
    const query = `
      select bag_no,weight,screening_out_dt,grade,ctc,userid,delivery_status,stock_change_dt as status_change_dt,
      stock_change_userid as status_change_userid
      FROM ${table}
      WHERE screening_out_dt >= TO_DATE($1, 'DDMMYY')
        AND screening_out_dt <  TO_DATE($2, 'DDMMYY') + INTERVAL '1 day'
      ORDER BY screening_out_dt;
    `;

    const { rows } = await pool.query(query, [start_date, end_date]);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    res.json({ columns, rows });
  } catch (err) {
    console.error('Error in /screening_inward:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



router.post("/screening_summary", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    const { start_date, end_date } = req.body || {};

    // Expect 'DDMMYY', e.g. '170825'
      const ddmmyy = /^\d{6}$/;
      if (!ddmmyy.test(start_date) || !ddmmyy.test(end_date)) {
        return res.status(400).json({
          error: "start_date and end_date must be DDMMYY (e.g., '170825')"
        });
      }


    const safeAccount = String(accountid).replace(/[^a-z0-9_]/gi, "");
    const destoningTable = `${safeAccount}_destoning`;
    const screeningOutwardTable = `${safeAccount}_screening_outward`;

    // Primary (date spine + sums)
    const qWeights = `
      WITH days AS (
        SELECT generate_series(
          to_date($1, 'DDMMYY'),
          to_date($2, 'DDMMYY'),
          interval '1 day'
        )::date AS d
      ),
      dest AS (
        SELECT
          screening_inward_time::date AS d,
          SUM(weight_out)::numeric            AS destoning_weight,
          SUM(screening_bag_weight)::numeric  AS screening_inward_bag_weight
        FROM ${destoningTable}
        WHERE screening_inward_time::date BETWEEN to_date($1,'DDMMYY') AND to_date($2,'DDMMYY')
        GROUP BY 1
      ),
      reload AS (
        SELECT
          reload_time::date AS d,
          SUM(reload_bag_weight)::numeric AS reload_bag_weight
        FROM ${screeningOutwardTable}
        WHERE reload_time::date BETWEEN to_date($1,'DDMMYY') AND to_date($2,'DDMMYY')
        GROUP BY 1
      )
      SELECT
        d AS day,
        to_char(d, 'YYYY-MM-DD') AS iso_day,
        to_char(d, 'DD-MM-YYYY') AS date_str,
        COALESCE(dest.destoning_weight, 0) AS destoning_weight,
        COALESCE(dest.screening_inward_bag_weight, 0) + COALESCE(reload.reload_bag_weight, 0) AS screening_inward_bag_weight
      FROM days
      LEFT JOIN dest   USING (d)
      LEFT JOIN reload USING (d)
      ORDER BY d;
    `;

    // Secondary (grades by day)
    const qGrades = `
      SELECT
        to_char(screening_out_dt::date, 'YYYY-MM-DD') AS iso_day,
        grade,
        SUM(weight)::numeric AS screening_out_weight
      FROM ${screeningOutwardTable}
      WHERE screening_out_dt::date BETWEEN to_date($1,'DDMMYY') AND to_date($2,'DDMMYY')
      GROUP BY 1, 2
      ORDER BY 1, 2;
    `;

    const [{ rows: weightRows }, { rows: gradeRows }] = await Promise.all([
      pool.query(qWeights, [start_date, end_date]),
      pool.query(qGrades, [start_date, end_date]),
    ]);

    // Build iso_day -> { grade -> total } and collect all grade labels for columns
    const gradeByDay = new Map();
    const gradeSet = new Set();
    for (const r of gradeRows) {
      const iso = r.iso_day;
      const g = (r.grade ?? "").toString().trim();
      const wt = Number(r.screening_out_weight || 0);
      if (!gradeByDay.has(iso)) gradeByDay.set(iso, {});
      gradeByDay.get(iso)[g] = (gradeByDay.get(iso)[g] || 0) + wt;
      gradeSet.add(g);
    }
    const gradeCols = Array.from(gradeSet).sort((a, b) => String(a).localeCompare(String(b)));

    // Merge; include days that appear in either dataset, skip pure empties
    const rows = [];
    for (const w of weightRows) {
      const grades = gradeByDay.get(w.iso_day) || {};
      const row = {
        date: w.date_str, // DD-MM-YYYY
        destoning_weight: Number(w.destoning_weight || 0),
        screening_inward_bag_weight: Number(w.screening_inward_bag_weight || 0),
      };
      let gradeSum = 0;
      for (const col of gradeCols) {
        const v = Number(grades[col] || 0);
        row[col] = v;
        gradeSum += v;
      }
      row.screening_out_total = gradeSum;
      if (row.destoning_weight !== 0 || row.screening_inward_bag_weight !== 0 || gradeSum !== 0) {
        rows.push(row);
      }
    }

    // columns: put total at the very end
    const columns = ["date", "destoning_weight", "screening_inward_bag_weight", ...gradeCols, "screening_out_total"];

    return res.json({ columns, rows });
  } catch (err) {
    console.error("Error in /screening_summary:", err);
    return res.status(500).json({ error: "Database error" });
  }
});





router.post("/screening_breakdown", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user || {};
    let { start_date, end_date } = req.body || {};

    // Validate DDMMYY (e.g., '170825')
    const ddmmyy = /^\d{6}$/;
    if (!accountid) return res.status(400).json({ error: "Missing account id" });
    if (!ddmmyy.test(start_date) || !ddmmyy.test(end_date)) {
      return res.status(400).json({ error: "start_date and end_date must be DDMMYY (e.g., '170825')" });
    }

    // Optional: auto-swap if dates are reversed
    if (Number(start_date.slice(4) + start_date.slice(2,4) + start_date.slice(0,2)) >
        Number(end_date.slice(4)   + end_date.slice(2,4)   + end_date.slice(0,2))) {
      [start_date, end_date] = [end_date, start_date];
    }

    const safeAccount = String(accountid).replace(/[^a-z0-9_]/gi, "");
    const destoningTable = `${safeAccount}_destoning`;
    const screeningOutwardTable = `${safeAccount}_screening_outward`;

    const q = `
      WITH
      days AS (
        SELECT generate_series(
          to_date($1, 'DDMMYY'),
          to_date($2, 'DDMMYY'),
          interval '1 day'
        )::date AS d
      ),
      dest AS (
        SELECT
          screening_inward_time::date AS d,
          SUM(weight_out)::numeric           AS ex_destone,
          SUM(screening_bag_weight)::numeric AS in_screener_inward
        FROM ${destoningTable}
        WHERE screening_inward_time::date BETWEEN to_date($1,'DDMMYY') AND to_date($2,'DDMMYY')
        GROUP BY 1
      ),
      reload AS (
        SELECT
          reload_time::date AS d,
          SUM(reload_bag_weight)::numeric AS in_screener_reload
        FROM ${screeningOutwardTable}
        WHERE reload_time::date BETWEEN to_date($1,'DDMMYY') AND to_date($2,'DDMMYY')
        GROUP BY 1
      ),
      primary_totals AS (
        SELECT
          d.d,
          COALESCE(dest.ex_destone, 0) AS ex_destone,
          COALESCE(dest.in_screener_inward, 0) + COALESCE(reload.in_screener_reload, 0) AS in_screener
        FROM days d
        LEFT JOIN dest   ON dest.d   = d.d
        LEFT JOIN reload ON reload.d = d.d
      ),
      grades AS (
        SELECT
          screening_out_dt::date AS d,
          grade,
          SUM(weight)::numeric AS ex_screener
        FROM ${screeningOutwardTable}
        WHERE screening_out_dt::date BETWEEN to_date($1,'DDMMYY') AND to_date($2,'DDMMYY')
        GROUP BY 1, 2
      ),
      grade_totals AS (
        SELECT d, SUM(ex_screener)::numeric AS ex_screener_total
        FROM grades
        GROUP BY 1
      ),
      grade_rows AS (
        SELECT
          to_char(d.d, 'DD-MM-YYYY') AS date,
          g.grade                     AS grade,
          NULL::numeric               AS ex_destone,
          NULL::numeric               AS in_screener,
          COALESCE(g.ex_screener, 0) AS ex_screener,
          CASE
            WHEN COALESCE(gt.ex_screener_total, 0) = 0 THEN NULL
            ELSE ROUND(100.0 * g.ex_screener / gt.ex_screener_total, 2)
          END                         AS pct_of_grade,
          NULL::numeric               AS loss_carry_over
        FROM days d
        JOIN grades g      ON g.d  = d.d
        LEFT JOIN grade_totals gt ON gt.d = d.d
      ),
      total_rows AS (
        SELECT
          to_char(d.d, 'DD-MM-YYYY')                                        AS date,
          'Total'                                                           AS grade,
          COALESCE(p.ex_destone, 0)                                         AS ex_destone,
          COALESCE(p.in_screener, 0)                                        AS in_screener,
          COALESCE(gt.ex_screener_total, 0)                                 AS ex_screener,
          NULL::numeric                                                     AS pct_of_grade,
          COALESCE(gt.ex_screener_total, 0) - COALESCE(p.ex_destone, 0)     AS loss_carry_over
        FROM days d
        LEFT JOIN primary_totals p ON p.d = d.d
        LEFT JOIN grade_totals  gt ON gt.d = d.d
        -- keep the day only if there is data in either dataset
        WHERE COALESCE(p.ex_destone, 0) <> 0
           OR COALESCE(p.in_screener, 0) <> 0
           OR COALESCE(gt.ex_screener_total, 0) <> 0
      )
      SELECT *
      FROM (
        SELECT * FROM grade_rows
        UNION ALL
        SELECT * FROM total_rows
      ) AS u
      ORDER BY to_date(u.date,'DD-MM-YYYY'),
               CASE WHEN u.grade = 'Total' THEN 1 ELSE 0 END,
               u.grade;
    `;

    const { rows: dbRows } = await pool.query(q, [start_date, end_date]);

    // Convert NUMERIC strings to numbers, keep nulls for blank cells
    const toNum = (v) => (v == null ? null : Number(v));
    const rows = dbRows.map((r) => ({
      date: r.date,
      grade: r.grade,
      ex_destone: toNum(r.ex_destone),
      in_screener: toNum(r.in_screener),
      ex_screener: toNum(r.ex_screener),
      pct_of_grade: toNum(r.pct_of_grade),
      loss_carry_over: toNum(r.loss_carry_over),
    }));

    const columns = ["date", "grade", "ex_destone", "in_screener", "ex_screener", "pct_of_grade", "loss_carry_over"];
    return res.json({ columns, rows });
  } catch (err) {
    console.error("Error in /screening_breakdown:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;









