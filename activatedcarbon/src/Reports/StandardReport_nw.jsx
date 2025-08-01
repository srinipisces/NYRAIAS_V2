import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, TextField } from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function StandardReport({ endpoint, title, enableDateRange = false, needsSingleDate = false, startDate, endDate, fetchDataTrigger }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      let body = {};

      if (enableDateRange) {
        body = {
          start_date: startDate?.format('DDMMYY'),
          end_date: endDate?.format('DDMMYY')
        };
      } else if (needsSingleDate) {
        body = {
          datecode: startDate?.format('DDMMYY')
        };
      }

      const res = await axios.post(`${API_URL}/api/reports/${endpoint}`, body, { withCredentials: true });
      const { columns: cols, rows: data } = res.data;
      setColumns(cols.map(col => ({ field: col, headerName: col, flex: 1, minWidth: 150 })));
      setRows(data.map((r, i) => ({ id: i, ...r })));
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchDataTrigger) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDataTrigger]);

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredRows = rows.filter(row =>
    Object.values(row).some(val => val?.toString().toLowerCase().includes(searchText))
  );

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>

      <TextField
        size="small"
        placeholder="Search"
        value={searchText}
        onChange={handleSearch}
        sx={{ mb: 2, width: 300 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={filteredRows}
          columns={columns}
          autoHeight
          density="compact"
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      )}
    </Box>
  );
}
