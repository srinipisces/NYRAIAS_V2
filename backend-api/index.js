
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



// --- final


/////---final
router.get("/rawmaterialbagque", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where material_inward_status is null"
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);

    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})






router.get("/charcoalstock", async(req,res) => {
  try {

    const que = "select * from charcoal_inStock"
    const result = await pool.query(que);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.get("/gcharcoalstock", async(req,res) => {
  try {

    const que = "select * from gcharcoal_stock"
    const result = await pool.query(que);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//// security
router.post("/materialatgate", authenticate, checkAccess("Operations.Security"), async (req, res) => {
  try {
    const { userid, accountid } = req.user;
    const {
      rawmaterial_entryDateTime,
      supplier,
      supplier_weight,
      supplier_value,
      supplier_dc_number,
      our_weight
    } = req.body;

    const table = `${accountid}_rawmaterial_rcvd`;

    // Create activity log
    const activities = [{
      timestamp: new Date().toISOString(),
      action: 'create',
      performedBy: userid,
    }];

    const text = `
      INSERT INTO ${table}
        (
          material_arrivaltime,
          supplier_name,
          supplier_weight,
          supplier_value,
          supplier_dc_number,
          our_weight,
          userid,
          deleted,
          activities
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, false, $8)
      RETURNING inward_number;
    `;

    const values = [
      rawmaterial_entryDateTime,
      supplier,
      Number(supplier_weight),
      Number(supplier_value || 0), // default to 0 if not provided
      supplier_dc_number,
      Number(our_weight),
      userid,
      JSON.stringify(activities)
    ];

    console.log("insert into material_inward_atgate", text, values);

    const result = await pool.query(text, values);
    const newInwardNumber = result.rows[0].inward_number;

    res.json({
      operation: 'success',
      inward_number: newInwardNumber
    });

  } catch (err) {
    console.error("Insert error in /materialatgate:", err);
    res.status(500).json({ operation: 'error', message: err.message });
  }
});

//---final
router.get("/RawMaterialIncoming", authenticate, async (req, res) => {
  try {
    const { accountid } = req.user;
    const table = `${accountid}_rawmaterial_rcvd`;

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
        lab_result AS lab_result_time 
      FROM ${table}
      WHERE lab_result IS NULL
    `;

    const result = await pool.query(query);
    const rows = result.rows;

    const columns = result.fields.map((field) => ({
      field: field.name,
      headerName: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flex: 1,
    }));

    res.json({ columns, rows });

  } catch (err) {
    console.error("Error in /RawMaterialIncoming:", err);
    res.status(500).json({ error: "Database error" });
  }
});


//----final
router.get("/inwnumforcrusheroutward",authenticate, async(req,res) => {
  const {accountid} = req.user
  const rawTable = `${accountid}_rawmaterial_rcvd`;
  const bagTable = `${accountid}_material_inward_bag`;
  try {

    const que = `select inward_number from ${rawTable} where material_outward_status is null and inward_number in (select inward_number from ${bagTable})`
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//crusher performance table data
router.get("/crusher-performance-inward",authenticate, async (req, res) => {
  const {accountid} = req.user
  const rawTable = `${accountid}_rawmaterial_rcvd`;
  const bagTable = `${accountid}_crusher_performance`;
  try {
    const result = await pool.query(`
      SELECT 
        a.inward_number,
        c.sample_from,
        c.grade_plus2,
        c.grade_2by3,
        c.grade_3by4,
        c.grade_4by6,
        c.grade_6by10,
        c.grade_10by12,
        c.grade_12by14,
        c.grade_minus14,
        c.moisture,
        c.dust
      FROM 
        ${rawTable} a
      LEFT JOIN 
        ${bagTable} c
      ON 
        a.inward_number = c.inward_number
      WHERE 
        a.material_inward_status IS NOT NULL 
        AND a.material_outward_status IS NULL;
    `);

    const columns = [
      { field: "inward_number", headerName: "Inward Number" },
      { field: "sample_from", headerName: "Sample From" },
      { field: "grade_plus2", headerName: "Grade +2" },
      { field: "grade_2by3", headerName: "Grade 2/3" },
      { field: "grade_3by4", headerName: "Grade 3/4" },
      { field: "grade_4by6", headerName: "Grade 4/6" },
      { field: "grade_6by10", headerName: "Grade 6/10" },
      { field: "grade_10by12", headerName: "Grade 10/12" },
      { field: "grade_12by14", headerName: "Grade 12/14" },
      { field: "grade_minus14", headerName: "Grade -14" },
      { field: "moisture", headerName: "Moisture" },
      { field: "dust", headerName: "Dust" },
    ];

    res.json({
      columns,
      rows: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post(
  "/crusherperformance",
  authenticate,
  checkAccess("Operations.Crusher Performance"),
  async (req, res) => {
    const { userid, accountid } = req.user;

    try {
      const tname = `${accountid}_crusher_performance`;

      const text = `
        INSERT INTO ${tname} (
          inward_number,
          grade_plus2,
          grade_2by3,
          grade_3by4,
          grade_4by6,
          grade_6by10,
          grade_10by12,
          grade_12by14,
          grade_minus14,
          moisture,
          dust,
          sample_from,
          userid
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13
        )
      `;

      const values = [
        req.body.inward_number,
        Number(req.body.grade_plus2),
        Number(req.body.grade_2by3),
        Number(req.body.grade_3by4),
        Number(req.body.grade_4by6),
        Number(req.body.grade_6by10),
        Number(req.body.grade_10by12),
        Number(req.body.grade_12by14),
        Number(req.body.grade_minus14),
        Number(req.body.moisture),
        Number(req.body.dust),
        req.body.sample_from,
        userid,
      ];

      console.log(text, values);

      await pool.query(text, values);

      res.json({ operation: "success" });
    } catch (err) {
      console.error("Crusher Performance Insert Error:", err);
      res.status(500).json({ operation: "error", message: err.message });
    }
  }
);






// final


//Final----


//final.....



//----final

// final

// final

//final..
router.get("/BoilerPerformance", authenticate,checkAccess('Operations.Boiler Performance'),async (req, res) => {
  const {accountid} = req.user;
  const table = `${accountid}_boiler_performance`;
  try {
    const result = await pool.query(`select * from ${table}`);
    

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
// final
router.post("/BoilerPerformance", authenticate,checkAccess('Operations.Boiler Performance'),async(req,res) => {
  try {
    const {userid,accountid} = req.user
    const table = `${accountid}_boiler_performance`;
    const que = `insert into ${table} (
      boiler_perf_entryDateTime,
      boiler_number,
      boiler_pressure,
      boiler_inlet_temperature,
      boiler_outlet_temperature,
      feed_pump,
      blower_open,
      fan_damper_open,
      id_fan_rpm,
      remarks,
      userid
    ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) `
    const values = [req.body.boiler_perf_entryDateTime,req.body.boiler_number,
      req.body.boiler_pressure,req.body.boiler_inlet_temperature,
      req.body.boiler_outlet_temperature,req.body.feed_pump,
      req.body.blower_open,req.body.fan_damper_open,
      req.body.id_fan_rpm,req.body.remarks,userid];
    console.log(values,que)
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//final


//final



//--final.---


// final


// final


// final



router.get("/stock_in_hand", async (req, res) => {
  try {
    const result = await pool.query("select * from stock_in_hand_report");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});



router.get("/supplier_performance", async (req, res) => {
  try {
    const result = await pool.query("select * from supplier_performance_1");
    res.json({ data: assignDeliveryOrder(result.rows) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
router.get("/rawmaterial_in_hand", async (req, res) => {
  try {
    const result = await pool.query("select supplier_name,inward_number, sum weight from raw_material_stock;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/spot_results", async (req, res) => {
  try {
    const result = await pool.query("select * from spot_results sr  group by sr.kiln,sr.id order by event_datetime  desc, event_timestamp desc limit 3;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/kiln_performance", async (req, res) => {
  try {
    const result = await pool.query("select * from kiln_performance  group by event_datetime , kiln, id order by event_datetime desc limit 3;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/new_inward_number_list", async (req, res) => {
  try {
    const result = await pool.query("select inward_number from charcoal_inStock where moisture is null;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/gennew_inward_number", async (req, res) => {
  try {
    const result = await pool.query("select nextval('Inward_Number');");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/inward_number_list_forcrusher", async (req, res) => {
  try {
    const result = await pool.query("select inward_number from charcoal_inStock where moisture is not null;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/gennew_bag_id", async (req, res) => {
  try {
    const result = await pool.query("select * from kiln_performance  group by event_datetime , kiln, id order by event_datetime desc limit 3;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});





function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function assignDeliveryOrder(data) {
      // Group records by supplier and timestamp
      console.log("here..");
      const grouped = {};
  
      data.forEach(item => {
      const key = item.suppliername + "|" + item.event_timestamp;
      if (!grouped[key]) {
          grouped[key] = [];
      }
      grouped[key].push(item);
      });
  
      // Organize by supplier and sort by timestamp
      const supplierMap = {};
  
      Object.keys(grouped).forEach(key => {
      const [supplier, timestamp] = key.split("|");
      if (!supplierMap[supplier]) {
          supplierMap[supplier] = [];
      }
      supplierMap[supplier].push({ timestamp, records: grouped[key] });
      });
  
      // Assign delivery order
      const output = [];
  
      Object.entries(supplierMap).forEach(([supplier, entries]) => {
      entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      entries.forEach((entry, index) => {
          const label = getOrdinal(index + 1);
          entry.records.forEach(record => {
          output.push({ ...record, delivery: label });
          });
      });
      });
  
      return output;
}







module.exports = router;








