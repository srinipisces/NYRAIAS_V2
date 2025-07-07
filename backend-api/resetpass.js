// resetpass.js
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const [accountid, userid, newPassword] = process.argv.slice(2);

if (!accountid || !userid || !newPassword) {
  console.error('❌ Usage: node resetpass.js <accountid> <userid> <newPassword>');
  process.exit(1);
}

const client = new Client({
    host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const table = `${accountid}_authentication`;

  try {
    await client.connect();
    console.log(`🔌 Connected to DB. Updating password for ${userid} in table ${table}`);

    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await client.query(
      `UPDATE ${table} SET password = $1 WHERE userid = $2`,
      [hashed, userid]
    );

    if (result.rowCount === 0) {
      console.log(`❌ User '${userid}' not found in table '${table}'`);
    } else {
      console.log(`✅ Password for '${userid}' has been reset successfully`);
    }
  } catch (err) {
    console.error('❌ Full error:', err);
  } finally {
    await client.end();
    console.log('🔒 DB connection closed.');
  }
})();
