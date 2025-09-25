const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { getKolkataDayString, formatToKolkataDay } = require('./date');
const checkAccess= require('./checkaccess.js');

// 🛡️ Auth Middleware
const { authenticate } = require('./authenticate');

// GET /inwardnumber_outward_select
// GET /inwardnumber_outward_select
router.get('/inwardnumber_outward_select', authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  const rcvdTable   = `${accountid}_rawmaterial_rcvd`;
  const inBagTable  = `${accountid}_material_inward_bag`;
  const outBagTable = `${accountid}_material_outward_bag`;

  try {
    const sql = `
      WITH open_inwards AS (
        SELECT DISTINCT o.inward_number
        FROM ${inBagTable} o
        JOIN ${rcvdTable} r
          ON r.inward_number = o.inward_number
        WHERE r.material_outward_status IS NULL
      ),
      inward_totals AS (
        SELECT b.inward_number, SUM(b.weight)::numeric AS inward_weight
        FROM ${inBagTable} b
        GROUP BY b.inward_number
      ),
      outward_bags AS (
        SELECT o.inward_number,
               json_agg(
                 json_build_object(
                   'bag_no',   o.bag_no,
                   'grade',    o.grade,
                   'weight',   o.weight,
                   'write_dt', o.write_timestamp
                 )
                 ORDER BY o.write_timestamp DESC
               ) AS bags
        FROM ${outBagTable} o
        GROUP BY o.inward_number
      )
      SELECT oi.inward_number,
             COALESCE(it.inward_weight, 0) AS inward_weight,
             COALESCE(ob.bags, '[]'::json) AS bags
      FROM open_inwards oi
      LEFT JOIN inward_totals it ON it.inward_number = oi.inward_number
      LEFT JOIN outward_bags ob  ON ob.inward_number = oi.inward_number
      ORDER BY oi.inward_number DESC;
    `;

    const { rows } = await pool.query(sql);

    const payload = rows.map(r => ({
      inward_no: r.inward_number,
      weight: Number(r.inward_weight) || 0,
      bags: Array.isArray(r.bags) ? r.bags.map(b => ({
        bag_no: b.bag_no,
        grade:  b.grade,
        weight: Number(b.weight) || 0,
        write_dt: b.write_dt,
      })) : [],
    }));

    res.json(payload);
  } catch (err) {
    console.error('Error fetching outward select list:', err);
    res.status(500).json({ error: 'Database error' });
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

router.post("/crusheroutput", authenticate, checkAccess('Operations.RMS.Raw-Material Outward'), async (req, res) => {
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
       RETURNING bag_no,grade,weight,write_timestamp`,
      [inward_number, outward_grade, Number(bag_weight), userid]
    );

    const bag_no = insertBag.rows[0].bag_no;
    const grade = insertBag.rows[0].grade;
    const weight = insertBag.rows[0].weight;
    const write_dt = insertBag.rows[0].write_timestamp;

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
    return res.status(200).json({ success: true,  bag_no:bag_no,grade:grade,weight:weight,write_dt: write_dt,});
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

router.get('/crusher-performance-inward', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const bagTable = `${accountid}_crusher_performance`;

  // pagination
  const PAGE_SIZE = Math.max(1, Math.min(1000, parseInt(req.query.page_size ?? '50', 10)));
  const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  // date filters (YYYY-MM-DD)
  const startDate = (req.query.start_date || '').toString().trim(); // e.g., '2025-09-01'
  const endDate   = (req.query.end_date   || '').toString().trim(); // e.g., '2025-09-25'

  const where = [];
  const args = [];
  const add = (sql, val) => { args.push(val); where.push(sql.replace('$X', `$${args.length}`)); };

  if (startDate) add(`c.event_timestamp >= $X`, `${startDate} 00:00:00`);
  if (endDate)   add(`c.event_timestamp <  $X`, `${endDate} 23:59:59.999`); // inclusive end-of-day

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const columns = [
    { field: 'inward_number', headerName: 'Inward Number' },
    { field: 'sample_from', headerName: 'Sample From' },
    { field: 'grade_plus2', headerName: 'Grade +2' },
    { field: 'grade_2by3', headerName: 'Grade 2/3' },
    { field: 'grade_3by4', headerName: 'Grade 3/4' },
    { field: 'grade_4by6', headerName: 'Grade 4/6' },
    { field: 'grade_6by10', headerName: 'Grade 6/10' },
    { field: 'grade_10by12', headerName: 'Grade 10/12' },
    { field: 'grade_12by14', headerName: 'Grade 12/14' },
    { field: 'grade_minus14', headerName: 'Grade -14' },
    { field: 'moisture', headerName: 'Moisture' },
    { field: 'dust', headerName: 'Dust' },
    { field: 'event_timestamp', headerName: 'Date/Time' }, // <-- added
  ];

  try {
    const countSql = `SELECT COUNT(*)::bigint AS total FROM ${bagTable} c ${whereSql}`;
    const pageSql = `
      SELECT
        c.inward_number, c.sample_from,
        c.grade_plus2, c.grade_2by3, c.grade_3by4, c.grade_4by6,
        c.grade_6by10, c.grade_10by12, c.grade_12by14, c.grade_minus14,
        c.moisture, c.dust, c.event_timestamp
      FROM ${bagTable} c
      ${whereSql}
      ORDER BY c.event_timestamp DESC
      LIMIT $${args.length + 1} OFFSET $${args.length + 2}
    `;

    const [countRes, pageRes] = await Promise.all([
      pool.query(countSql, args),
      pool.query(pageSql, [...args, PAGE_SIZE, offset]),
    ]);

    const total_rows = Number(countRes.rows[0]?.total || 0);
    const total_pages = Math.max(1, Math.ceil(total_rows / PAGE_SIZE));

    res.json({
      columns,
      rows: pageRes.rows,
      page,
      page_size: PAGE_SIZE,
      total_rows,
      total_pages,
      has_next: page < total_pages,
      next_page: page < total_pages ? page + 1 : null,
    });
  } catch (err) {
    console.error('crusher-performance-inward error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/crusher-performance-inward/export', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const bagTable = `${accountid}_crusher_performance`;

  const startDate = (req.query.start_date || '').toString().trim();
  const endDate   = (req.query.end_date   || '').toString().trim();

  const where = [];
  const args = [];
  const add = (sql, val) => { args.push(val); where.push(sql.replace('$X', `$${args.length}`)); };
  if (startDate) add(`c.event_timestamp >= $X`, `${startDate} 00:00:00`);
  if (endDate)   add(`c.event_timestamp <  $X`, `${endDate} 23:59:59.999`);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const MAX_EXPORT = 50000;
  const sql = `
    SELECT
      c.inward_number, c.sample_from,
      c.grade_plus2, c.grade_2by3, c.grade_3by4, c.grade_4by6,
      c.grade_6by10, c.grade_10by12, c.grade_12by14, c.grade_minus14,
      c.moisture, c.dust, c.event_timestamp
    FROM ${bagTable} c
    ${whereSql}
    ORDER BY c.event_timestamp DESC
    LIMIT ${MAX_EXPORT}
  `;

  try {
    const { rows } = await pool.query(sql, args);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"crusher_performance.csv\"');
    res.write([
      'inward_number','sample_from','grade_plus2','grade_2by3','grade_3by4','grade_4by6',
      'grade_6by10','grade_10by12','grade_12by14','grade_minus14','moisture','dust','event_timestamp'
    ].join(',') + '\\n');
    for (const r of rows) {
      const line = [
        r.inward_number ?? '', r.sample_from ?? '', r.grade_plus2 ?? '', r.grade_2by3 ?? '',
        r.grade_3by4 ?? '', r.grade_4by6 ?? '', r.grade_6by10 ?? '', r.grade_10by12 ?? '',
        r.grade_12by14 ?? '', r.grade_minus14 ?? '', r.moisture ?? '', r.dust ?? '',
        r.event_timestamp ? new Date(r.event_timestamp).toISOString() : ''
      ].map((v) => String(v).replaceAll('"','""'));
      res.write(line.join(',') + '\\n');
    }
    res.end();
  } catch (err) {
    console.error('crusher-performance-inward/export error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});




module.exports = router;