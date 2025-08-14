// StockTable.jsx
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Select, MenuItem, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography,
  TableContainer, Box, IconButton, Popover, TextField, Chip
} from '../../node_modules/@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearAllIcon from '@mui/icons-material/ClearAll';

// Memoized row to avoid unnecessary re-renders
const RowItem = memo(function RowItem({
  row, loading, loadingRow, onFieldChange, onRequestUpdate, getStatusOptions
}) {
  const options = getStatusOptions(row.bag_no);
  const isUpdating = loadingRow === row.bag_no;
  const isChanged = row.newStatus !== (row.delivery_status || 'InStock');

  return (
    <TableRow key={row.bag_no} hover>
      <TableCell>{row.bag_no}</TableCell>
      <TableCell>{row.grade}</TableCell>
      <TableCell align="right">{row.ctc}</TableCell>
      <TableCell align="right">{row.weight}</TableCell>
      <TableCell>
        <Select
          value={row.newStatus}
          onChange={(e) => onFieldChange(row.bag_no, e.target.value)}
          disabled={isUpdating || loading}
          size="small"
          sx={{ minWidth: 140 }}
        >
          {options.map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          size="small"
          disableElevation
          disabled={!isChanged || isUpdating || loading}
          onClick={() => onRequestUpdate(row.bag_no, row.newStatus)}
        >
          {isUpdating ? <CircularProgress size={18} /> : 'Update'}
        </Button>
      </TableCell>
    </TableRow>
  );
});

export default function StockTable({
  // same props as before; pagination props are ignored now
  data, page, totalRows, rowsPerPage, onPageChange, onUpdate, loading
}) {
  // Local copy so status edits persist across filtering
  const [allRows, setAllRows] = useState([]);
  const [loadingRow, setLoadingRow] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, bag_no: '', newStatus: '' });

  // Filters
  const [filters, setFilters] = useState({
    bag_no: '',
    grades: [],
    statuses: [],
    ctcMin: '',
    ctcMax: '',
    weightMin: '',
    weightMax: '',
  });

  // Popover anchors + temp values
  const [bagAnchor, setBagAnchor] = useState(null);
  const [gradeAnchor, setGradeAnchor] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [ctcAnchor, setCtcAnchor] = useState(null);
  const [weightAnchor, setWeightAnchor] = useState(null);

  const [tmpBag, setTmpBag] = useState('');
  const [tmpGrades, setTmpGrades] = useState([]);
  const [tmpStatuses, setTmpStatuses] = useState([]);
  const [tmpCtcMin, setTmpCtcMin] = useState('');
  const [tmpCtcMax, setTmpCtcMax] = useState('');
  const [tmpWeightMin, setTmpWeightMin] = useState('');
  const [tmpWeightMax, setTmpWeightMax] = useState('');

  // Initialize local rows
  useEffect(() => {
    setAllRows(
      (Array.isArray(data) ? data : []).map(r => ({
        ...r,
        newStatus: r.delivery_status || 'InStock'
      }))
    );
  }, [data]);

  // Distinct values for pickers
  const distinctGrades = useMemo(
    () => Array.from(new Set(allRows.map(r => r.grade).filter(Boolean))).sort(),
    [allRows]
  );
  const distinctStatuses = useMemo(
    () => Array.from(new Set(allRows.map(r => (r.newStatus || r.delivery_status || 'InStock')).filter(Boolean))).sort(),
    [allRows]
  );

  // Client-side filtering
  const filteredRows = useMemo(() => {
    const bag = filters.bag_no.trim().toLowerCase();
    const ctcMin = filters.ctcMin === '' ? null : Number(filters.ctcMin);
    const ctcMax = filters.ctcMax === '' ? null : Number(filters.ctcMax);
    const wMin  = filters.weightMin === '' ? null : Number(filters.weightMin);
    const wMax  = filters.weightMax === '' ? null : Number(filters.weightMax);

    return allRows.filter(row => {
      if (bag && !(row.bag_no || '').toLowerCase().includes(bag)) return false;
      if (filters.grades.length && !filters.grades.includes(row.grade)) return false;

      const statusNow = row.newStatus || row.delivery_status || 'InStock';
      if (filters.statuses.length && !filters.statuses.includes(statusNow)) return false;

      const ctc = row.ctc == null ? null : Number(row.ctc);
      if (ctcMin != null && (ctc == null || ctc < ctcMin)) return false;
      if (ctcMax != null && (ctc == null || ctc > ctcMax)) return false;

      const wt = row.weight == null ? null : Number(row.weight);
      if (wMin != null && (wt == null || wt < wMin)) return false;
      if (wMax != null && (wt == null || wt > wMax)) return false;

      return true;
    });
  }, [allRows, filters]);

  const total = filteredRows.length;

  // Edits
  const handleFieldChange = useCallback((bag_no, value) => {
    setAllRows(prev =>
      prev.map(r => (r.bag_no === bag_no ? { ...r, newStatus: value } : r))
    );
  }, []);

  // Update flow
  const handleRequestUpdate = useCallback((bag_no, newStatus) => {
    setConfirmDialog({ open: true, bag_no, newStatus });
  }, []);
  const handleConfirmUpdate = useCallback(async () => {
    const { bag_no, newStatus } = confirmDialog;
    setConfirmDialog({ open: false, bag_no: '', newStatus: '' });
    setLoadingRow(bag_no);
    try {
      await onUpdate(bag_no, newStatus);
    } finally {
      setLoadingRow(null);
    }
  }, [confirmDialog, onUpdate]);

  // Status options per bag prefix
  const getStatusOptions = useCallback((bag_no) => {
    const prefix = (bag_no || '').toLowerCase();
    if (prefix.startsWith('scr')) return ['InStock', 'Delivered', 'Screening', 'Re-Processing'];
    if (prefix.startsWith('ds'))  return ['InStock', 'Delivered', 'Screening','Re-Processing'];
    return ['InStock'];
  }, []);

  // Helpers
  const anyFilters =
    filters.bag_no ||
    filters.grades.length ||
    filters.statuses.length ||
    filters.ctcMin !== '' ||
    filters.ctcMax !== '' ||
    filters.weightMin !== '' ||
    filters.weightMax !== '';

  const clearAllFilters = () => {
    setFilters({
      bag_no: '', grades: [], statuses: [],
      ctcMin: '', ctcMax: '', weightMin: '', weightMax: ''
    });
  };

  // Open popovers
  const openBag    = (e) => { setTmpBag(filters.bag_no); setBagAnchor(e.currentTarget); };
  const openGrade  = (e) => { setTmpGrades(filters.grades); setGradeAnchor(e.currentTarget); };
  const openStatus = (e) => { setTmpStatuses(filters.statuses); setStatusAnchor(e.currentTarget); };
  const openCtc    = (e) => { setTmpCtcMin(filters.ctcMin); setTmpCtcMax(filters.ctcMax); setCtcAnchor(e.currentTarget); };
  const openWeight = (e) => { setTmpWeightMin(filters.weightMin); setTmpWeightMax(filters.weightMax); setWeightAnchor(e.currentTarget); };

  // Apply/Clear per column
  const applyBag      = () => { setFilters(f => ({ ...f, bag_no: tmpBag })); setBagAnchor(null); };
  const clearBag      = () => { setFilters(f => ({ ...f, bag_no: '' })); setBagAnchor(null); };
  const applyGrades   = () => { setFilters(f => ({ ...f, grades: tmpGrades })); setGradeAnchor(null); };
  const clearGrades   = () => { setFilters(f => ({ ...f, grades: [] })); setGradeAnchor(null); };
  const applyStatuses = () => { setFilters(f => ({ ...f, statuses: tmpStatuses })); setStatusAnchor(null); };
  const clearStatuses = () => { setFilters(f => ({ ...f, statuses: [] })); setStatusAnchor(null); };
  const applyCtc      = () => { setFilters(f => ({ ...f, ctcMin: tmpCtcMin, ctcMax: tmpCtcMax })); setCtcAnchor(null); };
  const clearCtc      = () => { setFilters(f => ({ ...f, ctcMin: '', ctcMax: '' })); setCtcAnchor(null); };
  const applyWeight   = () => { setFilters(f => ({ ...f, weightMin: tmpWeightMin, weightMax: tmpWeightMax })); setWeightAnchor(null); };
  const clearWeight   = () => { setFilters(f => ({ ...f, weightMin: '', weightMax: '' })); setWeightAnchor(null); };

  return (
    <>
      {/* Header bar with count */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {anyFilters && (
            <Chip
              size="small"
              label="Filters active"
              onDelete={clearAllFilters}
              deleteIcon={<ClearAllIcon />}
            />
          )}
        </Box>
        <Typography variant="body2">Records: {total.toLocaleString()}</Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 600, borderRadius: 1, boxShadow: 1 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Bag_No
                  <IconButton size="small" onClick={openBag} title="Filter Bag No">
                    <FilterAltIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Grade
                  <IconButton size="small" onClick={openGrade} title="Filter Grade">
                    <FilterAltIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  CTC
                  <IconButton size="small" onClick={openCtc} title="Filter CTC">
                    <FilterAltIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  Weight
                  <IconButton size="small" onClick={openWeight} title="Filter Weight">
                    <FilterAltIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Stock Status
                </Box>
              </TableCell>
              <TableCell>Update</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? <CircularProgress size={22} /> : 'No rows'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <RowItem
                  key={row.bag_no}
                  row={row}
                  loading={loading}
                  loadingRow={loadingRow}
                  onFieldChange={handleFieldChange}
                  onRequestUpdate={handleRequestUpdate}
                  getStatusOptions={getStatusOptions}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, bag_no: '', newStatus: '' })}
      >
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>
            Update <strong>{confirmDialog.bag_no}</strong> to <strong>{confirmDialog.newStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, bag_no: '', newStatus: '' })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmUpdate} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bag filter */}
      <Popover open={!!bagAnchor} anchorEl={bagAnchor} onClose={() => setBagAnchor(null)}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, display: 'grid', gap: 1, width: 280 }}>
          <Typography variant="subtitle2">Filter: Bag No (contains)</Typography>
          <TextField
            size="small"
            placeholder="Type part of bag no…"
            value={tmpBag}
            onChange={(e) => setTmpBag(e.target.value)}
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={clearBag} size="small">Clear</Button>
            <Button onClick={applyBag} size="small" variant="contained">Apply</Button>
          </Box>
        </Box>
      </Popover>

      {/* Grade filter */}
      <Popover open={!!gradeAnchor} anchorEl={gradeAnchor} onClose={() => setGradeAnchor(null)}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, display: 'grid', gap: 1, width: 300 }}>
          <Typography variant="subtitle2">Filter: Grade</Typography>
          <Select
            multiple
            size="small"
            value={tmpGrades}
            onChange={(e) => setTmpGrades(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {distinctGrades.map(g => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={clearGrades} size="small">Clear</Button>
            <Button onClick={applyGrades} size="small" variant="contained">Apply</Button>
          </Box>
        </Box>
      </Popover>

      {/* Status filter */}
      <Popover open={!!statusAnchor} anchorEl={statusAnchor} onClose={() => setStatusAnchor(null)}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, display: 'grid', gap: 1, width: 300 }}>
          <Typography variant="subtitle2">Filter: Stock Status</Typography>
          <Select
            multiple
            size="small"
            value={tmpStatuses}
            onChange={(e) => setTmpStatuses(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {distinctStatuses.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={clearStatuses} size="small">Clear</Button>
            <Button onClick={applyStatuses} size="small" variant="contained">Apply</Button>
          </Box>
        </Box>
      </Popover>

      {/* CTC filter */}
      <Popover open={!!ctcAnchor} anchorEl={ctcAnchor} onClose={() => setCtcAnchor(null)}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, display: 'grid', gap: 1, width: 320 }}>
          <Typography variant="subtitle2">Filter: CTC (range)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small" type="number" label="Min" value={tmpCtcMin}
              onChange={(e) => setTmpCtcMin(e.target.value)}
              inputProps={{ step: 'any' }}
            />
            <TextField
              size="small" type="number" label="Max" value={tmpCtcMax}
              onChange={(e) => setTmpCtcMax(e.target.value)}
              inputProps={{ step: 'any' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={clearCtc} size="small">Clear</Button>
            <Button onClick={applyCtc} size="small" variant="contained">Apply</Button>
          </Box>
        </Box>
      </Popover>

      {/* Weight filter */}
      <Popover open={!!weightAnchor} anchorEl={weightAnchor} onClose={() => setWeightAnchor(null)}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 2, display: 'grid', gap: 1, width: 320 }}>
          <Typography variant="subtitle2">Filter: Weight (range)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small" type="number" label="Min" value={tmpWeightMin}
              onChange={(e) => setTmpWeightMin(e.target.value)}
              inputProps={{ step: 'any' }}
            />
            <TextField
              size="small" type="number" label="Max" value={tmpWeightMax}
              onChange={(e) => setTmpWeightMax(e.target.value)}
              inputProps={{ step: 'any' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={clearWeight} size="small">Clear</Button>
            <Button onClick={applyWeight} size="small" variant="contained">Apply</Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
