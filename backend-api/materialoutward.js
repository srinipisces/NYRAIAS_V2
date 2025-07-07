const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const checkAccess= require('./checkaccess.js');

// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');
const { BsTable, BsTabletLandscape } = require('react-icons/bs');



router.get("/inwardnumber_outward_select", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_rawmaterial_rcvd`;

  try {
    const query = `
      SELECT inward_number 
      FROM ${table}
      WHERE material_inward_status IS NOT NULL 
        AND material_outward_status IS NULL
    `;
    
    const result = await pool.query(query);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error("Error fetching inward numbers:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/material-outward-bagging", authenticate,async (req, res) => {
    const { accountid } = req.user;
    const table = `${accountid}_material_outward_bag`;
    const rawtable = `${accountid}_rawmaterial_rcvd`;
  try {
    const result = await pool.query(`
      SELECT 
        a.inward_number, 
        a.supplier_name, 
        a.material_arrivaltime,
        a.material_inward_status, 
        a.material_outward_status,
        b.bag_no, 
        b.grade,
        b.weight AS bag_weight, 
        b.write_timestamp AS bag_update_time
      FROM 
        ${rawtable} a
      LEFT JOIN 
        ${table} b 
      ON 
        a.inward_number = b.inward_number
      WHERE 
        a.kiln_feed_status IS NULL 
    `);

    const rows = result.rows;
    const map = new Map();

    for (const r of rows) {
      if (!map.has(r.inward_number)) {
        map.set(r.inward_number, {
          inward_number: r.inward_number,
          supplier_name: r.supplier_name,
          material_arrivaltime: r.material_arrivaltime,
          material_inward_status: r.material_inward_status,
          material_outward_status: r.material_outward_status,
          bags: [],
        });
      }
      map.get(r.inward_number).bags.push({
        bag_no: r.bag_no,
        bag_weight: r.bag_weight,
        grade: r.grade,
        bag_update_time: r.bag_update_time, // <-- match key in frontend
      });
    }

    const columns = [
      { field: "inward_number", headerName: "Inward Number" },
      { field: "supplier_name", headerName: "Supplier" },
      { field: "material_arrivaltime", headerName: "Arrival Time" },
      { field: "material_inward_status", headerName: "Inward Status" },
      { field: "material_outward_status", headerName: "Outward Status" },
    ];

    const expandColumns = [
      { field: "bag_no", headerName: "Bag No" },
      { field: "bag_weight", headerName: "Weight" },
      { field: "grade", headerName: "Grade" },
      { field: "bag_update_time", headerName: "Updated Time" },
    ];

    res.json({
      columns,
      rows: Array.from(map.values()),
      expandColumns,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/outwardweightsummary", authenticate,async (req, res) => {
  const { accountid } = req.user;
  const rawtable = `${accountid}_rawmaterial_rcvd`;
  const table = `${accountid}_material_outward_bag`;
  const { inward_number } = req.query;
  const inwardNumber = inward_number.trim().toUpperCase();


  if (!inward_number) {
    return res.status(400).json({ error: "inward_number is required" });
  }

  const query = `
  SELECT
  r.our_weight,
  COALESCE(m.total_weight, 0) AS total_weight,
  COALESCE(m.bag_count, 0) AS bag_count
FROM
  ${rawtable} r
LEFT JOIN (
  SELECT
    inward_number,
    SUM(weight) AS total_weight,
    COUNT(*) AS bag_count
  FROM
    ${table}
  WHERE
    inward_number = $1
  GROUP BY
    inward_number
) m ON r.inward_number = m.inward_number
WHERE
  r.inward_number = $1; `


  try {
    const result = await pool.query(query, [inwardNumber]); // db is your pg client
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/crusheroutput", authenticate,checkAccess('Operations.Material Outward'),async (req, res) => {
    const { userid,accountid } = req.user;
    const table = `${accountid}_material_outward_bag`;
    try {
    const text = `
    INSERT INTO ${table}
    (
      inward_number,
      grade,
      weight,
      userid
    ) VALUES (
      $1,                     
      $2,                     
      $3,
      $4                     
    )                     
    RETURNING bag_no;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.inward_number,  // should be in ISO format or a JS Date that Postgres can parse
      req.body.outward_grade,
      Number(req.body.bag_weight),
      userid
    ];
    console.log (text,values);
    const result = await pool.query(text, values);
    const newbag_no = result.rows[0].bag_no;
    res.json({
      operation: 'success',
      bag_no: newbag_no
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ operation: 'error', message: err.message });
  }
});

router.put("/materialoutwardcomplete",authenticate, async (req, res) => {
  const {userid,accountid} = req.user
  const table = `${accountid}_rawmaterial_rcvd`;
  try {
    const text = `
      UPDATE ${table}
      SET material_outward_status = 'Completed',material_outward_remarks = $2,
      material_outward_status_upddt = current_timestamp, material_outward_userid = $3
      WHERE inward_number = $1
    `;
    const values = [req.body.inward_number,req.body.remark,userid];

    console.log(text, values);

    const result = await pool.query(text, values);
    console.log(result);
    res.json({
      operation: 'success',
      rowsAffected: result.rowCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ operation: 'error', message: err.message });
  }
});

module.exports = router;