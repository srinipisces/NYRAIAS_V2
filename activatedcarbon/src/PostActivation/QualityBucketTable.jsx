// QualityBucketTable.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Collapse,
  IconButton, Stack, Typography, TextField, TablePagination, LinearProgress, Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

const DEST_OPTIONS = ['Screening','Blending','De-Dusting','De-Magnetize','Crushing','InStock'];

export default function QualityBucketTable({ apiBase, bucketKey, pageSize = 50, onCountRefresh }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0); // 0-based UI page
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openRow, setOpenRow] = useState({}); // id -> bool
  const [metrics, setMetrics] = useState(null); // grade -> fields
  const [saving, setSaving] = useState({}); // id -> bool
  const [formState, setFormState] = useState({}); // id -> { quality, remarks, next_destination }

  const fetchPage = async (uiPage = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ bucket: bucketKey, page: String(uiPage + 1), pageSize: String(pageSize) });
      const resp = await fetch(`${apiBase}/api/post_activation/bags?${params.toString()}`, { method: 'GET', credentials: 'include' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data?.success) throw new Error(data?.error || 'Failed to load data');
      setRows(Array.isArray(data.data) ? data.data : []);
      const t = Number(data.total ?? (Array.isArray(data.data) ? data.data.length : 0));
      setTotal(t);
      if (typeof t === 'number' && onCountRefresh) onCountRefresh(t);
    } catch (err) {
      console.error('fetchPage error', err);
      alert(`Failed to load ${bucketKey}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
    // fetch metrics once when panel opens
    (async () => {
      try {
        const url = `${apiBase}/api/settings/quality-params/metrics?includeInactive=1`;
        const resp = await fetch(url, { credentials: 'include' });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.success) setMetrics(data.data || {});
        }
      } catch (e) {
        console.error('metrics fetch error', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketKey]);

  const handleChangePage = (_evt, newPage) => {
    setPage(newPage);
    fetchPage(newPage);
  };

  const toggleOpen = (id) => setOpenRow((prev) => ({ ...prev, [id]: !prev[id] }));

  const getFieldsForGrade = (grade) => {
     const m = metrics || {};
     const list =
       m?.[grade] ||
       m?.__DEFAULT__ ||
       [{ key: 'CTC', label: 'CTC', min: 0, max: 100, step: 0.01 }];
     // Drop any “remarks” metric definition if it sneaks in
     return list.filter(
       (f) => String(f.key ?? f.label).toLowerCase() !== 'remarks'
     );
   };

  const onFieldChange = (id, key, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: { ...prev[id], quality: { ...(prev[id]?.quality || {}), [key]: value } },
    }));
  };
  const onRemarksChange = (id, value) => {
    setFormState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), remarks: value } }));
  };
  const onDestChange = (id, value) => {
    setFormState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), next_destination: value } }));
  };

  const handleSave = async (row) => {
    const id = row.id;
    // Merge remarks into the quality JSON
    const q = { ...(formState[id]?.quality || {}) };
    const rmk = (formState[id]?.remarks ?? '').trim();
    if (rmk) q.remarks = rmk;
      const payload = {
        bucket: bucketKey,
        id,
        quality: q,
        next_destination: formState[id]?.next_destination || 'InStock',
      };
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const resp = await fetch(`${apiBase}/api/post_activation/quality_save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) throw new Error(data?.error || `HTTP ${resp.status}`);

      // Update count badge immediately
      if (typeof data?.affectedOperation === 'string' && typeof data?.newCount === 'number' && onCountRefresh) {
        onCountRefresh(data.newCount);
      }
      // Refresh current page so the removed row disappears from Quality bucket
      fetchPage(page);
      // Collapse the row
      setOpenRow((prev) => ({ ...prev, [id]: false }));
    } catch (e) {
      console.error('quality_save error', e);
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={48} />
              <TableCell>Bag No</TableCell>
              <TableCell align="right">Weight (kg)</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <React.Fragment key={r.id}>
                <TableRow hover>
                  <TableCell width={48}>
                    <IconButton size="small" onClick={() => toggleOpen(r.id)} aria-label="expand">
                      {openRow[r.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{r.id}</TableCell>
                  <TableCell align="right">{Number(r.weightKg ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{r.grade}</TableCell>
                  <TableCell>{formatDate(r.created_date)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={!!openRow[r.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                          Enter quality metrics and choose next destination
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                          {getFieldsForGrade(r.grade).map((f) => (
                            <TextField
                              key={f.key}
                              size="small"
                              label={f.label}
                              type="number"
                              inputProps={{ step: f.step ?? 0.01, min: f.min ?? 0, max: f.max ?? 100 }}
                              value={formState[r.id]?.quality?.[f.key] ?? ''}
                              onChange={(e) => onFieldChange(r.id, f.key, e.target.value)}
                            />
                          ))}
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                            label="Remarks"
                            value={formState[r.id]?.remarks ?? ''}
                            onChange={(e) => onRemarksChange(r.id, e.target.value)}
                          />
                          <TextField
                            select
                            size="small"
                            label="Next Destination"
                            value={formState[r.id]?.next_destination ?? 'InStock'}
                            onChange={(e) => onDestChange(r.id, e.target.value)}
                            SelectProps={{ native: true }}
                            sx={{ minWidth: 180 }}
                          >
                            {DEST_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </TextField>
                        </Stack>
                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<SaveOutlinedIcon />}
                            onClick={() => handleSave(r)}
                            disabled={!!saving[r.id]}
                          >
                            {saving[r.id] ? 'Saving…' : 'Save'}
                          </Button>
                        </Stack>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} sx={{ color: 'text.secondary', fontSize: 13 }}>
                  No records.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
      />
    </Box>
  );
}
