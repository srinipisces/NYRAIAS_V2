const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { getKolkataDayString, formatToKolkataDay } = require('./date');
const checkAccess= require('./checkaccess.js');

// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');

router.get("/inwardnumber_outward_select", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_rawmaterial_rcvd`;
  const table1 = `${accountid}_material_inward_bag`;

  try {
    const query = `
      SELECT DISTINCT b.inward_number
        FROM ${table1} a
        JOIN ${table} b
          ON a.inward_number = b.inward_number
        WHERE b.material_outward_status IS NULL 
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

router.post("/crusheroutput", authenticate, checkAccess('Operations.Raw-Material Outward'), async (req, res) => {
  const { userid, accountid } = req.user;
  const { inward_number, outward_grade, bag_weight } = req.body;

  const bagTable = `${accountid}_material_outward_bag`;
  const rawTable = `${accountid}_rawmaterial_rcvd`;
  const historyTable = `${accountid}_rawmaterial_inward_history`;

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const statusCheck = await client.query(
      `SELECT material_outward_status FROM ${rawTable} WHERE inward_number = $1`,
      [inward_number]
    );

    if (statusCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Inward number not found" });
    }

    if (statusCheck.rows[0].material_outward_status === 'Completed') {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "No action - Outward status is complete" });
    }

    const insertBag = await client.query(
      `INSERT INTO ${bagTable} (inward_number, grade, weight, userid)
       VALUES ($1, $2, $3, $4)
       RETURNING bag_no`,
      [inward_number, outward_grade, Number(bag_weight), userid]
    );

    const bag_no = insertBag.rows[0].bag_no;

    await client.query(
      `UPDATE ${rawTable} SET kiln_feed_status = NULL WHERE inward_number = $1`,
      [inward_number]
    );

    const day = getKolkataDayString();

    const historyCheck = await client.query(
      `SELECT * FROM ${historyTable} WHERE inward_number = $1 AND day::date = $2`,
      [inward_number, day]
    );

    if (historyCheck.rowCount > 0) {
      const updateField =
        ['Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B'].includes(outward_grade)
          ? 'Gcharcoal_Weight_after_crusher'
          : 'Physical_Loss_in_crusher';

      const isGcharcoal = updateField === 'Gcharcoal_Weight_after_crusher';

      await client.query(
        `UPDATE ${historyTable}
        SET raw_material_outward_no_bags = COALESCE(raw_material_outward_no_bags, 0) + 1,
            ${updateField} = COALESCE(${updateField}, 0) + $1,
            Total_weight_from_crusher = COALESCE(Total_weight_from_crusher, 0) + $1
            ${isGcharcoal ? ', Gcharcoal_stock = COALESCE(Gcharcoal_Weight_after_crusher, 0) + $1' : ''}
        WHERE inward_number = $2 AND day::date = $3`,
        [Number(bag_weight), inward_number, day]
      );

    } else {
      const latest = await client.query(
        `SELECT * FROM ${historyTable} WHERE inward_number = $1 ORDER BY day DESC LIMIT 1`,
        [inward_number]
      );

      const baseRow = latest.rows[0] || {};

      const weightField = ['Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B'].includes(outward_grade)
        ? 'Gcharcoal_Weight_after_crusher'
        : 'Physical_Loss_in_crusher';

      const Gcharcoal_Weight_after_crusher = weightField === 'Gcharcoal_Weight_after_crusher' ? Number(bag_weight) : 0;
      const Physical_Loss_in_crusher = weightField === 'Physical_Loss_in_crusher' ? Number(bag_weight) : 0;
      const Total_weight_from_crusher = Gcharcoal_Weight_after_crusher+Physical_Loss_in_crusher;
      await client.query(
        `INSERT INTO ${historyTable}
          (day, inward_number, supplier_name, supplier_weight, weight_at_security,
           raw_material_inward_no_bags, raw_material_outward_no_bags,
           Gcharcoal_Weight_after_crusher, Physical_Loss_in_crusher,Gcharcoal_stock,Total_weight_from_crusher)
         VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8,$9,$10)`,
        [
          day,
          inward_number,
          baseRow.supplier_name || '',
          baseRow.supplier_weight || 0,
          baseRow.weight_at_security || 0,
          baseRow.raw_material_inward_no_bags || 0,
          Gcharcoal_Weight_after_crusher,
          Physical_Loss_in_crusher,
          Gcharcoal_Weight_after_crusher,
          Total_weight_from_crusher
        ]
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({ success: true, bag_no });
  } catch (error) {
    console.error("Insert error in /crusheroutput:", error);
    if (client) await client.query("ROLLBACK");
    return res.status(500).json({ error: "Server error during crusher output processing" });
  } finally {
    if (client) client.release();
  }
});


router.put("/materialoutwardcomplete", authenticate, async (req, res) => {
  const { userid, accountid } = req.user;
  const { inward_number, remark } = req.body;

  const rcvdTable = `${accountid}_rawmaterial_rcvd`;
  const bagTable = `${accountid}_material_outward_bag`;
  const historyTable = `${accountid}_rawmaterial_inward_history`;

  const day = getKolkataDayString(); // e.g. '2025-07-27'

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // 1. Pre-check if already completed
    const checkStatus = await client.query(
      `SELECT material_outward_status FROM ${rcvdTable} WHERE inward_number = $1`,
      [inward_number]
    );

    if (checkStatus.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Inward number not found" });
    }

    if (checkStatus.rows[0].material_outward_status === 'Completed') {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Already marked as completed" });
    }

    // 2. Mark as Completed
    await client.query(
      `UPDATE ${rcvdTable}
       SET material_outward_status = 'Completed',
           material_outward_remarks = $2,
           material_outward_status_upddt = CURRENT_TIMESTAMP,
           material_outward_userid = $3
       WHERE inward_number = $1`,
      [inward_number, remark, userid]
    );

    // 3. Check if history row exists for today
    const historyCheck = await client.query(
      `SELECT * FROM ${historyTable} WHERE inward_number = $1 AND day::date = $2`,
      [inward_number, day]
    );

    if (historyCheck.rowCount > 0) {
      // 4. Get total bag weight for that inward
      const sumResult = await client.query(
        `SELECT SUM(weight) AS total FROM ${bagTable} WHERE inward_number = $1`,
        [inward_number]
      );

      const totalWeight = Number(sumResult.rows[0]?.total || 0);

      // 5. Update history with outward status and total
      await client.query(
        `UPDATE ${historyTable}
         SET raw_material_outward_status = 'Completed',
             Total_weight_from_crusher = $1
         WHERE inward_number = $2 AND day::date = $3`,
        [totalWeight, inward_number, day]
      );
    }

    await client.query("COMMIT");
    return res.status(200).json({
      operation: 'success',
      message: 'Material outward marked as completed',
    });
  } catch (err) {
    console.error("Error in /materialoutwardcomplete:", err);
    if (client) await client.query("ROLLBACK");
    res.status(500).json({ operation: 'error', message: err.message });
  } finally {
    if (client) client.release();
  }
});


module.exports = router;