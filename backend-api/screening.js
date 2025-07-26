const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');


let dbConnected = false;


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');


router.get("/screeninginwardbagno",authenticate, async(req,res) => {
    const {accountid} = req.user;
    const table = `${accountid}_kiln_output`
    const table2 = `${accountid}_screening_outward`
    let que =''
    let values = []
  try {
    const kiln = req.query.kiln;
    
    if (kiln==='Re-Screening'){
      que = `select bag_no from ${table2} where delivery_status = 'Screening' and reload ='InQue'`
    }
    else {
      que = `select bag_no from ${table} where screening_inward_time is null and exkiln_stock = 'Screening' and from_the_kiln=$1`,
      values = [kiln]
    }       
    const result = await pool.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})
router.get("/ScreeningInwardTable", authenticate,async (req, res) => {
    const {accountid} = req.user;
    const table = `${accountid}_kiln_output`
  try {
    const result = await pool.query(`SELECT * 
    FROM ${table} 
    WHERE screening_inward_time IS NOT NULL 
    and exkiln_stock = 'InStock'
    ORDER BY screening_inward_time DESC 
    LIMIT 10;
    `);
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

router.post("/ScreeningInward", authenticate,checkAccess('Operations.Screening Inward'),async(req,res) => {
    const {userid,accountid} = req.user;
    const bag_no  = req.body.bag_no;
    
    const prefix = bag_no.trim().charAt(0).toUpperCase();
    let table, que,values;
  try {
    if (prefix === 'S') {
      table = `${accountid}_screening_outward`;
      que = `
        UPDATE ${table} set
        reload ='loaded',
        reload_time =$1,
        reload_kiln = $2,
        reload_machine =$5,
        reload_output_required = $6,
        reload_userid = $7,
        reload_bag_weight = $8,
        exkiln_stock = 'ScreeningCompleted'
        where bag_no = $9
      `;
      values = [req.body.date_time,
        req.body.kiln,
        req.body.machine,
        req.body.output_required,
        userid,
        req.body.bag_weight,
        req.body.bag_no
       ];
      
      const result = await pool.query(que,values);
    } else if (prefix === 'K') {
      table = `${accountid}_kiln_output`;
      que = `update ${table} 
      set screening_inward_time = $1,
      screening_inward_kiln = $2,
      screening_machine =$6,
      userid_screening_inward = $8,
      screening_output_required = $7,
      exkiln_stock = 'Screening',
      screening_bag_weight = $9  
      where bag_no = $3`

      values = [req.body.date_time,
        req.body.kiln,
        req.body.bag_no,
        req.body.machine,
        req.body.output_required,
        userid,
        req.body.bag_weight
       ];
      const result = await pool.query(que,values);

    } else {
      return res.status(400).json({ message: 'Bag number must start with S or K' });
    }
  
    
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.post("/ScreeningOutward",authenticate,checkAccess('Operations.Screening Outward'), async(req,res) => {
    const {userid,accountid} = req.user;
    const table = `${accountid}_screening_outward`
    try {

    const que = `insert into ${table} 
    (screening_out_dt,weight,grade,machine,userid,ctc)
    values ($1,$2,$3,$4,$5,$6)
    `

    const values = [req.body.date_time,
      req.body.bag_weight,
      req.body.grade,
      req.body.machine,
      userid,
      req.body.ctc];
    console.log(values,que)
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// final
router.get("/ScreeningOutward",authenticate, async(req,res) => {
    const {accountid} = req.user;
    const table = `${accountid}_screening_outward`
    try {
      const result = await pool.query(`SELECT screening_out_dt,bag_no,weight,grade,ctc,machine,
      write_dt,userid,delivery_status,stock_change_userid,stock_change_dt
      FROM ${table} 
      where delivery_status = 'InStock'
      ORDER BY write_dt DESC ;
      `);
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
});


router.post('/update-cell', authenticate, checkAccess('Operations.Screening Outward'),async (req, res) => {
  const { primaryKeyField, primaryKeyValue, field, value } = req.body;
  const accountId = req.user.accountid; // or extract from token/session

  try {
    const tableName = `${accountId}_screening_outward`;

    const query = `
      UPDATE ${tableName}
      SET ${field} = $1
      WHERE ${primaryKeyField} = $2
    `;
    await pool.query(query, [value, primaryKeyValue]);

    res.json({ success: true });
  } catch (err) {
    console.error('Update failed', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;