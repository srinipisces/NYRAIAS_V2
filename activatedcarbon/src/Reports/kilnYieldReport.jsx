import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, IconButton, TextField, Paper, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';

const API_URL = import.meta.env.VITE_API_URL;

export default function KilnYieldReport({ startDate, endDate }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/reports/kiln_yield`, {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD')
      }, { withCredentials: true });

      const { columns: cols, rows: data } = response.data;
      setColumns(cols.map(col => ({
        field: col,
        headerName: col,
        flex: 1,
        minWidth: 150
      })));
      setRows(data.map((r, i) => ({ id: i, ...r })));
    } catch (err) {
      console.error('Error loading kiln_yield report:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleDownload = () => {
    const csv = [columns.map(c => c.field).join(',')];
    rows.forEach(row => {
      csv.push(columns.map(c => row[c.field] ?? '').join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kiln_yield_report.csv`;
    a.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Kiln Yield Report</Typography>
        <IconButton onClick={handleDownload} disabled={rows.length === 0}>
          <DownloadIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        label="Filter"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="small"
        sx={{ mb: 2 }}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ height: 460 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            sx={{
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#e0e0e0' }
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
