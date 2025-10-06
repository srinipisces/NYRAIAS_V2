// GradeSettings.jsx (aka OutputGradesManager)
import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Switch, FormControlLabel,
  CircularProgress, Alert, IconButton, Tooltip, Snackbar, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL || '/', withCredentials: true, timeout: 20000 });

/* ---- Axios error normalization ---- */
api.interceptors.response.use(
  (resp) => {
    const d = resp?.data;
    if (d && typeof d === 'object' && d.success === false) {
      const err = new Error(d.error || 'Request failed');
      err.code = d.code;
      // @ts-ignore
      err.status = resp.status;
      throw err;
    }
    return resp;
  },
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const msg = error?.response?.data?.error || error?.message || 'Network error';
    const err = new Error(msg);
    // @ts-ignore
    err.status = status;
    // @ts-ignore
    err.code = code;
    return Promise.reject(err);
  }
);

/* ---------- Helpers ---------- */
const statusToBool = (s) => String(s).trim().toLowerCase() === 'active';
const boolToStatus = (b) => (b ? 'Active' : 'De-Active');
const normalizeAlias = (s) => s?.trim().toUpperCase() ?? '';

// match TextField size="small" input height (≈40px)
const CONTROL_HEIGHT = 40;

// pick the grades payload regardless of key casing/shape
const pickGrades = (payload) =>
  payload?.Output_Grades || payload?.output_grades || payload || {};

// Convert server object -> rows [{grade, status, quality, alias}]
const toRows = (obj = {}) =>
  Object.entries(obj)
    .map(([grade, val]) => {
      if (typeof val === 'string') {
        // backward compatibility with old schema
        return { grade, status: val, quality: [], alias: '' };
      }
      return {
        grade,
        status: val?.status ?? 'De-Active',
        quality: Array.isArray(val?.quality) ? val.quality : [],
        alias: typeof val?.alias === 'string' ? val.alias : '',
      };
    })
    .sort((a, b) => a.grade.localeCompare(b.grade));

/* ---------- Chip editor for quality[] ---------- */
function QualityEditor({ grade, values = [], onError }) {
  const [items, setItems] = React.useState(values);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setItems(values); // sync with parent refresh
  }, [values]);

  const commit = async (next) => {
    setBusy(true);
    try {
      await api.patch(`/api/settings/output-grades/${encodeURIComponent(grade)}`, {
        quality: next,
        remarks: 'Updated quality via GradeSettings',
      });
    } catch (e) {
      onError?.(e?.message || 'Failed to update quality.');
      setItems(values); // revert
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const v = input.trim();
    if (!v || items.includes(v)) { setInput(''); return; }
    const next = [...items, v];
    setItems(next); // optimistic
    setInput('');
    await commit(next);
  };

  const remove = (v) => async () => {
    const next = items.filter((x) => x !== v);
    setItems(next); // optimistic
    await commit(next);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
      {items.map((q) => (
        <Chip
          key={q}
          label={q}
          size="small"
          onDelete={remove(q)}
          disabled={busy}
          sx={{ height: 28 }}
        />
      ))}

      <TextField
        size="small"
        placeholder="Quality"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
        disabled={busy}
        sx={{ width: 80 }}
      />
      <Button
        size="small"
        variant="contained"
        onClick={add}
        disabled={busy || !input.trim()}
      >
        Add
      </Button>
    </Box>
  );
}

/* ---------- Inline alias editor ---------- */
function AliasEditor({ grade, value = '', onError }) {
  const [val, setVal] = React.useState(value);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setVal(value); // sync with parent refresh
  }, [value]);

  const commit = async (nextRaw) => {
    const next = normalizeAlias(nextRaw);
    if (next === value) return; // no-op
    setBusy(true);
    try {
      // empty string => remove alias
      await api.patch(`/api/settings/output-grades/${encodeURIComponent(grade)}`, {
        alias: next, // '' means remove on backend
        remarks: 'Updated alias via GradeSettings',
      });
    } catch (e) {
      onError?.(e?.message || 'Failed to update alias.');
      setVal(value); // revert
    } finally {
      setBusy(false);
    }
  };

  return (
    <TextField
      size="small"
      placeholder="Alias (optional)"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => commit(val)}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      disabled={busy}
      inputProps={{ maxLength: 4 }}
      sx={{ maxWidth: 140 }}
    />
  );
}

