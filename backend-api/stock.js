const express = require('express');
const router = express.Router();
const pool = require('./db');
const { authenticate } = require('./authenticate');
const checkAccess = require('./checkaccess');



router.get('/instock', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const kilnTable = `${accountid}_destoning`;
  const screenTable = `${accountid}_screening_outward`;

  // Pagination inputs
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 50;
  const offset = page * limit;

  try {
    // 1. Paginated query with UNION ALL
    const dataQuery = `
      SELECT ds_bag_no as bag_no, 'exkiln' as grade,quality_ctc as ctc,weight_out AS weight, final_destination AS delivery_status
      FROM ${kilnTable}
      WHERE final_destination = 'InStock' and quality_ctc > 0

      UNION ALL

      SELECT bag_no, grade,ctc,weight, delivery_status
      FROM ${screenTable}
      WHERE delivery_status = 'InStock' and ctc > 0

    `;

    const dataResult = await pool.query(dataQuery, [limit, offset]);

    // 2. Total count query
    const countQuery = `
      SELECT (
        SELECT COUNT(*) FROM ${kilnTable} WHERE final_destination = 'InStock' and quality_ctc > 0
      ) + (
        SELECT COUNT(*) FROM ${screenTable} WHERE delivery_status = 'InStock' and ctc > 0
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
      SELECT bag_no, grade,weight, delivery_status
      FROM ${table}
      WHERE bag_no ILIKE $1
      AND delivery_status = 'InStock' and ctc > 0
    `;
    values = [`%${search}%`];
  } else if (prefix === 'D') {
    table = `${accountid}_destoning`;
    query = `
      SELECT ds_bag_no bag_no, 'exkiln' as grade,weight_out AS weight, final_destination AS delivery_status
      FROM ${table}
      WHERE ds_bag_no ILIKE $1
      AND final_destination = 'InStock' and quality_ctc > 0
    `;
    values = [`%${search}%`];
  } else {
    return res.status(400).json({ message: 'Search must begin with S or D' });
  }

  try {
    const result = await pool.query(query, values);
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error filtering stock:', err);
    res.status(500).json({ message: 'Failed to filter stock' });
  }
});


router.put('/bulk-update_old', authenticate, checkAccess('Operations.Stock'),async (req, res) => {
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
  } else if (prefix === 'D') {
    table = `${accountid}_destoning`;
    updateQuery = `
      UPDATE ${table}
      SET final_destination = $1,
      stock_upd_user = $3,
      stock_upd_dt = current_timestamp
      WHERE ds_bag_no ILIKE $2
    `;
  } else {
    return res.status(400).json({ message: 'SearchText must begin with S or D' });
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
  } else if (prefix === 'D') {
    table = `${accountid}_destoning`;
    updateQuery = `
      UPDATE ${table}
      SET final_destination = $1,
      stock_upd_user = $3,
      stock_upd_dt = current_timestamp
      WHERE ds_bag_no = $2
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

router.post('/filter_instock', authenticate, async (req, res) => {
  const { accountid } = req.user;
  const { filters = [], page = 0, limit = 50 } = req.body;

  const tableConfigs = [
    {
      table: `${accountid}_screening_outward`,
      aliasMap: {
        bag_no: 'bag_no',
        grade: 'grade',
        ctc: 'ctc'
      },
      selectClause: `bag_no, grade, ctc, weight, delivery_status`,
      staticFilter: `delivery_status = 'InStock' AND ctc > 0`
    },
    {
      table: `${accountid}_destoning`,
      aliasMap: {
        bag_no: 'ds_bag_no',
        grade: `'exkiln'`,
        ctc: 'quality_ctc'
      },
      selectClause: `ds_bag_no AS bag_no, 'exkiln' AS grade, quality_ctc as ctc,weight_out AS weight, final_destination AS delivery_status`,
      staticFilter: `final_destination = 'InStock' AND quality_ctc > 0`
    }
  ];

  try {
    const allResults = [];

    for (const config of tableConfigs) {
      const { table, aliasMap, selectClause, staticFilter } = config;

      const conditions = [];
      const values = [];

      for (const filter of filters) {
        const dbField = aliasMap[filter.field];
        if (!dbField) continue;

        const operator = filter.operator.toUpperCase();

        if (operator === 'IN' && Array.isArray(filter.value)) {
          const placeholders = filter.value.map((_, i) => `$${values.length + i + 1}`);
          conditions.push(`${dbField} IN (${placeholders.join(', ')})`);
          values.push(...filter.value);
        } else {
          values.push(filter.value);
          conditions.push(`${dbField} ${operator} $${values.length}`);
        }
      }

      const whereClause = conditions.length > 0
        ? `${staticFilter} AND ${conditions.join(' AND ')}`
        : staticFilter;

      const query = `
        SELECT ${selectClause}
        FROM ${table}
        WHERE ${whereClause}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      const result = await pool.query(query, [...values, limit, page * limit]);
      allResults.push(...result.rows);
    }

    res.json({ data: allResults, total: allResults.length });

  } catch (err) {
    console.error('Filter instock error:', err);
    res.status(500).json({ message: 'Failed to filter stock' });
  }
});

router.put('/bulk-update', authenticate, checkAccess('Operations.Stock'), async (req, res) => {
  const { userid, accountid } = req.user;
  const { filters = [], status } = req.body;

  if (!status || !Array.isArray(filters)) {
    return res.status(400).json({ message: 'Missing filters or status' });
  }

  const baseUpdates = [
    {
      table: `${accountid}_screening_outward`,
      statusField: 'delivery_status',
      userField: 'stock_change_userid',
      timestampField: 'stock_change_dt',
      extraCondition: `delivery_status = 'InStock' AND ctc > 0`,
    },
    {
      table: `${accountid}_destoning`,
      statusField: 'final_destination',
      userField: 'stock_upd_user',
      timestampField: 'stock_upd_dt',
      extraCondition: `final_destination = 'InStock' AND quality_ctc > 0`,
    }
  ];

  try {
    let totalUpdated = 0;

    for (const {
      table, statusField, userField, timestampField, extraCondition
    } of baseUpdates) {
      const conditions = [];
      const values = [];

      for (const { field, operator, value } of filters) {
        // 👇 Substitute bag_no with actual table-specific bag field
        const actualField = (table.includes('destoning') && field === 'bag_no') ? 'ds_bag_no' : field;

        if (operator === 'IN' && Array.isArray(value)) {
          const placeholders = value.map((_, i) => `$${values.length + i + 1}`).join(', ');
          conditions.push(`${actualField} IN (${placeholders})`);
          values.push(...value);
        } else {
          values.push(value);
          conditions.push(`${actualField} ${operator} $${values.length}`);
        }
      }

      const whereClause = conditions.length > 0
        ? `${extraCondition} AND ${conditions.join(' AND ')}`
        : extraCondition;

      const updateQuery = `
        UPDATE ${table}
        SET ${statusField} = $${values.length + 1},
            ${userField} = $${values.length + 2},
            ${timestampField} = CURRENT_TIMESTAMP
        WHERE ${whereClause}
      `;

      const result = await pool.query(updateQuery, [...values, status, userid]);
      totalUpdated += result.rowCount;
    }

    res.json({ message: 'Bulk update successful', updated: totalUpdated });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ message: 'Bulk update failed' });
  }
});



module.exports = router;