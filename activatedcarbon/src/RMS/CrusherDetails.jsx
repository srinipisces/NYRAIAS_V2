// CrusherPerformanceTable.jsx — server‑paginated table with Date Range Filter + CSV Download
// Backend endpoints used:
//   GET  /api/materialinward/crusher-performance-inward?page=&page_size=&start_date=&end_date=
//   GET  /api/materialinward/crusher-performance-inward/export?start_date=&end_date=

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

const API_URL = import.meta.env.VITE_API_URL;

export default function CrusherPerformanceTable() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // zero-based in UI
  const [pageSize] = useState(50);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Filters — ONLY date range now
  const [filters, setFilters] = useState({
    start_date: '', // YYYY-MM-DD
    end_date: '',   // YYYY-MM-DD
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page + 1));
    params.set('page_size', String(pageSize));
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    return params.toString();
  }, [page, pageSize, filters]);

  async function fetchPage() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/materialoutward/crusher-performance-inward?${queryString}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      setRows(json.rows || []);
      setTotalRows(Number(json.total_rows || 0));
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPage(); /* eslint-disable-next-line */ }, [queryString]);

  function handleApplyFilters(newValues) {
    setPage(0); // reset to first page when filters change
    setFilters((prev) => ({ ...prev, ...newValues }));
    setOpenFilter(false);
  }

  async function handleDownload() {
    try {
      const url = `${API_URL}/api/materialoutward/crusher-performance-inward/export?${queryString}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'crusher_performance.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert('Unable to download CSV.');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Filters (Date Range)">
            <span>
              <IconButton onClick={() => setOpenFilter(true)} sx={{ mr: 1 }}>
                <FilterAltOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Download CSV">
            <span>
              <IconButton onClick={handleDownload}>
                <DownloadOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      <Paper sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Inward Number</TableCell>
                <TableCell>Sample From</TableCell>
                <TableCell>Grade +2</TableCell>
                <TableCell>Grade 2/3</TableCell>
                <TableCell>Grade 3/4</TableCell>
                <TableCell>Grade 4/6</TableCell>
                <TableCell>Grade 6/10</TableCell>
                <TableCell>Grade 10/12</TableCell>
                <TableCell>Grade 12/14</TableCell>
                <TableCell>Grade -14</TableCell>
                <TableCell>Moisture</TableCell>
                <TableCell>Dust</TableCell>
                <TableCell>DateTime</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13}>
                    <Typography sx={{ p: 2 }} color="text.secondary">No data</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => (
                  <TableRow key={`${r.inward_number}-${idx}`}>
                    <TableCell>{r.inward_number}</TableCell>
                    <TableCell>{r.sample_from}</TableCell>
                    <TableCell>{r.grade_plus2}</TableCell>
                    <TableCell>{r.grade_2by3}</TableCell>
                    <TableCell>{r.grade_3by4}</TableCell>
                    <TableCell>{r.grade_4by6}</TableCell>
                    <TableCell>{r.grade_6by10}</TableCell>
                    <TableCell>{r.grade_10by12}</TableCell>
                    <TableCell>{r.grade_12by14}</TableCell>
                    <TableCell>{r.grade_minus14}</TableCell>
                    <TableCell>{r.moisture}</TableCell>
                    <TableCell>{r.dust}</TableCell>
                    <TableCell>{r.event_timestamp ? new Date(r.event_timestamp).toLocaleString() : ''}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          rowsPerPageOptions={[50]}
          count={totalRows}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={() => {}}
        />
      </Paper>

      <FilterDialog
        open={openFilter}
        initialValues={filters}
        onClose={() => setOpenFilter(false)}
        onApply={handleApplyFilters}
      />
    </Box>
  );
}

function FilterDialog({ open, onClose, onApply, initialValues }) {
  const [local, setLocal] = useState(initialValues);
  useEffect(() => setLocal(initialValues), [initialValues, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Date Range</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={local.start_date}
              onChange={(e) => setLocal((s) => ({ ...s, start_date: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={local.end_date}
              onChange={(e) => setLocal((s) => ({ ...s, end_date: e.target.value }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="outlined" onClick={() => setLocal({ start_date: '', end_date: '' })}>Clear</Button>
        <Button variant="contained" onClick={() => onApply(local)}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
}
