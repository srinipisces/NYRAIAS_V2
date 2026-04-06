// jobs/factoryLogJob.js
// Factory log job – runs for ONE account at a time.
// Called by 15minsScheduler.js with: handler({ accountid, job })

const pool = require('../db');

const INTERVAL_MS = 15 * 60 * 1000;         // 15 minutes
const MAX_BACKFILL_HOURS = 24;             // don't backfill more than 24h
const MAX_BACKFILL_MS = MAX_BACKFILL_HOURS * 60 * 60 * 1000;

// ─────────────────────────────────────────────
// Helpers: time slot
// ─────────────────────────────────────────────

function getLastSlot() {
  const now = new Date();
  const nowMs = now.getTime();
  const slotEndMs = Math.floor(nowMs / INTERVAL_MS) * INTERVAL_MS;
  const slotStartMs = slotEndMs - INTERVAL_MS;
  return {
    slotStart: new Date(slotStartMs),
    slotEnd: new Date(slotEndMs),
  };
}
// ─────────────────────────────────────────────
// Helpers: Date formatting
// ─────────────────────────────────────────────
function formatIstTimestamp(date) {
  if (!(date instanceof Date)) return '';

  // Convert UTC date → IST by adding +5:30
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(date.getTime() + istOffsetMs);

  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, '0');
  const d = String(ist.getDate()).padStart(2, '0');
  const hh = String(ist.getHours()).padStart(2, '0');
  const mm = String(ist.getMinutes()).padStart(2, '0');

  // Format: 2025-11-27 23:59
  return `${y}-${m}-${d} ${hh}:${mm}`;
}


// ─────────────────────────────────────────────
// Helpers: status logging
// ─────────────────────────────────────────────

