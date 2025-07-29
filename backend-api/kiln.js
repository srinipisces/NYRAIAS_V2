const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db.js');

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

const { getKolkataDayString, formatToKolkataDay } = require('./date');
let dbConnected = false;


// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate.js');

router.get("/inwardnumber_kilnfeed_select",authenticate, async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_rawmaterial_rcvd`;
  const table1 = `${accountid}_material_outward_bag`;
  try {

    const que = `SELECT DISTINCT a.inward_number
        FROM ${table1} a
        JOIN ${table} b
          ON a.inward_number = b.inward_number
        WHERE b.kiln_feed_status is null`
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/inwardnumber_kilnfeed_bag_no_select", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_material_outward_bag`;
  try {

    const que = `select bag_no from ${table} where kiln_feed_status is null and inward_number = $1 and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`
    const values = [req.query.inward_number];
    
    const result = await pool.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.post("/kilnfeed", authenticate, checkAccess('Operations.Kiln Feed'), async (req, res) => {
  const { userid, accountid } = req.user;
  const rawtable = `${accountid}_rawmaterial_rcvd`;
  const table = `${accountid}_material_outward_bag`;
  const historyTable = `${accountid}_rawmaterial_inward_history`;

  const { inward_number, bag_no, bags_loaded_for, kiln_loaded_bag_weight } = req.body;
  const day = getKolkataDayString(); // 'YYYY-MM-DD'

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // ✅ Pre-check: is this bag already loaded?
    const preCheck = await client.query(
      `SELECT 1 FROM ${table}
       WHERE inward_number = $1 AND bag_no = $2 AND kiln_feed_status = 'loaded'`,
      [inward_number, bag_no]
    );

    if (preCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Bag is already loaded in kiln" });
    }

    // ✅ 1. Mark bag as loaded
    await client.query(
      `UPDATE ${table} 
       SET kiln_load_time = current_timestamp,
           kiln = $3,
           kiln_feed_status = 'loaded',
           kiln_loaded_weight = $4 
       WHERE inward_number = $1 AND bag_no = $2`,
      [inward_number, bag_no, bags_loaded_for, kiln_loaded_bag_weight]
    );

    // ✅ 2. Check if all bags for this inward_number are loaded
    const checkResult = await client.query(
      `SELECT COUNT(*) FILTER (WHERE kiln_feed_status IS DISTINCT FROM 'loaded') AS pending
       FROM ${table}
       WHERE inward_number = $1
         AND grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
      [inward_number]
    );

    const pending = parseInt(checkResult.rows[0].pending, 10);

    if (pending === 0) {
      await client.query(
        `UPDATE ${rawtable}
         SET kiln_feed_status = 'completed',
             kiln_feed_status_upddt = current_timestamp,
             kiln_feed_userid = $2
         WHERE inward_number = $1`,
        [inward_number, userid]
      );
    }

    // ✅ 3. Update or insert into history
    const historyCheck = await client.query(
      `SELECT * FROM ${historyTable} WHERE inward_number = $1 AND day::date = $2`,
      [inward_number, day]
    );

    if (historyCheck.rowCount > 0) {
      // 🔄 Update existing history row
      await client.query(
        `UPDATE ${historyTable}
         SET kiln_loaded_weight = COALESCE(kiln_loaded_weight, 0) + $1,
             kiln_load_no_bags = COALESCE(kiln_load_no_bags, 0) + 1,
             Gcharcoal_stock = COALESCE(Gcharcoal_stock, 0) - $1
         WHERE inward_number = $2 AND day::date = $3`,
        [Number(kiln_loaded_bag_weight), inward_number, day]
      );
    } else {
      // ➕ Insert new row for today
      const latest = await client.query(
        `SELECT * FROM ${historyTable} WHERE inward_number = $1 ORDER BY day DESC LIMIT 1`,
        [inward_number]
      );

      const base = latest.rows[0] || {};

      const aggResult = await client.query(
        `SELECT 
           SUM(kiln_loaded_weight) AS total_weight
         FROM ${table}
         WHERE inward_number = $1 
           AND kiln_feed_status = 'loaded'
           AND grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')`,
        [inward_number]
      );

      const totalWeight = Number(aggResult.rows[0]?.total_weight || 0);
      const totalBags = 1; // reset for the day
      const newGCharcoalStock = (base.gcharcoal_weight_after_crusher || 0) - totalWeight;

      await client.query(
        `INSERT INTO ${historyTable}
          (day, inward_number, supplier_name, supplier_weight, weight_at_security,
           raw_material_inward_no_bags, raw_material_inward_weight, raw_material_inward_stock,
           raw_material_inward_loss_or_gain, raw_material_inward_status,
           raw_material_outward_status, raw_material_outward_no_bags,
           Gcharcoal_Weight_after_crusher, Physical_Loss_in_crusher, Total_weight_from_crusher,
           kiln_loaded_weight, kiln_load_no_bags, Gcharcoal_stock)
         VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8,
           $9, $10,
           $11, $12,
           $13, $14, $15,
           $16, $17, $18
         )`,
        [
          day,
          inward_number,
          base.supplier_name || '',
          base.supplier_weight || 0,
          base.weight_at_security || 0,
          base.raw_material_inward_no_bags || 0,
          base.raw_material_inward_weight || 0,
          base.raw_material_inward_stock || 0,
          base.raw_material_inward_loss_or_gain || 0,
          base.raw_material_inward_status || null,
          base.raw_material_outward_status || null,
          base.raw_material_outward_no_bags || 0,
          base.gcharcoal_weight_after_crusher || 0,
          base.physical_loss_in_crusher || 0,
          base.total_weight_from_crusher || 0,
          totalWeight,
          totalBags,
          newGCharcoalStock
        ]
      );
    }

    await client.query("COMMIT");
    res.json({ operation: 'success' });

  } catch (err) {
    console.error(new Date().toLocaleString(), ":", err);
    if (client) await client.query("ROLLBACK");
    res.status(500).json({ error: "Database error" });
  } finally {
    if (client) client.release();
  }
});



