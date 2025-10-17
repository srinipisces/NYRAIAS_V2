// src/Activation/DeStoningQuality.jsx — UPDATED to add fields: +3, 3/4, 4/8, 8/12, 12/30, -30, cbd, ctc, Destination, Remarks
import React from "react";
import {
  Box,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Collapse, Stack, TextField, Button,
  Typography, CircularProgress, Snackbar, Alert, MenuItem,TablePagination
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
  const [grade_plus2, setgrade_plus2] = React.useState("");
  const [grade_2by3, setgrade_2by3] = React.useState(""); // 3/4
  const [grade_3by6, setgrade_3by6] = React.useState(""); // 4/8
  const [grade_6by8, setgrade_6by8] = React.useState(""); // 8/12
  const [grade_8by10, setgrade_8by10] = React.useState(""); // 12/30
  const [grade_10by12, setgrade_10by12] = React.useState(""); // -30
  const [grade_12by14, setgrade_12by14] = React.useState("");
  const [grade_minus14, setgrade_minus14] = React.useState("");
  const [feed_moisture, setfeed_moisture] = React.useState("");
  const [dust, setdust] = React.useState("");
  const [feed_volatile, setfeed_volatile] = React.useState("");
  // text
  const [destination, setDestination] = React.useState("InStock");
  const [remarks, setRemarks] = React.useState("");

  // Reset when switching to a different bag
  React.useEffect(() => {
    setgrade_plus2("");
    setgrade_2by3("");
    setgrade_3by6("");
    setgrade_6by8("");
    setgrade_8by10("");
    setgrade_10by12("");
    setgrade_12by14("");
    setgrade_minus14("");
    setfeed_moisture("");
    setdust("");
    setfeed_volatile("");
    setRemarks("");
  }, [dsBagNo]);

  const numberProps = { type: "number", inputProps: { step: "0.01", min: "0", inputMode: "decimal" } };

  const submit = (e) => {
    e?.preventDefault?.();
    if (saving) return;
    onSave({
      bag_no: dsBagNo,
      grade_plus2: grade_plus2 === "" ? null : Number(grade_plus2),
      grade_2by3: grade_2by3 === "" ? null : Number(grade_2by3),
      grade_3by6: grade_3by6 === "" ? null : Number(grade_3by6),
      grade_6by8: grade_6by8 === "" ? null : Number(grade_6by8),
      grade_8by10: grade_8by10 === "" ? null : Number(grade_8by10),
      grade_10by12: grade_10by12 === "" ? null : Number(grade_10by12),
      grade_12by14: grade_12by14 === "" ? null : Number(grade_12by14),
      grade_minus14: grade_minus14 === "" ? null : Number(grade_minus14),
      feed_moisture: feed_moisture === "" ? null : Number(feed_moisture),
      dust: dust === "" ? null : Number(dust),
      feed_volatile: feed_volatile === "" ? null : Number(feed_volatile),
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
            'p2 p23'
            'p36 p68'
            'p810 p1012'
            'p1214 m14'
            'fm du'
            'fv    .'
            'remarks remarks'
            'actions actions'
          `,
          sm: `
            'p2     p23    p36    p68'
            'p810   p1012  p1214  m14'
            'fm     du     fv     .'
            'remarks remarks actions actions'
          `,
        },
      }}
    >
      <Typography variant="subtitle2" sx={{ gridColumn: '1 / -1', mb: 0.5 }}>
        DS Bag: {dsBagNo}
      </Typography>

      <TextField size="small" label="+2" {...numberProps} value={grade_plus2} onChange={(e)=>setgrade_plus2(e.target.value)} sx={{ gridArea: 'p2', minWidth: { sm: 120 } }} />
      <TextField size="small" label="2/3" {...numberProps} value={grade_2by3} onChange={(e)=>setgrade_2by3(e.target.value)} sx={{ gridArea: 'p23', minWidth: { sm: 120 } }} />
      <TextField size="small" label="3/6" {...numberProps} value={grade_3by6} onChange={(e)=>setgrade_3by6(e.target.value)} sx={{ gridArea: 'p36', minWidth: { sm: 120 } }} />
      <TextField size="small" label="6/8" {...numberProps} value={grade_6by8} onChange={(e)=>setgrade_6by8(e.target.value)} sx={{ gridArea: 'p68', minWidth: { sm: 120 } }} />

      <TextField size="small" label="8/10" {...numberProps} value={grade_8by10} onChange={(e)=>setgrade_8by10(e.target.value)} sx={{ gridArea: 'p810', minWidth: { sm: 120 } }} />
      <TextField size="small" label="10/12" {...numberProps} value={grade_10by12} onChange={(e)=>setgrade_10by12(e.target.value)} sx={{ gridArea: 'p1012', minWidth: { sm: 120 } }} />
      <TextField size="small" label="12/14" {...numberProps} value={grade_12by14} onChange={(e)=>setgrade_12by14(e.target.value)} sx={{ gridArea: 'p1214', minWidth: { sm: 120 } }} />
      <TextField size="small" label="-14" {...numberProps} value={grade_minus14} onChange={(e)=>setgrade_minus14(e.target.value)} sx={{ gridArea: 'm14', minWidth: { sm: 120 } }} />
      <TextField size="small" label="feed_moisture" {...numberProps} value={feed_moisture} onChange={(e)=>setfeed_moisture(e.target.value)} sx={{ gridArea: 'fm', minWidth: { sm: 120 } }} />
      <TextField size="small" label="dust" {...numberProps} value={dust} onChange={(e)=>setdust(e.target.value)} sx={{ gridArea: 'du', minWidth: { sm: 120 } }} />
      <TextField size="small" label="feed_volatile" {...numberProps} value={feed_volatile} onChange={(e)=>setfeed_volatile(e.target.value)} sx={{ gridArea: 'fv', minWidth: { sm: 120 } }} />
     {/*  <TextField
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
      </TextField> */}
      <TextField size="small" label="Remarks" value={remarks} onChange={(e)=>setRemarks(e.target.value)} multiline maxRows={3} fullWidth sx={{ gridArea: 'remarks' }} />

      <Box sx={{ gridArea: 'actions', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </Box>
    </Box>
  );
});

// ---- main component ----
export default function KilnFeedQuality() {
  const auth = React.useContext(AuthContext) || {};
  const token =
    auth?.token || auth?.accessToken || auth?.auth?.token || auth?.user?.token;

  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);   // 0-based for MUI
  const PAGE_SIZE = 50;                        // fixed
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
        const qs = new URLSearchParams({
         page: String(page + 1),       // backend expects 1-based
         pageSize: String(PAGE_SIZE)   // harmless if backend locks to 50
      });
      const res = await fetch(`${API_URL}/api/activation/kiln_feed_bag_quality?${qs}`, {
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
      //setRows(normalizeArray(data));
      const arr = Array.isArray(data?.rows) ? data.rows : normalizeArray(data);
      setRows(arr);
      setTotal(data?.pagination?.total ?? arr.length ?? 0);
    } catch (e) {
      setError(e?.message || "Failed to load queue");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [headers, page]);

  React.useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const toggleRow = (row) => {
    const id = String(row?.bag_no ?? "");
    setExpandedId((prev) => (prev === id ? null : id)); // only one open at a time
  };

  const closeEditor = () => setExpandedId(null);

  const submitRow = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/activation/kiln_feed_bag_quality`, {
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
    <Paper sx={{ p: 1 ,width :{xs:'100%',md:1100}}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">Kiln Output — Bag Quality</Typography>
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
              <TableCell>Bag No</TableCell>
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
              const id = String(r?.bag_no ?? "");
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
                    <TableCell>{r.bag_no}</TableCell>
                    <TableCell>{r.weight}</TableCell>
                    <TableCell>{r.userid}</TableCell>
                  </TableRow>

                  <TableRow key={`collapse-${id}`}>
                    <TableCell style={{p:0}} colSpan={6}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: "background.paper" }}>
                          <RowEditor
                            dsBagNo={r.bag_no}
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
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={50}
        rowsPerPageOptions={[50]}   // lock to 50
      />

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
