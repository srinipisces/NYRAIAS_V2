import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicTable from './DynamicTable';
import { Box, Stack, Button, TextField, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const API = `${import.meta.env.VITE_API_URL}/api/activation/kilnFeedQuality`;
const CSV_API = `${import.meta.env.VITE_API_URL}/api/activation/kilnFeedQuality.csv`;
const PAGE_SIZE = 50; // fixed 50 per page

export default function KilnFeedQualityTable() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // server filters + pagination
  const [inwardQ, setInwardQ] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // metadata
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchServer = async ({ page: p = page } = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        withCredentials: true,
        params: {
          page: p,
          pageSize: PAGE_SIZE,
          inward: inwardQ || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });
      const data = res.data || {};
      setColumns(data.columns || []);
      setRows(data.rows || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setPage(data.page ?? p);
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      alert('Failed to load data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServer({ page: 1 }); }, []);

  const applyFilters = async () => { await fetchServer({ page: 1 }); };
  const clearFilters = async () => {
    setInwardQ('');
    setFromDate('');
    setToDate('');
    await fetchServer({ page: 1 });
  };

  const canPrev = page > 1;
  const canNext = totalPages && page < totalPages;

  // ---- CSV download (fetches ALL filtered rows via download=1) ----
  const handleDownloadCSV = async () => {
    try {
      const res = await axios.get(
        `${CSV_API}`,
        {
          withCredentials: true,
          params: {
            inward: inwardQ || undefined,
            from: fromDate || undefined,
            to: toDate || undefined,
          },
          responseType: 'blob', // important
        }
      );

      // If server returned an error JSON, detect and surface it
      const contentType = res.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await res.data.text?.() ?? await new Response(res.data).text();
        try {
          const errJson = JSON.parse(text);
          alert(errJson.error || 'Failed to download CSV.');
        } catch {
          alert(text || 'Failed to download CSV.');
        }
        return;
      }

      // Otherwise, treat as CSV blob and download
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kiln_feed_quality.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV download error:', err);
      const msg = err.response?.data?.error || err.message || 'Download failed';
      alert(msg);
    }
  };


  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Kiln Feed — Quality
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={handleDownloadCSV}
            disabled={loading || total === 0}
          >
            Download (.csv)
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 1 }}
      >
        <TextField
          size="small"
          label="Inward Number"
          value={inwardQ}
          onChange={(e) => setInwardQ(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Quality From"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Quality To"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <Button variant="contained" onClick={applyFilters} disabled={loading}>Apply</Button>
        <Button variant="text" onClick={clearFilters} disabled={loading}>Reset</Button>
      </Stack>

      <DynamicTable columns={columns} rows={rows} loading={loading} />

      {/* Pagination */}
      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
        <Typography variant="body2">
          Page {totalPages ? page : 0} of {totalPages}
        </Typography>
        <IconButton size="small" onClick={() => fetchServer({ page: page - 1 })} disabled={!(page > 1) || loading}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton size="small" onClick={() => fetchServer({ page: page + 1 })} disabled={!((totalPages && page < totalPages)) || loading}>
          <ChevronRightIcon />
        </IconButton>
        <Typography variant="body2">{total} rows</Typography>
      </Stack>
    </Box>
  );
}
