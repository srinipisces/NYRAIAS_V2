// KilnOutputPanel.jsx
import * as React from "react";
import {
  Box, Paper, Typography, Stack, TextField, Button,
  Chip, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Tooltip
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., https://nyraias.com
  withCredentials: true,                 // <-- sends auth cookies
  timeout: 15000,
});

const ddmmyy = (d) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

const pad3 = (n) => String(n).padStart(3, "0");

/**
 * Props:
 * - loadedCount?: number              // optional: from timeline
 * - labelPrefix?: string              // default "OUT"
 * - startCounter?: number             // default 1; resets each calendar day
 * - onAddWeight?: (row) => void       // row = { ts, weight, label, dateStr }
 * - onPrint?: (row) => void           // hook your PDF print here
 */
export default function KilnOutputPanel({
  loadedCount = 0,
  labelPrefix = "OUT",
  startCounter = 1,
  onAddWeight,
  onPrint,
  kiln
}) {
  const [weight, setWeight] = React.useState("");
  // rows newest-first
  const [rows, setRows] = React.useState([]); // { ts, weight, label, dateStr }
  // per-day counter (local)
  const [counter, setCounter] = React.useState(startCounter);
  const [currentDateStr, setCurrentDateStr] = React.useState(ddmmyy(new Date()));
  const [saving, setSaving] = React.useState(false)
  const [loadingList, setLoadingList] = React.useState(false);
  const [listErr, setListErr] = React.useState(null);

  // reset the counter if the day changed while panel is open
  React.useEffect(() => {
    const t = setInterval(() => {
      const today = ddmmyy(new Date());
      if (today !== currentDateStr) {
        setCurrentDateStr(today);
        setCounter(startCounter);
      }
    }, 60 * 1000);
    return () => clearInterval(t);
  }, [currentDateStr, startCounter]);

  const addOutput = async () => {
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) {
      alert("Enter a valid weight (e.g., 12.5)");
      return;
    }

    try {
      setSaving(true);

      // call your backend (expects { kiln, weight } and returns { bag_no })
      const { data } = await api.post("/api/activation/kilnoutput", {
        kiln,          // "Kiln A" | "Kiln B" | "Kiln C" (prop is already here)
        bag_weight: w,
      });

      const bagNo = data?.bag_no;
      if (!bagNo) {
        throw new Error("No bag_no returned");
      }

      // build a row (use returned bag_no as the label)
      const ts = Date.now();
      const dateStr = ddmmyy(new Date(ts));
      const row = { ts, weight: w, label: bagNo, dateStr };

      // prepend to the table
      //setRows((prev) => [row, ...prev]);

      // optional hook for parent
      onAddWeight?.(row);

      // clear input & (optionally) advance your local counter
      setWeight("");
      setCounter((c) => c + 1);
      setCurrentDateStr(dateStr);
      await fetchOutputs();
    } catch (err) {
      // per your requirement: show an alert on error
      alert("Error while saving output.");
    } finally {
      setSaving(false);
    }
  };

  const fetchOutputs = React.useCallback(async () => {
    try {
      setLoadingList(true);
      setListErr(null);

      // Backend GET: /api/activation/kilnoutput?kiln=Kiln%20A
      // (Your current backend reads req.body.kiln in a GET — switch it to req.query.kiln
      // or change this to POST on your side. Frontend will pass kiln as a query param.)
      const { data } = await api.get("/api/activation/kilnoutput", {
        params: { kiln },
      });

      // Expecting: { columns, rows } with rows like { bag_no, weight_with_stones, write_timestamp? }
      const mapped = (data?.rows ?? []).map((r) => ({
        label: r.bag_no,
        weight: r.weight_with_stones ?? r.weight ?? null,
        dateStr: ddmmyy(new Date()),
      }));

      // keep newest-first; cap to 10 if backend doesn’t
      setRows(mapped.slice(0, 10));
    } catch (err) {
      setListErr(err?.message || "Failed to load outputs");
      setRows([]); // show empty state gracefully
    } finally {
      setLoadingList(false);
    }
  }, [kiln]);

  React.useEffect(() => {
    fetchOutputs();
  }, [fetchOutputs]);




  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handlePrint = (row) => {
    if (onPrint) {
      onPrint(row);
    } else {
      // placeholder action
      console.log("PRINT LABEL", row);
      // e.g., window.open(`/api/labels/preview?label=${encodeURIComponent(row.label)}&weight=${row.weight}`)
    }
  };

  const outputCount = rows.length;

  const fmtTime = (ts) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 800 },
          maxWidth: "100%",
          overflow: "hidden",
          p: 1,
          bgcolor: "transparent",
        }}
      >
        {/* 2-column layout on desktop, stacked on mobile */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1,
          }}
        >
          {/* LEFT column: capture + counters */}
          <Stack spacing={1}>
            {/* Capture weight */}
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{kiln} Output</Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={addOutput} disabled={saving || !weight}>
                  {saving ? "Saving…" : "Add"}
                </Button>

              </Stack>
            </Paper>

            {/* Counters */}
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Counters
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={`Loaded: ${loadedCount}`} />
                <Chip color="primary" label={`Output: ${outputCount}`} />
              </Stack>
            </Paper>
          </Stack>

          {/* RIGHT column: list with label + print */}
          <Paper variant="outlined" sx={{ p: 1, minHeight: 260 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              List of outputs
            </Typography>

            <Box sx={{ maxHeight: 280, overflow: "auto" }}>

              {loadingList && (
                <Box sx={{ px: 1, pb: 1, color: "text.secondary", fontSize: 13 }}>Loading…</Box>
              )}
              {!loadingList && listErr && (
                <Box sx={{ px: 1, pb: 1, color: "error.main", fontSize: 13 }}>{listErr}</Box>
              )}

              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell align="right">Weight (kg)</TableCell>
                    <TableCell align="right" width={90}>Print</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={`${r.ts}-${i}`}>
                      <TableCell><Chip label={r.label} size="small" /></TableCell>
                      <TableCell align="right">{r.weight}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Print label">
                          <span>
                            <IconButton size="small" onClick={() => handlePrint(r)}>
                              <PrintOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!rows.length && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: "text.secondary", fontSize: 13 }}>
                        No outputs yet. Enter a weight and click <b>Add</b>.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
