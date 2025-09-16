// src/Operations/Re_Process_Quality.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Card, CardHeader, CardContent, Typography,Grid,Button,TextField, Chip,
  Divider, Stack, IconButton, Paper, InputAdornment, GlobalStyles, List,
  ListItemButton, ListItemText, ListItemIcon, FormControl, InputLabel, Select, MenuItem,
  Alert, LinearProgress, Snackbar
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";



const DECIMAL_PLACES = 2;
const STEP = 0.01;
const API = import.meta.env.VITE_API_URL;

// Single-metric fallback when no alias/params
const DEFAULT_METRICS = [{ key: "CTC", label: "CTC", min: 0, max: 100, step: STEP }];

// Buckets (UI labels unchanged)
const BUCKETS = ["De-Stoning","Crushing","Blending","Screening","De-Magnetize","De-Dusting"];

// dropdown options (unchanged)
const NEXT_DEST_OPTIONS = [
  "Screening", "Crushing", "De-Dusting",
  "De-Magnetize", "Blending", "Packaging", "InStock"
];

const formatNum = (n) => (Number.isFinite(n) ? n.toFixed(DECIMAL_PLACES) : (0).toFixed(DECIMAL_PLACES));
const clampRound2 = (value, min = 0, max = 100) => {
  const num = Number.isFinite(value) ? value : 0;
  const clamped = Math.max(min, Math.min(max, num));
  return Math.round(clamped * 100) / 100;
};

// Parse alias from: <PREFIX>_<ALIAS>_<DDMMYY>_<RUNNING>
function parseAliasFromBagId(id = "") {
  if (typeof id !== "string") return null;
  const strict = id.match(/^[^_]+_([A-Za-z]+)_(\d{6})_([A-Za-z0-9]+)$/);
  if (strict) return strict[1];
  if (/^[^_]+__\d{6}_[A-Za-z0-9]+$/.test(id)) return null; // explicit no-alias
  const legacy = id.match(/^[^_]+_([A-Za-z]+)\d{6}_[A-Za-z0-9]+$/);
  if (legacy) return legacy[1];
  const parts = id.split("_");
  if (parts.length >= 4 && /^[A-Za-z]+$/.test(parts[1])) return parts[1];
  return null;
}

// Normalize whatever server returns into {key,label,min,max,step}
function normalizeMetricDefs(list) {
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
    .filter((m, idx, arr) => arr.findIndex(x => x.key === m.key) === idx);
}

