const express = require('express');
const router = express.Router();
const pool = require('./db');
const { authenticate } = require('./authenticate');
const checkAccess = require('./checkaccess');

router.post('/create/:accountid', authenticate, checkAccess('Settings'), async (req, res) => {
  const { accountid } = req.params;
  const create_userid = req.user.userid;  // ✅ Extract from token
  const {
    supplier_name,
    street,
    city,
    pincode,
    contact_person,
    contact_number
  } = req.body;

  const table = `${accountid}_suppliers`;

  try {
    await pool.query(
      `INSERT INTO ${table} 
      (supplier_name, street, city, pincode, contact_person, contact_number, create_userid)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        supplier_name,
        street,
        city,
        pincode || null,
        contact_person,
        contact_number || null,
        create_userid
      ]
    );

    res.status(200).json({ message: 'Supplier added successfully' });
  } catch (err) {
    console.error('Error inserting supplier:', err);
    res.status(500).json({ error: 'Database error while inserting supplier' });
  }
});

router.get('/list/:accountid', authenticate, checkAccess('Settings'), async (req, res) => {
  const { accountid } = req.params;
  const table = `${accountid}_suppliers`;

  try {
    const result = await pool.query(
      `SELECT supplier_name, street, city, pincode, contact_person, contact_number, create_userid, created_dt 
       FROM ${table}
       ORDER BY created_dt DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

router.put('/update/:accountid/:supplier_name', authenticate, checkAccess('Settings'), async (req, res) => {
  const { accountid, supplier_name } = req.params;
  const updatedBy = req.user.userid;
  const {
    street,
    city,
    pincode,
    contact_person,
    contact_number
  } = req.body;

  const table = `${accountid}_suppliers`;

  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE supplier_name = $1`, [supplier_name]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const existing = result.rows[0];
    const changes = [];

    if (street !== existing.street) changes.push({ field: 'street', from: existing.street, to: street });
    if (city !== existing.city) changes.push({ field: 'city', from: existing.city, to: city });
    if (Number(pincode) !== Number(existing.pincode)) changes.push({ field: 'pincode', from: existing.pincode, to: pincode });
    if (contact_person !== existing.contact_person) changes.push({ field: 'contact_person', from: existing.contact_person, to: contact_person });
    if (Number(contact_number) !== Number(existing.contact_number)) changes.push({ field: 'contact_number', from: existing.contact_number, to: contact_number });

    if (changes.length === 0) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    const activityEntry = {
      timestamp: new Date().toISOString(),
      action: 'updated',
      performedBy: updatedBy,
      changes
    };

    await pool.query(
      `UPDATE ${table}
       SET street = $1, city = $2, pincode = $3, contact_person = $4, contact_number = $5,
           activities = activities || $6::jsonb
       WHERE supplier_name = $7`,
      [
        street,
        city,
        pincode || null,
        contact_person,
        contact_number || null,
        JSON.stringify([activityEntry]),
        supplier_name
      ]
    );

    res.status(200).json({ message: 'Supplier updated successfully' });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ error: 'Database error while updating supplier' });
  }
});

router.get('/listnames', authenticate, async (req, res) => {
  const { accountid } = req.user; // ✅ comes from token
  const table = `${accountid}_suppliers`;

  try {
    const result = await pool.query(`SELECT supplier_name FROM ${table} ORDER BY supplier_name ASC`);
    const names = result.rows.map(row => row.supplier_name);
    res.json(names);
  } catch (err) {
    console.error('Error fetching supplier names:', err);
    res.status(500).json({ message: 'Failed to fetch supplier names' });
  }
});



module.exports = router;