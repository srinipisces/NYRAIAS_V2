const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', async (client) => {
  try {
    await client.query(`SET TIME ZONE 'Asia/Kolkata'`);
  } catch (err) {
    console.error('Failed to set session timezone:', err.message);
  }
});

module.exports = pool;
