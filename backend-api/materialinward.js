const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');


router.get("/inwardnumber", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_rawmaterial_rcvd`;

  try {
    const query = `
      SELECT inward_number 
      FROM ${table} 
      WHERE lab_result IS NOT NULL AND material_inward_status IS NULL
    `;

    const result = await pool.query(query);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error("Error fetching inward numbers:", err);
    res.status(500).json({ error: "Database error" });
  }
});


router.get("/inwardweightsummary", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const { inward_number } = req.query;

  if (!inward_number) {
    return res.status(400).json({ error: "inward_number is required" });
  }

  const inwardNumber = inward_number.trim().toUpperCase();
  const rcvdTable = `${accountid}_rawmaterial_rcvd`;
  const bagTable = `${accountid}_material_inward_bag`;

  const query = `
    SELECT
      r.our_weight,
      COALESCE(m.total_weight, 0) AS total_weight,
      COALESCE(m.bag_count, 0) AS bag_count
    FROM
      ${rcvdTable} r
    LEFT JOIN (
      SELECT
        inward_number,
        SUM(weight) AS total_weight,
        COUNT(*) AS bag_count
      FROM
        ${bagTable}
      WHERE
        inward_number = $1
      GROUP BY
        inward_number
    ) m ON r.inward_number = m.inward_number
    WHERE
      r.inward_number = $1;
  `;

  try {
    const result = await pool.query(query, [inwardNumber]);
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error("Error fetching inward weight summary:", err);
    res.status(500).json({ error: "Database error" });
  }
});


router.post("/crusherload", authenticate, checkAccess('Operations.Material Inward'), async (req, res) => {
  const { accountid, userid } = req.user;
  const table = `${accountid}_material_inward_bag`;

  const text = `
    INSERT INTO ${table} (
      inward_number,
      weight,
      userid
    ) VALUES (
      $1,
      $2,
      $3
    )
    RETURNING bag_no;
  `;

  const values = [
    req.body.inward_number,
    Number(req.body.bag_weight),
    userid
  ];

  try {
    const result = await pool.query(text, values);
    const newbag_no = result.rows[0].bag_no;
    res.json({
      operation: 'success',
      bag_no: newbag_no
    });
  } catch (err) {
    console.error("Error inserting crusher load:", err);
    res.status(500).json({ operation: 'error', message: err.message });
  }
});

router.put(
  "/materialinwardcomplete",
  authenticate,
  checkAccess('Operations.Material Inward'),
  async (req, res) => {
    const { accountid, userid } = req.user; // from decoded JWT
    const { inward_number, remark } = req.body;
    
    if (!inward_number) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const table = `${accountid}_rawmaterial_rcvd`; // dynamic table per tenant

    const query = `
      UPDATE ${table}
      SET
        material_inward_status = 'Completed',
        material_inward_remarks = $2,
        material_inward_status_upddt = current_timestamp,
        material_inward_userid = $3
      WHERE inward_number = $1
    `;
    const values = [inward_number, remark, userid];

    try {
      const result = await pool.query(query, values);

      res.json({
        operation: 'success',
        rowsAffected: result.rowCount,
      });
    } catch (err) {
      console.error('Error in materialinwardcomplete:', err);
      res.status(500).json({ operation: 'error', message: err.message });
    }
  }
);

router.get("/material-inward-bagging", authenticate, async (req, res) => {
  const { accountid } = req.user;

  const rawTable = `${accountid}_rawmaterial_rcvd`;
  const bagTable = `${accountid}_material_inward_bag`;

  try {
    const result = await pool.query(`
      SELECT 
        a.inward_number, 
        a.supplier_name, 
        a.material_arrivaltime, 
        a.material_inward_status,
        a.material_outward_status,
        b.bag_no, 
        b.weight AS bag_weight, 
        b.write_timestamp AS bag_update_time
      FROM 
        ${rawTable} a
      LEFT JOIN 
        ${bagTable} b 
      ON 
        a.inward_number = b.inward_number
      WHERE 
        a.material_outward_status IS NULL 
        AND a.lab_result IS NOT NULL;
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
        bag_update_time: r.bag_update_time,
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


module.exports = router;