/* ---------- Main component ---------- */
export default function GradeSettings() {
  const [activeOnly, setActiveOnly] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [newGrade, setNewGrade] = useState('');
  const [newGradeErr, setNewGradeErr] = useState('');
  const [toggling, setToggling] = useState({}); // { [grade]: true/false }

  const showError = (msg) => {
    setError(msg || 'Something went wrong.');
    setSnackOpen(true);
  };

  const fetchGrades = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/settings/output-grades', {
        params: { activeOnly }
      });
      const gradesObj = pickGrades(data.data);
      setRows(toRows(gradesObj));
    } catch (e) {
      console.error('fetchGrades', e);
      showError(e?.message || 'Failed to load Output_Grades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const handleAdd = async () => {
    const grade = newGrade.trim();
    setNewGradeErr('');
    if (!grade) {
      const msg = 'Grade is required.';
      setNewGradeErr(msg);
      showError(msg);
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Create with new schema (alias left empty by default)
      await api.post('/api/settings/output-grades', {
        grade,
        status: 'Active',
        quality: [],
        remarks: 'Added via GradeSettings'
      });
      setNewGrade('');
      await fetchGrades();
    } catch (e) {
      console.error('add grade', e);
      const msg = e?.message || `Failed to add "${grade}".`;
      setNewGradeErr(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (grade, nextBool) => {
    setToggling((m) => ({ ...m, [grade]: true }));
    setError('');
    try {
      const nextStatus = boolToStatus(nextBool);
      await api.patch(`/api/settings/output-grades/${encodeURIComponent(grade)}`, {
        status: nextStatus,
        remarks: 'Toggled via GradeSettings'
      });
      await fetchGrades();
    } catch (e) {
      console.error('toggle status', e);
      showError(e?.message || `Failed to update status for "${grade}".`);
    } finally {
      setToggling((m) => ({ ...m, [grade]: false }));
    }
  };

  const disabled = saving || loading;

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Output Grade Settings
        </Typography>

        <FormControlLabel
          label="Show only Active"
          control={
            <Switch
              size="small"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
          }
        />

        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={fetchGrades} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Add new grade */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'stretch' }}>
        <TextField
          size="small"
          label="New grade (e.g., 3x4)"
          value={newGrade}
          onChange={(e) => {
            setNewGrade(e.target.value);
            if (newGradeErr) setNewGradeErr('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) handleAdd();
          }}
          sx={{ maxWidth: 240 }}
          disabled={disabled}
          error={!!newGradeErr}
          helperText={newGradeErr || ' '}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={disabled || !newGrade.trim()}
          disableElevation
          sx={{
            height: CONTROL_HEIGHT,
            minHeight: CONTROL_HEIGHT,
            lineHeight: `${CONTROL_HEIGHT}px`,
            px: 2,
          }}
        >
          Add
        </Button>
      </Box>

      {/* Inline page alert (persists) */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} aria-live="polite">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 160 }}>Grade</TableCell>
                <TableCell sx={{ width: 120 }}>Alias</TableCell>
                <TableCell sx={{ width: 140 }}>Status</TableCell>
                <TableCell>Quality Parameters</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No grades found.
                  </TableCell>
                </TableRow>
              ) : (
                rows
                  .filter(({ status }) => (activeOnly ? statusToBool(status) : true))
                  .map(({ grade, status, quality, alias }) => {
                    const isActive = statusToBool(status);
                    const busy = !!toggling[grade];
                    return (
                      <TableRow key={grade} hover>
                        <TableCell>{grade}</TableCell>
                        <TableCell>
                          <AliasEditor
                            grade={grade}
                            value={alias}
                            onError={(msg) => showError(msg)}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            label={isActive ? 'Active' : 'De-Active'}
                            control={
                              <Switch
                                size="small"
                                checked={isActive}
                                onChange={(e) => handleToggle(grade, e.target.checked)}
                                disabled={busy || saving}
                              />
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <QualityEditor
                            grade={grade}
                            values={quality}
                            onError={(msg) => showError(msg)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Floating snackbar so you *always* see the error */}
      <Snackbar
        open={snackOpen && !!error}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
