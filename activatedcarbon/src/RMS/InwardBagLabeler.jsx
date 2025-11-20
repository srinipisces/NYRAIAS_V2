// InwardBagLabeler.jsx — updated with Finish Inward + summary table (elevated)
// - Fetches inwards from /api/materialinward/inwardnumber
// - Payload shape (from backend): [{ inward_no, weight, bags: [{ bag_no, weight, write_dt? }] }]
// - Creates bag via POST /api/materialinward/crusherload { inward_number, bag_weight }
// - Completes inward via POST /api/materialinward/materialinwardcomplete { inward_number, remark }
// - Renders summary as a small elevated table (shadow) instead of chips
// - Bags header shows count + a "Finish Inward" button that opens a dialog to capture remarks
// - Keeps canonical ordering by reloading list after creation; also sorts by write_dt when present

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PrintLabelButton from '../QR/PrintLabel';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const TEXT_SX = { fontSize: 14, lineHeight: 1.2 };

export default function InwardBagLabeler() {
  // inwards list + selection
  const navigate = useNavigate();
  const [inwards, setInwards] = useState([]);
  const [loadingInwards, setLoadingInwards] = useState(false);
  const [selectedInwardNo, setSelectedInwardNo] = useState('');
  const [selected, setSelected] = useState(null);

  // create-bag form
  const [bagWeight, setBagWeight] = useState('');
  const [creating, setCreating] = useState(false);

  // finish inward dialog
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishRemark, setFinishRemark] = useState('');
  const [finishing, setFinishing] = useState(false);

  // -------- Fetch on mount --------
  useEffect(() => {
    let abort = false;
    (async function initialLoad() {
      setLoadingInwards(true);
      try {
        const res = await fetch(`${API_URL}/api/materialinward/inwardnumber`, {
          credentials: 'include',
        });
        if (res.status === 401) {
          navigate('/', { replace: true });
          return;
        }
        if (!res.ok) {
          const t = await res.text();
          console.error('Inwards fetch failed', res.status, t);
          throw new Error(`Fetch failed: ${res.status}`);
        }
        const json = await res.json();
        const list = normalizeInwardsPayload(json);
        if (abort) return;
        setInwards(list);
        if (list.length) {
          const keep = list.find((x) => x.inward_no === selectedInwardNo);
          const sel = keep || list[0];
          setSelectedInwardNo(sel.inward_no);
          setSelected(sel);
        } else {
          setSelectedInwardNo('');
          setSelected(null);
        }
      } catch (e) {
        console.error(e);
        alert('Error fetching inwards. Please try again.');
      } finally {
        if (!abort) setLoadingInwards(false);
      }
    })();
    return () => {
      abort = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user changes dropdown selection, update selected record
  useEffect(() => {
    if (!selectedInwardNo) {
      setSelected(null);
      return;
    }
    const match = inwards.find((x) => x.inward_no === selectedInwardNo) || null;
    setSelected(match);
    setBagWeight('');
  }, [selectedInwardNo, inwards]);

  const inwardWeight = Number(selected?.inward_weight || 0);
  const bagCount = selected?.bags?.length || 0;
  const totalBagsWeight = useMemo(
    () => (selected?.bags || []).reduce((acc, b) => acc + (Number(b?.weight) || 0), 0),
    [selected]
  );
  const delta = inwardWeight - totalBagsWeight;

  async function reloadInwards(preserveSelection = true) {
    try {
      const res = await fetch(`${API_URL}/api/materialinward/inwardnumber`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        navigate('/', { replace: true });
        return;
      }
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      const list = normalizeInwardsPayload(json);
      setInwards(list);
      if (list.length) {
        const selNo = preserveSelection ? selectedInwardNo : '';
        const keep = selNo ? list.find((x) => x.inward_no === selNo) : null;
        const sel = keep || list[0];
        setSelectedInwardNo(sel.inward_no);
        setSelected(sel);
      } else {
        setSelectedInwardNo('');
        setSelected(null);
      }
    } catch (e) {
      console.error(e);
      alert('Error refreshing inwards.');
    }
  }

  async function handleCreateBag() {
    const weight = Number(bagWeight);
    if (!selected?.inward_no) {
      alert('Please select an inward.');
      return;
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      alert('Enter a valid bag weight (> 0).');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/materialinward/crusherload`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inward_number: selected.inward_no,
          bag_weight: weight,
        }),
      });
      if (res.status === 401) {
        navigate('/', { replace: true });
        return;
      }
      if (!res.ok) {
        let msg = `Create failed (${res.status})`;
        try {
          const j = await res.json();
          msg = j?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const j = await res.json();
      const bag_no = j?.bag_no ?? j?.label ?? (typeof j === 'string' ? j : '');
      const write_dt = j?.write_dt ?? j?.write_timestamp ?? j?.write_dttm ?? null;
      if (!bag_no) throw new Error('API did not return bag_no.');

      // Optimistic insert with server timestamp so UI updates instantly
      setSelected((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          bags: [
            {
              bag_no,
              weight,
              write_dt: write_dt || undefined,
              _ts: write_dt ? new Date(write_dt).getTime() : undefined,
            },
            ...(prev.bags || []),
          ],
        };
        next.bags = sortBags(next.bags);
        setInwards((old) => old.map((x) => (x.inward_no === next.inward_no ? next : x)));
        return next;
      });

      setBagWeight('');
      await reloadInwards(true); // canonical refresh
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error creating bag.');
    } finally {
      setCreating(false);
    }
  }

  // Finish inward flow
  function openFinishDialog() {
    if (!selected?.inward_no) {
      alert('Please select an inward.');
      return;
    }
    setFinishRemark('');
    setFinishOpen(true);
  }

  async function handleFinishInward() {
    if (!selected?.inward_no) return;
    setFinishing(true);
    try {
      const res = await fetch(`${API_URL}/api/materialinward/materialinwardcomplete`, {
        method: 'PUT', // backend expects PUT
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inward_number: selected.inward_no,
          remark: finishRemark || '',
        }),
      });
      if (res.status === 401) {
        navigate('/', { replace: true });
        return;
      }
      if (res.status === 409) {
        // Already completed (noop)
        try { const j = await res.json(); alert(j?.message || 'Inward already completed.'); } catch { alert('Inward already completed.'); }
        setFinishOpen(false);
        await reloadInwards(true);
        return;
      }

      if (!res.ok) {
        let msg = `Finish failed (${res.status})`;
        try { const j = await res.json(); msg = j?.message || j?.error || msg; } catch {}
        throw new Error(msg);
      }

      // Success: close dialog and refresh
      setFinishOpen(false);
      await reloadInwards(true);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error finishing inward.');
    } finally {
      setFinishing(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header + selection */}
      <Paper sx={{ p: { xs: 1.25, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Raw-Material Inward
          </Typography>

        {loadingInwards ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography sx={TEXT_SX}>Loading inwards…</Typography>
          </Box>
        ) : (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="inward-select-label">Select Inward</InputLabel>
            <Select
              labelId="inward-select-label"
              value={selectedInwardNo}
              label="Select Inward"
              onChange={(e) => setSelectedInwardNo(e.target.value)}
            >
              {inwards.length === 0 && <MenuItem value="">No inwards</MenuItem>}
              {inwards.map((row) => (
                <MenuItem key={row.inward_no} value={row.inward_no}>
                  {row.inward_no} — {Number(row.inward_weight || 0).toFixed(1)} kg
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        </Box>

        {/* Summary (elevated small table) */}
        <Box sx={{ mt: 1.25 }}>
          <Paper elevation={3} sx={{ p: 1.25, display: 'inline-block', minWidth: 280 }}>
            <Table size="small" aria-label="summary-table">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Inward Weight</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {inwardWeight.toFixed(1)} kg
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Bags Weight</TableCell>
                  <TableCell align="right">{totalBagsWeight.toFixed(1)} kg</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Delta (Remaining)</TableCell>
                  <TableCell align="right">{delta.toFixed(1)} kg</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Divider sx={{ my: 1.25 }} />

        {/* Create bag row */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Bag Weight (kg)"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={bagWeight}
            onChange={(e) => setBagWeight(e.target.value)}
            sx={{ width: { xs: '100%', sm: 220 } }}
          />
          <Button variant="contained" onClick={handleCreateBag} disabled={creating || !selected}>
            {creating ? 'Creating…' : 'Create Bag'}
          </Button>
        </Box>
      </Paper>

      {/* Bags table */}
      <Paper elevation={2} sx={{ p: { xs: 1, sm: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">Bags ({bagCount})</Typography>
          <Button size="small" variant="outlined" onClick={openFinishDialog} disabled={!selected}>
            Finish Inward
          </Button>
        </Box>
        <TableContainer sx={{ maxHeight: 360 }}>
          <Table stickyHeader size="small" aria-label="bags-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Bag No</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Weight (kg)</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Print</TableCell>
                {/* <TableCell sx={{ fontWeight: 700 }}>Created</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {!selected?.bags?.length ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary" sx={TEXT_SX}>
                      No bags yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                selected.bags.map((b, idx) => (
                  <TableRow key={`${selected.inward_no}-${b.bag_no || idx}`}>
                    <TableCell>
                      <Typography sx={{ ...TEXT_SX, fontWeight: 600 }}>
                        {b.bag_no || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={TEXT_SX}>{Number(b?.weight || 0).toFixed(2)}</Typography>
                    </TableCell>
                    {/* <TableCell>{b.write_dt ? new Date(b.write_dt).toLocaleString() : '—'}</TableCell> */}
                    <TableCell>
                      <PrintLabelButton bag_no={b.bag_no}  weight={b.weight} heightIn={2.5} />
                    </TableCell>
                  </TableRow>
                ))
              )}
              {selected?.bags?.length > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {totalBagsWeight.toFixed(2)}
                  </TableCell>
                  {/* <TableCell /> */}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Finish Inward Dialog */}
      <Dialog open={finishOpen} onClose={() => setFinishOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Finish Inward</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 1 }}>
            Inward: <strong>{selected?.inward_no || '—'}</strong>
          </Typography>
          <TextField
            label="Remarks"
            placeholder="Type any remarks here…"
            value={finishRemark}
            onChange={(e) => setFinishRemark(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishOpen(false)} disabled={finishing}>Cancel</Button>
          <Button variant="contained" onClick={handleFinishInward} disabled={finishing || !selected}>
            {finishing ? 'Finishing…' : 'Finish Inward'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ================= Helpers =================

function parseTs(v) {
  if (!v) return null;
  const n = Number(v);
  const d = Number.isFinite(n) ? new Date(n) : new Date(v);
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

function sortBags(bags = []) {
  // Sort DESC by timestamp if available; otherwise keep order
  return [...bags].sort((a, b) => {
    const ta = a._ts ?? parseTs(a.write_dt) ?? 0;
    const tb = b._ts ?? parseTs(b.write_dt) ?? 0;
    return tb - ta;
  });
}

function normalizeInwardsPayload(json) {
  // Accept array or common wrappers
  const arr = Array.isArray(json)
    ? json
    : Array.isArray(json?.payload)
    ? json.payload
    : Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json?.rows)
    ? json.rows
    : [];

  return arr
    .map((row) => {
      const bagsRaw = Array.isArray(row.bags) ? row.bags : [];
      const bags = bagsRaw.map((b) => {
        const ts =
          parseTs(b.write_dt) ||
          parseTs(b.write_dttm) ||
          parseTs(b.write_timestamp) ||
          parseTs(b.created_at) ||
          parseTs(b.created);
        return {
          bag_no: b.bag_no ?? b.label ?? b.id ?? '',
          weight: Number(b.weight ?? b.bag_weight ?? 0) || 0,
          write_dt: ts ? new Date(ts).toISOString() : undefined,
          _ts: ts ?? undefined,
        };
      });

      const normalized = {
        inward_no: row.inward_no ?? row.inward_number ?? row.id ?? '',
        inward_weight: Number(row.weight ?? row.our_weight ?? 0), // backend uses weight for inward total
        bags: sortBags(bags),
      };
      return normalized;
    })
    .filter((x) => x.inward_no);
}

function ChipStat({ label, value, color = 'default' }) {
  const palette = {
    default: { bg: '#f6f8fa', fg: '#111' },
    ok: { bg: '#e6ffed', fg: '#055d20' },
    warn: { bg: '#fff5e6', fg: '#8a4b00' },
    danger: { bg: '#ffe6e6', fg: '#8a0000' },
  }[color] || { bg: '#f6f8fa', fg: '#111' };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.5,
        borderRadius: 999,
        bgcolor: palette.bg,
        color: palette.fg,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: 12, opacity: 0.8 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
