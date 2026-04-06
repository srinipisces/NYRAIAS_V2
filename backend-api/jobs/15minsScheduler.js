// jobs/15minsScheduler.js
// Generic scheduler for all jobs in schedule_group = '15min'

const cron = require('node-cron');
const path = require('path');
const pool = require('../db');

const DEFAULT_TZ = process.env.JOB_TIMEZONE || 'Asia/Kolkata';
const JOB_GROUP = '15min';
const REFRESH_MS = 60_000; // 60 seconds

// id -> { task, signature }
const registeredJobs = new Map();

// ─────────────────────────────
// DB helpers
// ─────────────────────────────

async function loadEnabledJobs() {
  const res = await pool.query(
    `
    SELECT
      id, name, accountid, schedule_group, enabled,
      cron_expression, module_path, function_name,
      timezone, initial_run
    FROM scheduler_jobs
    WHERE enabled = TRUE AND schedule_group = $1
    ORDER BY id
    `,
    [JOB_GROUP]
  );
  return res.rows;
}

async function updateJobStatusStart(id) {
  await pool.query(
    `
    UPDATE scheduler_jobs
    SET
      last_started_at = NOW(),
      last_status = 'running',
      last_error = NULL
    WHERE id = $1
    `,
    [id]
  );
}

async function updateJobStatusSuccess(id) {
  await pool.query(
    `
    UPDATE scheduler_jobs
    SET
      last_finished_at = NOW(),
      last_status = 'success'
    WHERE id = $1
    `,
    [id]
  );
}

async function updateJobStatusError(id, errorMessage) {
  await pool.query(
    `
    UPDATE scheduler_jobs
    SET
      last_finished_at = NOW(),
      last_status = 'error',
      last_error = $2
    WHERE id = $1
    `,
    [id, String(errorMessage).slice(0, 4000)]
  );
}

// ─────────────────────────────
// Module + handler resolution
// ─────────────────────────────

function resolveHandler(modulePath, functionName) {
  const fullPath = path.resolve(__dirname, '..', modulePath); // e.g. ../jobs/factoryLogJob.js
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mod = require(fullPath);

  if (functionName && typeof mod[functionName] === 'function') {
    return mod[functionName];
  }
  if (typeof mod.default === 'function') return mod.default;
  if (typeof mod === 'function') return mod;

  throw new Error(
    `Handler "${functionName}" not found in module "${modulePath}"`
  );
}

// Small hash of job config that affects scheduling
function computeSignature(row) {
  return JSON.stringify({
    cron: row.cron_expression,
    module: row.module_path,
    fn: row.function_name,
    tz: row.timezone || DEFAULT_TZ,
    accountid: row.accountid || null,
  });
}

// ─────────────────────────────
// Runner
// ─────────────────────────────

async function runJobOnce(row, handler) {
  const { id, name, accountid } = row;
  console.log(`[SCHEDULER-15] Starting job "${name}" (id=${id}, accountid=${accountid || 'ALL'})`);
  await updateJobStatusStart(id);

  try {
    // Pass accountid + full job row to the handler
    await handler({ accountid, job: row });
    await updateJobStatusSuccess(id);
    console.log(`[SCHEDULER-15] Job "${name}" completed successfully.`);
  } catch (err) {
    console.error(`[SCHEDULER-15] Job "${name}" failed:`, err);
    await updateJobStatusError(id, err.message || String(err));
  }
}

// ─────────────────────────────
// Refresh job definitions from DB (dynamic)
// ─────────────────────────────

async function refreshJobs() {
  console.log('[SCHEDULER-15] Refreshing job definitions from DB...');
  const rows = await loadEnabledJobs();
  const seenIds = new Set();

  for (const row of rows) {
    const id = row.id;
    seenIds.add(id);
    const sig = computeSignature(row);
    const existing = registeredJobs.get(id);

    let handler;
    try {
      handler = resolveHandler(row.module_path, row.function_name);
    } catch (err) {
      console.error(
        `[SCHEDULER-15] Failed to resolve handler for job "${row.name}":`,
        err
      );
      await updateJobStatusError(id, err.message || String(err));
      continue;
    }

    // If job already registered and unchanged, keep it
    if (existing && existing.signature === sig) {
      continue;
    }

    // If job exists but config changed, stop old one
    if (existing) {
      existing.task.stop();
      registeredJobs.delete(id);
      console.log(`[SCHEDULER-15] Job "${row.name}" changed. Restarting...`);
    }

    const tz = row.timezone || DEFAULT_TZ;

    // Wrapper so we can reuse for cron + initial_run
    const runWrapper = () => runJobOnce(row, handler);

    // Create cron task
    const task = cron.schedule(row.cron_expression, runWrapper, {
      timezone: tz,
    });

    registeredJobs.set(id, { task, signature: sig });

    // If it's newly created (no existing), and initial_run = TRUE -> run once now
    if (!existing && row.initial_run) {
      runWrapper().catch((err) =>
        console.error(
          `[SCHEDULER-15] Initial run of job "${row.name}" failed:`,
          err
        )
      );
    }

    console.log(
      `[SCHEDULER-15] Registered job "${row.name}" with "${row.cron_expression}" (tz=${tz}, accountid=${row.accountid || 'ALL'})`
    );
  }

  // Stop any jobs that are no longer in the DB / disabled / group changed
  for (const [id, info] of registeredJobs.entries()) {
    if (!seenIds.has(id)) {
      console.log(
        `[SCHEDULER-15] Job id=${id} no longer present/enabled. Stopping...`
      );
      info.task.stop();
      registeredJobs.delete(id);
    }
  }
}

// ─────────────────────────────
// Main: start + periodic refresh
// ─────────────────────────────

async function startScheduler() {
  console.log(
    `[SCHEDULER-15] Starting scheduler for schedule_group="${JOB_GROUP}" (refresh every ${
      REFRESH_MS / 1000
    }s)...`
  );

  await refreshJobs(); // initial load

  setInterval(() => {
    refreshJobs().catch((err) =>
      console.error('[SCHEDULER-15] Error during refreshJobs:', err)
    );
  }, REFRESH_MS);
}

startScheduler().catch((err) => {
  console.error('[SCHEDULER-15] Fatal error starting scheduler:', err);
  process.exit(1);
});
