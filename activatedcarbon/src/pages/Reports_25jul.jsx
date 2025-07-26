import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
  TextField,
} from '../../node_modules/@mui/material';
import { DatePicker } from '../../node_modules/@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '../../node_modules/@mui/x-date-pickers/LocalizationProvider';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const reportOptions = [
  'Grade wise In-Stock',
  'Granulated Charcoal In-Stock',
  'RawMaterial In-Stock',
  'Raw-Material Stock History',
  'Granulated Charcoal Stock History',
  'Grade wise Stock History',
  'Crusher Performance',
  'Kiln Feed Quality',
  'Boiler Performance',
  'Supplier Performance',
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reportOptions[0]);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [activeReport, setActiveReport] = useState('');


  const isHistory = selectedReport.toLowerCase().includes('history');

  const fetchReportData = async ({ full = false } = {}) => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/reports/${selectedReport.replaceAll(' ', '_').toLowerCase()}`,
        {
          ...(isHistory && {
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
          }),
          ...(full
            ? {}
            : {
                page: page + 1,
                limit: pageSize,
              }),
        },
        { withCredentials: true }
      );

      const { columns: cols, rows: data, total } = response.data;

      if (!full) {
        setColumns(cols.map(col => ({ field: col, headerName: col, flex: 1 })));
        setRows(data);
        setTotalRows(total || data.length);
      }

      return { cols, data };
    } catch (error) {
      console.error('Error fetching report:', error);

      // Clear old data
      setColumns([]);
      setRows([]);
      setTotalRows(0);

      return { cols: [], data: [] };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setPage(0);
    setRows([]);
    setColumns([]);
    setTotalRows(0);
    setHasSubmitted(true);
    setActiveReport(selectedReport);
    fetchReportData();
  };

  const handleDownloadCSV = async () => {
    const { cols, data } = await fetchReportData({ full: true });
    if (data.length === 0) return;

    const csvHeader = cols.join(',');
    const csvBody = data.map(row =>
      cols.map(col => row[col]).join(',')
    ).join('\n');

    const blob = new Blob([`${csvHeader}\n${csvBody}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedReport.replaceAll(' ', '_')}.csv`;
    a.click();
  };

  useEffect(() => {
    if (hasSubmitted) {
      fetchReportData();
    }
  }, [page, pageSize]);

  const filteredRows = rows.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          width: '1000px',
          px: 3,
          pt: 2,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h5" gutterBottom>Reports</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Select Report</InputLabel>
            <Select
              value={selectedReport}
              label="Select Report"
              onChange={(e) => setSelectedReport(e.target.value)}
              disabled={loading}
            >
              {reportOptions.map((report, index) => (
                <MenuItem key={index} value={report}>{report}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {isHistory && (
            <>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small' } }}
              />
            </>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={!selectedReport || loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Retrieving...' : 'Submit'}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />

        <Paper elevation={3} sx={{ p: 2, minHeight: 450 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Report: <strong>{activeReport || '—'}</strong>
            </Typography>

            <IconButton onClick={handleDownloadCSV} disabled={rows.length === 0}>
              <DownloadIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Filter"
              size="small"
              fullWidth
              placeholder="Type to filter results"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={loading}
            />
          </Box>

          <Box sx={{ height: 360, position: 'relative' }}>
            {loading ? (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={filteredRows.map((row, i) => ({ id: i, ...row }))}
                columns={columns}
                pagination
                paginationMode="server"
                rowCount={totalRows}
                pageSize={pageSize}
                page={page}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#e0e0e0',
                    fontWeight: 'bold',
                  },
                }}
              />
            )}
          </Box>

          {!loading && rows.length === 0 && (
            <Typography sx={{ mt: 2, color: 'gray' }} align="center">
              No data available.
            </Typography>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
