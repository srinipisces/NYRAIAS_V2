const pool = require('./db');

async function logUserActivity(accountid, userid, changes, performedBy) {
  const table = `${accountid}_authentication`;
  const timestamp = new Date();

  const logEntry = {
    timestamp,
    action: 'update',
    performedBy,
    changes
  };

  await pool.query(
    `UPDATE ${table}
     SET activities = COALESCE(activities, '[]'::jsonb) || $1::jsonb
     WHERE userid = $2`,
    [JSON.stringify([logEntry]), userid]
  );
}

module.exports = { logUserActivity };
