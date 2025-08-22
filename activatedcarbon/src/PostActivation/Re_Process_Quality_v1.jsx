// src/Operations/Re_Process_Quality.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Card, CardHeader, CardContent, Typography, Button, Grid, TextField, Chip,
  Divider, Stack, IconButton, Paper, InputAdornment, GlobalStyles, List,
  ListItemButton, ListItemText, ListItemIcon, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";

const DECIMAL_PLACES = 2;
const STEP = 0.01;

// Shown when there's no alias or no settings found
const DEFAULT_METRICS = [
  { key: "CTC", label: "CTC", min: 0, max: 100, step: STEP },
];

// Buckets unchanged
const BUCKETS = ["Destoning","Crushing","Bundling","Screening","De-Magmetize","De- Dusting"];

// dropdown options
const NEXT_DEST_OPTIONS = [
  "DeStoning", "Screening", "Crushing", "De-Dusting",
  "De-Magnetizing", "Blending", "Packaging", "InStock"
];

const formatNum = (n) => (Number.isFinite(n) ? n.toFixed(DECIMAL_PLACES) : (0).toFixed(DECIMAL_PLACES));
const clampRound2 = (value, min = 0, max = 100) => {
  const num = Number.isFinite(value) ? value : 0;
  const clamped = Math.max(min, Math.min(max, num));
  return Math.round(clamped * 100) / 100;
};

// Parse alias from bag_no formatted as: <PREFIX>_<ALIAS>_<DDMMYY>_<RUNNING>
// Examples:
//   BAG_P_300725_0001     -> alias = "P"
//   KILN_ABC_310725_057   -> alias = "ABC"
// If alias is blank (e.g., BAG__300725_0001), return null.
// Also supports legacy "<PREFIX>_<ALIAS><DDMMYY>_<RUNNING>" as a fallback.
function parseAliasFromBagId(id = "") {
  if (typeof id !== "string") return null;

  // Preferred new format: <PREFIX>_<ALIAS>_<DDMMYY>_<RUNNING>
  const strict = id.match(/^[^_]+_([A-Za-z]+)_(\d{6})_([A-Za-z0-9]+)$/);
  if (strict) return strict[1];

  // Explicit "no alias": <PREFIX>__<DDMMYY>_<RUNNING>
  if (/^[^_]+__\d{6}_[A-Za-z0-9]+$/.test(id)) return null;

  // Backward-compatible legacy format: <PREFIX>_<ALIAS><DDMMYY>_<RUNNING>
  const legacy = id.match(/^[^_]+_([A-Za-z]+)\d{6}_[A-Za-z0-9]+$/);
  if (legacy) return legacy[1];

  // Last-resort split (handles simple cases while staying safe)
  const parts = id.split("_");
  if (parts.length >= 4 && /^[A-Za-z]+$/.test(parts[1])) return parts[1];

  return null;
}


// Normalize server-provided metric defs to the shape we need
function normalizeMetricDefs(list) {
  // Expecting items like: { key, label, min, max, step }
  // If backend returns only keys, we derive labels and defaults.
  return (Array.isArray(list) ? list : [])
    .map((it) => {
      if (typeof it === "string") {
        return { key: it, label: it, min: 0, max: 100, step: STEP };
      }
      const key = it?.key ?? it?.label ?? "CTC";
      return {
        key,
        label: it?.label ?? key,
        min: Number.isFinite(it?.min) ? it.min : 0,
        max: Number.isFinite(it?.max) ? it.max : 100,
        step: Number.isFinite(it?.step) ? it.step : STEP,
      };
    })
    // Dedup by key, keep first
    .filter((m, idx, arr) => arr.findIndex(x => x.key === m.key) === idx);
}

