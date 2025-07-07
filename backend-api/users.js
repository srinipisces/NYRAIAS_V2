// 📁 File: routes/users.js
const express = require('express');
const router = express.Router();

const { authenticate } = require('./authenticate');
const { logUserActivity } = require('./auditlogger');
const bcrypt = require('bcrypt');

const pool = require('./db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');


console.log("inseide users and trying to listall");

//login
router.post('/login', async (req, res) => {
  const { userid, password, accountid } = req.body;

  if (!userid || !password || !accountid) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const tableName = `${accountid}_authentication`;

  try {
    const result = await pool.query(
      `SELECT password, access FROM ${tableName} WHERE userid = $1 and status = true`,
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid userid or password' });
    }

    const match = await bcrypt.compare(password, result.rows[0].password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid userid or password' });
    }

    const token = jwt.sign(
      { userid, accountid, access: result.rows[0].access },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const expiresAt = new Date(Date.now() + 8 * 3600 * 1000);
    await pool.query(
      'INSERT INTO active_tokens (token, userid, accountid, expires_at) VALUES ($1, $2, $3, $4)',
      [token, userid, accountid, expiresAt]
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // use false for local testing only
        sameSite: 'Strict',
        maxAge: 8 * 3600 * 1000, // 8 hours
      })
      .json({ success: true });

  } catch (err) {
    if (err.code === '42P01') {
      return res.status(404).json({ message: `Invalid accountid '${accountid}'` });
    }

    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
//validate token
router.get('/validate-token', authenticate, async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('❌ No token in cookie');
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });
    return res.status(401).json({ message: 'No token provided' });
  }

  const { userid, accountid, access } = req.user;


  try {
    const result = await pool.query(
      'SELECT 1 FROM active_tokens WHERE token = $1 AND userid = $2 AND accountid = $3',
      [token, userid, accountid]
    );

    

    if (result.rows.length === 0) {
      console.log('❌ Token not found in active_tokens table');
      res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      });
      return res.status(401).json({ message: 'Token is no longer active' });
    }

    res.json({ userid, accountid, access });
  } catch (err) {
    console.error('Token validation error:', err);
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      });
    res.status(500).json({ message: 'Server error validating token' });
  }
});




