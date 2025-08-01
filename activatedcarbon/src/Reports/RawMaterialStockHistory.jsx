import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, IconButton, TextField, Paper, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';

const API_URL = import.meta.env.VITE_API_URL;

export default function RawMaterialStockHistory({ startDate, endDate }) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/reports/raw-material_stock_history`, {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD')
      }, { withCredentials: true });

      let { columns: cols, rows: data } = res.data;

      const grouped = {};
      data.forEach(row => {
        const day = row.day;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(row);
      });

      const transformed = [];
      Object.entries(grouped).forEach(([day, groupRows]) => {
        let totalStock = 0, totalLossGain = 0;
        groupRows.forEach(r => {
          totalStock += Number(r.stock || 0);
          totalLossGain += Number(r.loss_or_gain || 0);
          transformed.push(r);
        });
        transformed.push({
          day,
          inward_number: 'Total',
          stock: totalStock,
          loss_or_gain: totalLossGain,
          total_in_stock: +(totalStock + totalLossGain).toFixed(2)
        });
      });
      data = transformed;
      cols = [...new Set(data.flatMap(Object.keys))];

      setColumns(cols.map(col => ({ field: col, headerName: col, flex: 1, minWidth: 150 })));
      setRows(data.map((row, index) => ({ id: index, ...row })));
    } catch (err) {
      console.error('Error loading history report:', err);
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
    a.download = `Raw-Material_Stock_History.csv`;
    a.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Raw-Material Stock History</Typography>
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
            getCellClassName={(params) => {
              if (params.field === 'loss_or_gain' && Number(params.value) < 0) {
                return 'negative-cell';
              }
              return '';
            }}
            getRowClassName={(params) =>
              params.row.inward_number === 'Total' ? 'summary-row' : ''
            }
            sx={{
              '& .negative-cell': { backgroundColor: '#ffebee' },
              '& .summary-row': { backgroundColor: '#eeeeee', fontWeight: 'bold' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#e0e0e0' }
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
