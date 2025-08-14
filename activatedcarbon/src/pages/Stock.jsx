// Stock.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExpressionSearchBar from './ExpressionSearchBar';
import StockTable from '../Tables/StockTable_New';
import { Snackbar, Alert } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

export default function Stock() {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [filters, setFilters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async (pageOverride = page, customFilters = filters) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/stock/filter_instock`,
        { filters: customFilters, page: pageOverride, limit: rowsPerPage },
        { withCredentials: true }
      );
      setData(res.data.data);
      setTotalRows(res.data.total);
      setPage(pageOverride);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const handleSearch = async (newFilters) => {
    setFilters(newFilters);
    fetchData(0, newFilters);
  };

  const handleBulkUpdate = async (filterSet, newStatus) => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/stock/bulk-update`,
        { filters: filterSet, status: newStatus },
        { withCredentials: true }
      );
      fetchData(0, filterSet);
    } catch (err) {
      setError('Bulk update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualUpdate = async (bag, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/stock/singleupdate/${bag}`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchData(page);
    } catch (err) {
      setError(`Update failed for bag ${bag}.`);
    }
  };

  return (
    <>
      <h2>Material in InStock</h2>
      {/* <ExpressionSearchBar
        onSearch={handleSearch}
        onBulkUpdate={handleBulkUpdate}
        loading={loading}
      /> */}
      <StockTable
        data={data}
        page={page}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        onPageChange={fetchData}
        onUpdate={handleIndividualUpdate}
        loading={loading}
      />
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
}
