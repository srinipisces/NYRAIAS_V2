import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBarWithStatus from './SearchBarWithStatus';
import StockTable from '../Tables/StockTable';
import { Snackbar, Alert } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

export default function Stock() {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [searchParams, setSearchParams] = useState({ searchText: '', status: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async (pageOverride = page) => {
    try {
      setLoading(true);
      const { searchText, status } = searchParams;
      const res = await axios.get(`${API_URL}/api/stock/instock`, {
        params: {
          page: pageOverride,
          limit: rowsPerPage,
          search: searchText,
          status
        },
        withCredentials: true
      });
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
    fetchData(0); // initial load
  }, []);

  const handleSearch = async (searchText, status) => {
    setSearchParams({ searchText, status });
    try {
      setLoading(true);
      
      if (!searchText) {
        const { searchText, status } = searchParams;
        const res = await axios.get(`${API_URL}/api/stock/instock`, {
          params: {
            page: 0,
            limit: rowsPerPage,
            search: searchText,
            status
          },
          withCredentials: true
        });
        setData(res.data.data);
        setTotalRows(res.data.total);
        setPage(0);
      } else {
        const res = await axios.get(`${API_URL}/api/stock/filter`, {
          params: { search: searchText, status },
          withCredentials: true
        });
        setData(res.data.data);
        setTotalRows(res.data.total);
        setPage(0);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to filter stock.');
    } finally {
      setLoading(false);
    }
  };


  const handleBulkUpdate = async (searchText, status) => {
    try {
      await axios.put(`${API_URL}/api/stock/bulk-update`, { searchText, status }, { withCredentials: true });
      fetchData(0);
    } catch (err) {
      setError('Bulk update failed.');
    }
  };

  const handleIndividualUpdate = async (bag, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/stock/singleupdate/${bag}`, { status: newStatus }, { withCredentials: true });
      fetchData(page);
    } catch (err) {
      setError(`Update failed for bag ${bag}.`);
    }
  };

  return (
    <>
      <h2>Material in InStock </h2>
      <SearchBarWithStatus onSearch={handleSearch} onBulkUpdate={handleBulkUpdate} />
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
