// 📁 File: routes/users.js
const express = require('express');
const router = express.Router();

const { authenticate } = require('./authenticate');
const { logUserActivity } = require('./auditlogger');
const bcrypt = require('bcrypt');

const pool = require('./db');

const checkAccess= require('./checkaccess.js');


//lab
// Get the Inward Number where lab test is not done -- final
router.get("/inwardlabque", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_rawmaterial_rcvd`; // 👈 table name with tenant prefix

  try {
    const query = `SELECT inward_number FROM ${table} WHERE lab_result IS NULL`;
    const result = await pool.query(query);
    const inwardNumbers = result.rows.map(row => row.inward_number);

    res.json(inwardNumbers);
  } catch (err) {
    console.error('Error fetching inward lab queue:', err);
    res.status(500).json({ error: "Database error" });
  }
});

// update inward number lab test results..
router.post(
  "/inwardlabtest",
  authenticate,
  checkAccess('Operations.Lab'),
  async (req, res) => {
    const { userid, accountid } = req.user; // ✅ extract from token
    const table = `${accountid}_rawmaterial_rcvd`; // ✅ tenant-specific table

    try {
      const query = `
        UPDATE ${table}
        SET
          moisture = $1,
          dust = $2,
          ad_value = $3,
          lab_result = CURRENT_TIMESTAMP,
          lab_userid = $5,
          admit_load = $6,
          remarks = $7
        WHERE inward_number = $4
      `;

      const values = [
        req.body.moisture,
        req.body.dust,
        req.body.ad_value,
        req.body.inward_number,
        req.body.admit_load,
        req.body.remarks,
        userid // ✅ from token, not request body
      ];

      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Inward number not found" });
      }

      res.json({ operation: 'success' });
    } catch (err) {
      console.error("Error updating rawmaterial_rcvd:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);
//lab table view
router.get("/LabTest_Table", authenticate, async (req, res) => {
  const { accountid } = req.user; // ✅ Get account ID from token
  const table = `${accountid}_rawmaterial_rcvd`; // ✅ Multi-tenant aware table

  try {
    const query = `
      SELECT 
        inward_number, 
        material_arrivaltime, 
        supplier_name, 
        supplier_dc_number AS dc_number, 
        supplier_weight, 
        our_weight, 
        moisture, 
        dust, 
        ad_value, 
        lab_result AS lab_result_time,
        lab_userid
      FROM ${table}
      WHERE material_inward_status IS NULL
    `;

    const result = await pool.query(query);

    const rows = result.rows;

    const columns = result.fields.map((field) => ({
      field: field.name,
      headerName: field.name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));

    res.json({ columns, rows });

  } catch (err) {
    console.error("Error fetching LabTest table:", err);
    res.status(500).json({ error: "Database error" });
  }
});


//lab


module.exports = router;