export default function Re_Process_Quality() {
  // spin animation for refresh icon while busy
  const spinStyles = `@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`;

  // -------- Buckets + search ----------
  const [bucketIndex, setBucketIndex] = useState(0);
  const currentBucket = BUCKETS[bucketIndex];
  const cycleBucket = (dir) => setBucketIndex((i) => (i + dir + BUCKETS.length) % BUCKETS.length);

  const [q, setQ] = useState("");

  // -------- Data: bags ----------
  const [bags, setBags] = useState([]);
  const [bagsLoading, setBagsLoading] = useState(false);
  const [bagsError, setBagsError] = useState("");

  // -------- Data: all alias metrics ----------
  const [aliasMap, setAliasMap] = useState({ __DEFAULT__: DEFAULT_METRICS });
  const [aliasMapLoading, setAliasMapLoading] = useState(false);
  const [aliasMapError, setAliasMapError] = useState("");

  // Combined busy flag for disabling interactions
  const [refreshing, setRefreshing] = useState(false);
  const busy = aliasMapLoading || bagsLoading || refreshing;

  // selected + search
  const visible = useMemo(
    () => bags.filter(b => !q || (b.id || "").toLowerCase().includes(q.toLowerCase())),
    [bags, q]
  );
    

  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [q, bags.length]);
  const selected = visible[index] ?? visible[0] ?? null;
  const canPrev = index > 0;
  const canNext = index < visible.length - 1;
  const alias = useMemo(() => parseAliasFromBagId(selected?.id), [selected?.id]);

  // derive metrics from cached aliasMap
  const metricsDef = useMemo(() => {
    if (!alias) return aliasMap.__DEFAULT__ || DEFAULT_METRICS;
    return aliasMap[alias] || aliasMap.__DEFAULT__ || DEFAULT_METRICS;
  }, [alias, aliasMap]);

  // Metric values/drafts
  const [values, setValues] = useState(() =>
    DEFAULT_METRICS.reduce((acc, m) => ({ ...acc, [m.key]: 0 }), {})
  );
  const [drafts, setDrafts] = useState({});

  // Remarks + Next Destination + Saving + Snackbars
  const [remarks, setRemarks] = useState("");
  const [nextDestination, setNextDestination] = useState(NEXT_DEST_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Next-destination options excluding the current bucket
    const filteredNextDestOptions = React.useMemo(
        () => NEXT_DEST_OPTIONS.filter(o => o !== currentBucket),
        [currentBucket]
      );
     
      // Keep nextDestination valid when bucket changes
      useEffect(() => {
        if (!filteredNextDestOptions.includes(nextDestination)) {
          setNextDestination(filteredNextDestOptions[0] || "");
        }
      }, [filteredNextDestOptions, nextDestination]);

  // Keep values in sync with current metricsDef
  useEffect(() => {
    setValues((prev) => {
      const next = {};
      metricsDef.forEach((m) => {
        next[m.key] = Number.isFinite(prev[m.key]) ? prev[m.key] : 0;
      });
      return next;
    });
    setDrafts({});
  }, [metricsDef]);

  // Validation helpers
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

  const commitDraft = (key) => {
    const msg = metricErrorMsg(key);
    if (msg) return;
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

  // -------- API calls --------

  // Fetch all aliases once (or on manual refresh)
  const fetchAllQualityParams = React.useCallback(async () => {
    setAliasMapLoading(true);
    setAliasMapError("");
    try {
      const res = await axios.get(`${API}/api/settings/quality-params/all`, {
        params: { includeInactive: 1 },
        withCredentials: true,
      });
      if (!res?.data?.success) throw new Error(res?.data?.error || "Unknown error");
      const rawMap = res.data.data || {};
      const normalizedMap = {};
      for (const [a, list] of Object.entries(rawMap)) {
        normalizedMap[a] = normalizeMetricDefs(list);
      }
      if (!normalizedMap.__DEFAULT__) normalizedMap.__DEFAULT__ = DEFAULT_METRICS;
      setAliasMap(normalizedMap);
    } catch (e) {
      console.error("Failed to fetch quality params (all):", e);
      setAliasMap({ __DEFAULT__: DEFAULT_METRICS });
      setAliasMapError("Couldn’t load quality parameters. You can still enter CTC, or retry.");
    } finally {
      setAliasMapLoading(false);
    }
  }, []);

  // Fetch bags for the current bucket (backend normalizes the name)
  const fetchBags = React.useCallback(async (bucketLabel) => {
    setBagsLoading(true);
    setBagsError("");
    try {
      const res = await axios.get(`${API}/api/post_activation/bags`, {
        params: { bucket: bucketLabel }, // pass raw label; BE normalizes
        withCredentials: true,
      });

      const payload = res?.data;
      const rows = Array.isArray(payload)
        ? payload
        : (payload?.success && Array.isArray(payload?.data) ? payload.data : null);
      if (!rows) throw new Error(payload?.error || "Invalid response");

      const normalized = rows.map(r => {
        const rawWeight = r.weightKg ?? r.weightkg ?? r.bag_weight ?? r.weight ?? 0;
        return {
          id: r.id ?? r.bag_no ?? r.bagno,
          weightkg: Number(rawWeight) || 0,
          grade: r.grade ?? r.quality_grade ?? null,
        };
      });

      setBags(normalized);
    } catch (e) {
      console.error("Failed to fetch bags:", e);
      setBags([]);
      setBagsError("Couldn’t load bags. Please try refresh.");
    } finally {
      setBagsLoading(false);
    }
  }, []);

  // Manual refresh: refresh both for current bucket
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchBags(currentBucket), fetchAllQualityParams()]);
    } finally {
      setRefreshing(false);
    }
  }, [currentBucket, fetchBags, fetchAllQualityParams]);

  // On mount: initial load for current bucket + all params
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user changes bucket, fetch that bucket’s bags
  useEffect(() => {
    fetchBags(currentBucket);
  }, [currentBucket, fetchBags]);

  // ---- Save quality ----
   const handleSave = async () => {
        if (!selected || hasErrors || aliasMapLoading || bagsLoading || saving) return;
        try {
                setSaving(true);
                const payload = {
                    bucket: currentBucket,        // raw label
                    bag_no: selected.id,          // backend accepts bag_no (or id)
                    quality: values,              // JSONB
                    remarks,
                    next_destination: nextDestination,
                };
                const res = await axios.post(`${API}/api/post_activation/quality_save`, payload, {
                    withCredentials: true,
                });
                if (!res?.data?.success) throw new Error(res?.data?.error || "Save failed");
                setSnack({ open: true, message: "Quality saved.", severity: "success" });

            // 🔄 Refresh the current bucket's bags so the list reflects the update
            await fetchBags(currentBucket);
            // (No need to refresh quality params here.)
        } catch (e) {
              const msg = e?.response?.data?.error || e?.message || "Save failed";
              setSnack({ open: true, message: msg, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

  // Disable everything interactive while busy
  const disableAll = busy;

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 1.5 } }}>
      <GlobalStyles styles={{ "html, body, #root": { overflowX: "hidden" } }} />
      <GlobalStyles styles={spinStyles} />

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
                <IconButton size="small" onClick={() => cycleBucket(-1)} disabled={disableAll} aria-label="Previous bucket">
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" fontWeight={700}>{currentBucket}</Typography>
                <IconButton size="small" onClick={() => cycleBucket(1)} disabled={disableAll} aria-label="Next bucket">
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" justifyContent="center" spacing={1} alignItems="center">
                {/* Refresh icon BEFORE No. of bags chip */}
                <IconButton
                  size="small"
                  aria-label="Refresh data"
                  onClick={handleRefresh}
                  disabled={disableAll}
                  sx={busy ? { animation: "spin 0.8s linear infinite" } : undefined}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>

                <Chip size="small" label={`No. of bags: ${visible.length}`} sx={{ bgcolor: "background.paper" }} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    busy
                      ? "Fetching data…"
                      : (alias
                          ? `Alias: ${alias} • Params: ${metricsDef.length}`
                          : "No alias • CTC only")
                  }
                />
              </Stack>

              <Paper elevation={3} sx={{ p: 1.25, borderRadius: 2, bgcolor: "background.paper", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
                <TextField
                  fullWidth placeholder="Search bag no..." size="small" value={q} onChange={(e) => setQ(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                  sx={{ mb: 1 }}
                  disabled={disableAll}
                />

                <List dense disablePadding sx={{ maxHeight: 240, overflowY: "auto", overflowX: "hidden" }}>
                  {visible.map((b, i) => (
                    <ListItemButton
                      key={b.id}
                      selected={i === index}
                      onClick={() => !disableAll && setIndex(i)}
                      disabled={disableAll}
                      sx={{ mb: 0.75, borderRadius: 1.5, border: 1, borderColor: i === index ? "text.primary" : "divider", bgcolor: "background.paper", minWidth: 0 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Inventory2OutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                            <Typography
                              fontWeight={800}
                              noWrap
                              sx={{
                                letterSpacing: 0.2,
                                fontSize: { xs: 14, sm: 14, md: 13, lg: 12 }, // smaller on big screens
                              }}
                            >
                              {b.id}
                            </Typography>

                            {/* Chips inline with ID on md+ */}
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ display: { xs: "none", md: "inline-flex" }, ml: 1, flexShrink: 0 }}
                            >
                              <Chip size="small" label={`${b.weightkg} kg`} />
                              <Chip size="small" label={`Grade ${b.grade}`} />
                            </Stack>
                          </Stack>
                        }
                        secondaryTypographyProps={{ component: 'div' }} 
                        secondary={
                          // Mobile view unchanged: chips on the next line
                          <Stack
                            direction="row"
                            spacing={1}
                            mt={0.5}
                            sx={{ display: { xs: "flex", md: "none" } }}
                          >
                            <Chip size="small" label={`${b.weightkg} kg`} />
                            <Chip size="small" label={`Grade ${b.grade}`} />
                          </Stack>
                        }
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
                  <Button size="small" variant="outlined" onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={!canPrev || disableAll} startIcon={<ChevronLeftIcon fontSize="small" />}>Prev</Button>
                  <Button size="small" variant="outlined" onClick={() => setIndex((v) => Math.min(visible.length - 1, v + 1))} disabled={!canNext || disableAll} endIcon={<ChevronRightIcon fontSize="small" />}>Next</Button>
                </Stack>
              </Paper>
            </Stack>
          }
        />

        <Divider />

        {/* ===== Content ===== */}
        <CardContent sx={{ pt: 2, overflowX: "hidden" }}>
          {(busy) && <LinearProgress sx={{ mb: 1 }} />}

          {/* Error banners (show both if both fail) */}
          {bagsError && (
            <Alert
              severity="error"
              sx={{ mb: 1.5 }}
              action={<Button color="inherit" size="small" onClick={handleRefresh}>Retry</Button>}
            >
              {bagsError}
            </Alert>
          )}
          {aliasMapError && (
            <Alert
              severity="error"
              sx={{ mb: 1.5 }}
              action={<Button color="inherit" size="small" onClick={handleRefresh}>Retry</Button>}
            >
              {aliasMapError}
            </Alert>
          )}

          {/* <Grid container spacing={1.75} alignItems="flex-start"> */}
          <Grid container spacing={1.75} alignItems="flex-start" columns={12} >
            {/* Dynamic Metrics grid */}
            <Grid size ={{xs:12 }}>
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
                        disabled={disableAll}
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
              </Box>
            </Grid>

            {/* Remarks + Next Destination + Save */}
            {/* <Grid item xs={12} md={12} lg={4} > */}
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              {/* <Grid container spacing={1.25} alignItems="stretch"> */}
              <Grid container spacing={1.25} alignItems="stretch" columns={12} >
                {/* Remarks */}
                {/* <Grid item xs={12} md={8} lg={7}> */}
                <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="Remarks"
                    placeholder="Optional notes…"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={disableAll}
                    sx={{
                      "& .MuiInputBase-input": { fontSize: 13, py: 1.1 },
                      "& .MuiInputLabel-root": { fontSize: 12 },
                      height: "100%",
                    }}
                  />
                </Grid>

                {/* Dropdown + Save in ONE line */}
                {/* <Grid item xs={12} md={5} lg={5}> */}
                <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 0 }} disabled={disableAll}>
                      <InputLabel id="next-dest-label">Next Destination</InputLabel>
                      <Select
                        labelId="next-dest-label"
                        label="Next Destination"
                        value={nextDestination}
                        onChange={(e) => setNextDestination(e.target.value)}
                      >
                        {filteredNextDestOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      endIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={!selected || hasErrors || disableAll || saving}
                      sx={{ height: 40, px: 2, whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Snackbars */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
