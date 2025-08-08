require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Initialize DB connection
const db = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
db.connect();

const createUser = async ({
  accountid,
  userid,
  password,
  name,
  email,
  phone,
  access = [],
  status = true,
  performedBy = 'system'
}) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const activities = [{
      timestamp: new Date().toISOString(),
      action: 'User Created',
      performedBy,
      changes: {
        name,
        email,
        phone,
        access,
        status,
      },
    }];

    const insertQuery = `
      INSERT INTO ${accountid}_authentication (
        userid, password, name, email, phone, access, status, accountid, activities
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (userid) DO NOTHING;
    `;

    await db.query(insertQuery, [
      userid,
      hashedPassword,
      name,
      email,
      phone,
      access,
      status,
      accountid,
      JSON.stringify(activities),
    ]);

    console.log(`✅ User '${userid}' created in '${accountid}_authentication'`);
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
  } finally {
    db.end();
  }
};

// ---- ENTRY POINT ----
const args = process.argv.slice(2);
if (args.length < 6) {
  console.error(`❌ Usage: node createUser.js <accountid> <userid> <password> <name> <email> <phone>`);
  process.exit(1);
}

// Basic args
const [accountid, userid, password, name, email, phone] = args;

// You can modify the default access here if needed
const defaultAccess = [
  'Dashboard',
  'Reports',
  'Settings',
  'Operations.Raw-Material Inward',
  'Operations.Raw-Material Outward'
];

// Call the function
createUser({
  accountid,
  userid,
  password,
  name,
  email,
  phone,
  access: defaultAccess,
  status: true
});
