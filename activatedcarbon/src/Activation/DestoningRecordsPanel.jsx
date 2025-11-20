// src/Activation/DestoningRecordsPanel.jsx
// Records-style panel for De-Stoning with dialog-based Filter and mobile kebab menu.
// Matches Kiln panels' compact filter look.

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Stack, Typography, IconButton, Tooltip, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Button, TextField, MenuItem, Chip, Pagination,
  useMediaQuery, Menu, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintLabelButton from '../QR/PrintLabel';

const API = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 50;
const DEST_OPTIONS = ['InStock', 'Screening'];

// Only these may be edited after screening has started:
const QUALITY_FIELDS = [
  'quality_cbd', 'quality_ctc',
  'quality_3by4', 'quality_4by8', 'quality_8by12', 'quality_12by30', 'quality_minus_30',
  'quality_remarks'
];

function useIsXs() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}

export default function DestoningRecordsPanel({
  title = 'De-Stoning',
  jsonPath = '/destoning/records',          // GET rows
  csvPath = '/destoning/records.csv',       // GET csv (optional)
  updatePath = '/destoningrecords/update',  // POST update
  deletePath = '/destoningrecords/delete',  // POST delete
  canEdit = false,
  editableFields = ['weight_out', 'final_destination', ...QUALITY_FIELDS],
}) {
  const isXs = useIsXs();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // applied filters (sent to backend)
  const [filters, setFilters] = useState({});
  // dialog form state
  const [filterOpen, setFilterOpen] = useState(false);
  const [f, setF] = useState({
    timeFrom: '',
    timeTo: '',
    bag_no: '',
    final_destination: '',
    ctc_min: '',
    ctc_max: '',
    userid: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState({}); // { [rowId]: { field: value } }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = async (p = page, flt = filters) => {
    setLoading(true); setErr('');
    try {
      const res = await axios.get(`${API}/api/activation${jsonPath}`, {
        withCredentials: true,
        params: { page: p, pageSize: PAGE_SIZE, ...flt }
      });
      const data = res.data || {};
      const rws = (data.rows || []).map((r, i) => ({ id: r.ds_bag_no ?? r.id ?? i, ...r }));

      let cols = data.columns || [];
      if (!cols.length && rws.length) {
        const visibleFields = [
          'time_generated','ds_bag_no','loaded_weight','loaded_bags','weight_out','userid','final_destination',
          'quality_updt_time','quality_updt_user','quality_3by4','quality_4by8','quality_8by12','quality_12by30',
          'quality_minus_30','quality_cbd','quality_ctc','quality_remarks'
        ];
        const toHeader = (s) => s.replace(/_/g,' ').replace(/\b\w/g, (l) => l.toUpperCase());
        cols = visibleFields.map((f) => ({ field: f, headerName: toHeader(f), flex: 1, minWidth: 140 }));
      }

      setColumns(cols);
      setRows(rws);
      setTotal(data.total ?? rws.length);
      setPage(data.page ?? p);
      setDrafts(prev => {
        const keep = {}; for (const r of rws) if (prev[r.id]) keep[r.id] = prev[r.id]; return keep;
      });
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load data');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(1, filters); /* eslint-disable-line */ }, []);

  const isFilterOn = Object.keys(filters).some((k) => filters[k] !== undefined && String(filters[k]).trim() !== '');

  const handleDownloadCSV = () => {
    const params = new URLSearchParams({ ...filters });
    const url = `${API}/api/activation${csvPath}?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g,'_').toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const toggleEdit = () => { setDrafts({}); setEditMode((e) => !e); };
  const handleChangeCell = (rowId, field, value) =>
    setDrafts(prev => ({ ...prev, [rowId]: { ...(prev[rowId] || {}), [field]: value } }));

  const rowChanged = (row) => {
    const patch = drafts[row.id];
    if (!patch) return false;
    const keys = Object.keys(patch);
    if (row.screening_inward_time) {
      return keys.some((k) => QUALITY_FIELDS.includes(k) && (patch[k] ?? row[k]) !== row[k]);
    }
    return keys.some((k) => editableFields.includes(k) && (patch[k] ?? row[k]) !== row[k]);
  };

  const handleUpdate = async (row) => {
    const patch = drafts[row.id]; if (!patch || !rowChanged(row)) return;
    await axios.post(`${API}/api/activation${updatePath}`, {
      ds_bag_no: row.ds_bag_no,
      changes: patch,
    }, { withCredentials: true });
    setRows(prev => prev.map(r => (r.id === row.id ? { ...r, ...patch } : r)));
    setDrafts(prev => { const cp = { ...prev }; delete cp[row.id]; return cp; });
  };

  const handleDelete = async (row) => {
    const ok = confirm('Remove this record?'); if (!ok) return;
    await axios.post(`${API}/api/activation${deletePath}`, { ds_bag_no: row.ds_bag_no }, { withCredentials: true });
    setRows(prev => prev.filter(r => r.id !== row.id));
    setDrafts(prev => { const cp = { ...prev }; delete cp[row.id]; return cp; });
  };

  const renderCell = (r, c) => {
    const field = c.field;
    const baseVal = r[field];
    const draftVal = drafts[r.id]?.[field];
    const value = draftVal !== undefined ? draftVal : baseVal;
    const isEditable = editMode && editableFields.includes(field);
    const isNumber =
      typeof baseVal === 'number' ||
      ['weight_out'].includes(field) ||
      /^quality_.+/.test(field);

    if (Array.isArray(value)) {
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {value.map((v, i) => (
            <Chip key={i} size="small" label={String(v)} sx={{ mb: 0.5 }} />
          ))}
        </Stack>
      );
    }

    if (isEditable && field === 'final_destination') {
      const locked = !!r.screening_inward_time;
      const val = value ?? 'InStock';
      return (
        <TextField
          select size="small" value={val}
          onChange={(e) => handleChangeCell(r.id, field, e.target.value)}
          sx={{ minWidth: 140 }}
          disabled={locked}
        >
          {DEST_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
      );
    }

    if (isEditable) {
      const locked = !!r.screening_inward_time;
      const fieldLocked = locked && !QUALITY_FIELDS.includes(field);
      return (
        <TextField
          size="small"
          type={isNumber ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => {
            const next = isNumber ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
            handleChangeCell(r.id, field, next);
          }}
          sx={{ maxWidth: 180 }}
          disabled={fieldLocked}
        />
      );
    }

    if (/time|date/i.test(field) && value) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d.toISOString().replace('T',' ').slice(0,19);
    }

    return value ?? '';
  };

  // kebab menu
  const [menuEl, setMenuEl] = useState(null);
  const menuOpen = Boolean(menuEl);
  const openMenu = (e) => setMenuEl(e.currentTarget);
  const closeMenu = () => setMenuEl(null);

  // filter helpers
  const applyFilters = () => {
    const next = {
      timeFrom: f.timeFrom || undefined,
      timeTo: f.timeTo || undefined,
      bag_no: f.bag_no || undefined,
      final_destination: f.final_destination || undefined,
      ctc_min: f.ctc_min || undefined,
      ctc_max: f.ctc_max || undefined,
      userid: f.userid || undefined,
    };
    setFilters(next);
    setPage(1);
    load(1, next);
    setFilterOpen(false);
  };
  const clearFilters = () => {
    setF({ timeFrom: '', timeTo: '', bag_no: '', final_destination: '', ctc_min: '', ctc_max: '', userid: '' });
  };

  return (
    <Box sx={{ pt: 1 }}>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
          <Chip size="small" label={isFilterOn ? 'Filter: On' : 'Filter: Off'} color={isFilterOn ? 'primary' : 'default'} variant={isFilterOn ? 'filled' : 'outlined'} />
        </Stack>

        {isXs ? (
          <>
            <IconButton size="small" onClick={openMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuEl}
              open={menuOpen}
              onClose={closeMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { closeMenu(); setFilterOpen(true); }}>
                <ListItemIcon><FilterListIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Filter</ListItemText>
              </MenuItem>
              {canEdit && (
                <MenuItem onClick={() => { closeMenu(); toggleEdit(); }}>
                  <ListItemIcon>{editMode ? <DoneIcon fontSize="small" /> : <EditIcon fontSize="small" />}</ListItemIcon>
                  <ListItemText>{editMode ? 'Done' : 'Edit'}</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={() => { closeMenu(); handleDownloadCSV(); }}>
                <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Download CSV</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { closeMenu(); load(1, filters); }}>
                <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Refresh</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)}>Filter</Button>
            {canEdit && (
              <Button size="small" variant={editMode ? 'text' : 'outlined'} startIcon={editMode ? <DoneIcon /> : <EditIcon />} onClick={toggleEdit}>
                {editMode ? 'Done' : 'Edit'}
              </Button>
            )}
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCSV}>CSV</Button>
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={() => load(1, filters)} disabled={loading} size="small">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {/* Table */}
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.25 }}>
        <TableContainer sx={{ maxHeight: { xs: 360, md: '60vh' } }}>
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2 }}>
              <CircularProgress size={18} />
              <Typography sx={{ fontSize: 13 }}>Loading…</Typography>
            </Stack>
          ) : err ? (
            <Typography sx={{ p: 2, color: 'error.main' }}>{err}</Typography>
          ) : rows.length === 0 ? (
            <Typography sx={{ p: 2 }}>No records.</Typography>
          ) : (
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((c) => (
                    <TableCell key={c.field} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {c.headerName}
                    </TableCell>
                  ))}
                  <TableCell sx={{ width: 180 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => {
                  const changed = rowChanged(r);
                  return (
                    <TableRow key={r.id} hover>
                      {columns.map((c) => (
                        <TableCell
                          key={c.field}
                          sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 220 }}
                          title={r[c.field] ?? ''}
                        >
                          {renderCell(r, c)}
                        </TableCell>
                      ))}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {/* Print De-Stoner label */}
                        {r.ds_bag_no && (
                          <PrintLabelButton
                            bag_no={r.ds_bag_no}     // <-- prints the ds_bag_no
                            weight={r.weight_out}    // optional, if your label template shows weight
                            heightIn={2.5}           // keep same label size as your other flows
                            sx={{ mr: 1 }}           // optional spacing helper if your component accepts sx
                          />
                        )}
                        {canEdit && editMode && (
                          <>
                            <Button size="small" variant="contained" disabled={!changed} onClick={() => handleUpdate(r)} sx={{ mr: 1 }}>
                              Update
                            </Button>
                            <Tooltip title={r.screening_inward_time ? 'Cannot delete after screening' : 'Remove from list'}>
                              <span>
                                <IconButton size="small" color="error" onClick={() => handleDelete(r)} disabled={!!r.screening_inward_time}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 1 }}>
        <Pagination count={totalPages} page={page} onChange={(_, p) => { setPage(p); load(p, filters); }} size="small" />
        <Typography variant="body2" sx={{ ml: 1 }}>{total} rows</Typography>
      </Stack>

      {/* Filter dialog (compact, like Kiln panels) */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ py: 1.25, fontSize: 16 }}>Filter — De-Stoning</DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Stack spacing={1.25}>
            {/* Bag Generated time (range) */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap>
              <Typography variant="caption" sx={{ width: 140, color: 'text.secondary' }}>Bag Generated:</Typography>
              <TextField size="small" type="datetime-local" value={f.timeFrom} onChange={(e)=>setF(s=>({...s, timeFrom:e.target.value}))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 190 }} />
              <Typography variant="caption" sx={{ mx: 0.5 }}>to</Typography>
              <TextField size="small" type="datetime-local" value={f.timeTo} onChange={(e)=>setF(s=>({...s, timeTo:e.target.value}))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 190 }} />
            </Stack>

            {/* CTC range */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap>
              <Typography variant="caption" sx={{ width: 140, color: 'text.secondary' }}>CTC:</Typography>
              <TextField size="small" type="number" placeholder="Min" value={f.ctc_min} onChange={(e)=>setF(s=>({...s, ctc_min:e.target.value}))} inputProps={{ min:50, max:60, step:'0.1'}} sx={{ width: 120 }} />
              <Typography variant="caption" sx={{ mx: 0.5 }}>to</Typography>
              <TextField size="small" type="number" placeholder="Max" value={f.ctc_max} onChange={(e)=>setF(s=>({...s, ctc_max:e.target.value}))} inputProps={{ min:50, max:60, step:'0.1'}} sx={{ width: 120 }} />
            </Stack>

            {/* Bag No */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap>
              <Typography variant="caption" sx={{ width: 140, color: 'text.secondary' }}>Bag No:</Typography>
              <TextField size="small" value={f.bag_no} onChange={(e)=>setF(s=>({...s, bag_no:e.target.value}))} sx={{ minWidth: 220, maxWidth: 380 }} />
            </Stack>

            {/* Destination */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap>
              <Typography variant="caption" sx={{ width: 140, color: 'text.secondary' }}>Destination:</Typography>
              <TextField select size="small" value={f.final_destination} onChange={(e)=>setF(s=>({...s, final_destination:e.target.value}))} sx={{ minWidth: 200, maxWidth: 260 }}>
                <MenuItem value="">All</MenuItem>
                {DEST_OPTIONS.map((opt)=> <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Stack>

            {/* Userid */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap>
              <Typography variant="caption" sx={{ width: 140, color: 'text.secondary' }}>Userid:</Typography>
              <TextField size="small" value={f.userid} onChange={(e)=>setF(s=>({...s, userid:e.target.value}))} sx={{ minWidth: 220, maxWidth: 300 }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button size="small" onClick={clearFilters}>Clear</Button>
          <Button size="small" onClick={() => setFilterOpen(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={applyFilters}>Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
