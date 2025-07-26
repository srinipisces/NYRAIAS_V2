const express = require('express');
const router = express.Router();

const { authenticate } = require('./authenticate');
const { logUserActivity } = require('./auditlogger');
const bcrypt = require('bcrypt');

const pool = require('./db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const checkAccess= require('./checkaccess.js');

router.get('/dropdown', authenticate, async (req, res) => {
  const { tabname } = req.query;
  const { accountid } = req.user;

  if (!tabname) return res.status(400).json({ error: 'tabname is required' });

  const tableName = `${accountid}_dropdown`;

  try {
    const result = await pool.query(
      `SELECT settings FROM ${tableName} WHERE tabname = $1`,
      [tabname]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No settings found for this tab' });
    }

    res.json({ settings: result.rows[0].settings });
  } catch (err) {
    console.error('Error fetching dropdown settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/dropdown', authenticate,checkAccess('Settings'), async (req, res) => {
  const { tabname, settings } = req.body;
  const { accountid } = req.user;

  if (!tabname || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'tabname and settings array are required' });
  }

  const tableName = `${accountid}_dropdown`;

  try {
    await pool.query(
      `UPDATE ${tableName} SET settings = $1 WHERE tabname = $2`,
      [JSON.stringify(settings), tabname]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating dropdown settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/dropdown/update', authenticate, checkAccess('Settings'),async (req, res) => {
  const { tabname, settings } = req.body;
  const { accountid } = req.user;

  if (!tabname || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'tabname and valid settings array are required' });
  }

  const tableName = `${accountid}_dropdown`;

  try {
    // Overwrite the full settings array for that tab
    await pool.query(
      `UPDATE ${tableName} SET settings = $1 WHERE tabname = $2`,
      [JSON.stringify(settings), tabname]
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
