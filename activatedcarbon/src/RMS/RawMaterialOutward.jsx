// RawMaterialOutward.jsx — clean build (fixes TS "',' expected" and ")' expected" errors)
// - Grade is required; Weight > 0 required to enable Create Bag
// - Uses /api/materialinward/inwardnumber_outward_select for the dropdown
// - Creates outward bag via POST /api/materialoutward/crusheroutput { inward_number, outward_grade, bag_weight }
// - Bags table: Bag No | Grade | Weight | Print
// - Finish Outward dialog (endpoint placeholder until finalized)

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
  IconButton,
  Tooltip,
} from '@mui/material';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import PrintLabelButton from '../QR/PrintLabel';

const API_URL = import.meta.env.VITE_API_URL;

const ROUTES = {
  fetchInwards: '/api/materialoutward/inwardnumber_outward_select',
  createOutward: '/api/materialoutward/crusheroutput',
  completeOutward: '/api/materialoutward/materialoutwardcomplete', // TODO: replace when backend is ready
  labelPreview: '/api/labels/templates/bag_v1/preview.pdf',
};

export const gradeOptions = [
  { label: '-20  1st Stage - Rotary A', value: '-20  1st Stage - Rotary A' },
  { label: 'Grade 1st stage - Rotary A', value: 'Grade 1st stage - Rotary A' },
  { label: '-20 2nd Stage - Rotary B', value: '-20 2nd Stage - Rotary B' },
  { label: 'Grade 2nd stage - Rotary B', value: 'Grade 2nd stage - Rotary B' },
  { label: 'Stones', value: 'Stones' },
  { label: 'Unburnt', value: 'Unburnt' },
];

const TEXT_SX = { fontSize: 14, lineHeight: 1.2 };

