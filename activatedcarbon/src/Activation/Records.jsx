// KilnFeedAndOutputAccordion.jsx
import React, { useContext, useEffect, useMemo, useState, } from 'react';
import axios from 'axios';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Box, Stack, Typography, IconButton, Tooltip,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, CircularProgress, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, List, ListItem, ListItemText,
  Pagination, Divider, MenuItem,Chip, Popover,Menu, ListItemIcon, useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PrintIcon from '@mui/icons-material/Print';
import PrintLabelButton from '../QR/PrintLabel';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DestoningRecordsPanel from './DeStoningRecordsPanel';
import { Snackbar, Alert } from '@mui/material';


// import 'react-date-range/dist/styles.css';
// import 'react-date-range/dist/theme/default.css';

// Replace with your real auth context
const AuthContext = React.createContext({ access: [] });

const API = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 50;
const hasAccess = (a = [], key) => Array.isArray(a) && a.includes(key);
const fmt = (d) => (d ? format(d, 'yyyy-MM-dd') : undefined);
const KILN_OPTIONS = ['Kiln A', 'Kiln B', 'Kiln C'];


/* ----------------------------- Filter Dialog ----------------------------- */
function FilterDialog({ open, onClose, onApply, mode, initial = {} }) {
  const isFeed = mode === 'feed';

  // fields
  const [inward, setInward] = useState(initial.inward ?? '');
  const [bagNo, setBagNo]   = useState(initial.bag_no ?? '');
  const [grade, setGrade]   = useState(initial.grade ?? '');
  const [kiln, setKiln]     = useState(initial.kiln ?? '');
  const [userid, setUserid] = useState(initial.userid ?? '');

  // date (react-date-range expects an object in an array)
  const [range, setRange] = useState([{
    startDate: initial.from ? new Date(initial.from) : null,
    endDate:   initial.to ? new Date(initial.to) : null,
    key: 'selection',
  }]);

  // popover control for date picker
  const [anchorEl, setAnchorEl] = useState(null);
  const openCal = Boolean(anchorEl);
  const fmtLocal = (d) => (d ? format(d, 'yyyy-MM-dd') : '');
  const sel = range[0] || {};
  const dateLabel = sel.startDate || sel.endDate
    ? `${fmtLocal(sel.startDate) || '…'} → ${fmtLocal(sel.endDate) || '…'}`
    : 'Select range';

  useEffect(() => {
    setInward(initial.inward ?? '');
    setBagNo(initial.bag_no ?? '');
    setGrade(initial.grade ?? '');
    setKiln(initial.kiln ?? '');
    setUserid(initial.userid ?? '');
    setRange([{
      startDate: initial.from ? new Date(initial.from) : null,
      endDate:   initial.to ? new Date(initial.to) : null,
      key: 'selection',
    }]);
  }, [initial, open]);

  const clearAll = () => {
    setInward(''); setBagNo(''); setGrade(''); setKiln(''); setUserid('');
    setRange([{ startDate: null, endDate: null, key: 'selection' }]);
  };

  const apply = () => {
    const params = {};
    if (isFeed) {
      if (inward) params.inward = inward;
      if (bagNo)  params.bag_no = bagNo;
      if (grade)  params.grade = grade;
      if (kiln)   params.kiln = kiln;
      if (userid) params.userid = userid;
    } else {
      if (kiln)   params.kiln = kiln;
      if (userid) params.userid = userid;
    }
    if (sel.startDate) params.from = format(sel.startDate, 'yyyy-MM-dd');
    if (sel.endDate)   params.to   = format(sel.endDate,   'yyyy-MM-dd');
    onApply(params);
  };

  // kiln options (include current if it isn't one of A/B/C)
  const kilnOpts = kiln && !KILN_OPTIONS.includes(kiln)
    ? [kiln, ...KILN_OPTIONS]
    : KILN_OPTIONS;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ py: 1.25, fontSize: 16, pr: 5, position: 'relative' }}>
        {isFeed ? 'Filter — Kiln Feed' : 'Filter — Kiln Output'}

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          {isFeed && (
            <>
              <TextField size="small" label="Inward Number" value={inward} onChange={e => setInward(e.target.value)} />
              <TextField size="small" label="Bag No" value={bagNo} onChange={e => setBagNo(e.target.value)} />
              <TextField size="small" label="Grade" value={grade} onChange={e => setGrade(e.target.value)} />
            </>
          )}

          <TextField
            size="small"
            select
            label="Kiln"
            value={kiln}
            onChange={(e) => setKiln(e.target.value)}
          >
            {kiln && !KILN_OPTIONS.includes(kiln) && (
              <MenuItem value={kiln}>{kiln} (current)</MenuItem>
            )}
            {kilnOpts.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
          </TextField>

          <TextField
            size="small"
            label="User ID"
            value={userid}
            onChange={e => setUserid(e.target.value)}
          />

          {/* Date trigger — opens popover, not always visible */}
          <TextField
            size="small"
            label={isFeed ? 'Kiln Load Date Range' : 'Kiln Output Date Range'}
            value={dateLabel}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            InputProps={{ readOnly: true }}
          />
          <Popover
            open={openCal}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 1 }}>
              <DateRange
                ranges={range}
                onChange={(r) => setRange([r.selection])}
                moveRangeOnFirstSelection={false}
                editableDateInputs
                months={1}
                direction="horizontal"
                showSelectionPreview
                retainEndDateOnFirstSelection
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                <Button size="small" onClick={() => { clearAll(); setAnchorEl(null); }}>
                  Clear
                </Button>
                <Button size="small" variant="contained" onClick={() => setAnchorEl(null)}>
                  Done
                </Button>
              </Stack>
            </Box>
          </Popover>

          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <Button size="small" onClick={clearAll}>Clear</Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button size="small" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={apply}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
}


