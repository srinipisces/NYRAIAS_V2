// Records.jsx — clean rebuild
// - No props; uses AuthContext
// - Edit/Done toggle (requires Operations.RMS.Edit)
// - Parent status dropdowns (Completed or null)
// - Parent save = IconButton (save icon)
// - Child rows show PrintLabelButton and per-row Update (when weight changed)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PrintLabelButton from '../QR/PrintLabel';
import { useAuth } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

// Helpers
const weightHeaderMatch = (c) => String(c?.headerName || '').toLowerCase() === 'weight';
const bagKey = (direction, bag_no) => `${direction}::${bag_no}`;

// Child table component
function ChildTable({ title, rows, columns, direction, editMode, editedWeights, setEditedWeight, onUpdateRow, canEdit }) {
  const weightCol = columns.find(weightHeaderMatch);
  const weightField = weightCol?.field;
  const total = weightField ? rows.reduce((s, r) => s + (Number(r[weightField]) || 0), 0) : 0;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1.25 }}>
      <Box sx={{ px: 1, py: 0.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', fontWeight: 600 }}>{title}</Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.field}>{c.headerName}</TableCell>
            ))}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const k = bagKey(direction, r.bag_no);
            const original = weightField ? r[weightField] : undefined;
            const editVal = editedWeights.get(k);
            const display = editMode && weightField && editedWeights.has(k) ? editVal : original;
            const dirty = editMode && weightField && String(editVal ?? '') !== '' && String(editVal) !== String(original);

            return (
              <TableRow key={`${direction}-${r.bag_no}`}>
                {columns.map((c) => {
                  const isWeightCell = weightField && c.field === weightField;
                  const value = r[c.field];
                  return (
                    <TableCell key={c.field} align={isWeightCell ? 'right' : 'left'}>
                      {isWeightCell && editMode ? (
                        <TextField
                          size="small"
                          type="number"
                          value={display ?? ''}
                          onChange={(e) => setEditedWeight(k, e.target.value)}
                          inputProps={{ step: '0.01', min: '0' }}
                          sx={{ maxWidth: 120 }}
                        />
                      ) : c.type === 'datetime' ? (
                        value ? new Date(value).toLocaleString() : ''
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                    <PrintLabelButton
                      bag_no={r.bag_no}
                      grade={r.grade ? r.grade : undefined}
                      weight={Number(weightField ? r[weightField] : 0) || 0}
                      heightIn={2.5}
                    />
                    {editMode && canEdit && (
                      <span>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SaveOutlinedIcon />}
                          disabled={!dirty}
                          onClick={() => onUpdateRow({ ...r, direction, new_weight: Number(editVal) })}
                        >
                          Update
                        </Button>
                      </span>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
          {weightField && (
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell colSpan={columns.length - 1} align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{total.toFixed(2)}</TableCell>
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

// Parent row component
function ParentRow({ row, columns, childInwardCols, childOutwardCols, editMode, parentEdits, setParentEdit, onUpdateParent, canEdit, editedWeights, setEditedWeight, onUpdateBag }) {
  const [open, setOpen] = useState(false);

  const hasInwardStatus = columns.some((c) => c.field === 'material_inward_status');
  const hasOutwardStatus = columns.some((c) => c.field === 'material_outward_status');

  const originalIn = row.material_inward_status ?? '';
  const originalOut = row.material_outward_status ?? '';

  const sKey = row.inward_number;
  const edited = parentEdits.get(sKey) || { material_inward_status: originalIn, material_outward_status: originalOut };
  const dirtyParent = editMode && (
    String(edited.material_inward_status ?? '') !== String(originalIn ?? '') ||
    String(edited.material_outward_status ?? '') !== String(originalOut ?? '')
  );

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ width: 50, px: 0.25 }}>
          <Tooltip title={open ? 'Collapse' : 'Expand'}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Collapse' : 'Expand'}
              sx={{ m: -0.75 }}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Tooltip>
        </TableCell>

        {columns.map((c) => {
          const value = row[c.field];
          const isInStat = c.field === 'material_inward_status' && hasInwardStatus;
          const isOutStat = c.field === 'material_outward_status' && hasOutwardStatus;

          if (editMode && (isInStat || isOutStat)) {
            const key = isInStat ? 'material_inward_status' : 'material_outward_status';
            return (
              <TableCell key={c.field}>
                <TextField
                  size="small"
                  select
                  value={edited[key] ?? ''}
                  onChange={(e) => setParentEdit(sKey, { ...edited, [key]: e.target.value })}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </TableCell>
            );
          }

          return (
            <TableCell key={c.field}>
              {c.type === 'datetime' ? (value ? new Date(value).toLocaleString() : '') : value}
            </TableCell>
          );
        })}
        <TableCell width={160} align="right">
          {editMode && canEdit && (
            <Tooltip title="Save changes">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!dirtyParent}
                  onClick={() => onUpdateParent({ inward_number: row.inward_number, ...edited })}
                >
                  <SaveOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      {open && (
        <TableRow>
          <TableCell colSpan={columns.length + 2} sx={{ p: 1.25 }}>
            <ChildTable
              title="Inward Bags"
              rows={Array.isArray(row.bags) ? row.bags : []}
              columns={childInwardCols}
              direction="inward"
              editMode={editMode}
              editedWeights={editedWeights}
              setEditedWeight={(k, v) => setEditedWeight(k, v)}
              onUpdateRow={(payload) => onUpdateBag(row.inward_number, payload)}
              canEdit={canEdit}
            />
            <ChildTable
              title="Outward Bags"
              rows={Array.isArray(row.outward_bags) ? row.outward_bags : []}
              columns={childOutwardCols}
              direction="outward"
              editMode={editMode}
              editedWeights={editedWeights}
              setEditedWeight={(k, v) => setEditedWeight(k, v)}
              onUpdateRow={(payload) => onUpdateBag(row.inward_number, payload)}
              canEdit={canEdit}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// Main component
export default function Records() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [childInwardCols, setChildInwardCols] = useState([]);
  const [childOutwardCols, setChildOutwardCols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');

  const authCtx = typeof useAuth === 'function' ? useAuth() : null;
  const accessArr = Array.isArray(authCtx?.access) ? authCtx.access : [];
  const canEdit = accessArr.includes('Operations.RMS.Edit');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page + 1));
      params.set('pageSize', String(pageSize));
      if (q) params.set('q', q);
      const res = await fetch(`${API_URL}/api/materialinward/material-inward-bagging?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setColumns(Array.isArray(data.columns) ? data.columns : []);
      setChildInwardCols(Array.isArray(data.expandColumnsInward) ? data.expandColumnsInward : []);
      setChildOutwardCols(Array.isArray(data.expandColumnsOutward) ? data.expandColumnsOutward : []);
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotal(Number(data.total || 0));
      if (typeof data.page === 'number') setPage(Math.max(0, data.page - 1));
    } catch (e) {
      console.error(e);
      setError('Failed to load');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Parent status save
  const saveParentRow = useCallback(async ({ inward_number, material_inward_status, material_outward_status }) => {
    try {
      const url = `${API_URL}/api/materialinward/inward-outward-status`;
      const body = {
        inward_number,
        material_inward_status: material_inward_status || null,
        material_outward_status: material_outward_status || null,
      };
      const res = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setParentEdits((prev) => { const n = new Map(prev); n.delete(inward_number); return n; });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Status update failed');
    }
  }, [fetchData]);

  // Child bag weight save
  const saveBagRow = useCallback(async (inward_number, { direction, bag_no, new_weight }) => {
    try {
      const url = direction === 'inward'
        ? `${API_URL}/api/materialinward/update-inwardbag-weight`
        : `${API_URL}/api/materialinward/update-outwardbag-weight`;
      const body = { inward_number, bag_no, weight: Number(new_weight) };
      const res = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditedWeights((prev) => { const n = new Map(prev); n.delete(bagKey(direction, bag_no)); return n; });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Bag weight update failed');
    }
  }, [fetchData]);

  // Edit state containers
  const [parentEdits, setParentEdits] = useState(new Map());
  const setParentEdit = (inward_number, val) => {
    setParentEdits((prev) => {
      const next = new Map(prev);
      next.set(inward_number, val);
      return next;
    });
  };

  const [editedWeights, setEditedWeights] = useState(new Map());
  const setEditedWeight = (k, v) => {
    setEditedWeights((prev) => {
      const next = new Map(prev);
      next.set(k, v);
      return next;
    });
  };

  const [editMode, setEditMode] = useState(false);
  const onClickEdit = () => { if (canEdit) setEditMode(true); };
  const onClickDone = () => {
    setEditMode(false);
    setParentEdits(new Map());
    setEditedWeights(new Map());
    fetchData();
  };

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper sx={{ p: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Raw Material — Inward/Outward (Bagging)</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" label="Filter by Inward Number" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button size="small" variant="outlined" onClick={() => { setPage(0); fetchData(); }}>Apply</Button>
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={fetchData} disabled={loading}>
                  <RefreshOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {canEdit && !editMode && (
            <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onClickEdit}>Edit</Button>
          )}
          {editMode && (
            <Button size="small" color="inherit" variant="outlined" startIcon={<DoneOutlinedIcon />} onClick={onClickDone}>Done</Button>
          )}
        </Stack>

        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                {columns.map((c) => (
                  <TableCell key={c.field}>{c.headerName}</TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center">No records</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <ParentRow
                    key={row.inward_number}
                    row={row}
                    columns={columns}
                    childInwardCols={childInwardCols}
                    childOutwardCols={childOutwardCols}
                    editMode={editMode}
                    parentEdits={parentEdits}
                    setParentEdit={setParentEdit}
                    onUpdateParent={saveParentRow}
                    canEdit={canEdit}
                    editedWeights={editedWeights}
                    setEditedWeight={setEditedWeight}
                    onUpdateBag={saveBagRow}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TablePagination
            component="div"
            rowsPerPageOptions={[pageSize]}
            count={total}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={() => {}}
          />
        </Box>
      </Paper>
    </Box>
  );
}
