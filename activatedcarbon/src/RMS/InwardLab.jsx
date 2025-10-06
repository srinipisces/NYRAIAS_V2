// src/Lab/InwardLab.jsx
import React from "react";
import {
  Box,
  Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Collapse, Stack, TextField, MenuItem, Button,
  Typography, CircularProgress, Snackbar, Alert
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { AuthContext } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

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
const RowEditor = React.memo(function RowEditor({ inwardNumber, onCancel, onSave, saving }) {
  const [moisture, setMoisture] = React.useState("");
  const [dust, setDust] = React.useState("");
  const [adValue, setAdValue] = React.useState("");
  const [admitLoad, setAdmitLoad] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  // Reset local form when switching to a different row
  React.useEffect(() => {
    setMoisture(""); setDust(""); setAdValue(""); setAdmitLoad(""); setRemarks("");
  }, [inwardNumber]);

  const validNumber = (v) => v !== "" && !isNaN(Number(v));
  const ok =
    inwardNumber &&
    validNumber(moisture) &&
    validNumber(dust) &&
    validNumber(adValue) &&
    (admitLoad === "Approve" || admitLoad === "Deny");

  const submit = (e) => {
    e?.preventDefault?.();
    if (!ok || saving) return;
    onSave({
      moisture: Number(moisture),
      dust: Number(dust),
      ad_value: Number(adValue),
      inward_number: inwardNumber,
      admit_load: admitLoad,
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
        // full-bleed on mobile so no horizontal scroll inside the editor
        width: { xs: 'calc(100vw - 100px)', sm: "auto" },
        mx: { xs: 'calc(-50vw + 50%)', sm: 0 },
        // mobile: 2 columns; desktop: 4 columns (2 rows)
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'auto auto auto auto' },
        gridTemplateAreas: {
          xs: `
            "moisture dust"
            "advalue  decision"
            "remarks  remarks"
            "actions  actions"
          `,
          sm: `
            "moisture dust advalue decision"
            "remarks  remarks remarks actions"
          `,
        },
      }}
    >
      <Typography variant="subtitle2" sx={{ gridColumn: '1 / -1', mb: 0.5 }}>
        Inward #{inwardNumber}
      </Typography>

      <TextField
        size="small"
        autoComplete="off"
        label="Moisture (%)"
        type="number"
        inputProps={{ step: "0.01", min: "0", max: "999", inputMode: "decimal" }}
        value={moisture}
        onChange={(e) => setMoisture(e.target.value)}
        fullWidth
        sx={{ gridArea: 'moisture', minWidth: { sm: 120 } }}
      />
      <TextField
        size="small"
        autoComplete="off"
        label="Dust (%)"
        type="number"
        inputProps={{ step: "0.01", min: "0", max: "999", inputMode: "decimal" }}
        value={dust}
        onChange={(e) => setDust(e.target.value)}
        fullWidth
        sx={{ gridArea: 'dust', minWidth: { sm: 120 } }}
      />
      <TextField
        size="small"
        autoComplete="off"
        label="AD Value"
        type="number"
        inputProps={{ step: "0.01", min: "0", max: "999", inputMode: "decimal" }}
        value={adValue}
        onChange={(e) => setAdValue(e.target.value)}
        fullWidth
        sx={{ gridArea: 'advalue', minWidth: { sm: 120 } }}
      />
      <TextField
        size="small"
        label="Decision"
        select
        value={admitLoad}
        onChange={(e) => setAdmitLoad(e.target.value)}
        fullWidth
        sx={{ gridArea: 'decision', minWidth: { sm: 140 } }}
        SelectProps={{
          displayEmpty: true,
          MenuProps: {
            keepMounted: true,
            disablePortal: false,     // render to body
            container: document.body, // ensure outside scroll container
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
          },
        }}
        
      >
        <MenuItem value="Approve">Approve</MenuItem>
        <MenuItem value="Deny">Deny</MenuItem>
      </TextField>

      <TextField
        size="small"
        autoComplete="off"
        label="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        multiline
        maxRows={3}
        fullWidth
        sx={{ gridArea: 'remarks' }}
      />

      <Box sx={{ gridArea: 'actions', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={!ok || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Box>
  );
});

// ---- main component ----
export default function InwardLab() {
  const auth = React.useContext(AuthContext) || {};
  const token =
    auth?.token || auth?.accessToken || auth?.auth?.token || auth?.user?.token;

  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [expandedId, setExpandedId] = React.useState(null); // inward_number (string)
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
      const res = await fetch(`${API_URL}/api/lab/inwardlabque`, {
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
    const id = String(row?.inward_number ?? "");
    setExpandedId((prev) => (prev === id ? null : id)); // only one open at a time
  };

  const closeEditor = () => setExpandedId(null);

  const submitRow = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/lab/inwardlabtest`, {
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
      setSnack({ open: true, msg: "Lab test saved", sev: "success" });
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
        <Typography variant="h6">Pending Lab Queue</Typography>
        <IconButton onClick={fetchQueue} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
        </IconButton>
      </Stack>

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={56} /> {/* room for big tap-target */}
              <TableCell>Arrival Time</TableCell>
              <TableCell>Inward #</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>DC #</TableCell>
              <TableCell align="right">Supplier Weight</TableCell>
              <TableCell align="right">Supplier Value</TableCell>
              <TableCell align="right">Security Weight</TableCell>
              <TableCell>Security User</TableCell>
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
              const id = String(r?.inward_number ?? "");
              const isOpen = expandedId === id;
              const securityWeight = r.security_weight ?? r.our_weight ?? "";
              const securityUser = r.security_userid ?? r.userid ?? "";

              return (
                <React.Fragment key={`row-${id}`}>
                  <TableRow hover selected={isOpen}>
                    <TableCell padding="checkbox">
                      <IconButton
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                        onClick={(e) => { e.stopPropagation(); toggleRow(r); }}
                        // BIGGER tap target for mobile
                        sx={{ width: 44, height: 44 }}
                      >
                        {isOpen
                          ? <RemoveCircleOutlineIcon sx={{ fontSize: 28 }} />
                          : <AddCircleOutlineIcon sx={{ fontSize: 28 }} />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{fmtDT(r.material_arrivaltime)}</TableCell>
                    <TableCell>{r.inward_number}</TableCell>
                    <TableCell>{r.supplier_name}</TableCell>
                    <TableCell>{r.supplier_dc_number}</TableCell>
                    <TableCell align="right">{r.supplier_weight}</TableCell>
                    <TableCell align="right">{r.supplier_value}</TableCell>
                    <TableCell align="right">{securityWeight}</TableCell>
                    <TableCell>{securityUser}</TableCell>
                  </TableRow>

                  {/* Inline editor */}
                  <TableRow key={`collapse-${id}`}>
                    <TableCell style={{p:0}} colSpan={6}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.25 },
                            bgcolor: "background.paper",
                          }}
                          // block events so editor interactions never toggle the row
                        >
                          <RowEditor
                            inwardNumber={r.inward_number}
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
