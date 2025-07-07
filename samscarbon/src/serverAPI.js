import express from "express";
import cors from "cors";
import { Client } from "pg";

const port = 8000;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// PostgreSQL client
const client = new Client({
  host: "sam-carbons-db.ct6oskiisvfb.eu-north-1.rds.amazonaws.com",
  database: "sam-carbons-db",
  user: "postgresadmin",
  password: "kondadam123#",
  port: 5432, // default PostgreSQL port
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect()
  .then(() => console.log("✅ Connected to DB"))
  .catch(err => console.error("❌ Failed to connect:", err.message));


// Get the suppliers short name list -- Final
app.get("/api/supplierslist", async(req,res) => {
  try {

    const que = "select supplier_shortname from suppliers"
    const result = await client.query(que);
    const supplierlist = result.rows.map(row => row.supplier_shortname);

    res.json(supplierlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// Get the Inward Number where lab test is not done -- final
app.get("/api/inwardlabque", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where lab_result is null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);

    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// --- final
app.get("/api/inwardweightsummary", async (req, res) => {
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
  rawmaterial_rcvd r
LEFT JOIN (
  SELECT
    inward_number,
    SUM(weight) AS total_weight,
    COUNT(*) AS bag_count
  FROM
    material_inward_bag
  WHERE
    inward_number = $1
  GROUP BY
    inward_number
) m ON r.inward_number = m.inward_number
WHERE
  r.inward_number = $1; `


  try {
    const result = await client.query(query, [inwardNumber]); // db is your pg client
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/////---final
app.get("/api/rawmaterialbagque", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where material_inward_status is null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);

    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})




//---final
app.get("/api/RawMaterialIncoming", async (req, res) => {
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
        lab_result AS lab_result_time 
      FROM rawmaterial_rcvd 
      WHERE lab_result IS NULL
    `;

    const result = await client.query(query);

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

//---final
app.get("/api/LabTest_Table", async (req, res) => {
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
        lab_result AS lab_result_time 
      FROM rawmaterial_rcvd 
      WHERE material_inward_status IS NULL
    `;

    const result = await client.query(query);

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

//---final
app.get("/api/material-inward-bagging", async (req, res) => {
  try {
    const result = await client.query(`
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
        rawmaterial_rcvd a
      LEFT JOIN 
        material_inward_bag b 
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
        bag_update_time: r.bag_update_time, // <-- match key in frontend
      });
    }

    const columns = [
      { field: "inward_number", headerName: "Inward Number" },
      { field: "supplier_name", headerName: "Supplier" },
      { field: "material_arrivaltime", headerName: "Arrival Time" },
      { field: "material_inward_status", headerName: "Inward Status" },
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

//---final
app.get("/api/material-outward-bagging", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        a.inward_number, 
        a.supplier_name, 
        a.material_arrivaltime, 
        a.material_outward_status,
        b.bag_no, 
        b.grade,
        b.weight AS bag_weight, 
        b.write_timestamp AS bag_update_time
      FROM 
        rawmaterial_rcvd a
      LEFT JOIN 
        material_outward_bag b 
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


app.get("/api/dashboard", async(req,res) => {
  try {

    const que = "select * from charcoal_inStock"
    const result = await client.query(que);

    const RawData = result.rows
    const Charcoal_stock = RawData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    const Charcoal_chartData = Object.values(groupBySupplierAndInwardWeight(RawData));
    const allInwards = new Set(RawData.map(d => d.inward_number.replace(/\s+/g, '')));
    const Charcoal_chart_keys = Array.from(allInwards);
    const labTestData = RawData.map(({ inward_number, moisture, dust, ad_value }) => ({
      inward_number,
      moisture,
      dust,
      ad_value
    }));

    const que1 = "select * from gcharcoal_stock"
    const result1 = await client.query(que1);
    console.log(result1.rows)

    const RawData1 = result1.rows
    const GCharcoal_stock = RawData1.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    const GCharcoal_chartData = Object.values(groupBySupplierAndInwardWeight(RawData1));
    const allInwards1 = new Set(RawData1.map(d => d.inward_number.replace(/\s+/g, '')));
    const GCharcoal_chart_keys = Array.from(allInwards1);


    res.json({ data : {Charcoal_chartData,Charcoal_chart_keys,Charcoal_stock,labTestData,GCharcoal_chartData,GCharcoal_chart_keys,GCharcoal_stock }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})


app.get("/api/charcoalstock", async(req,res) => {
  try {

    const que = "select * from charcoal_inStock"
    const result = await client.query(que);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

app.get("/api/gcharcoalstock", async(req,res) => {
  try {

    const que = "select * from gcharcoal_stock"
    const result = await client.query(que);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//// final from security
app.post("/api/materialatgate", async (req, res) => {
  try {
    const text = `
    INSERT INTO rawmaterial_rcvd
      (
       material_arrivaltime,
       supplier_name,
       supplier_weight,
       supplier_value,
       supplier_dc_number,
       our_weight,
       userid)
    VALUES
      (
       $1,                     -- event_datetime
       $2,                     -- supplier_name
       $3,                     -- supplier_weight
       $4,                     -- supplier_value
       $5,                     -- supplier_dc_number
       $6,                     -- our_weight 
       $7)                     -- userid
    RETURNING inward_number;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.rawmaterial_entryDateTime,  // should be in ISO format or a JS Date that Postgres can parse
      req.body.supplier,
      Number(req.body.supplier_weight),
      Number(req.body.supplier_value),
      req.body.supplier_dc_number,
      Number(req.body.our_weight),
      'test_user'
    ];
    console.log("insert into material_inward_atgate",text,values)
      
    const result = await client.query(text, values);
    const newInwardNumber = result.rows[0].inward_number;
    res.json({
      operation: 'success',
      inward_number: newInwardNumber
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ operation: 'error', message: err.message });
  }
});

//-final
app.post("/api/crusheroutput", async (req, res) => {
  try {
    const text = `
    INSERT INTO material_outward_bag
    (
      inward_number,
      grade,
      weight,
      userid
    ) VALUES (
      $1,                     
      $2,                     
      $3,
      'test'                     
    )                     
    RETURNING bag_no;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.inward_number,  // should be in ISO format or a JS Date that Postgres can parse
      req.body.outward_grade,
      Number(req.body.bag_weight)
    ];
    console.log (text,values);
    const result = await client.query(text, values);
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

//---final...
app.post("/api/crusherload", async (req, res) => {
  try {
    const text = `
    INSERT INTO material_inward_bag
    (
      inward_number,
      weight,
      userid
    ) VALUES (
      $1,                                          
      $2,
      'test'                     
    )                     
    RETURNING bag_no;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.inward_number,  // should be in ISO format or a JS Date that Postgres can parse
      Number(req.body.bag_weight)
    ];
    console.log (text,values);
    const result = await client.query(text, values);
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

//---final
app.put("/api/materialinwardcomplete", async (req, res) => {
  const userid = 'test'
  try {
    const text = `
      UPDATE rawmaterial_rcvd
      SET material_inward_status = 'Completed',material_inward_remarks = $2,
      material_inward_status_upddt = current_timestamp, material_inward_userid = $3
      WHERE inward_number = $1
    `;
    const values = [req.body.inward_number,req.body.remark,userid];

    console.log(text, values);

    const result = await client.query(text, values);
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

//---final
app.put("/api/materialoutwardcomplete", async (req, res) => {
  const userid = 'test'
  try {
    const text = `
      UPDATE rawmaterial_rcvd
      SET material_outward_status = 'Completed',material_outward_remarks = $2,
      material_outward_status_upddt = current_timestamp, material_outward_userid = $3
      WHERE inward_number = $1
    `;
    const values = [req.body.inward_number,req.body.remark,userid];

    console.log(text, values);

    const result = await client.query(text, values);
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

//---final
app.get("/api/inwardnumberbagging", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where lab_result is not null and material_inward_status is null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//---final
app.get("/api/inwardnumber_outward_select", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where material_inward_status is not null and material_outward_status is null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// --- final
app.get("/api/outwardweightsummary", async (req, res) => {
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
  rawmaterial_rcvd r
LEFT JOIN (
  SELECT
    inward_number,
    SUM(weight) AS total_weight,
    COUNT(*) AS bag_count
  FROM
    material_outward_bag
  WHERE
    inward_number = $1
  GROUP BY
    inward_number
) m ON r.inward_number = m.inward_number
WHERE
  r.inward_number = $1; `


  try {
    const result = await client.query(query, [inwardNumber]); // db is your pg client
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


//----final
app.get("/api/inwnumforcrusheroutward", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where material_inward_status is not null and material_outward_status is null and inward_number not in (select inward_number from crusher_performance)"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//crusher performance table data
app.get("/api/crusher-performance-inward", async (req, res) => {
  try {
    const result = await client.query(`
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
        rawmaterial_rcvd a
      LEFT JOIN 
        crusher_performance c
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

app.post("/api/crusherperformance", async (req, res) => {
  try {
    const text = `
    INSERT INTO crusher_performance
    (
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
      sample_from
    ) VALUES (
      $1,                                          
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12                     
    )                     
  `;
    const values = [
      req.body.inward_number,  // should be in ISO format or a JS Date that Postgres can parse
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
      req.body.sample_from
    ];
    console.log (text,values);
    const result = await client.query(text, values);
    
    res.json({
      operation: 'success',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ operation: 'error', message: err.message });
  }
});

// update inward number lab test results..
app.post("/api/inwardlabtest", async (req, res) => {
  try {
    const query = `
      UPDATE rawmaterial_rcvd
      SET
        moisture = $1,
        dust = $2,
        ad_value = $3,
        lab_result = CURRENT_TIMESTAMP
      WHERE inward_number = $4
    `;

    const values = [
      req.body.moisture,
      req.body.dust,
      req.body.ad_value,
      req.body.inward_number
    ];

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inward number not found" });
    }

    res.json({ operation: 'success' });
  } catch (err) {
    console.error("Error updating rawmaterial_rcvd:", err);
    res.status(500).json({ error: "Database error" });
  }
});


//----final
app.get("/api/inwardnumber_kilnfeed_select", async(req,res) => {
  try {

    const que = "select inward_number from rawmaterial_rcvd where material_outward_status is not null and kiln_feed_status is null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})
// final
app.get("/api/inwardnumber_kilnfeed_bag_no_select", async(req,res) => {
  try {

    const que = "select bag_no from material_outward_bag where kiln_feed_status is null and inward_number = $1 and grade not in('Stones','Unburnt')"
    const values = [req.query.inward_number];
    console.log(values,que)
    const result = await client.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//Final----
app.get("/api/kilnFeedTable", async(req,res) => {
  try {

    const que =`SELECT 
    b.inward_number,
    b.bag_no,
    b.weight,
    b.kiln
  FROM 
    material_outward_bag b
  WHERE 
    b.kiln_quality_updt is null and b.grade not in ('Stones','Unburnt')
    `
    
    const result = await client.query(que);
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

//final.....
app.post("/api/kilnfeed", async (req, res) => {
  try {
    const { inward_number, bag_no, bags_loaded_for } = req.body;

    const ins_columns = `update material_outward_bag 
    set kiln_load_time = current_timestamp,
    kiln = $3, kiln_feed_status = 'loaded' 
    where inward_number = $1 and bag_no =$2`
    

    await client.query("BEGIN");

    // Insert the kiln feed record
    await client.query(
      `${ins_columns}`,
      [inward_number, bag_no, bags_loaded_for]
    );


    // Check if all bags for this inward_number are loaded
    const checkResult = await client.query(
      `SELECT COUNT(*) FILTER (WHERE kiln_feed_status IS DISTINCT FROM 'loaded') AS pending
       FROM material_outward_bag
       WHERE inward_number = $1 and grade not in('Stones','Unburnt')`,
      [inward_number]
    );

    const pending = parseInt(checkResult.rows[0].pending, 10);

    // If no pending bags, mark rawmaterial_rcvd as 'completed'
    if (pending === 0) {
      await client.query(
        `UPDATE rawmaterial_rcvd
         SET kiln_feed_status = 'completed',
         kiln_feed_status_upddt = current_timestamp,
         kiln_feed_userid = 'test'
         WHERE inward_number = $1`,
        [inward_number]
      );
    }

    await client.query("COMMIT");

    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Database error" });
  }
});


//----final
app.get("/api/inwardnumber_kilnfeedquality_select", async(req,res) => {
  try {

    const que = "select distinct(inward_number) from material_outward_bag where kiln_quality_updt is null and kiln_feed_status is not null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.inward_number);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})
// final
app.get("/api/inwardnumber_kilnfeedquality_bag_no_select", async(req,res) => {
  try {

    const que = "select bag_no from material_outward_bag where kiln_feed_status is not null and inward_number = $1 and grade not in('Stones','Unburnt')"
    const values = [req.query.inward_number];
    console.log(values,que)
    const result = await client.query(que,values);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})
// final
app.post("/api/kilnfeedquality", async(req,res) => {
  try {

    const que = `update material_outward_bag 
    set kiln_quality_updt = current_timestamp,
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
    kiln_feed_quality_entry = $12
    where bag_no = $13  `
    const values = [req.body.g_plus_2,req.body.g_2by3,req.body.g_3by6,req.body.g_6by8,req.body.g_8by10,
      req.body.g_10by12,req.body.g_12by14,req.body.g_minus_14,req.body.feed_moisture,
      req.body.dust,req.body.remarks,req.body.kiln_quality_entryDateTime,req.body.bag_no];
    console.log(values,que)
    const result = await client.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})
//final..
app.get("/api/BoilerPerformance", async (req, res) => {
  try {
    const result = await client.query("select * from boiler_performace");
    

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
app.post("/api/BoilerPerformance", async(req,res) => {
  try {

    const que = `insert into boiler_performace (
      boiler_perf_entryDateTime,
      boiler_number,
      boiler_pressure,
      boiler_inlet_temperature,
      boiler_outlet_temperature,
      feed_pump,
      blower_open,
      fan_damper_open,
      vfd_rpm,
      remarks
    ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) `
    const values = [req.body.boiler_perf_entryDateTime,req.body.boiler_number,
      req.body.boiler_pressure,req.body.boiler_inlet_temperature,
      req.body.boiler_outlet_temperature,req.body.feed_pump,
      req.body.blower_open,req.body.fan_damper_open,
      req.body.vfd_rpm,req.body.remarks];
    console.log(values,que)
    const result = await client.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

//final
app.post("/api/kilnoutput", async (req, res) => {

  try {
    const text = `
    INSERT INTO kiln_output
      (
       write_timestamp,
       kiln_output_dt,
       from_the_kiln,
       weight_with_stones,
       remarks)
    VALUES
      (
       current_timestamp,
       $1,                     
       $2,                     
       $3,                    
       $4                                    
       )                     
    RETURNING bag_no;  -- grab the generated alphanumeric ID
  `;
    const values = [
      req.body.kiln_output_entryDateTime,
      req.body.kiln,
      req.body.bag_weight,
      req.body.remarks
    ];
    console.log("insert into " ,text,values)
      
    const result = await client.query(text, values);
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

//final
app.get("/api/kilnoutput", async (req, res) => {

  try {
    const result = await client.query("select * from kiln_output where screening_inward_time is null");
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


//--final.---
app.get("/api/ScreeningInwardTable", async (req, res) => {

  try {
    const result = await client.query(`SELECT * 
    FROM kiln_output 
    WHERE screening_inward_time IS NOT NULL 
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

// final
app.post("/api/ScreeningInward", async(req,res) => {
  try {

    const que = `update kiln_output 
    set screening_inward_time = $1,
    screening_inward_kiln = $2,
    grade = $4,
    ctc = $5,
    machine =$6,
    output_required = $7  
    where bag_no = $3`

    const values = [req.body.date_time,
      req.body.kiln,
      req.body.bag_no,
      req.body.grade,
      req.body.ctc,
      req.body.machine,
      req.body.output_required];
    console.log(values,que)
    const result = await client.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// final
app.get("/api/screeninginwardbagno", async(req,res) => {
  try {

    const que = "select bag_no from kiln_output where screening_inward_time is null"
    const result = await client.query(que);
    const inwardNumbers = result.rows.map(row => row.bag_no);
    res.json(inwardNumbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// final
app.post("/api/ScreeningOutward", async(req,res) => {
  try {

    const que = `insert into screening 
    (updt,screening_out_dt,weight,grade,machine)
    values (current_timestamp,$1,$2,$3,$4)
    `

    const values = [req.body.date_time,
      req.body.weight,
      req.body.grade,
      req.body.machine];
    console.log(values,que)
    const result = await client.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

// final
app.get("/api/ScreeningOutward", async(req,res) => {

    try {
      const result = await client.query(`SELECT * 
      FROM screening 
      ORDER BY updt DESC 
      LIMIT 50;
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


app.get("/api/stock_in_hand", async (req, res) => {
  try {
    const result = await client.query("select * from stock_in_hand_report");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});



app.get("/api/supplier_performance", async (req, res) => {
  try {
    const result = await client.query("select * from supplier_performance_1");
    res.json({ data: assignDeliveryOrder(result.rows) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/rawmaterial_in_hand", async (req, res) => {
  try {
    const result = await client.query("select supplier_name,inward_number, sum weight from raw_material_stock;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/spot_results", async (req, res) => {
  try {
    const result = await client.query("select * from spot_results sr  group by sr.kiln,sr.id order by event_datetime  desc, event_timestamp desc limit 3;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/kiln_performance", async (req, res) => {
  try {
    const result = await client.query("select * from kiln_performance  group by event_datetime , kiln, id order by event_datetime desc limit 3;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/new_inward_number_list", async (req, res) => {
  try {
    const result = await client.query("select inward_number from charcoal_inStock where moisture is null;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/gennew_inward_number", async (req, res) => {
  try {
    const result = await client.query("select nextval('Inward_Number');");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/inward_number_list_forcrusher", async (req, res) => {
  try {
    const result = await client.query("select inward_number from charcoal_inStock where moisture is not null;");
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/gennew_bag_id", async (req, res) => {
  try {
    const result = await client.query("select * from kiln_performance  group by event_datetime , kiln, id order by event_datetime desc limit 3;");
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


function groupBySupplierAndInwardWeight(rawData) {
  const grouped = {};

  rawData.forEach(item => {
    const supplier = item.supplier_name;
    const inwardKey = item.inward_number.replace(/\s+/g, ''); // Normalize key
    const weight = parseFloat(item.weight) || 0;

    if (!grouped[supplier]) {
      grouped[supplier] = { supplier_name: supplier };
    }

    grouped[supplier][inwardKey] = (grouped[supplier][inwardKey] || 0) + weight;
  });

  return grouped;
}


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});