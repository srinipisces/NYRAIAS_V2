const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

const { getKolkataDayString, formatToKolkataDay } = require('./date');

// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');


router.get("/inwardnumber", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_rawmaterial_rcvd`;

  try {
    const query = `
      SELECT inward_number 
      FROM ${table} 
      WHERE lab_result IS NOT NULL AND material_inward_status IS NULL and admit_load != 'Deny'
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


router.post("/crusherload", authenticate, checkAccess('Operations.Raw-Material Inward'), async (req, res) => {
  const { accountid, userid } = req.user;
  const bagTable = `${accountid}_material_inward_bag`;
  const rcvdTable = `${accountid}_rawmaterial_rcvd`;
  const historyTable = `${accountid}_rawmaterial_inward_history`;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { inward_number, bag_weight } = req.body;
    const weight = Number(bag_weight);
    const day = getKolkataDayString();

    // ✅ Pre-check: Is this inward already completed?
    const statusCheck = await client.query(
      `SELECT material_inward_status FROM ${rcvdTable} WHERE inward_number = $1`,
      [inward_number]
    );

    if (statusCheck.rowCount === 0) {
      throw new Error("inward_number not found in rawmaterial_rcvd");
    }

    const currentStatus = statusCheck.rows[0].material_inward_status;
    if (currentStatus === 'Completed') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        operation: 'noop',
        message: 'No action - Cannot add bags. Inward already marked as completed.'
      });
    }

    // 1. Insert new bag
    const insertBagQuery = `
      INSERT INTO ${bagTable} (inward_number, weight, userid)
      VALUES ($1, $2, $3)
      RETURNING bag_no;
    `;
    const insertBagResult = await client.query(insertBagQuery, [inward_number, weight, userid]);
    const newbag_no = insertBagResult.rows[0].bag_no;

    // 2. Check if history exists for this day + inward_number
    const checkHistory = await client.query(
      `SELECT 1 FROM ${historyTable} WHERE day = $1 AND inward_number = $2`,
      [day, inward_number]
    );

    if (checkHistory.rowCount > 0) {
      // 3a. UPDATE: increment today's bag count, add to total weight, recalc stock
      await client.query(
        `UPDATE ${historyTable}
         SET
           raw_material_inward_no_bags = raw_material_inward_no_bags + 1,
           raw_material_inward_weight = raw_material_inward_weight + $1,
           raw_material_inward_stock = weight_at_security - (raw_material_inward_weight + $1)
         WHERE day = $2 AND inward_number = $3`,
        [weight, day, inward_number]
      );

    } else {
      // 3b. INSERT: gather data from rcvd table and insert into history

      // 3b.i Get cumulative weight
      const totalWeightResult = await client.query(
        `SELECT SUM(weight) AS total_weight FROM ${bagTable} WHERE inward_number = $1`,
        [inward_number]
      );
      const total_weight = Number(totalWeightResult.rows[0].total_weight || 0);

      // 3b.ii Insert into history using data from rcvd
      const insertHistoryResult = await client.query(
        `INSERT INTO ${historyTable} (
           day,
           inward_number,
           supplier_name,
           supplier_weight,
           weight_at_security,
           raw_material_inward_no_bags,
           raw_material_inward_weight,
           raw_material_inward_stock
         )
         SELECT
           $1,
           inward_number,
           supplier_name,
           supplier_weight,
           our_weight,
           1,
           $2,
           our_weight - $2
         FROM ${rcvdTable}
         WHERE inward_number = $3
         RETURNING 1`,
        [day, total_weight, inward_number]
      );

      if (insertHistoryResult.rowCount === 0) {
        throw new Error("Insert failed: inward_number not found in rawmaterial_rcvd");
      }
    }

    await client.query('COMMIT');
    res.json({ operation: 'success', bag_no: newbag_no });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error inserting crusher load and updating history:", err);
    res.status(500).json({ operation: 'error', message: err.message });
  } finally {
    client.release();
  }
});



