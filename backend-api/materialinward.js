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


// GET /inwardnumber
router.get("/inwardnumber", authenticate, async (req, res) => {
  const { accountid } = req.user;

  // Safety: allow only alnum + underscore in dynamic table names
  if (!/^[A-Za-z0-9_]+$/.test(accountid)) {
    return res.status(400).json({ error: "Invalid account id" });
  }

  const rcvdTable = `${accountid}_rawmaterial_rcvd`;
  const bagsTable = `${accountid}_material_inward_bag`;

  try {
    const query = `
      SELECT
        r.inward_number,
        r.our_weight,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'bag_no', b.bag_no,
              'weight', b.weight
            )
            ORDER BY b.write_timestamp DESC
          ) FILTER (WHERE b.bag_no IS NOT NULL),
          '[]'::json
        ) AS bags
      FROM ${rcvdTable} AS r
      LEFT JOIN ${bagsTable} AS b
        ON b.inward_number = r.inward_number
      WHERE
        r.lab_result IS NOT NULL
        AND r.material_inward_status IS NULL
        AND COALESCE(r.admit_load, '') <> 'Deny'
      GROUP BY r.inward_number, r.our_weight
      ORDER BY r.inward_number;
    `;

    const result = await pool.query(query);

    const payload = result.rows.map(row => ({
      inward_no: row.inward_number,                 // string
      weight: Number(row.our_weight) || 0,          // number
      bags: Array.isArray(row.bags)                 // array of { bag_no, weight }
        ? row.bags.map(b => ({
            bag_no: b.bag_no,
            weight: Number(b.weight) || 0,
          }))
        : [],
    }));

    // [] when there are no matching inwards
    res.json(payload);
  } catch (err) {
    console.error("Error fetching inward numbers with bags:", err);
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


router.post("/crusherload", authenticate, checkAccess('Operations.RMS.Raw-Material Inward'), async (req, res) => {
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
      RETURNING bag_no,write_timestamp;
    `;
    const insertBagResult = await client.query(insertBagQuery, [inward_number, weight, userid]);
    const newbag_no = insertBagResult.rows[0].bag_no;
    const write_dt = insertBagResult.write_timestamp;
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
    res.json({ operation: 'success', bag_no: newbag_no,write_dt: write_dt });

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
  checkAccess('Operations.RMS.Raw-Material Inward'),
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

  const rawTable    = `${accountid}_rawmaterial_rcvd`;
  const inBagTable  = `${accountid}_material_inward_bag`;
  const outBagTable = `${accountid}_material_outward_bag`;

  const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize ?? "50", 10)));
  const page     = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const offset   = (page - 1) * pageSize;

  // existing date filters
  const from = (req.query.from || '').toString().trim(); // YYYY-MM-DD
  const to   = (req.query.to   || '').toString().trim();

  // NEW: free-text filter for inward number
  const q    = (req.query.q    || '').toString().trim();

  const where = [];
  const args = [];
  const add = (sql, val) => { args.push(val); where.push(sql.replace("$X", `$${args.length}`)); };

  if (from) add(`r.material_arrivaltime >= $X`, `${from} 00:00:00`);
  if (to)   add(`r.material_arrivaltime <= $X`, `${to} 23:59:59.999`);

  // NEW: match inward_number (case-insensitive, contains)
  if (q)    add(`r.inward_number ILIKE $X`, `%${q}%`);

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    const sql = `
      WITH parents AS (
        SELECT DISTINCT b.inward_number
        FROM ${inBagTable} b
      ),
      parent_info AS (
        SELECT
          p.inward_number,
          r.our_weight,
          r.material_inward_status,
          r.material_outward_status,
          r.material_arrivaltime
        FROM parents p
        JOIN ${rawTable} r ON r.inward_number = p.inward_number
        ${whereSql}
      ),
      parent_count AS ( SELECT COUNT(*)::bigint AS total FROM parent_info ),
      parent_page AS (
        SELECT * FROM parent_info
        ORDER BY inward_number DESC
        LIMIT $${args.length + 1} OFFSET $${args.length + 2}
      ),
      inward_bags AS (
        SELECT
          b.inward_number,
          json_agg(
            json_build_object(
              'bag_no', b.bag_no,
              'bag_weight', b.weight,
              'bag_update_time', b.write_timestamp
            )
            ORDER BY b.write_timestamp DESC
          ) AS bags
        FROM ${inBagTable} b
        JOIN parent_page pp ON pp.inward_number = b.inward_number
        GROUP BY b.inward_number
      ),
      outward_bags AS (
        SELECT
          ob.inward_number,
          json_agg(
            json_build_object(
              'bag_no', ob.bag_no,
              'grade', ob.grade,
              'bag_weight', ob.weight,
              'bag_update_time', ob.write_timestamp
            )
            ORDER BY ob.write_timestamp DESC
          ) AS outward_bags
        FROM ${outBagTable} ob
        JOIN parent_page pp ON pp.inward_number = ob.inward_number
        GROUP BY ob.inward_number
      )
      SELECT
        pc.total,
        pp.inward_number,
        pp.our_weight,
        pp.material_inward_status,
        pp.material_outward_status,
        COALESCE(ib.bags, '[]'::json)         AS bags,
        COALESCE(ob.outward_bags, '[]'::json) AS outward_bags
      FROM parent_page pp
      CROSS JOIN parent_count pc
      LEFT JOIN inward_bags  ib ON ib.inward_number = pp.inward_number
      LEFT JOIN outward_bags ob ON ob.inward_number = pp.inward_number
      ORDER BY pp.inward_number DESC;
    `;

    const { rows } = await pool.query(sql, [...args, pageSize, offset]);

    const total = Number(rows[0]?.total || 0);
    const dataRows = rows.map(r => ({
      inward_number: r.inward_number,
      our_weight: r.our_weight,
      material_inward_status: r.material_inward_status,
      material_outward_status: r.material_outward_status,
      bags: Array.isArray(r.bags) ? r.bags : [],
      outward_bags: Array.isArray(r.outward_bags) ? r.outward_bags : []
    }));

    const columns = [
      { field: "inward_number", headerName: "Inward Number" },
      { field: "our_weight", headerName: "Our Weight" },
      { field: "material_inward_status", headerName: "Inward Status" },
      { field: "material_outward_status", headerName: "Outward Status" },
    ];
    const expandColumnsInward = [
      { field: "bag_no", headerName: "Bag No" },
      { field: "bag_weight", headerName: "Weight" },
      { field: "bag_update_time", headerName: "Updated Time" },
    ];
    const expandColumnsOutward = [
      { field: "bag_no", headerName: "Bag No" },
      { field: "grade", headerName: "Grade" },
      { field: "bag_weight", headerName: "Weight" },
      { field: "bag_update_time", headerName: "Updated Time" },
    ];

    res.json({
      columns,
      rows: dataRows,
      expandColumnsInward,
      expandColumnsOutward,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    console.error("material-inward-bagging (paginated, dual-children) error:", err);
    res.status(500).json({ error: "Database error" });
  }
});



function buildAuditItem(column, oldVal, newVal, userid) {
  return {
    column,
    old_value: oldVal,
    new_value: newVal,
    userid,
    upd_dt: new Date().toISOString(),
  };
}

router.put('/inward-outward-status', authenticate, checkAccess('Operations.RMS.Edit') ,async (req, res) => {
  const { accountid, userid } = req.user || {};
  const { inward_number, material_inward_status, material_outward_status } = req.body || {};

  if (!accountid || !userid) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (!inward_number) return res.status(400).json({ success: false, error: 'inward_number is required' });

  const table = `${accountid}_rawmaterial_rcvd`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Grab current values
    const { rows: curRows } = await client.query(
      `SELECT material_inward_status, material_outward_status
       FROM ${table}
       WHERE inward_number = $1
       LIMIT 1`,
      [inward_number]
    );
    if (curRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Inward not found' });
    }
    const cur = curRows[0];

    // Build only changed audit items
    const items = [];
    if (cur.material_inward_status !== material_inward_status) {
      items.push(
        buildAuditItem('material_inward_status', cur.material_inward_status, material_inward_status, userid)
      );
    }
    if (cur.material_outward_status !== material_outward_status) {
      items.push(
        buildAuditItem('material_outward_status', cur.material_outward_status, material_outward_status, userid)
      );
    }

    // If nothing changed, short-circuit
    if (items.length === 0) {
      await client.query('COMMIT');
      return res.json({ success: true, updated: false });
    }

    const { rows: updated } = await client.query(
      `
      UPDATE ${table} t
      SET material_inward_status  = $2,
          material_outward_status = $3,
          audit_trail = COALESCE(t.audit_trail, '[]'::jsonb) || $4::jsonb
      WHERE t.inward_number = $1
      RETURNING inward_number, material_inward_status, material_outward_status, audit_trail
      `,
      [
        inward_number,
        material_inward_status ?? null,
        material_outward_status ?? null,
        JSON.stringify(items), // already an array -> append as array
      ]
    );

    await client.query('COMMIT');
    return res.json({ success: true, updated: true, row: updated[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  } finally {
    client.release();
  }
});


// routes/materialoutward.js
router.put('/update-outwardbag-weight', authenticate, checkAccess('Operations.RMS.Edit') ,async (req, res) => {
  const { accountid, userid } = req.user || {};
  const { bag_no, inward_number, weight } = req.body || {};

  if (!accountid || !userid) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (!bag_no || typeof weight !== 'number') {
    return res.status(400).json({ success: false, error: 'bag_no and numeric weight are required' });
  }

  const table = `${accountid}_material_outward_bag`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: oldRows } = await client.query(
      `SELECT weight FROM ${table} WHERE bag_no = $1 LIMIT 1`,
      [bag_no]
    );
    if (oldRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Bag not found' });
    }
    const oldWeight = oldRows[0].weight;

    if (String(oldWeight) === String(weight)) {
      await client.query('COMMIT');
      return res.json({ success: true, updated: false });
    }

    const auditItem = buildAuditItem('weight', oldWeight, weight, userid);
    const { rows: updated } = await client.query(
      `
      UPDATE ${table} t
      SET weight = $2,
          audit_trail = COALESCE(t.audit_trail, '[]'::jsonb) || jsonb_build_array($3::jsonb)
      WHERE t.bag_no = $1
      RETURNING bag_no, weight, audit_trail
      `,
      [bag_no, weight, JSON.stringify(auditItem)]
    );

    await client.query('COMMIT');
    return res.json({ success: true, updated: true, row: updated[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  } finally {
    client.release();
  }
});

// PUT /api/materialinward/update-bag-weight
router.put('/update-inwardbag-weight', authenticate, checkAccess('Operations.RMS.Edit') ,async (req, res) => {
  const { accountid, userid } = req.user || {};
  const { bag_no, inward_number, weight } = req.body || {};

  if (!accountid || !userid) return res.status(401).json({ success: false, error: 'Unauthorized' });
  if (!bag_no || typeof weight !== 'number') {
    return res.status(400).json({ success: false, error: 'bag_no and numeric weight are required' });
  }

  const table = `${accountid}_material_inward_bag`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch old value
    const { rows: oldRows } = await client.query(
      `SELECT weight FROM ${table} WHERE bag_no = $1 LIMIT 1`,
      [bag_no]
    );
    if (oldRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Bag not found' });
    }
    const oldWeight = oldRows[0].weight;

    // If no change, just return success (nothing to log)
    if (String(oldWeight) === String(weight)) {
      await client.query('COMMIT');
      return res.json({ success: true, updated: false });
    }

    // Append audit item and update in one go
    const auditItem = buildAuditItem('weight', oldWeight, weight, userid);
    const { rows: updated } = await client.query(
      `
      UPDATE ${table} t
      SET weight = $2,
          audit_trail = COALESCE(t.audit_trail, '[]'::jsonb) || jsonb_build_array($3::jsonb)
      WHERE t.bag_no = $1
      RETURNING bag_no, weight, audit_trail
      `,
      [bag_no, weight, JSON.stringify(auditItem)]
    );

    await client.query('COMMIT');
    return res.json({ success: true, updated: true, row: updated[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    return res.status(500).json({ success: false, error: 'Internal error' });
  } finally {
    client.release();
  }
});


module.exports = router;