async function recordStatus(level, message, details = {}) {
  // global status table (not per-account), used only for scheduler / job errors
  try {
    await pool.query(
      `
      INSERT INTO factory_log_status (level, message, details)
      VALUES ($1, $2, $3::jsonb)
      `,
      [level, message, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Failed to insert into factory_log_status:', err);
  }
}

// ─────────────────────────────────────────────
// Helpers: last processed slot (per account)
// ─────────────────────────────────────────────

async function getLastProcessedSlotStart(accountid) {
  if (!accountid) {
    throw new Error('getLastProcessedSlotStart: accountid is required');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(accountid)) {
    throw new Error(`Invalid accountid for table name: ${accountid}`);
  }

  const tableName = `${accountid}_factory_log`;

  const res = await pool.query(
    `SELECT MAX(slot_start) AS last_slot_start FROM ${tableName}`
  );
  return res.rows[0]?.last_slot_start || null;
}

// ─────────────────────────────────────────────
// Helpers: build logs (per account, per slot)
// ─────────────────────────────────────────────

async function buildLogsForTenant(accountid, slotStart, slotEnd) {
  const logs = [];
  if (!/^[a-zA-Z0-9_]+$/.test(accountid)) {
    throw new Error(`Invalid accountid for table name: ${accountid}`);
  }

  const rcvdTable = `${accountid}_rawmaterial_rcvd`;
  console.log(slotStart,slotEnd);

  try {
    const r = await pool.query(
      `
      SELECT
        inward_number,
        supplier_weight,
        supplier_name,
        our_weight
      FROM ${rcvdTable}
      WHERE write_timestamp >= ($1::timestamptz AT TIME ZONE 'Asia/Kolkata')
        AND write_timestamp < ($2::timestamptz AT TIME ZONE 'Asia/Kolkata')
      ORDER BY write_timestamp ASC, inward_number ASC
      `,
      [slotStart, slotEnd]
    );

    // One INFO log per row
    for (const row of r.rows) {
      const msg =
        `Raw Material Arrival` +
        `Inw: ${row.inward_number}, ` +
        `Sup_W: ${Number(row.supplier_weight || 0).toFixed(2)}, ` +
        `Our_W: ${Number(row.our_weight || 0).toFixed(2)}, ` +
        `Sup_Name: ${row.supplier_name || ''}`;

      logs.push({
        id: `${accountid}-inward-${row.inward_number}-${slotEnd.toISOString()}`,
        timestamp: formatIstTimestamp(slotEnd),
        level: 'INFO',
        message: msg,
      });
    }

    const r1 = await pool.query(
      `
      SELECT inward_number,supplier_name,lab_result,write_timestamp
        FROM ${rcvdTable}
        WHERE lab_result IS NULL
        AND now() - write_timestamp > interval '4 hours';
      `
    );

    // One INFO log per row
    for (const row of r1.rows) {
      const msg =
        `Inw: ${row.inward_number}, ` +
        `Sup_Name: ${row.supplier_name || ''}` +
        ' Pending in Lab for more than 4 hrs';

      logs.push({
        id: `${accountid}-inward-${row.inward_number}-${slotEnd.toISOString()}`,
        timestamp: formatIstTimestamp(slotEnd),
        level: 'WARN',
        message: msg,
      });
    }

    const r2 = await pool.query(
      `
      SELECT inward_number,supplier_name,lab_result,admit_load,our_weight
        FROM ${rcvdTable}
        WHERE lab_result >= ($1::timestamptz AT TIME ZONE 'Asia/Kolkata')
        AND lab_result < ($2::timestamptz AT TIME ZONE 'Asia/Kolkata');
      `,
      [slotStart, slotEnd]
    );

    // One INFO log per row
    for (const row of r2.rows) {
      const msg =
        `Inw: ${row.inward_number}, ` +
        `Sup_Name: ${row.supplier_name || ''}` +
        `Our_W: ${row.our_weight} ` +
        `Lab Status: ${row.admit_load} `;

      logs.push({
        id: `${accountid}-inward-${row.inward_number}-${slotEnd.toISOString()}`,
        timestamp: formatIstTimestamp(slotEnd),
        level: 'INFO',
        message: msg,
      });
    }



  } catch (err) {
    // Capture the error as a log entry AND in factory_log_status
    console.error(`Error building logs for ${accountid}:`, err);
    logs.push({
      id: `${accountid}-error-${slotStart.toISOString()}`,
      timestamp: slotStart.toISOString().slice(0, 16).replace('T', ' '),
      level: 'ERROR',
      message: `Failed to compute inward logs: ${err.message}`,
    });

    await recordStatus('ERROR', 'Factory log inward query failed', {
      accountid,
      slotStart: slotStart.toISOString(),
      slotEnd: slotEnd.toISOString(),
      error: err.message,
    });

    // NOTE: we do NOT rethrow here, so we still attempt to write these error logs
    // into <accountid>_factory_log (if that table exists).
  }

  return logs;
}

// ─────────────────────────────────────────────
// Helpers: upsert into <accountid>_factory_log
// ─────────────────────────────────────────────

async function upsertFactoryLog(accountid, slotStart, slotEnd, logs) {
  if (!accountid) {
    throw new Error('upsertFactoryLog: accountid is required');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(accountid)) {
    throw new Error(`Invalid accountid for table name: ${accountid}`);
  }

  const tableName = `${accountid}_factory_log`;

  const payload = {
    slotStart: slotStart.toISOString(),
    slotEnd: slotEnd.toISOString(),
    logs,
  };

  await pool.query(
    `
    INSERT INTO ${tableName} (slot_start, slot_end, data)
    VALUES ($1, $2, $3::jsonb)
    ON CONFLICT (slot_start)
    DO UPDATE SET
      data = EXCLUDED.data,
      updated_at = NOW()
    `,
    [slotStart.toISOString(), slotEnd.toISOString(), JSON.stringify(payload)]
  );
}

// ─────────────────────────────────────────────
// Main job function – ONE account only
// context: { accountid, job }
// ─────────────────────────────────────────────

async function runFactoryLogJobOnce(context = {}) {
  const { accountid } = context;

  if (!accountid) {
    // No fallback to account_route_config – MUST be set in scheduler_jobs
    throw new Error('Factory log job requires accountid in context');
  }

  try {
    const { slotStart: lastCompleteSlotStart } = getLastSlot();
    const lastProcessed = await getLastProcessedSlotStart(accountid);

    let startSlotForBackfill;
    let longGap = false;
    let gapMs = 0;

    if (lastProcessed) {
      const lastProcessedDate = new Date(lastProcessed);
      gapMs = lastCompleteSlotStart.getTime() - lastProcessedDate.getTime();

      if (gapMs > MAX_BACKFILL_MS) {
        // Gap too large -> do NOT backfill; process only latest slot
        longGap = true;
        startSlotForBackfill = lastCompleteSlotStart;

        await recordStatus(
          'WARN',
          'Factory log backfill skipped due to long gap',
          {
            accountid,
            lastProcessedSlot: lastProcessedDate.toISOString(),
            lastCompleteSlot: lastCompleteSlotStart.toISOString(),
            gapHours: gapMs / (60 * 60 * 1000),
          }
        );
      } else {
        // Backfill from next slot after lastProcessed
        startSlotForBackfill = new Date(
          lastProcessedDate.getTime() + INTERVAL_MS
        );
      }
    } else {
      // First time: only latest slot
      startSlotForBackfill = lastCompleteSlotStart;
    }

    console.log(
      `[FACTORY LOG] account=${accountid} from ${startSlotForBackfill.toISOString()} to ${lastCompleteSlotStart.toISOString()} (longGap=${longGap})`
    );

    for (
      let slotStart = startSlotForBackfill;
      slotStart <= lastCompleteSlotStart;
      slotStart = new Date(slotStart.getTime() + INTERVAL_MS)
    ) {
      const slotEnd = new Date(slotStart.getTime() + INTERVAL_MS);

      console.log(
        `[FACTORY LOG] account=${accountid} slot ${slotStart.toISOString()} → ${slotEnd.toISOString()}`
      );

      // Build logs (INFO per inward row + ERROR entry if query fails)
      let logs = await buildLogsForTenant(accountid, slotStart, slotEnd);

      // If there was a long gap, add WARN log in first processed slot
      if (longGap && slotStart.getTime() === startSlotForBackfill.getTime()) {
        logs = [
          {
            id: `${accountid}-gap-${slotStart.toISOString()}`,
            timestamp: slotStart.toISOString().slice(0, 16).replace('T', ' '),
            level: 'WARN',
            message: `Factory log skipped for a gap of ~${(
              gapMs /
              (60 * 60 * 1000)
            ).toFixed(1)} hours before this slot.`,
          },
          ...logs,
        ];
      }

      // This will throw if <accountid>_factory_log does NOT exist
      await upsertFactoryLog(accountid, slotStart, slotEnd, logs);

      console.log(
        `[FACTORY LOG] account=${accountid} upserted ${logs.length} logs at slot ${slotStart.toISOString()}`
      );

      // If long gap, only process that one latest slot
      if (longGap) {
        break;
      }
    }
  } catch (err) {
    // Capture ALL exceptions here
    console.error(
      `[FACTORY LOG] FATAL error for account ${accountid}:`,
      err
    );
    await recordStatus('ERROR', 'Factory log job failed', {
      accountid,
      error: err.message,
      stack: err.stack,
    });
    // Re-throw so the scheduler (15minsScheduler) also marks this job as error
    throw err;
  }
}

module.exports = {
  runFactoryLogJobOnce,
};
