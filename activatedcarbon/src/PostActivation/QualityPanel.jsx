// src/Activation/DeStoningQuality.jsx — UPDATED to add fields: +3, 3/4, 4/8, 8/12, 12/30, -30, cbd, ctc, Destination, Remarks
import React from "react";
import {
  Box,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Collapse, Stack, TextField, Button,
  Typography, CircularProgress, Snackbar, Alert, MenuItem
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { AuthContext } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const DEST_OPTIONS = ["InStock", "Screening", "Crushing", "De-Magnetize", "De-Dusting", "Blending"];

// ---- helpers ----
const fmtDT = (s) => {
  if (!s) return "";
  try { return new Date(s).toLocaleString(); } catch { return s; }
};
const normalizeArray = (d) =>
  Array.isArray(d) ? d
  : Array.isArray(d?.rows) ? d.rows
  : Array.isArray(d?.data) ? d.data
  : Array.isArray(d?.result) ? d.result
  : [];

// ---- per-row editor (isolated local state) ----
const RowEditor = React.memo(function RowEditor({ dsBagNo, onCancel, onSave, saving }) {
  // numeric grade buckets
  const [plus3, setPlus3] = React.useState("");
  const [threeFour, setThreeFour] = React.useState(""); // 3/4
  const [fourEight, setFourEight] = React.useState(""); // 4/8
  const [eightTwelve, setEightTwelve] = React.useState(""); // 8/12
  const [twelveThirty, setTwelveThirty] = React.useState(""); // 12/30
  const [minus30, setMinus30] = React.useState(""); // -30
  const [cbd, setCbd] = React.useState("");
  const [ctc, setCtc] = React.useState("");

  // text
  const [destination, setDestination] = React.useState("InStock");
  const [remarks, setRemarks] = React.useState("");

  // Reset when switching to a different bag
  React.useEffect(() => {
    setPlus3("");
    setThreeFour("");
    setFourEight("");
    setEightTwelve("");
    setTwelveThirty("");
    setMinus30("");
    setCbd("");
    setCtc("");
    setDestination("InStock");
    setRemarks("");
  }, [dsBagNo]);

  const numberProps = { type: "number", inputProps: { step: "0.01", min: "0", inputMode: "decimal" } };

  const submit = (e) => {
    e?.preventDefault?.();
    if (saving) return;
    onSave({
      ds_bag_no: dsBagNo,
      plus3: plus3 === "" ? null : Number(plus3),
      three_four: threeFour === "" ? null : Number(threeFour),
      four_eight: fourEight === "" ? null : Number(fourEight),
      eight_twelve: eightTwelve === "" ? null : Number(eightTwelve),
      twelve_thirty: twelveThirty === "" ? null : Number(twelveThirty),
      minus30: minus30 === "" ? null : Number(minus30),
      cbd: cbd === "" ? null : Number(cbd),
      ctc: ctc === "" ? null : Number(ctc),
      destination: destination || "",
      remarks: remarks || "",
    });
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        mt: 0.5,
        display: 'grid',
        columnGap: 1.25,
        rowGap: 1.25,
        alignItems: 'start',
        width: { xs: 'calc(100vw - 100px)', sm: "auto" },
        mx: { xs: 'calc(-50vw + 50%)', sm: 0 },
        // Layout requested:
        // Row1: "+3  3/4  4/8  8/12"
        // Row2: "12/30  -30  cbd  ctc"
        // Row3: "Destination  remarks"
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'auto auto auto auto' },
        gridTemplateAreas: {
          xs: `
            'p3 p34'
            'p48 p812'
            'p1230 m30'
            'cbd ctc'
            'dest dest'
            'remarks remarks'
            'actions actions'
          `,
          sm: `
            'p3 p34 p48 p812'
            'p1230 m30 cbd ctc'
            'dest remarks remarks remarks'
            'actions actions actions actions'
          `,
        },
      }}
    >
      <Typography variant="subtitle2" sx={{ gridColumn: '1 / -1', mb: 0.5 }}>
        DS Bag: {dsBagNo}
      </Typography>

      <TextField size="small" label="+3" {...numberProps} value={plus3} onChange={(e)=>setPlus3(e.target.value)} sx={{ gridArea: 'p3', minWidth: { sm: 120 } }} />
      <TextField size="small" label="3/4" {...numberProps} value={threeFour} onChange={(e)=>setThreeFour(e.target.value)} sx={{ gridArea: 'p34', minWidth: { sm: 120 } }} />
      <TextField size="small" label="4/8" {...numberProps} value={fourEight} onChange={(e)=>setFourEight(e.target.value)} sx={{ gridArea: 'p48', minWidth: { sm: 120 } }} />
      <TextField size="small" label="8/12" {...numberProps} value={eightTwelve} onChange={(e)=>setEightTwelve(e.target.value)} sx={{ gridArea: 'p812', minWidth: { sm: 120 } }} />

      <TextField size="small" label="12/30" {...numberProps} value={twelveThirty} onChange={(e)=>setTwelveThirty(e.target.value)} sx={{ gridArea: 'p1230', minWidth: { sm: 120 } }} />
      <TextField size="small" label="-30" {...numberProps} value={minus30} onChange={(e)=>setMinus30(e.target.value)} sx={{ gridArea: 'm30', minWidth: { sm: 120 } }} />
      <TextField size="small" label="cbd" {...numberProps} value={cbd} onChange={(e)=>setCbd(e.target.value)} sx={{ gridArea: 'cbd', minWidth: { sm: 120 } }} />
      <TextField size="small" label="ctc" {...numberProps} value={ctc} onChange={(e)=>setCtc(e.target.value)} sx={{ gridArea: 'ctc', minWidth: { sm: 120 } }} />

      <TextField
        select
        size="small"
        label="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        fullWidth
        sx={{ gridArea: 'dest' }}
      >
        {DEST_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </TextField>
      <TextField size="small" label="Remarks" value={remarks} onChange={(e)=>setRemarks(e.target.value)} multiline maxRows={3} fullWidth sx={{ gridArea: 'remarks' }} />

      <Box sx={{ gridArea: 'actions', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </Box>
    </Box>
  );
});

// ---- main component ----
export default function QualityPanel() {
  const auth = React.useContext(AuthContext) || {};
  const token =
    auth?.token || auth?.accessToken || auth?.auth?.token || auth?.user?.token;

  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [expandedId, setExpandedId] = React.useState(null); // ds_bag_no (string)
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState({ open: false, msg: "", sev: "success" });

  const headers = React.useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchQueue = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/activation/ds_bag_quality`, {
        method: "GET",
        headers,
        credentials: "include",
      });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : []; } catch { data = []; }
      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setRows(normalizeArray(data));
    } catch (e) {
      setError(e?.message || "Failed to load queue");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  React.useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const toggleRow = (row) => {
    const id = String(row?.ds_bag_no ?? "");
    setExpandedId((prev) => (prev === id ? null : id)); // only one open at a time
  };

  const closeEditor = () => setExpandedId(null);

  const submitRow = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/activation/ds_bag_quality`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setSnack({ open: true, msg: "Quality saved", sev: "success" });
      await fetchQueue(); // refresh list so the row disappears automatically
      closeEditor();
    } catch (e) {
      setSnack({ open: true, msg: e?.message || "Save failed", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">De‑Stoning — Bag Quality</Typography>
        <IconButton onClick={fetchQueue} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
        </IconButton>
      </Stack>

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={56} />
              <TableCell>Bag Created Time</TableCell>
              <TableCell>DS Bag No</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Userid</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            )}

            {!loading && error && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 2 }}>
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No pending items
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && rows.map((r) => {
              const id = String(r?.ds_bag_no ?? "");
              const isOpen = expandedId === id;

              return (
                <React.Fragment key={`row-${id}`}>
                  <TableRow hover selected={isOpen}>
                    <TableCell padding="checkbox">
                      <IconButton
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                        onClick={(e) => { e.stopPropagation(); toggleRow(r); }}
                        sx={{ width: 44, height: 44 }}
                      >
                        {isOpen
                          ? <RemoveCircleOutlineIcon sx={{ fontSize: 28 }} />
                          : <AddCircleOutlineIcon sx={{ fontSize: 28 }} />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{fmtDT(r.time_generated)}</TableCell>
                    <TableCell>{r.ds_bag_no}</TableCell>
                    <TableCell>{r.weight}</TableCell>
                    <TableCell>{r.userid}</TableCell>
                  </TableRow>

                  <TableRow key={`collapse-${id}`}>
                    <TableCell style={{p:0}} colSpan={6}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: "background.paper" }}>
                          <RowEditor
                            dsBagNo={r.ds_bag_no}
                            saving={saving}
                            onCancel={closeEditor}
                            onSave={submitRow}
                          />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