export default function RawMaterialOutward() {
  // inwards list + selection
  const [inwards, setInwards] = useState([]);
  const [loadingInwards, setLoadingInwards] = useState(false);
  const [selectedInwardNo, setSelectedInwardNo] = useState('');
  const [selected, setSelected] = useState(null);

  // create-bag form
  const [grade, setGrade] = useState('');
  const [bagWeight, setBagWeight] = useState('');
  const [creating, setCreating] = useState(false);

  // finish outward dialog
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishRemark, setFinishRemark] = useState('');
  const [finishing, setFinishing] = useState(false);

  // derived form state
  const weightNum = Number(bagWeight);
  const canCreate = !!selected && !!grade && Number.isFinite(weightNum) && weightNum > 0 && !creating;

  // -------- Fetch on mount --------
  useEffect(() => {
    let abort = false;
    (async function initialLoad() {
      setLoadingInwards(true);
      try {
        const res = await fetch(`${API_URL}${ROUTES.fetchInwards}`, { credentials: 'include' });
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
    setGrade('');
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
      const res = await fetch(`${API_URL}${ROUTES.fetchInwards}`, { credentials: 'include' });
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
    if (!grade) {
      alert('Please select a grade.');
      return;
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      alert('Enter a valid bag weight (> 0).');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}${ROUTES.createOutward}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inward_number: selected.inward_no,
          outward_grade: grade,
          bag_weight: weight,
        }),
      });

      if (res.status === 409) {
        try {
          const j409 = await res.json();
          alert(j409?.error || 'No action - Outward status is complete');
        } catch {
          alert('No action - Outward status is complete');
        }
        setCreating(false);
        await reloadInwards(true);
        return;
      }

      if (!res.ok) {
        let msg = `Create failed (${res.status})`;
        try {
          const jErr = await res.json();
          msg = jErr?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const j = await res.json();
      const bag_no = j?.bag_no ?? (typeof j === 'string' ? j : '');
      const write_dt = j?.write_dt ?? j?.write_timestamp ?? j?.write_dttm ?? null;
      const srvGrade = j?.grade ?? grade;
      const srvWeight = Number(j?.weight ?? weight);
      if (!bag_no) throw new Error('API did not return bag_no.');

      // Optimistic insert with server timestamp + grade
      setSelected((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          bags: [
            {
              bag_no,
              grade: srvGrade,
              weight: srvWeight,
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
      setGrade('');
      await reloadInwards(true);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error creating bag.');
    } finally {
      setCreating(false);
    }
  }

  function openFinishDialog() {
    if (!selected?.inward_no) {
      alert('Please select an inward.');
      return;
    }
    setFinishRemark('');
    setFinishOpen(true);
  }

  async function handleFinishOutward() {
    if (!selected?.inward_no) return;
    setFinishing(true);
    try {
      const res = await fetch(`${API_URL}${ROUTES.completeOutward}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inward_number: selected.inward_no, remark: finishRemark || '' }),
      });
      if (!res.ok) {
        let msg = `Finish failed (${res.status})`;
        try {
          const j = await res.json();
          msg = j?.message || j?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      setFinishOpen(false);
      await reloadInwards(true);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error finishing outward.');
    } finally {
      setFinishing(false);
    }
  }

  function handlePrint(bag) {
    if (!bag?.bag_no) return;
    const url = `${API_URL}${ROUTES.labelPreview}?bag_no=${encodeURIComponent(bag.bag_no)}&grade=${encodeURIComponent(bag.grade || '')}&weight=${encodeURIComponent(String(bag.weight || ''))}`;
    window.open(url, '_blank');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header + selection */}
      <Paper sx={{ p: { xs: 1.25, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Raw‑Material Outward
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

        {/* Summary small elevated table */}
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

        {/* Create bag row: Grade + Weight */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center,', flexWrap: 'wrap' }}>
          <FormControl required size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="grade-select-label">Grade</InputLabel>
            <Select
              labelId="grade-select-label"
              value={grade}
              label="Grade"
              onChange={(e) => setGrade(e.target.value)}
            >
              {gradeOptions.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            required
            size="small"
            label="Bag Weight (kg)"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={bagWeight}
            onChange={(e) => setBagWeight(e.target.value)}
            sx={{ width: { xs: '100%', sm: 220 } }}
          />
          <Button variant="contained" onClick={handleCreateBag} disabled={!canCreate}>
            {creating ? 'Creating…' : 'Create Bag'}
          </Button>
        </Box>
      </Paper>

      {/* Bags table */}
      <Paper elevation={2} sx={{ p: { xs: 1, sm: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">Bags ({bagCount})</Typography>
          <Button size="small" variant="outlined" onClick={openFinishDialog} disabled={!selected}>
            Finish Outward
          </Button>
        </Box>
        <TableContainer sx={{ maxHeight: 360 }}>
          <Table stickyHeader size="small" aria-label="bags-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Bag No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Weight (kg)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Print
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!selected?.bags?.length ? (
                <TableRow>
                  <TableCell colSpan={4}>
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
                    <TableCell>
                      <Typography sx={TEXT_SX}>{b.grade || '—'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={TEXT_SX}>{Number(b?.weight || 0).toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Print label">
                        <PrintLabelButton bag_no={b.bag_no} grade={b.grade} weight={b.weight} heightIn={2.5} />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {selected?.bags?.length > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell />
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {totalBagsWeight.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Finish Outward Dialog */}
      <Dialog open={finishOpen} onClose={() => setFinishOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Finish Outward</DialogTitle>
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
          <Button onClick={() => setFinishOpen(false)} disabled={finishing}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleFinishOutward} disabled={finishing || !selected}>
            {finishing ? 'Finishing…' : 'Finish Outward'}
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
  return [...bags].sort((a, b) => {
    const ta = a._ts ?? parseTs(a.write_dt) ?? 0;
    const tb = b._ts ?? parseTs(b.write_dt) ?? 0;
    return tb - ta;
  });
}

function normalizeInwardsPayload(json) {
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
          grade: b.grade ?? b.bag_grade ?? '',
          weight: Number(b.weight ?? b.bag_weight ?? 0) || 0,
          write_dt: ts ? new Date(ts).toISOString() : undefined,
          _ts: ts ?? undefined,
        };
      });

      return {
        inward_no: row.inward_no ?? row.inward_number ?? row.id ?? '',
        inward_weight: Number(row.weight ?? row.our_weight ?? 0),
        bags: sortBags(bags),
      };
    })
    .filter((x) => x.inward_no);
}