/* ----------------------------- Shared DataPanel --------------------------- */
function DataPanel({
  title,
  jsonPath,
  csvPath,
  expanded,
  canEdit,             // controls Edit/Done button visibility
  editableFields = [], // which fields turn into inputs in edit mode
  showPrint = false,   // render Print button per row
  onUpdateRow,
  onDeleteRow,
  onPrintRow,
  filterMode,          // 'feed' | 'output'
}) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState({}); // { [rowId]: { field: value } }
  const [toast, setToast] = useState({ open: false, type: 'success', msg: '' });
  const showToast = (type, msg) => setToast({ open: true, type, msg });

  const load = async (p = page, f = filters) => {
    if (!expanded) return;
    setLoading(true); setErr('');
    try {
      const res = await axios.get(`${API}/api/activation${jsonPath}`, {
        withCredentials: true,
        params: { page: p, pageSize: PAGE_SIZE, ...f }
      });
      const data = res.data || {};
      const rws = (data.rows || []).map((r, i) => ({ id: r.bag_no ?? r.id ?? i, ...r }));
      setColumns(data.columns || []);
      setRows(rws);
      setTotal(data.total ?? rws.length);
      setPage(data.page ?? p);
      setDrafts(prev => {
        const keep = {};
        for (const r of rws) if (prev[r.id]) keep[r.id] = prev[r.id];
        return keep;
      });
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (expanded) load(1, filters); }, [expanded]);

  const applyFilters = (f) => { setFilters(f); setPage(1); load(1, f); setFilterOpen(false); };

  const handleDownloadCSV = () => {
    const params = new URLSearchParams({ ...filters });
    const url = `${API}/api/activation${csvPath}?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url; a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const toggleEdit = () => { setDrafts({}); setEditMode((e) => !e); };

  const handleChangeCell = (rowId, field, value) =>
    setDrafts(prev => ({ ...prev, [rowId]: { ...(prev[rowId] || {}), [field]: value } }));

  const rowChanged = (row) => {
    const patch = drafts[row.id];
    if (!patch) return false;
    return editableFields.some((f) => (patch[f] ?? row[f]) !== row[f]);
  };

  const handleUpdate = async (row) => {
    const patch = drafts[row.id];
    if (!patch || !rowChanged(row)) return;
    try {
      const resp = await onUpdateRow?.(row, patch);
      setRows(prev => prev.map(r => (r.id === row.id ? { ...r, ...patch } : r)));
      setDrafts(prev => { const cp = { ...prev }; delete cp[row.id]; return cp; });
      const msg = resp?.data?.message || 'Updated successfully';
      showToast('success', msg);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? 'Update not allowed' : 'Update failed');
      showToast('error', msg);
    }
  };

  const handleDelete = async (row) => {
    const ok = confirm('Remove this record from the list?');
    if (!ok) return;
    try {
      const resp = await onDeleteRow?.(row);
      setRows(prev => prev.filter(r => r.id !== row.id));
      setDrafts(prev => { const cp = { ...prev }; delete cp[row.id]; return cp; });
      const msg = resp?.data?.message || 'Deleted successfully';
      showToast('success', msg);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? 'Delete not allowed' : 'Delete failed');
      showToast('error', msg);
    }
  };

  const renderCell = (r, c) => {
    const field = c.field;
    const baseVal = r[field];
    const draftVal = drafts[r.id]?.[field];
    const value = draftVal !== undefined ? draftVal : baseVal;

    const isEditable = editMode && editableFields.includes(field);
    const isNumber =
      typeof baseVal === 'number' ||
      ['weight', 'kiln_loaded_weight', 'weight_with_stones'].includes(field);

    // 🔽 Special handling for KILN select in edit mode
    if (isEditable && field === 'kiln') {
      // ensure we show the current kiln if it's not one of A/B/C
      const hasCurrentInList = KILN_OPTIONS.includes(baseVal);
      const options = hasCurrentInList ? KILN_OPTIONS : [baseVal, ...KILN_OPTIONS];

      return (
        <TextField
          select
          size="small"
          value={value ?? ''}
          onChange={(e) => handleChangeCell(r.id, field, e.target.value)}
          sx={{ minWidth: 140, maxWidth: 180 }}
        >
          {!hasCurrentInList && baseVal && (
            <MenuItem value={baseVal}>{`${baseVal} (current)`}</MenuItem>
          )}
          {KILN_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      );
    }

  // default editable fields: number/text
  if (isEditable) {
    return (
      <TextField
        size="small"
        type={isNumber ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) =>
          handleChangeCell(
            r.id,
            field,
            isNumber ? Number(e.target.value) : e.target.value
          )
        }
        sx={{ maxWidth: 160 }}
      />
    );
  }

  // pretty-print likely date fields
  if (['kiln_load_time', 'kiln_quality_updt', 'kiln_output_dt'].includes(field) && value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString().replace('T', ' ').slice(0, 19);
  }

  return value ?? '';
};

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm')); // true on mobile

  const [menuEl, setMenuEl] = useState(null);
  const menuOpen = Boolean(menuEl);
  const openMenu = (e) => setMenuEl(e.currentTarget);
  const closeMenu = () => setMenuEl(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // is any filter active?
  const isFilterOn = Object.keys(filters).some(
    (k) => filters[k] !== undefined && String(filters[k]).trim() !== ''
  );

  return (
    <Box sx={{ pt: 1 }}>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          {/* Left side: Title + Filter chip */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
            <Chip
              size="small"
              label={isFilterOn ? 'Filter: On' : 'Filter: Off'}
              color={isFilterOn ? 'primary' : 'default'}
              variant={isFilterOn ? 'filled' : 'outlined'}
            />
          </Stack>

          {/* Right side: Desktop buttons OR Mobile kebab */}
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
                <MenuItem
                  onClick={() => { closeMenu(); setFilterOpen(true); }}
                >
                  <ListItemIcon><FilterListIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Filter</ListItemText>
                </MenuItem>

                {canEdit && (
                  <MenuItem
                    onClick={() => { closeMenu(); setDrafts({}); setEditMode(!editMode); }}
                  >
                    <ListItemIcon>{editMode ? <DoneIcon fontSize="small" /> : <EditIcon fontSize="small" />}</ListItemIcon>
                    <ListItemText>{editMode ? 'Done' : 'Edit'}</ListItemText>
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => { closeMenu(); handleDownloadCSV(); }}
                >
                  <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Download CSV</ListItemText>
                </MenuItem>

                <MenuItem
                  onClick={() => { closeMenu(); load(1, filters); }}
                >
                  <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Refresh</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)}>
                Filter
              </Button>
              {canEdit && (
                <Button
                  size="small"
                  variant={editMode ? 'text' : 'outlined'}
                  startIcon={editMode ? <DoneIcon /> : <EditIcon />}
                  onClick={() => { setDrafts({}); setEditMode(!editMode); }}
                >
                  {editMode ? 'Done' : 'Edit'}
                </Button>
              )}
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCSV}>
                CSV
              </Button>
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
                  {/* render data column headers first */}
                  {columns.map((c) => (
                    <TableCell key={c.field} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {c.headerName}
                    </TableCell>
                  ))}
                  {/* trailing (empty) header cell for actions — no label */}
                  <TableCell sx={{ width: showPrint ? 240 : 180 }} />
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r) => {
                  const changed = rowChanged(r);
                  return (
                    <TableRow key={r.id} hover>
                      {/* render data cells first */}
                      {columns.map((c) => (
                        <TableCell
                          key={c.field}
                          sx={{
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            maxWidth: 220,
                          }}
                          title={r[c.field] ?? ''}
                        >
                          {renderCell(r, c)}
                        </TableCell>
                      ))}

                      {/* trailing actions cell (left aligned) */}
                      <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                        {/* Print only if showPrint=true (Kiln Output) */}
                        {showPrint && (
                          <PrintLabelButton
                            bag_no={r.bag_no}
                            weight={r.weight_with_stones}
                            heightIn={2.5}
                          />
                        )}

                        {/* Update/Delete only in edit mode (and only if canEdit) */}
                        {canEdit && editMode && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!changed}
                              onClick={() => handleUpdate(r)}
                              sx={{ mr: 1 }}
                            >
                              Update
                            </Button>
                            <Tooltip title="Remove from list">
                              <IconButton size="small" color="error" onClick={() => handleDelete(r)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
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
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => { setPage(p); load(p, filters); }}
          size="small"
        />
        <Typography variant="body2" sx={{ ml: 1 }}>{total} rows</Typography>
      </Stack>

      {/* Filter dialog */}
      <FilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
        mode={filterMode}
        initial={filters}
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(s => ({ ...s, open: false }))}
          severity={toast.type === 'error' ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
}

/* --------------------------------- Page ---------------------------------- */
export default function KilnFeedAndOutputAccordion() {
  const authCtx = typeof useAuth === 'function' ? useAuth() : null;
  const accessArr = Array.isArray(authCtx?.access) ? authCtx.access : [];
  const canEditActivation = accessArr.includes('Operations.Activation.Edit');
  //const canEditActivation = hasAccess(access, 'Operations.Activation.Edit');

  const [expanded, setExpanded] = useState('feed');
  const handleChange = (panel) => (_e, isExpanded) => setExpanded(isExpanded ? panel : false);

  // TODO: wire to backend later
  // FEED: update by bag_no (only kiln, kiln_loaded_weight are allowed)
  const updateFeedRow = async (row, patch) => {
    await axios.post(`${API}/api/activation/kilnFeedTable/update`, {
      bag_no: row.bag_no,
      changes: {
        ...(patch.kiln !== undefined ? { kiln: patch.kiln } : {}),
        ...(patch.kiln_loaded_weight !== undefined ? { kiln_loaded_weight: patch.kiln_loaded_weight } : {}),
      }
    }, { withCredentials: true });
  };

  // FEED: logical delete by bag_no
  const deleteFeedRow = async (row) => {
    await axios.post(`${API}/api/activation/kilnFeedTable/delete`, {
      bag_no: row.bag_no,
    }, { withCredentials: true });
  };

  // UPDATE kiln output
  const updateOutRow = async (row, patch) => {
    await axios.post(`${API}/api/activation/kilnoutputrecords/update`, {
      bag_no: row.bag_no,
      changes: {
        ...(patch.kiln !== undefined ? { kiln: patch.kiln } : {}),
        ...(patch.weight_with_stones !== undefined ? { weight_with_stones: patch.weight_with_stones } : {}),
      }
    }, { withCredentials: true });
  };

  // DELETE kiln output
  const deleteOutRow = async (row) => {
    await axios.post(`${API}/api/activation/kilnoutputrecords/delete`, {
      bag_no: row.bag_no,
    }, { withCredentials: true });
  };

  const printOutLabel  = (row) => { console.log('PRINT OUTPUT LABEL', row.bag_no); };

  return (
    <Box sx={{ width: { xs: '100%', sm: 900 }, maxWidth: 1100, mx: 'auto', p: { xs: 1, md: 2 } }}>
      {/* Kiln Feed */}
      <Accordion expanded={expanded === 'feed'} onChange={handleChange('feed')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={700}>Kiln Feed</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DataPanel
            jsonPath="/kilnFeedTable"
            csvPath="/kilnFeedTable.csv"
            expanded={expanded === 'feed'}
            canEdit={canEditActivation}
            editableFields={['kiln', 'kiln_loaded_weight']}   // only these two are editable
            showPrint={false}                                  // ← no print on feed
            onUpdateRow={updateFeedRow}
            onDeleteRow={deleteFeedRow}
            onPrintRow={undefined}
            filterMode="feed"
          />
        </AccordionDetails>
      </Accordion>

      {/* Kiln Output */}
      <Accordion expanded={expanded === 'output'} onChange={handleChange('output')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={700}>Kiln Output</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DataPanel
            jsonPath="/kilnoutputrecords"
            csvPath="/kilnoutputrecords.csv"
            expanded={expanded === 'output'}
            canEdit={canEditActivation}
            editableFields={['kiln', 'weight_with_stones']}               // kiln & weight
            showPrint={true}                                   // ← print visible for everyone
            onUpdateRow={updateOutRow}
            onDeleteRow={deleteOutRow}
            onPrintRow={printOutLabel}
            filterMode="output"
          />
        </AccordionDetails>
      </Accordion>
      {/* DeStoning */}
      <Accordion expanded={expanded === 'destoning'} onChange={handleChange('destoning')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={700}>De-Stoning</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DestoningRecordsPanel
            // you can flip this flag based on 'Operations.Activation.Edit'
            canEdit={canEditActivation}
            // override paths if needed to match your backend once we finalize:
            jsonPath="/destoning/records"
            csvPath="/destoning/records.csv"
            updatePath="/destoningrecords/update"
            deletePath="/destoningrecords/delete"
            // optionally restrict which fields are editable:
            // editableFields={['weight_out','final_destination','quality_cbd','quality_ctc', ...]}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