export default function Re_Process_Quality() {
  // Demo data now follows the new ID format: <Prefix>_<Alias><DDMMYY>_<Running>
  const [bags] = useState([
    { id: "DOS_V_300725_0001", weightKg: 25.4, grade: "A", stage: "Destoning" },
    { id: "DOS_300725_0003", weightKg: 25.4, grade: "A", stage: "Destoning" },
    { id: "SCR_M_300725_0010", weightKg: 25.4, grade: "A", stage: "Destoning" },
    { id: "CRU_300725_0002", weightKg: 26.1, grade: "B", stage: "Crushing" },
    { id: "BAG_V_300725_0003", weightKg: 24.9, grade: "A", stage: "Bundling" },
    { id: "BAG_300725_0004", weightKg: 25.0, grade: "C", stage: "Screening" },
    { id: "BAG_300725_0005", weightKg: 26.0, grade: "B", stage: "De-Magmetize" },
    { id: "BAG_300725_0006", weightKg: 25.2, grade: "A", stage: "De- Dusting" },
    // Example without alias: "BAG__300725_0007" or "BAG_300725_0007" would lead to CTC-only
  ]);

  // buckets + search
  const [bucketIndex, setBucketIndex] = useState(0);
  const currentBucket = BUCKETS[bucketIndex];
  const cycleBucket = (dir) => setBucketIndex((i) => (i + dir + BUCKETS.length) % BUCKETS.length);

  const [q, setQ] = useState("");
  const visible = useMemo(
    () =>
      bags.filter(
        (b) =>
          (b.stage || "").toLowerCase() === currentBucket.toLowerCase() &&
          (!q || b.id.toLowerCase().includes(q.toLowerCase()))
      ),
    [bags, currentBucket, q]
  );

  // selected bag
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [currentBucket, q]);
  const selected = visible[index] ?? visible[0] ?? null;
  const canPrev = index > 0;
  const canNext = index < visible.length - 1;

  // Dynamic metric definitions
  const [metricsDef, setMetricsDef] = useState(DEFAULT_METRICS);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const alias = useMemo(() => parseAliasFromBagId(selected?.id), [selected?.id]);

  // Metric values/drafts
  const [values, setValues] = useState(() =>
    DEFAULT_METRICS.reduce((acc, m) => ({ ...acc, [m.key]: 0 }), {})
  );
  const [drafts, setDrafts] = useState({});

  // Remarks + Next Destination
  const [remarks, setRemarks] = useState("");
  const [nextDestination, setNextDestination] = useState(NEXT_DEST_OPTIONS[0]);

  // ----- Fetch quality parameters for alias -----
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // If no alias, fall back to CTC-only
      if (!alias) {
        setMetricsDef(DEFAULT_METRICS);
        return;
      }
      setMetricsLoading(true);
      try {
        // Backend contract (adjust if your route differs):
        // GET /api/settings/quality-params?alias=P
        // -> { success: true, data: [{key,label,min,max,step}, ...] }
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/settings/quality-params`,
          { params: { alias }, withCredentials: true }
        );
        const defList = normalizeMetricDefs(res?.data?.data);
        // If server returned nothing, fall back to CTC-only
        const nextDefs = (defList && defList.length) ? defList : DEFAULT_METRICS;
        if (!cancelled) setMetricsDef(nextDefs);
      } catch (e) {
        console.error("Failed to fetch quality params for alias", alias, e);
        if (!cancelled) setMetricsDef(DEFAULT_METRICS);
      } finally {
        if (!cancelled) setMetricsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [alias]);

  // Keep values in sync with the current metricsDef (preserve what we can)
  useEffect(() => {
    setValues((prev) => {
      const next = {};
      metricsDef.forEach((m) => {
        next[m.key] = Number.isFinite(prev[m.key]) ? prev[m.key] : 0;
      });
      return next;
    });
    // Clear any stale drafts when metrics change
    setDrafts({});
  }, [metricsDef]);

  // validation helpers
  const metricErrorMsg = (key) => {
    const def = metricsDef.find((m) => m.key === key) || { min: 0, max: 100 };
    const raw = drafts[key];
    if (raw === undefined) return "";
    const v = parseFloat(String(raw).replace(",", "."));
    if (!Number.isFinite(v)) return "Enter a number";
    if (v < def.min || v > def.max) return `Range ${def.min}-${def.max}`;
    return "";
  };
  const hasErrors = metricsDef.some((m) => metricErrorMsg(m.key));

  // numeric commit/revert
  const commitDraft = (key) => {
    const msg = metricErrorMsg(key);
    if (msg) return; // keep error visible until fixed
    const raw = drafts[key];
    if (raw === undefined) return;
    const parsed = parseFloat(String(raw).replace(",", "."));
    const def = metricsDef.find((m) => m.key === key) || { min: 0, max: 100 };
    const next = clampRound2(parsed, def.min, def.max);
    setValues((prev) => ({ ...prev, [key]: next }));
    setDrafts((p) => {
      const c = { ...p };
      delete c[key];
      return c;
    });
  };
  const revertDraft = (key) =>
    setDrafts((p) => {
      const c = { ...p };
      delete c[key];
      return c;
    });

  const handleSave = () => {
    if (!selected || hasErrors || metricsLoading) return;
    const payload = {
      bucket: currentBucket,
      bag_no: selected.id,
      alias: alias ?? null,
      metrics: values,            // dynamic per alias
      remarks,
      next_destination: nextDestination,
    };
    console.log("SAVE", payload);
    // TODO: POST to your backend route, e.g.:
    // axios.post(`${import.meta.env.VITE_API_URL}/api/reprocess/save-quality`, payload, { withCredentials: true })
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 1.5 } }}>
      <GlobalStyles styles={{ "html, body, #root": { overflowX: "hidden" } }} />

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          width: { xs: "100%", md: "50%" },
          mx: "auto",
          overflowX: "hidden",
          bgcolor: (t) => (t.palette.mode === "light" ? t.palette.grey[100] : t.palette.grey[900]),
        }}
      >
        {/* ===== Header ===== */}
        <CardHeader
          sx={{ pb: 1, "& .MuiCardHeader-content": { width: "100%" } }}
          title={
            <Stack spacing={1.25}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <IconButton size="small" onClick={() => cycleBucket(-1)}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" fontWeight={700}>{currentBucket}</Typography>
                <IconButton size="small" onClick={() => cycleBucket(1)}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" justifyContent="center" spacing={1} alignItems="center">
                <Chip size="small" label={`No. of bags in bucket: ${visible.length}`} sx={{ bgcolor: "background.paper" }} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    metricsLoading
                      ? "Loading quality parameters…"
                      : alias
                        ? `Alias: ${alias} • Params: ${metricsDef.length}`
                        : "No alias • CTC only"
                  }
                />
              </Stack>

              <Paper elevation={3} sx={{ p: 1.25, borderRadius: 2, bgcolor: "background.paper", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
                <TextField
                  fullWidth placeholder="Search bag no..." size="small" value={q} onChange={(e) => setQ(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                  sx={{ mb: 1 }}
                />

                <List dense disablePadding sx={{ maxHeight: 240, overflowY: "auto", overflowX: "hidden" }}>
                  {visible.map((b, i) => (
                    <ListItemButton
                      key={b.id}
                      selected={i === index}
                      onClick={() => setIndex(i)}
                      sx={{ mb: 0.75, borderRadius: 1.5, border: 1, borderColor: i === index ? "text.primary" : "divider", bgcolor: "background.paper", minWidth: 0 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Inventory2OutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography fontWeight={800} noWrap sx={{ letterSpacing: 0.2 }}>{b.id}</Typography>}
                        secondary={
                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip size="small" label={`${b.weightKg} kg`} />
                            <Chip size="small" label={`Grade ${b.grade}`} />
                          </Stack>
                        }
                        sx={{ minWidth: 0 }}
                      />
                    </ListItemButton>
                  ))}
                  {visible.length === 0 && (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">No bags found.</Typography>
                    </Box>
                  )}
                </List>

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                  <Button size="small" variant="outlined" onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={!canPrev} startIcon={<ChevronLeftIcon fontSize="small" />}>Prev</Button>
                  <Button size="small" variant="outlined" onClick={() => setIndex((v) => Math.min(visible.length - 1, v + 1))} disabled={!canNext} endIcon={<ChevronRightIcon fontSize="small" />}>Next</Button>
                </Stack>
              </Paper>
            </Stack>
          }
        />

        <Divider />

        {/* ===== Content ===== */}
        <CardContent sx={{ pt: 2, overflowX: "hidden" }}>
          <Grid container spacing={1.75} alignItems="flex-start">
            {/* Dynamic Metrics grid */}
            <Grid item xs={12} md={12} lg={8}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                  columnGap: { xs: 2, md: 2.5 },
                  rowGap: { xs: 2, md: 2.5 },
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                {metricsDef.map((m) => {
                  const err = metricErrorMsg(m.key);
                  return (
                    <Box key={m.key} sx={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
                      <TextField
                        label={m.label}
                        size="small"
                        error={Boolean(err)}
                        helperText={err || " "}
                        value={drafts[m.key] !== undefined ? drafts[m.key] : formatNum(values[m.key])}
                        onChange={(e) => setDrafts((p) => ({ ...p, [m.key]: e.target.value }))}
                        onBlur={() => commitDraft(m.key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Tab") commitDraft(m.key);
                          if (e.key === "Escape") revertDraft(m.key);
                        }}
                        inputProps={{ inputMode: "decimal" }}
                        sx={{
                          width: { xs: 136, md: 156 },
                          "& .MuiInputBase-input": { py: 1.05, fontSize: 14 },
                          "& .MuiInputLabel-root": { fontSize: 12 },
                          minWidth: 0,
                        }}
                        FormHelperTextProps={{ sx: { m: 0, minHeight: 16 } }}
                      />
                    </Box>
                  );
                })}
                {metricsLoading && (
                  <Typography variant="body2" color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
                    Loading parameters…
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Remarks + Next Destination + Save */}
            <Grid item xs={12} md={12} lg={4}>
              <Grid container spacing={1.25} alignItems="stretch">
                {/* Remarks */}
                <Grid item xs={12} md={8} lg={7}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="Remarks"
                    placeholder="Optional notes…"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: 13, py: 1.1 },
                      "& .MuiInputLabel-root": { fontSize: 12 },
                      height: "100%",
                    }}
                  />
                </Grid>

                {/* Dropdown + Save in ONE line */}
                <Grid item xs={12} lg={5}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                      <InputLabel id="next-dest-label">Next Destination</InputLabel>
                      <Select
                        labelId="next-dest-label"
                        label="Next Destination"
                        value={nextDestination}
                        onChange={(e) => setNextDestination(e.target.value)}
                      >
                        {NEXT_DEST_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      endIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={!selected || hasErrors || metricsLoading}
                      sx={{ height: 40, px: 2, whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      Save
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
