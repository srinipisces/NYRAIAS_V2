// Updated ReportsPage.jsx with error alert, row-level loss_or_gain highlight, and daily total rows
import { useState, useEffect } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Typography, Button,
  IconButton, CircularProgress, Paper, Divider, TextField, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const reportOptions = [
   'RawMaterial In-Stock',
  'Raw-Material Stock History', 'Granulated Charcoal In-Stock', 'Granulated Charcoal Stock History','Grade wise In-Stock',
  'Grade wise Stock History', 'RMS Performance','Crusher Performance', 'Kiln Feed Quality',
  'Boiler Performance', 'Supplier Performance'
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reportOptions[0]);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeReport, setActiveReport] = useState('');

  const isHistory = selectedReport.toLowerCase().includes('history');
  const isRawMaterialHistory = selectedReport === 'Raw-Material Stock History';

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await axios.post(
        `${API_URL}/api/reports/${selectedReport.replaceAll(' ', '_').toLowerCase()}`,
        isHistory ? {
          start_date: startDate.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD'),
        } : {},
        { withCredentials: true }
      );

      let { columns: cols, rows: data } = response.data;

      if (isRawMaterialHistory) {
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
      }

      setColumns(cols.map(col => ({ field: col, headerName: col, flex: 1 ,minWidth: 150})));
      setRows(data.map((row, index) => ({ id: index, ...row })));
      setActiveReport(selectedReport);
    } catch (error) {
      console.error('Error fetching report:', error);
      setErrorMessage('Error fetching report data.');
      setColumns([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    const response = await axios.post(
      `${API_URL}/api/reports/${selectedReport.replaceAll(' ', '_').toLowerCase()}`,
      isHistory ? {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
      } : {},
      { withCredentials: true }
    );
    let { columns: cols, rows: data } = response.data;

    if (isRawMaterialHistory) {
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
    }

    const csv = [cols.join(',')];
    data.forEach(row => {
      csv.push(cols.map(col => row[col] ?? '').join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedReport.replaceAll(' ', '_')}.csv`;
    a.click();
  };

  const filteredRows = rows.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ px: 3, pt: 2, width: '1000px' }}>
        <Typography variant="h5" gutterBottom>Reports</Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Select Report</InputLabel>
            <Select value={selectedReport} label="Select Report" onChange={e => setSelectedReport(e.target.value)} disabled={loading}>
              {reportOptions.map((report, idx) => (
                <MenuItem key={idx} value={report}>{report}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {isHistory && (
            <>
              <DatePicker label="Start Date" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small' } }} />
              <DatePicker label="End Date" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: 'small' } }} />
            </>
          )}

          <Button variant="contained" size="small" onClick={fetchReportData} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : null}>
            {loading ? 'Retrieving...' : 'Submit'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Report: <strong>{activeReport || '—'}</strong>
            </Typography>
            <IconButton onClick={handleDownloadCSV} disabled={rows.length === 0}>
              <DownloadIcon />
            </IconButton>
          </Box>

          <TextField label="Filter" fullWidth size="small" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Type to filter" sx={{ mb: 2 }} />

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
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