router.put(
  "/materialinwardcomplete",
  authenticate,
  checkAccess('Operations.Raw-Material Inward'),
  async (req, res) => {
    const { accountid, userid } = req.user;
    const { inward_number, remark } = req.body;

    if (!inward_number) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rcvdTable = `${accountid}_rawmaterial_rcvd`;
    const bagTable = `${accountid}_material_inward_bag`;
    const historyTable = `${accountid}_rawmaterial_inward_history`;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // ✅ Pre-check: is it already marked Completed?
      const statusCheck = await client.query(
        `SELECT material_inward_status FROM ${rcvdTable} WHERE inward_number = $1`,
        [inward_number]
      );

      if (statusCheck.rowCount === 0) {
        throw new Error("inward_number not found");
      }

      const currentStatus = statusCheck.rows[0].material_inward_status;
      if (currentStatus === 'Completed') {
        await client.query('ROLLBACK');
        return res.status(409).json({ operation: 'noop', message: 'No action - Inward already in completed state' });
      }

      // 1. Update status in rawmaterial_rcvd
      const updateQuery = `
        UPDATE ${rcvdTable}
        SET
          material_inward_status = 'Completed',
          material_inward_remarks = $2,
          material_inward_status_upddt = CURRENT_TIMESTAMP,
          material_inward_userid = $3
        WHERE inward_number = $1
      `;
      await client.query(updateQuery, [inward_number, remark, userid]);

      const day = getKolkataDayString();

      // 2. Fetch total bag weight (needed in both cases)
      const bagResult = await client.query(
        `SELECT SUM(weight) AS total_weight FROM ${bagTable} WHERE inward_number = $1`,
        [inward_number]
      );
      const total_weight = Number(bagResult.rows[0].total_weight || 0);

      // 3. Check if history record exists
      const historyResult = await client.query(
        `SELECT 1 FROM ${historyTable} WHERE day = $1 AND inward_number = $2`,
        [day, inward_number]
      );

      if (historyResult.rowCount === 0) {
        // 🚨 Scenario 1: Insert

        const rcvdResult = await client.query(
          `SELECT supplier_name, supplier_weight, our_weight
           FROM ${rcvdTable}
           WHERE inward_number = $1`,
          [inward_number]
        );
        if (rcvdResult.rowCount === 0) throw new Error("inward_number not found in rawmaterial_rcvd table");
        const { supplier_name, supplier_weight, our_weight } = rcvdResult.rows[0];
        const loss_or_gain = total_weight - our_weight;

        await client.query(
          `INSERT INTO ${historyTable} (
            day,
            inward_number,
            supplier_name,
            supplier_weight,
            weight_at_security,
            raw_material_inward_no_bags,
            raw_material_inward_weight,
            raw_material_inward_stock,
            raw_material_inward_loss_or_gain,
            raw_material_inward_status
          )
          VALUES ($1, $2, $3, $4, $5, 0, $6, 0, $7, 'Completed')`,
          [day, inward_number, supplier_name, supplier_weight, our_weight, total_weight, loss_or_gain]
        );

      } else {
        // ✅ Scenario 2: Update with new weight, reset stock, recalculate loss/gain
        await client.query(
          `UPDATE ${historyTable}
           SET
             raw_material_inward_weight = $1,
             raw_material_inward_stock = 0,
             raw_material_inward_loss_or_gain = $1 - weight_at_security,
             raw_material_inward_status = 'Completed'
           WHERE day = $2 AND inward_number = $3`,
          [total_weight, day, inward_number]
        );
      }

      await client.query('COMMIT');
      res.json({ operation: 'success' });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error("Error in materialinwardcomplete:", err);
      res.status(500).json({ operation: 'error', message: err.message });
    } finally {
      client.release();
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
        AND a.lab_result IS NOT NULL
        and a.admit_load != 'Deny'
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