// GET users for an account
router.get('/listallusers/:accountid', authenticate, checkAccess("Settings"),async (req, res) => {
  const { accountid } = req.params;
  const table = `${accountid}_authentication`;
  try {
    const result = await pool.query(
      `SELECT userid, name, email, phone, status, access FROM ${table}`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// POST create a new user
router.post('/createuser/', authenticate, checkAccess("Settings"),async (req, res) => {
  const { accountid, userid, name, email, phone, access, status, createdBy } = req.body;
  const table = `${accountid}_authentication`;

  try {
    const hashed = await bcrypt.hash('Welcome123', 10);

    await pool.query(
      `INSERT INTO ${table} (userid, name, email, phone, access, status, password, activities,accountid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)`,
      [
        userid,
        name,
        email,
        phone,
        access,
        status,
        hashed,
        JSON.stringify([
          {
            timestamp: new Date().toISOString(),
            action: 'created',
            performedBy: createdBy,
            details: { name, email, phone, access, status },
          },
        ]),
        accountid,
      ]
    );

    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Create user error:', err);
    if (err.code === '23505') {
      // PostgreSQL unique violation error code
      return res.status(409).json({ message: 'UserID already exists' });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
});


router.put('/updateuser/:accountid/:userid', authenticate, checkAccess("Settings"),async (req, res) => {
  const { accountid, userid } = req.params;
  let { name, email, phone, access, status, updatedBy } = req.body;
  const table = `${accountid}_authentication`;

  // Ensure access is always an array
  access = Array.isArray(access) ? access : [];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(`SELECT * FROM ${table} WHERE userid = $1`, [userid]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const changes = {};
    if (user.name !== name) changes.name = { from: user.name, to: name };
    if (user.email !== email) changes.email = { from: user.email, to: email };
    if (user.phone !== phone) changes.phone = { from: user.phone, to: phone };
    if (user.status !== status) changes.status = { from: user.status, to: status };
    if (JSON.stringify(user.access) !== JSON.stringify(access)) changes.access = { from: user.access, to: access };

    await client.query(
      `UPDATE ${table}
       SET name = $1, email = $2, phone = $3, access = $4, status = $5
       WHERE userid = $6`,
      [name, email, phone, access, status, userid]
    );

    const activityJson = JSON.stringify([
      {
        timestamp: new Date().toISOString(),
        action: 'updated',
        performedBy: updatedBy,
        changes,
      },
    ]);

    await client.query(
      `UPDATE ${table}
       SET activities = activities || $1::jsonb
       WHERE userid = $2`,
      [activityJson, userid]
    );

    await client.query('COMMIT');

    res.json({
      userid,
      name,
      email,
      phone,
      access,
      status,
      message: 'User updated successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Error updating user' });
  } finally {
    client.release();
  }
});

router.post('/resetpassword/:accountid/:userid', authenticate, checkAccess("Settings"),async (req, res) => {
  const { accountid, userid } = req.params;
  const { performedBy } = req.body;
  const table = `${accountid}_authentication`;

  const newPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(newPassword, 10);

  const activityLog = [{
    timestamp: new Date().toISOString(),
    action: 'reset_password',
    performedBy,
  }];

  try {
    const result = await pool.query(
      `UPDATE ${table}
       SET password = $1,
           activities = activities || $2::jsonb
       WHERE userid = $3`,
      [hashed, JSON.stringify(activityLog), userid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ newPassword });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// 🔑 Change Password

router.post('/changepassword', authenticate,async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { userid, accountid } = req.user;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing oldPassword or newPassword' });
  }

  const tableName = `${accountid}_authentication`;

  try {
    const result = await pool.query(
      `SELECT password, activities FROM ${tableName} WHERE userid = $1`,
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: storedHash, activities } = result.rows[0];

    const match = await bcrypt.compare(oldPassword, storedHash);
    if (!match) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const newActivity = {
      timestamp: new Date().toISOString(),
      action: 'change_password',
      performedBy: userid,
    };

    const updatedActivities = Array.isArray(activities)
      ? [...activities, newActivity]
      : [newActivity];

    await pool.query(
      `UPDATE ${tableName} SET password = $1, activities = $2 WHERE userid = $3`,
      [newHash, JSON.stringify(updatedActivities), userid]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

router.post('/updateAccess/:accountid/:userid', authenticate, checkAccess("Settings"),async (req, res) => {
  const { accountid, userid } = req.params;
  const { access, updatedBy } = req.body; // access data is passed in the request body

  // Ensure access is always an array
  const table = `${accountid}_authentication`;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the current user's data from the database
    const result = await client.query(`SELECT * FROM ${table} WHERE userid = $1`, [userid]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Track changes to access
    const changes = {};
    if (JSON.stringify(user.access) !== JSON.stringify(access)) {
      changes.access = { from: user.access, to: access };
    }

    // Update the user's access
    await client.query(
      `UPDATE ${table}
       SET access = $1
       WHERE userid = $2`,
      [access, userid]
    );

    // Log the activity in the activities field
    const activityJson = JSON.stringify([
      {
        timestamp: new Date().toISOString(),
        action: 'updated access',
        performedBy: updatedBy,
        changes,
      },
    ]);

    // Append the activity log to the existing activities
    await client.query(
      `UPDATE ${table}
       SET activities = activities || $1::jsonb
       WHERE userid = $2`,
      [activityJson, userid]
    );

    await client.query('COMMIT');

    res.json({
      userid,
      access,
      message: 'User access updated successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update access error:', err);
    res.status(500).json({ message: 'Error updating user access' });
  } finally {
    client.release();
  }
});

router.post('/logout', authenticate, async (req, res) => {
  const token = req.token;

  try {
    await pool.query(`DELETE FROM active_tokens WHERE token = $1`, [token]);

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Strict',
      secure: false, // if using HTTPS
    });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
});


module.exports = router;
