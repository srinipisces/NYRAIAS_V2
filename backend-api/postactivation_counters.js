// lib/counters.js
function safeIdent(s) {
  if (!/^[a-z0-9_]+$/i.test(String(s || ''))) throw new Error('Invalid identifier');
  return s;
}

/**
 * Computes counters + last-10 lists for a given tab.
 * - loaded: from <accountid>_postactivation_loaded view (reload_time/reload_weight)
 * - output: from <accountid>_postactivation table (bag_no_created_dttm/bag_weight)
 * All day windows are in IST without changing the session timezone.
 */
async function getCounters(pool, accountid, tabName) {
  const acct = safeIdent(accountid);
  const loadedView = `${acct}_postactivation_loaded`;
  const postactTbl = `${acct}_postactivation`;
  const statusValue = `${tabName}_Loaded`;

  // --- Queries ---
  // Today in IST:  >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
  //                <  date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 day'
  // Yesterday in IST: >= (today_start - 1 day) AND < today_start
  const todayLoadedQ = pool.query(
    `
    SELECT
      COUNT(*)::int                             AS loaded_count,
      COALESCE(SUM(reload_weight), 0.0)::float8 AS loaded_total_weight
    FROM ${loadedView}
    WHERE status = $1
      AND reload_time >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
      AND reload_time <  date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 day'
    `,
    [statusValue]
  );

  const yestLoadedQ = pool.query(
    `
    SELECT
      COUNT(*)::int                             AS loaded_count,
      COALESCE(SUM(reload_weight), 0.0)::float8 AS loaded_total_weight
    FROM ${loadedView}
    WHERE status = $1
      AND reload_time >= (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') - interval '1 day')
      AND reload_time <   date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
    `,
    [statusValue]
  );

  // "Output" = labels created for this operation today/yesterday
  const todayOutputQ = pool.query(
    `
    SELECT
      COUNT(bag_no)::int                        AS output_count,
      COALESCE(SUM(bag_weight), 0.0)::float8    AS output_total_weight
    FROM ${postactTbl}
    WHERE operations = $1
      AND bag_no_created_dttm >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
      AND bag_no_created_dttm <  date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 day'
    `,
    [tabName]
  );

  const yestOutputQ = pool.query(
    `
    SELECT
      COUNT(bag_no)::int                        AS output_count,
      COALESCE(SUM(bag_weight), 0.0)::float8    AS output_total_weight
    FROM ${postactTbl}
    WHERE operations = $1
      AND bag_no_created_dttm >= (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') - interval '1 day')
      AND bag_no_created_dttm <   date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
    `,
    [tabName]
  );

  const last10LoadedQ = pool.query(
    `
    SELECT bag_no, reload_weight AS weight, grade, reload_time::text AS loaded_at
    FROM ${loadedView}
    WHERE status = $1
    AND reload_time >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
      AND reload_time <  (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 day')
    ORDER BY reload_time DESC NULLS LAST
    LIMIT 10
    `,
    [statusValue]
  );

  const last10OutputQ = pool.query(
    `
    SELECT bag_no, bag_weight AS weight, grade, bag_no_created_dttm::text AS output_at
    FROM ${postactTbl}
    WHERE operations = $1
    AND bag_no_created_dttm >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
      AND bag_no_created_dttm <  (date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 day')
    ORDER BY bag_no_created_dttm DESC
    LIMIT 10
    `,
    [tabName]
  );

  const [
    tLoaded, tOutput, yLoaded, yOutput, l10Loaded, l10Output
  ] = await Promise.all([todayLoadedQ, todayOutputQ, yestLoadedQ, yestOutputQ, last10LoadedQ, last10OutputQ]);

  const tIn = tLoaded.rows?.[0] || {};
  const tOut = tOutput.rows?.[0] || {};
  const yIn = yLoaded.rows?.[0] || {};
  const yOut = yOutput.rows?.[0] || {};

  const todayCounters = {
    loaded: { count: Number(tIn.loaded_count || 0),  totalWeight: Number(tIn.loaded_total_weight || 0) },
    output: { count: Number(tOut.output_count || 0), totalWeight: Number(tOut.output_total_weight || 0) },
    delta:  { weight: (Number(tIn.loaded_total_weight || 0) - Number(tOut.output_total_weight || 0)) }
  };

  const yesterdayCounters = {
    loaded: { count: Number(yIn.loaded_count || 0),  totalWeight: Number(yIn.loaded_total_weight || 0) },
    output: { count: Number(yOut.output_count || 0), totalWeight: Number(yOut.output_total_weight || 0) },
    delta:  { weight: (Number(yIn.loaded_total_weight || 0) - Number(yOut.output_total_weight || 0)) }
  };

  const last10Loaded = (l10Loaded.rows || []).map(r => ({
    bagNo: r.bag_no, grade: r.grade, weight: Number(r.weight) || 0, loadedAt: r.loaded_at
  }));

  const last10Output = (l10Output.rows || []).map(r => ({
    bagNo: r.bag_no, grade: r.grade, weight: Number(r.weight) || 0, outputAt: r.output_at
  }));

  return { todayCounters, yesterdayCounters, last10Loaded, last10Output };
}

module.exports = { getCounters };
