require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const readlineSync = require('readline-sync');

const db = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

db.connect();

async function updatePassword(accountid) {
  try {
    const userid = readlineSync.question('Enter userid: ');
    const newPassword = readlineSync.question('Enter new password: ', {
      hideEchoBack: true,
    });
    const confirmPassword = readlineSync.question('Confirm new password: ', {
      hideEchoBack: true,
    });

    if (newPassword !== confirmPassword) {
      console.log('\n❌ Passwords do not match.');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const table = `${accountid}_authentication`;

    const result = await db.query(
      `UPDATE ${table} SET password = $1 WHERE userid = $2`,
      [hashedPassword, userid]
    );

    if (result.rowCount === 0) {
      console.log(`❌ No user '${userid}' found in account '${accountid}'`);
    } else {
      console.log(`✅ Password updated for '${userid}' in '${accountid}'`);
    }
  } catch (err) {
    console.error('❌ Error updating password:', err.message);
  } finally {
    db.end();
  }
}

// ---- ENTRY POINT ----
const args = process.argv.slice(2);
if (!args[0]) {
  console.error('❌ Usage: node updateUserPassword.js <accountid>');
  process.exit(1);
}

updatePassword(args[0]);
