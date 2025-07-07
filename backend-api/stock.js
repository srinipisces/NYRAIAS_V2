const express = require('express');
const router = express.Router();
const pool = require('./db');
const { authenticate } = require('./authenticate');
const checkAccess = require('./checkaccess');



router.get('/instock', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const kilnTable = `${accountid}_kiln_output`;
  const screenTable = `${accountid}_screening_outward`;

  // Pagination inputs
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 50;
  const offset = page * limit;

  try {
    // 1. Paginated query with UNION ALL
    const dataQuery = `
      SELECT bag_no, weight_with_stones AS weight, exkiln_stock AS delivery_status
      FROM ${kilnTable}
      WHERE exkiln_stock = 'InStock'

      UNION ALL

      SELECT bag_no, weight, delivery_status
      FROM ${screenTable}
      WHERE delivery_status = 'InStock'

      LIMIT $1 OFFSET $2
    `;

    const dataResult = await pool.query(dataQuery, [limit, offset]);

    // 2. Total count query
    const countQuery = `
      SELECT (
        SELECT COUNT(*) FROM ${kilnTable} WHERE exkiln_stock = 'InStock'
      ) + (
        SELECT COUNT(*) FROM ${screenTable} WHERE delivery_status = 'InStock'
      ) AS total
    `;

    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      data: dataResult.rows,
      total
    });
  } catch (err) {
    console.error('Error fetching in-stock bags:', err);
    res.status(500).json({ message: 'Failed to fetch in-stock bags' });
  }
});

router.get('/filter', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const { search = '', status } = req.query;

  if (!search) {
    return res.status(400).json({ message: 'Missing search parameter' });
  }

  const prefix = search.trim().charAt(0).toUpperCase();
  let table = '';
  let query = '';
  let values = [];

  if (prefix === 'S') {
    table = `${accountid}_screening_outward`;
    query = `
      SELECT bag_no, weight, delivery_status
      FROM ${table}
      WHERE bag_no ILIKE $1
      AND delivery_status = 'InStock'
    `;
    values = [`%${search}%`];
  } else if (prefix === 'K') {
    table = `${accountid}_kiln_output`;
    query = `
      SELECT bag_no, weight_with_stones AS weight, exkiln_stock AS delivery_status
      FROM ${table}
      WHERE bag_no ILIKE $1
      AND exkiln_stock = 'InStock'
    `;
    values = [`%${search}%`];
  } else {
    return res.status(400).json({ message: 'Search must begin with S or K' });
  }

  try {
    const result = await pool.query(query, values);
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error filtering stock:', err);
    res.status(500).json({ message: 'Failed to filter stock' });
  }
});


router.put('/bulk-update', authenticate, checkAccess('Operations.Stock'),async (req, res) => {
  const { userid,accountid } = req.user;
  const { searchText, status } = req.body;

  if (!searchText || !status) {
    return res.status(400).json({ message: 'Missing searchText or status' });
  }

  const prefix = searchText.trim().charAt(0).toUpperCase();
  let table, updateQuery;

  if (prefix === 'S') {
    table = `${accountid}_screening_outward`;
    updateQuery = `
      UPDATE ${table}
      SET delivery_status = $1,
      stock_change_userid = $3,
      stock_change_dt = current_timestamp 
      WHERE bag_no ILIKE $2
    `;
  } else if (prefix === 'K') {
    table = `${accountid}_kiln_output`;
    updateQuery = `
      UPDATE ${table}
      SET exkiln_stock = $1,
      stock_upd_user = $3,
      stock_upd_dt = current_timestamp
      WHERE bag_no ILIKE $2
    `;
  } else {
    return res.status(400).json({ message: 'SearchText must begin with S or K' });
  }

  try {
    const result = await pool.query(updateQuery, [status, `%${searchText}%`,userid]);
    res.json({ message: 'Bulk update successful', updated: result.rowCount });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ message: 'Bulk update failed' });
  }
});

router.put('/singleupdate/:bag_no', authenticate, checkAccess('Operations.Stock'),async (req, res) => {
  const { userid,accountid } = req.user;
  const { status } = req.body;
  const { bag_no } = req.params;

  if (!bag_no || !status) {
    return res.status(400).json({ message: 'Missing bag_no or status' });
  }

  const prefix = bag_no.trim().charAt(0).toUpperCase();
  let table, updateQuery;

  if (prefix === 'S') {
    table = `${accountid}_screening_outward`;
    updateQuery = `
      UPDATE ${table}
      SET delivery_status = $1,
      stock_change_userid = $3,
      stock_change_dt = current_timestamp 
      WHERE bag_no = $2
    `;
  } else if (prefix === 'K') {
    table = `${accountid}_kiln_output`;
    updateQuery = `
      UPDATE ${table}
      SET exkiln_stock = $1,
      stock_upd_user = $3,
      stock_upd_dt = current_timestamp
      WHERE bag_no = $2
    `;
  } else {
    return res.status(400).json({ message: 'Bag number must start with S or K' });
  }

  try {
    const result = await pool.query(updateQuery, [status, bag_no,userid]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Bag not found' });
    }
    res.json({ message: 'Update successful' });
  } catch (err) {
    console.error('Individual update error:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});


module.exports = router;