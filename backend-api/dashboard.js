const express = require('express');
const router = express.Router();
const pool = require('./db');
const { authenticate } = require('./authenticate');
const checkAccess = require('./checkaccess');

router.get("/rawmaterial", authenticate,async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_rawmaterial_rcvd`
    const table1 = `${accountid}_material_inward_bag`
    const que = `SELECT 
        a.inward_number,
        a.supplier_name,
        a.moisture,
        a.dust,
        a.ad_value,
        a.our_weight - COALESCE(b.total_weight, 0) AS weight
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
        a.material_inward_status IS NULL;
      `
    const result = await pool.query(que);

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
    

    res.json({ data : {Charcoal_chartData,Charcoal_chart_keys,Charcoal_stock,labTestData, }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.get("/gcharcoal", authenticate,async(req,res) => {
  try {
    const {accountid} = req.user;
    const table2 = `${accountid}_material_outward_bag`
        const que1 = `SELECT
            a.inward_number,
            b.supplier_name,

            -- Component weights
            SUM(CASE WHEN a.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS weight,
            SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) AS total_stone_weight,
            SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) AS total_unburnt_weight,
            SUM(CASE WHEN a.grade like '-20%' THEN a.weight ELSE 0 END) AS total_minus_weight,

            -- Total (all grades combined)
            SUM(a.weight) AS total_weight,

            -- Percentages relative to total weight
            ROUND(SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_stone,
            ROUND(SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_unburnt,
            ROUND(SUM(CASE WHEN a.grade like '-20%' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_minus20

            FROM ${accountid}_material_outward_bag a
            LEFT JOIN ${accountid}_rawmaterial_rcvd b
            ON a.inward_number = b.inward_number
            WHERE a.kiln_feed_status IS NULL
            and b.kiln_feed_status is null
            GROUP BY a.inward_number, b.supplier_name
            ORDER BY a.inward_number;`

    /* const que1 =   `SELECT 
        a.inward_number, 
        SUM(a.weight) AS weight, 
        b.supplier_name
      FROM ${table2} a
      LEFT JOIN samcarbon_rawmaterial_rcvd b 
        ON a.inward_number = b.inward_number
      WHERE 
        a.grade NOT IN ('Stones', 'Unburnt') 
        AND a.kiln_feed_status IS NULL
      GROUP BY 
        a.inward_number, 
        b.supplier_name;` */

    const result1 = await pool.query(que1);
    const RawData1 = result1.rows
    const GCharcoal_stock = RawData1.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    const GCharcoal_chartData = Object.values(groupBySupplierAndInwardWeight(RawData1));
    const allInwards1 = new Set(RawData1.map(d => d.inward_number.replace(/\s+/g, '')));
    const GCharcoal_chart_keys = Array.from(allInwards1);

    const GCharcoal_percent_stacked = RawData1.map(row => ({
        supplier_name: row.supplier_name,
        inward_number: row.inward_number,
        percent_gcharcoal: parseFloat(row.percent_gcharcoal),
        percent_stone: parseFloat(row.percent_stone),
        percent_unburnt: parseFloat(row.percent_unburnt),
        percent_minus20: parseFloat(row.percent_minus20)
        }));

    res.json({ data : {GCharcoal_chartData,GCharcoal_chart_keys,GCharcoal_stock,GCharcoal_percent_stacked }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.get("/kilnstock", authenticate,async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_kiln_output`
    const que = `select from_the_kiln as kiln,sum(weight_with_stones) as weight from ${table} where exkiln_stock = 'InStock' group by from_the_kiln; `
    const result = await pool.query(que);

    const RawData = result.rows
    const exkiln_stock = RawData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    const exkiln_chartData = RawData;    

    res.json({ data : {exkiln_chartData,exkiln_stock }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})

router.get("/gradeinstock", authenticate,async(req,res) => {
  try {
    const {accountid} = req.user;
    const table = `${accountid}_screening_outward`
    const que = `select grade,sum(weight) as weight from ${table} where delivery_status = 'InStock' group by grade; `
    const result = await pool.query(que);

    const RawData = result.rows
    const grade_stock = RawData.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    const grade_chartData = RawData;    

    res.json({ data : {grade_chartData,grade_stock }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
})



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

module.exports = router;