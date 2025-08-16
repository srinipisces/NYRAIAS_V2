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


router.get("/re_process", authenticate, async (req, res) => {
  const { accountid } = req.user;
  const table = `${accountid}_screening_outward`;

  try {
    const result = await pool.query(
      `SELECT bag_no, weight,screening_out_dt
       FROM ${table}
       WHERE delivery_status = 'Re-Processing'
       ORDER BY screening_out_dt`
       
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching re_process bags:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


function assertSafeIdent(id) {
  if (!/^[a-z0-9_]+$/i.test(id)) throw new Error('Unsafe identifier');
}

router.get('/status',authenticate,async (req, res) => {
    const { accountid } = req.user || {};
    try { assertSafeIdent(accountid); } catch {
      return res.status(400).json({ error: 'Invalid account id' });
    }

    const rpTable  = `${accountid}_re_process`;
    const outTable = `${accountid}_re_process_out`;

    try {
      // 1) Active lot (NULL total_out_weight => machine busy)
      const { rows: activeRows } = await pool.query(
        `SELECT lot_id, loaded_dttm, loaded_bag_details, loaded_weight,
                bags_loaded_userid, total_out_weight, bags_out_datetime, bags_out_userid
           FROM ${rpTable}
          WHERE total_out_weight IS NULL
          ORDER BY loaded_dttm DESC
          LIMIT 1`
      );

      if (activeRows.length === 0) {
        return res.json({ busy: false, lot: null });
      }

      const lot = activeRows[0];

      // 2) OUT bags (created so far for this lot)
      const { rows: outBags } = await pool.query(
        `SELECT bag_no, bag_weight, grade, bag_no_created_dttm, stock_status, bag_created_userid
           FROM ${outTable}
          WHERE lot_id = $1
          ORDER BY bag_no_created_dttm NULLS LAST, bag_no ASC`,
        [lot.lot_id]
      );

      // 3) Per-grade summary
      const { rows: sumRows } = await pool.query(
        `SELECT grade,
                COUNT(*)::int AS count,
                COALESCE(SUM(bag_weight), 0)::numeric AS total_weight
           FROM ${outTable}
          WHERE lot_id = $1
          GROUP BY grade
          ORDER BY grade`,
        [lot.lot_id]
      );

      // 4) Loaded bag details (JSONB array of { bag_no, weight, created_dttm })
      let loadedBags = lot.loaded_bag_details;
      if (typeof loadedBags === 'string') {
        try { loadedBags = JSON.parse(loadedBags); } catch { loadedBags = []; }
      }
      if (!Array.isArray(loadedBags)) loadedBags = [];

      return res.json({
        busy: true,
        lot: {
          lot_id: lot.lot_id,
          loaded_dttm: lot.loaded_dttm,
          loaded_weight: lot.loaded_weight == null ? null : Number(lot.loaded_weight),
          bags_loaded_userid: lot.bags_loaded_userid
        },
        loaded: {
          total_loaded_weight: lot.loaded_weight == null ? null : Number(lot.loaded_weight),
          bags: loadedBags // [{ bag_no, weight, created_dttm }]
        },
        out_summary: sumRows.map(r => ({
          grade: r.grade,
          count: r.count,
          total_weight: Number(r.total_weight)
        })),
        out_bags: outBags
      });
    } catch (err) {
      console.error('Status check failed:', err);
      return res.status(500).json({ error: 'Failed to check machine status' });
    }
  }
);


module.exports = router;