// GradeSettings.jsx (aka OutputGradesManager)
import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Switch, FormControlLabel,
  CircularProgress, Alert, IconButton, Tooltip, Snackbar
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

const toRows = (obj = {}) =>
  Object.entries(obj)
    .map(([grade, status]) => ({ grade, status }))
    .sort((a, b) => a.grade.localeCompare(b.grade));

const statusToBool = (s) => s === 'Active';
const boolToStatus = (b) => (b ? 'Active' : 'De-Active');

// match TextField size="small" input height (≈40px)
const CONTROL_HEIGHT = 40;

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
      setRows(toRows(data.data || {}));
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
      await api.post('/api/settings/output-grades', {
        grade,
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
                <TableCell sx={{ width: 140 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No grades found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ grade, status }) => {
                  const isActive = statusToBool(status);
                  const busy = !!toggling[grade];
                  return (
                    <TableRow key={grade} hover>
                      <TableCell>{grade}</TableCell>
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