router.get("/kilnFeedTable", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_material_outward_bag`;
  try {

    const que =`SELECT 
    b.inward_number,
    b.bag_no,
    b.grade,
    b.weight,
    b.kiln,
    b.kiln_loaded_weight
  FROM 
    ${table} b
  WHERE 
    b.kiln_quality_updt is null and b.grade in ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')
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
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

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
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

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
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }


})


router.get("/inwardnumber_kilnfeedquality_select",authenticate, async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_material_outward_bag`;
    const que = `select distinct(inward_number) from ${table} where kiln_quality_updt is null and kiln_feed_status is not null and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') `
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/inwardnumber_kilnfeedquality_bag_no_select", authenticate,async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_material_outward_bag`;
    const que = `select bag_no from ${table} where kiln_feed_status is not null and inward_number = $1 and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') and kiln_quality_updt is null`
    const values = [req.query.inward_number];
    
    const result = await pool.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.post("/kilnfeedquality", authenticate,checkAccess('Operations.Kiln Feed Quality'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_material_outward_bag`;
    const que = `update ${table}
    set kiln_quality_updt = $12,
    grade_plus2 = $1,
    grade_2by3 = $2,
    grade_3by6 = $3,
    grade_6by8 =$4,
    grade_8by10 = $5,
    grade_10by12 = $6,
    grade_12by14 = $7,
    grade_minus14 = $8,
    feed_moisture = $8,
    dust = $9,
    feed_volatile = $10,
    remarks = $11,
    kiln_feed_quality_sysentry = current_timestamp,
    kiln_quality_updt_user = $14
    where bag_no = $13  `
    const values = [req.body.g_plus_2,req.body.g_2by3,req.body.g_3by6,req.body.g_6by8,req.body.g_8by10,
      req.body.g_10by12,req.body.g_12by14,req.body.g_minus_14,req.body.feed_moisture,
      req.body.dust,req.body.remarks,req.body.kiln_quality_entryDateTime,req.body.bag_no,userid];
  
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})


router.get("/destoningbagno",authenticate, async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_kiln_output`;
    const que = `select bag_no from ${table} where exkiln_stock = 'InStock' `
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/destoningbagno_out",authenticate, async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_kiln_output`;
    const que = `select bag_no from ${table} where exkiln_stock ='De-Stoning' `
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})


router.post("/destoning_in", authenticate,checkAccess('Operations.De-Stoning'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_kiln_output`;
    const que = `update ${table}
    set exkiln_stock = $1,
    destoning_in_user = $2,
    destoning_in_updt = current_timestamp,
    destoning_in_weight = $4
    where bag_no = $3  `
    const values = [req.body.exkiln_stock,userid,req.body.bag_no,req.body.bag_weight];
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.post("/destoning_out", authenticate,checkAccess('Operations.De-Stoning'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_kiln_output`;
    const que = `update ${table}
    set exkiln_stock = $1,
    destoning_out_user = $2,
    destoning_out_updt = current_timestamp,
    destoning_out_weight = $4,
    destoning_ctc = $5
    where bag_no = $3  `
    const values = [req.body.exkiln_stock,userid,req.body.bag_no,req.body.bag_weight,req.body.ctc];
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/kilntemp",authenticate, async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_kiln_temp`;
    const que = `select * from ${table} order by entry_dt desc limit 10 `
    const result = await pool.query(que);
    const rows = result.rows;
    const columns = result.fields.map((field) => ({
      field: field.name,
      headerName: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));
    res.json({ columns, rows });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.post("/kilntemp", authenticate,checkAccess('Operations.Kiln Temperature'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_kiln_temp`;
    const que = `insert into ${table}
    (temp_dt,
    kiln,
    t1,
    t2,
    t3,
    t4,
    chamber ,
    feed_rate ,
    kiln_rpm ,
    main_damper_open_per ,
    boiler_damper_open_per ,
    steam_pressure,
    remarks ,
    userid ,
    entry_dt  )
    values
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,current_timestamp)
     `
    const values = [req.body.temp_entryDateTime,
        req.body.kiln,
        req.body.t1,
        req.body.t2,
        req.body.t3,
        req.body.t4,
        req.body.chamber,
        req.body.feed_rate,
        req.body.kiln_rpm,
        req.body.main_damper_open_per,
        req.body.boiler_damper_open_per,
        req.body.steam_pressure,
        req.body.remarks,userid];
    
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/kilnFeedQuality", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_material_outward_bag`;
  try {

    const que =`SELECT 
    inward_number,
    bag_no,
    grade,
    weight,
    kiln,
    kiln_loaded_weight,grade_plus2,grade_2by3,grade_3by6,grade_6by8,grade_8by10,grade_10by12,grade_12by14,
    grade_minus14,feed_moisture,dust,feed_volatile,remarks,kiln_load_time,kiln_quality_updt
  FROM 
    ${table} 
  WHERE 
    kiln_quality_updt is not null and grade in ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')
    order by kiln_feed_quality_sysentry desc limit 10
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
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/kilnoutputbag_quality", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_kiln_output`;
  try {

    const que = `select bag_no from ${table} where quality_updt_time is null`
    
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})


router.post("/kilnoutputquality", authenticate,checkAccess('Operations.Kiln Output Quality'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_kiln_output`;
    const que = `update ${table}
    set quality_plus_3 = $1,
    quality_3by4 = $2,
    quality_4by8 = $3,
    quality_8by12 = $4,
    quality_12by30 = $5,
    quality_minus_30 = $6,
    quality_cbd = $7,
    quality_ctc = $8,
    quality_updt_user = $9,
    quality_updt_time = current_timestamp
    where bag_no = $10
     `
    const values = [req.body.quality_plus_3,
        req.body.quality_3by4,
        req.body.quality_4by8,
        req.body.quality_8by12,
        req.body.quality_12by30,
        req.body.quality_minus_30,
        req.body.quality_cbd,
        req.body.quality_ctc,
        userid,
        req.body.bag_no
        ];
    
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})


router.get("/de-stoning", authenticate,async (req, res) => {
  const {accountid} = req.user;
  const table = `${accountid}_kiln_output`;
  try {
    const result = await pool.query(`select kiln_output_dt,bag_no,destoning_out_user,destoning_out_updt,
    destoning_out_weight,destoning_ctc from ${table} where screening_inward_time is null`);
    const rows = result.rows;
    const columns = result.fields.map((field) => ({
      field: field.name,
      headerName: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));
    res.json({ columns, rows });
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.post('/destoning-update-cell', authenticate, checkAccess('Operations.De-Stoning'),async (req, res) => {
  const { primaryKeyField, primaryKeyValue, field, value } = req.body;
  const accountId = req.user.accountid; // or extract from token/session

  try {
    const tableName = `${accountId}_kiln_output`;

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