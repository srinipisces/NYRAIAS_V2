require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const db = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
db.connect();

const createAdminUser = async (accountid, password = 'administrator') => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const access = ['Dashboard','Reports','Settings',
    'Operations.Security', 'Operations.Lab', 'Operations.Raw-Material Inward', 'Operations.Crusher Performance', 'Operations.Raw-Material Outward',
    'Operations.Kiln Feed','Operations.Kiln Feed Quality', 'Operations.Boiler Performance', 'Operations.Kiln Output', 'Operations.Screening Inward', 
    'Operations.Screening Outward', 'Operations.Stock'
  ];
    const activities = [{
      timestamp: new Date().toISOString(),
      action: 'User Created',
      performedBy: 'system',
      changes: {
        name: 'Admin User',
        email: 'admin@example.com',
        access,
        status: true,
      },
    }];

    const insertQuery = `
      INSERT INTO ${accountid}_authentication (
        userid, password, name, email, phone, access, status, accountid, activities
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (userid) DO NOTHING;
    `;

    await db.query(insertQuery, [
      'admin',
      hashedPassword,
      'Admin User',
      'admin@example.com',
      '1234567890',
      access,
      true,
      accountid,
      JSON.stringify(activities),
    ]);

    console.log(`✅ Admin user created for account '${accountid}'`);
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
  } finally {
    db.end();
  }
};

// ---- ENTRY POINT ----
const args = process.argv.slice(2);
if (!args[0]) {
  console.error('❌ Usage: node createAdminUser.js <accountid> [password]');
  process.exit(1);
}
createAdminUser(args[0], args[1]);
