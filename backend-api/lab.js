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
    const { userid, accountid } = req.user;
    const table = `${accountid}_rawmaterial_rcvd`;
    const historyTable = `${accountid}_rawmaterial_inward_history`;

    const client = await pool.connect();

    try {
      const {
        moisture,
        dust,
        ad_value,
        inward_number,
        admit_load,
        remarks
      } = req.body;

      await client.query('BEGIN');

      const updateQuery = `
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

      const updateValues = [
        moisture,
        dust,
        ad_value,
        inward_number,
        userid,
        admit_load,
        remarks
      ];

      const result = await client.query(updateQuery, updateValues);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Inward number not found" });
      }

      if (admit_load === "Deny") {
        const deleteQuery = `DELETE FROM ${historyTable} WHERE inward_number = $1`;
        await client.query(deleteQuery, [inward_number]);
      }

      await client.query('COMMIT');
      res.json({ operation: 'success' });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error("Error in /inwardlabtest:", err);
      res.status(500).json({ error: "Database error" });
    } finally {
      client.release();
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
