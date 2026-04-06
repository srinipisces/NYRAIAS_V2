// routes/factoryLog.js
const express = require('express');
const router = express.Router();
const pool = require('./db');                      
const { authenticate } = require('./authenticate.js');

// Guard for <accountid>_factory_log
function safeTableName(accountid) {
  if (!accountid || !/^[a-zA-Z0-9_]+$/.test(accountid)) {
    throw new Error('Invalid accountid for factory log table');
  }
  return `${accountid}_factory_log`;
}

/**
 * GET /api/factory-log/scroll
 *
 * Query params:
 *  - limit  (optional): max slots, default ≈ 24h (96 slots)
 *  - before (optional): fetch OLDER slots (slot_end < before)
 *  - after  (optional): fetch NEWER slots (slot_end > after)
 *
 * All timestamps are treated as IST (no timezone conversion).
 * All results are sorted DESC by slot_end (latest first).
 */
router.get('/scroll', authenticate, async (req, res) => {
  const { accountid } = req.user || {};
  if (!accountid) {
    return res.status(400).json({ error: 'Missing accountid' });
  }

  let table;
  try {
    table = safeTableName(accountid);
  } catch (err) {
    console.error('[FACTORY-LOG/API] bad accountid', err);
    return res.status(400).json({ error: 'Invalid accountid' });
  }

  let { before, after, limit } = req.query;

  const DEFAULT_LIMIT = 96; // 24 hours * 4 slots/hour
  let lim = parseInt(limit, 10);
  if (!Number.isFinite(lim) || lim <= 0) lim = DEFAULT_LIMIT;
  if (lim > 200) lim = 200; // safety cap

  // Base select: keep timestamps as strings, do NOT change timezone
  const baseSelect = `
    SELECT
      slot_start::text AS slot_start_raw,
      slot_end::text   AS slot_end_raw,
      data
    FROM ${table}
  `;

  let sql;
  let params = [];

  if (after) {
    // NEWER than "after"
    sql = `
      ${baseSelect}
      WHERE slot_end > $1::timestamp
      ORDER BY slot_end DESC
      LIMIT $2
    `;
    params = [after, lim];
  } else if (before) {
    // OLDER than "before"
    sql = `
      ${baseSelect}
      WHERE slot_end < $1::timestamp
      ORDER BY slot_end DESC
      LIMIT $2
    `;
    params = [before, lim];
  } else {
    // Initial load: last 24 hours from now() (IST DB time)
    sql = `
      ${baseSelect}
      WHERE slot_end >= (now() - interval '24 hours')
      ORDER BY slot_end DESC
      LIMIT $1
    `;
    params = [lim];
  }

  try {
    const { rows } = await pool.query(sql, params);

    const items = rows.map((row) => {
      let payload = row.data;

      // data is jsonb → already an object, but be defensive
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error('[FACTORY-LOG/API] failed to parse data JSON', e);
          payload = {};
        }
      }

      // Your format:
      // { logs: [...], slotEnd: "2025-11-24T05:15:00.000Z", slotStart: ... }
      const logs = Array.isArray(payload?.logs) ? payload.logs : [];

      const slotStartFromData = payload?.slotStart;
      const slotEndFromData   = payload?.slotEnd;

      const slotStart = String(slotStartFromData || row.slot_start_raw);
      const slotEnd   = String(slotEndFromData   || row.slot_end_raw);

      return { slotStart, slotEnd, logs };
    });

    const newest = items[0]?.slotEnd || null; // first = newest, because DESC
    const oldest = items.length ? items[items.length - 1].slotEnd : null;

    return res.json({
      items,
      paging: {
        newest,  // pass to "after" queries
        oldest,  // pass to "before" queries
        limit: lim,
      },
    });
  } catch (err) {
    console.error('[FACTORY-LOG/API] error', err);
    return res.status(500).json({ error: 'Failed to fetch factory log' });
  }
});

module.exports = router;
