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



router.post("/submit-destoning", authenticate, checkAccess("Operations.Activation.De-Stoning"), async (req, res) => {
  const { accountid } = req.user;
  const { bag_nos } = req.body; // array of bag_no
  const table = `${accountid}_kiln_output`;

  if (!Array.isArray(bag_nos) || bag_nos.length === 0) {
    return res.status(400).json({ error: "No bags provided" });
  }

  try {
    const query = `
      UPDATE ${table}
      SET exkiln_stock = 'De-Stoning-loaded'
      WHERE bag_no = ANY($1)
    `;
    await pool.query(query, [bag_nos]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating bag status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Example: tray = KOA for Kiln A
router.get("/destoning-bags/:tray", authenticate, checkAccess("Operations.De-Stoning"), async (req, res) => {
  const { tray } = req.params; // KOA, KOB, KOC
  const { accountid } = req.user;
  const table = `${accountid}_kiln_output`;

  try {
    const result = await pool.query(
      `SELECT bag_no, weight
       FROM ${table}
       WHERE exkiln_stock = 'De-Stoning'
         AND bag_no LIKE $1
       ORDER BY kiln_output_dt`,
      [`${tray}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching destoning bags:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// routes/destoningRoutes.js (continued)

const getDSOBagNo = async (accountid) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB').split('/').join(''); // ddmmyy
  const basePrefix = `DSO_${dateStr}_`;
  const table = `${accountid}_destoning`;

  const result = await pool.query(
    `SELECT MAX(DS_Bag_No) AS last FROM ${table} WHERE DS_Bag_No LIKE $1`,
    [`${basePrefix}%`]
  );

  const last = result.rows[0].last;
  let counter = 1;
  if (last) {
    const match = last.match(/_(\d+)$/);
    if (match) counter = parseInt(match[1]) + 1;
  }
  return basePrefix + counter.toString().padStart(4, '0');
};

router.post("/submit-in", authenticate, checkAccess("Operations.De-Stoning"), async (req, res) => {
  const { accountid } = req.user;
  const { loaded_bags } = req.body;

  if (!Array.isArray(loaded_bags) || loaded_bags.length === 0) {
    return res.status(400).json({ error: "No bags provided" });
  }

  const kilnTable = `${accountid}_kiln_output`;
  const destoningTable = `${accountid}_destoning`;

  try {
    await pool.query("BEGIN");

    // Get bag weights
    const { rows } = await pool.query(
      `SELECT bag_no, weight FROM ${kilnTable} WHERE bag_no = ANY($1)`,
      [loaded_bags]
    );
    const weight_loaded = rows.reduce((sum, r) => sum + Number(r.weight), 0);

    // Update kiln bags
    await pool.query(
      `UPDATE ${kilnTable} SET exkiln_stock = 'De-Stoning-loaded' WHERE bag_no = ANY($1)`,
      [loaded_bags]
    );

    // Generate DS Bag No
    const DS_Bag_No = await getDSOBagNo(accountid);

    // Insert destoning entry
    await pool.query(
      `INSERT INTO ${destoningTable} (DS_Bag_No, weight_loaded, loaded_bags)
       VALUES ($1, $2, $3)`,
      [DS_Bag_No, weight_loaded, loaded_bags]
    );

    await pool.query("COMMIT");
    res.json({ DS_Bag_No, weight_loaded });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Destoning submit-in error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// routes/destoning.js
router.get("/status", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const destoningTable = `${accountid}_destoning`;
  const kilnTable = `${accountid}_kiln_output`;

  try {
    // Step 1: Check if De-Stoner is currently running
    const result = await pool.query(
      `SELECT loaded_bags, loaded_weight
       FROM ${destoningTable}
       WHERE ds_bag_no IS NULL
       ORDER BY loaded_timestamp DESC
       LIMIT 1`
    );

    if (result.rowCount > 0) {
      const { loaded_bags, loaded_weight } = result.rows[0];

      // Fetch bag weights for loaded_bags
      const weightQuery = await pool.query(
        `SELECT bag_no, weight_with_stones AS weight
         FROM ${kilnTable}
         WHERE bag_no = ANY($1)`,
        [loaded_bags]
      );

      return res.json({
        busy: true,
        loaded_bags: weightQuery.rows,  // array of { bag_no, weight }
        loaded_weight
      });
    }

    // Step 2: De-Stoner not running — return available kiln tray bags
    const trayRes = await pool.query(
      `SELECT bag_no, weight_with_stones AS weight
       FROM ${kilnTable}
       WHERE exkiln_stock = 'De-Stoning'`
    );

    const grouped = { KOA: [], KOB: [], KOC: [] };
    for (const row of trayRes.rows) {
      const prefix = row.bag_no.slice(0, 3);
      if (grouped[prefix]) grouped[prefix].push(row); // includes bag_no and weight
    }

    return res.json({
      busy: false,
      kiln_trays: grouped
    });

  } catch (err) {
    console.error("Error checking De-Stoner status:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/* router.post("/load", authenticate, checkAccess("Operations.Activation.De-Stoning"), async (req, res) => {
  const { accountid, userid } = req.user;
  const destoningTable = `${accountid}_destoning`;
  const kilnTable = `${accountid}_kiln_output`;
  const { loaded_bags, loaded_weight } = req.body;

  if (!Array.isArray(loaded_bags) || loaded_bags.length === 0) {
    return res.status(400).json({ error: "No bags provided" });
  }

  if (!loaded_weight || isNaN(loaded_weight)) {
    return res.status(400).json({ error: "Invalid or missing loaded weight" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure no active destoning with same bags
    const check = await client.query(
      `SELECT 1 FROM ${destoningTable}
       WHERE ds_bag_no IS NULL AND loaded_bags && $1`,
      [loaded_bags]
    );

    if (check.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Some bags are already loaded in an active session" });
    }

    // Insert into destoning table
    await client.query(
      `INSERT INTO ${destoningTable} (loaded_bags, loaded_weight, userid)
       VALUES ($1, $2, $3)`,
      [loaded_bags, loaded_weight, userid]
    );

    // Update exkiln_stock in kiln output table
    await client.query(
      `UPDATE ${kilnTable}
       SET exkiln_stock = 'DeStoningCompleted',
       destoning_in_user = $2,
       destoning_in_updt = current_timestamp
       WHERE bag_no = ANY($1)`,
      [loaded_bags,userid]
    );

    await client.query("COMMIT");
    return res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Load API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
}); */

router.post(
  "/load",
  authenticate,
  checkAccess("Operations.Activation.De-Stoning"),
  async (req, res) => {
    const { accountid, userid } = req.user;
    const destoningTable = `${accountid}_destoning`;
    const kilnTable = `${accountid}_kiln_output`;
    const { loaded_bags, loaded_weight } = req.body;

    if (!Array.isArray(loaded_bags) || loaded_bags.length === 0) {
      return res.status(400).json({ error: "No bags provided" });
    }

    // Normalize + dedupe (remove duplicates automatically)
    const uniqueBags = [...new Set(loaded_bags.map((b) => String(b).trim()))].filter(Boolean);

    if (uniqueBags.length === 0) {
      return res.status(400).json({ error: "No valid bags provided" });
    }

    if (!loaded_weight || isNaN(loaded_weight)) {
      return res.status(400).json({ error: "Invalid or missing loaded weight" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Ensure no active destoning with same bags
      const check = await client.query(
        `SELECT 1
         FROM ${destoningTable}
         WHERE ds_bag_no IS NULL
           AND loaded_bags && $1`,
        [uniqueBags]
      );

      if (check.rowCount > 0) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({ error: "Some bags are already loaded in an active session" });
      }

      // Insert into destoning table
      await client.query(
        `INSERT INTO ${destoningTable} (loaded_bags, loaded_weight, userid)
         VALUES ($1, $2, $3)`,
        [uniqueBags, loaded_weight, userid]
      );

      // Update exkiln_stock in kiln output table
      await client.query(
        `UPDATE ${kilnTable}
         SET exkiln_stock = 'DeStoningCompleted',
             destoning_in_user = $2,
             destoning_in_updt = current_timestamp
         WHERE bag_no = ANY($1)`,
        [uniqueBags, userid]
      );

      await client.query("COMMIT");
      return res.json({ success: true });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Load API error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  }
);



router.post("/complete", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const { loaded_bags, weight_out } = req.body;

  if (!weight_out || isNaN(weight_out)) {
    return res.status(400).json({ error: "Invalid or missing output weight" });
  }

  if (!Array.isArray(loaded_bags) || loaded_bags.length === 0) {
    return res.status(400).json({ error: "Missing loaded bags" });
  }

  const table = `${accountid}_destoning`;
  const now = new Date();

  // YYYYMMDD format
  const dayStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // '20250728'
  const prefix = `DSO_${dayStr}_`;

  try {
    await pool.query("BEGIN");

    // Lock global counter for concurrency safety
    await pool.query(`SELECT pg_advisory_xact_lock(hashtext('global_ds_bag_counter'))`);

    // Find pending destoning session that contains these bags
    const pendingResult = await pool.query(
      `SELECT bag_generated_timestamp FROM ${table}
       WHERE ds_bag_no IS NULL AND loaded_bags @> $1::text[]`,
      [loaded_bags]
    );

    if (pendingResult.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(409).json({ error: "No matching pending session found" });
    }

    // Get max running number across all days (DSO_YYYYMMDD_###)
    const maxResult = await pool.query(
      `SELECT COALESCE((
        SELECT split_part(btrim(ds_bag_no), '_', 3)::int
        FROM ${table}
        ORDER BY bag_generated_timestamp DESC NULLS LAST
        LIMIT 1
      ), 0) AS max_no;`
    );
    
    let nextNo = (maxResult.rows[0].max_no || 0);
    nextNo = (nextNo >= 999) ? 1 : nextNo + 1;
    
    const newBagNo = `${prefix}${String(nextNo).padStart(3, '0')}`;
    console.log("nextNo",nextNo,newBagNo,maxResult.rows[0].max_no);
    // Update the pending row with the new bag number
    await pool.query(
      `UPDATE ${table}
       SET ds_bag_no = $1,
           weight_out = $2,
           final_destination = 'Quality',
           bag_generated_timestamp = CURRENT_TIMESTAMP
       WHERE ds_bag_no IS NULL AND loaded_bags @> $3::text[]`,
      [newBagNo, weight_out, loaded_bags]
    );

    await pool.query("COMMIT");
    return res.json({ success: true, bag_no: newBagNo });

  } catch (err) {
    console.error("De-Stoner Complete Error:", err);
    await pool.query("ROLLBACK");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bag_quality", authenticate,async(req,res) => {
  const {accountid} = req.user;
  const table = `${accountid}_destoning`;
  try {

    const que = `select ds_bag_no from ${table} where quality_updt_time is null`
    const result = await pool.query(que);
    const inwardNumbers = result.rows.map(row => row.ds_bag_no);
    res.json(inwardNumbers);
  } catch (err) {
        const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})



router.post("/destoningquality", authenticate,checkAccess('Operations.De-Stoning Quality'),async(req,res) => {
  try {
    const {userid,accountid} = req.user;
    const table = `${accountid}_destoning`;
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
    final_destination = $11,
    quality_updt_time = current_timestamp
    where ds_bag_no = $10
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
        req.body.bag_no,
        req.body.destination
        ];
    
    const result = await pool.query(que,values);
    
    res.json({ operation: 'success' });
  } catch (err) {
    const now = new Date();
    console.error(now.toLocaleString(),":",err);

    res.status(500).json({ error: "Database error" });
  }
})

router.get("/destoningtable",authenticate, async(req,res) => {
    const {accountid} = req.user;
    const table = `${accountid}_destoning`
    try {
      const result = await pool.query(`SELECT *
      FROM ${table} 
      where ds_bag_no is not null and final_destination != 'Delivered'
      ORDER BY bag_generated_timestamp DESC ;
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


router.post('/update-cell', authenticate, checkAccess('Operations.De-Stoning Quality'),async (req, res) => {
  const { primaryKeyField, primaryKeyValue, field, value } = req.body;
  const accountId = req.user.accountid; // or extract from token/session

  try {
    const tableName = `${accountId}_destoning`;

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
