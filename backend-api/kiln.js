const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db.js');

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');


let dbConnected = false;


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate.js');

router.get("/inwardnumber_kilnfeed_select",authenticate, async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_rawmaterial_rcvd`;
  try {

    const que = `select inward_number from ${table} where material_outward_status is not null and kiln_feed_status is null`
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.get("/inwardnumber_kilnfeed_bag_no_select", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_material_outward_bag`;
  try {

    const que = `select bag_no from ${table} where kiln_feed_status is null and inward_number = $1 and grade not in('Stones','Unburnt')`
    const values = [req.query.inward_number];
    console.log(values,que)
    const result = await pool.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.post("/kilnfeed", authenticate,checkAccess('Operations.Kiln Feed'),async (req, res) => {
  const {userid,accountid} = req.user;
  const rawtable = `${accountid}_rawmaterial_rcvd`
  const table = `${accountid}_material_outward_bag`
  try {
    const { inward_number, bag_no, bags_loaded_for } = req.body;

    const ins_columns = `update ${table} 
    set kiln_load_time = current_timestamp,
    kiln = $3, kiln_feed_status = 'loaded' 
    where inward_number = $1 and bag_no =$2`
    

    await pool.query("BEGIN");

    // Insert the kiln feed record
    await pool.query(
      `${ins_columns}`,
      [inward_number, bag_no, bags_loaded_for]
    );


    // Check if all bags for this inward_number are loaded
    const checkResult = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE kiln_feed_status IS DISTINCT FROM 'loaded') AS pending
       FROM ${table}
       WHERE inward_number = $1 and grade not in('Stones','Unburnt')`,
      [inward_number]
    );

    const pending = parseInt(checkResult.rows[0].pending, 10);

    // If no pending bags, mark rawmaterial_rcvd as 'completed'
    if (pending === 0) {
      await pool.query(
        `UPDATE ${rawtable}
         SET kiln_feed_status = 'completed',
         kiln_feed_status_upddt = current_timestamp,
         kiln_feed_userid = 'test'
         WHERE inward_number = $1`,
        [inward_number]
      );
    }

    await pool.query("COMMIT");

    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/kilnFeedTable", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_material_outward_bag`;
  try {

    const que =`SELECT 
    b.inward_number,
    b.bag_no,
    b.weight,
    b.kiln
  FROM 
    ${table} b
  WHERE 
    b.kiln_quality_updt is null and b.grade not in ('Stones','Unburnt')
    `
    
    const result = await pool.query(que);
    const rows = result.rows;

    const columns = result.fields.map((field) => ({
      field: field.name,
      headerName: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));

    res.json({ columns, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.get("/kilnoutput", authenticate,async (req, res) => {
  const {accountid} = req.user;
  const table = `${accountid}_kiln_output`;
  try {
    const result = await pool.query(`select * from ${table} where screening_inward_time is null`);
    const rows = result.rows;
    const columns = result.fields.map((field) => ({
      field: field.name,
      headerName: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));
    res.json({ columns, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.post("/kilnoutput", authenticate,checkAccess('Operations.Kiln Output'),async (req, res) => {
  const {userid,accountid} = req.user;
  const table = `${accountid}_kiln_output`;
  try {
    const text = `
    INSERT INTO ${table}
      (
       write_timestamp,
       kiln_output_dt,
       from_the_kiln,
       weight_with_stones,
       remarks,
       userid_kilnoutput)
    VALUES
      (
       current_timestamp,
       $1,                     
       $2,                     
       $3,                    
       $4,
       $5                                    
       )                     
    RETURNING bag_no;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.kiln_output_entryDateTime,
      req.body.kiln,
      req.body.bag_weight,
      req.body.remarks,
      userid
    ];
      
    const result = await pool.query(text, values);
    const newInwardNumber = result.rows[0].bag_no;
    res.json({
      operation: 'success',
      bag_no: newInwardNumber
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }


})

module.exports = router;