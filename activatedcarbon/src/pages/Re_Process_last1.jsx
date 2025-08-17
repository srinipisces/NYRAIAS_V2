// Re_Process.jsx (status-first)
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Alert,
  Tooltip,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Switch,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import axios from "axios";

/* ------------------ API client (VITE_URL + cookies + error surfacing) ------------------ */
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL || "/", withCredentials: true, timeout: 20000 });
const CREATE_LABEL_URL = '/api/re_process/createlabel';
const DELETE_BAG_URL = '/api/re_process/delete_bag';
const MOVE_TO_STOCK_URL = '/api/re_process/move_to_stock';

api.interceptors.response.use(
  (resp) => {
    const d = resp?.data;
    if (d && typeof d === "object" && d.success === false) {
      const err = new Error(d.error || "Request failed");
      // @ts-ignore
      err.status = resp.status;
      // @ts-ignore
      err.code = d.code;
      throw err;
    }
    return resp;
  },
  (error) => {
    const msg = error?.response?.data?.error || error?.message || "Network error";
    const err = new Error(msg);
    // @ts-ignore
    err.status = error?.response?.status;
    // @ts-ignore
    err.code = error?.response?.data?.code;
    return Promise.reject(err);
  }
);

const paperSx = { p: 2, bgcolor: "#f6f8fa", borderRadius: 3, boxShadow: 1 };
const LEFT_WIDTH = 350;
const RIGHT_WIDTH = 700;
const PAPER_HEIGHT = 560;

/* ------------------ small utils ------------------ */
const parseNum = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const fmt1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "0.0");
const fmt2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "0.00");
function ddmmyy(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

export default function Re_Process() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  /* ------------------ App state ------------------ */
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true); // NEW: status-first bootstrap

  // Bags from backend route /api/re_process/re_process
  const [available, setAvailable] = useState([]);
  const [bagsLoading, setBagsLoading] = useState(true);
  const [loaderBags, setLoaderBags] = useState([]);
  const [search, setSearch] = useState("");

  // Output grades from backend
  const [gradeOptions, setGradeOptions] = useState([]); // ["3x4","4x16",...]
  const [selectedGrades, setSelectedGrades] = useState([]); // -> persisted in Output_Grades_Live
  const [gradesLoading, setGradesLoading] = useState(true);
  const [savingLive, setSavingLive] = useState(false);
  const [gradesError, setGradesError] = useState('');


  // Error surfaces
  const [error, setError] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const showError = (msg) => {
    setError(msg || "Something went wrong.");
    setSnackOpen(true);
  };

  // Labels (client-side preview)
  const [labels, setLabels] = useState([]);
  const [labelCounter, setLabelCounter] = useState(1);
  const [newLabelWeight, setNewLabelWeight] = useState({});
  const [serverOutBags, setServerOutBags] = useState([]);
  const [serverOutSummary, setServerOutSummary] = useState([]);
  const [lot, setLot] = useState(null);
  const [outSaving, setOutSaving] = useState(false);

  /* ------------------ Derived ------------------ */
  const sortByDateDesc = (list) =>
    [...list].sort((a, b) => new Date(b?.screening_out_dt ?? 0) - new Date(a?.screening_out_dt ?? 0));

  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortByDateDesc(
      available.filter((b) => (!q ? true : b.bag_no?.toLowerCase().includes(q) || String(b.weight).includes(q)))
    );
  }, [search, available]);

  const loadedWeight = useMemo(() => loaderBags.reduce((sum, b) => sum + parseNum(b?.weight), 0), [loaderBags]);

  // ✅ new: always compute a busy total from server data
  const outputsTotalBusy = useMemo(
    () => serverOutBags.reduce((s, b) => s + parseNum(b?.bag_weight), 0),
    [serverOutBags]
  );

  // ✅ unified total that switches source based on busy flag
  const outputsTotal = useMemo(
    () => (busy ? outputsTotalBusy : labels.reduce((sum, l) => sum + parseNum(l?.weight), 0)),
    [busy, outputsTotalBusy, labels]
  );


  const localSummary = useMemo(() => {
    const m = new Map();
    for (const l of labels) {
      const g = l.grade || "—";
      const v = m.get(g) || { count: 0, total_weight: 0 };
      v.count += 1;
      v.total_weight += parseNum(l.weight);
      m.set(g, v);
    }
    return Array.from(m, ([grade, v]) => ({ grade, ...v }));
  }, [labels]);

  const displaySummary = busy ? serverOutSummary : localSummary;
  const displayBags = busy
    ? serverOutBags
    : labels.map(l => ({ bag_no: l.labelId, bag_weight: parseNum(l.weight), grade: l.grade, bag_no_created_dttm: null }));

  const tolerance = 0.2;
  const diff = loadedWeight - outputsTotal;
  const canMoveToStock = started && (busy ? serverOutBags.length > 0 : outputsTotal > 0);

  /* ------------------ Backend helpers ------------------ */
  // 1) Bags (eligible for loader when idle)
  const fetchReprocessBags = async () => {
    setBagsLoading(true);
    try {
      // Your route returns rows: bag_no, weight, screening_out_dt (for Re_Process)
      const resp = await api.get("/api/re_process/re_process");
      const rows = Array.isArray(resp.data) ? resp.data : [];
      setAvailable(rows);
    } catch (e) {
      console.error("fetchReprocessBags", e);
      showError(e?.message || "Failed to load re-process bags.");
    } finally {
      setBagsLoading(false);
    }
  };

  // 2) Grades (active + live)
  // before starting a grades fetch/save
    setGradesError('');

  const fetchActiveGrades = async () => {
    const resp = await api.get("/api/settings/output-grades", { params: { activeOnly: true } });
    return Object.keys(resp.data?.data || {}).sort();
  };

  const fetchLiveGrades = async () => {
    const resp = await api.get("/api/settings/output-grades-live");
    return Array.isArray(resp.data?.data) ? resp.data.data : [];
  };

  const saveLiveGrades = async (grades, remarks = "Updated from Screening Loader") => {
    setSavingLive(true);
    try {
      await api.put("/api/settings/output-grades-live", { grades, remarks });
    } finally {
      setSavingLive(false);
    }
  };

  // 3) Status-first bootstrap (NEW)
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const { data } = await api.get("/api/re_process/status");
      if (data?.busy) {
        setLot(data.lot || null);
        // Machine BUSY → hydrate loader (read-only) from status
        setBusy(true);
        setStarted(true);
        const loaded = (data?.loaded?.bags || []).map((b) => ({
          bag_no: b.bag_no,
          weight: b.weight,
          screening_out_dt: b.created_dttm,
        }));
        setLoaderBags(loaded);
        setAvailable([]); // lock Available panel
        setServerOutBags(Array.isArray(data?.out_bags) ? data.out_bags : []);
        setServerOutSummary(Array.isArray(data?.out_summary) ? data.out_summary : []);
      } else {
        // Machine IDLE → normal flow
        setBusy(false);
        setStarted(false);
        setLot(null);
        
        
        setServerOutBags([]);
        setServerOutSummary([]);
        await fetchReprocessBags();
      }
    } catch (e) {
      console.error("status", e);
      showError(e?.message || "Failed to check status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // On mount → check status first (instead of fetching bags immediately)
  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load grade settings (unchanged)
  const loadGradeSettings = async () => {
    setGradesLoading(true);
    try {
      const actives = await fetchActiveGrades();
      setGradeOptions(actives);

      let live = await fetchLiveGrades();
      live = live.filter((g) => actives.includes(g));

      if ((!live || live.length === 0) && actives.length > 0) {
        await saveLiveGrades(actives, "Init: default all active");
        setSelectedGrades(actives);
      } else {
        setSelectedGrades(live);
      }
    } catch (e) {
      console.error("loadGradeSettings", e);
      showError(e?.message || "Failed to load Output Grades.");
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    loadGradeSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gradesLoading) return;
    setSelectedGrades((prev) => {
      const intersect = prev.filter((g) => gradeOptions.includes(g));
      const next = intersect.length > 0 ? intersect : gradeOptions;
      if (next.length !== prev.length) {
        saveLiveGrades(next, "Auto-adjust to active grades");
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeOptions]);

  /* ------------------ Actions ------------------ */
  const addBagToLoader = (bag) => {
    if (loaderBags.length >= 4) return;
    setLoaderBags((prev) => (prev.find((x) => x.bag_no === bag.bag_no) ? prev : [...prev, bag]));
    setAvailable((prev) => prev.filter((b) => b.bag_no !== bag.bag_no));
  };

  const removeFromLoader = (bag) => {
    setLoaderBags((prev) => prev.filter((b) => b.bag_no !== bag.bag_no));
    setAvailable((prev) => sortByDateDesc([bag, ...prev]));
  };

  const startScreening = async () => {
    if (!loaderBags.length || selectedGrades.length === 0) return;
    try {
      await saveLiveGrades(selectedGrades, "Start pressed");
      setBusy(true);
      setStarted(true);
    } catch (e) {
      showError(e?.message || "Failed to save selection before Start.");
    }
  };

  const toggleGrade = async (gname) => {
    const prev = selectedGrades;
    const next = prev.includes(gname) ? prev.filter((g) => g !== gname) : [...prev, gname];
    setSelectedGrades(next);
    try {
      await saveLiveGrades(next, "Chip toggled");
    } catch (e) {
      setSelectedGrades(prev);
      showError(e?.message || "Failed to update selection.");
    }
  };

  const clearGrades = async () => {
    const prev = selectedGrades;
    setSelectedGrades([]);
    try {
      await saveLiveGrades([], "Cleared all");
    } catch (e) {
      setSelectedGrades(prev);
      showError(e?.message || "Failed to clear selection.");
    }
  };

  // Labels (icon instead of text button)
  const createLabel = (grade) => {
    const w = parseNum(newLabelWeight[grade]);
    if (!(w > 0)) return;
    const seq = String(labelCounter).padStart(3, "0");
    const labelId = `REPO_${ddmmyy()}_${seq}`;
    setLabelCounter((n) => n + 1);
    setLabels((prev) => [{ id: `${grade}-${labelId}`, labelId, grade, weight: w }, ...prev]);
    setNewLabelWeight((prev) => ({ ...prev, [grade]: "" }));
  };
  const deleteLabel = (id) => setLabels((prev) => prev.filter((l) => l.id !== id));

  
  const handleAddOut = async (grade) => {
    if (!lot?.lot_id) return;
    const w = Number(newLabelWeight[grade]);
    if (!Number.isFinite(w) || w <= 0) return;
    setOutSaving(true);
    try {
      await api.post(CREATE_LABEL_URL, {
        lot_id: lot.lot_id,
        grade,
        bag_weight: w,
      });
      setNewLabelWeight((prev) => ({ ...prev, [grade]: '' }));
      await fetchStatus();
    } catch (e) {
      console.error(e);
      showError(e?.message || 'Failed to add output bag.');
    } finally {
      setOutSaving(false);
    }
  };

  const handleDeleteOut = async (bag_no) => {
    if (!bag_no) return;
    setOutSaving(true);
    try {
      await api.post(DELETE_BAG_URL, { bag_no });
      await fetchStatus();
    } catch (e) {
      console.error(e);
      showError(e?.message || 'Failed to delete output bag.');
    } finally {
      setOutSaving(false);
    }
  };

const resetAll = () => {
    setBusy(false);
    setStarted(false);
        setLot(null);
        
    
        setServerOutBags([]);
        setServerOutSummary([]);
setLabels([]);
    setLabelCounter(1);
    setLoaderBags([]);
    setSearch("");
  };

  const moveToStock = async () => {
    if (!canMoveToStock) return;
    try {
      const payload = lot?.lot_id ? { lot_id: lot.lot_id } : {};
      await api.post(MOVE_TO_STOCK_URL, payload);
      // success → reset component and refresh
      resetAll();
      await fetchStatus();
    } catch (e) {
      console.error('move_to_stock', e);
      showError(e?.message || 'Failed to move to stock.');
    }
  };


  return (
    <Box sx={{ p: { xs: 1, md: 2 }, width: "100%" }}>
      {/* Optional: linear hint while status bootstraps */}
      {statusLoading && <LinearProgress sx={{ mb: 1 }} />}

      {/* Top header */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }} sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Screening – Machine SCR-1</Typography>
        <Box sx={{ flex: 1 }} />
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        {/* Left: Available Inputs */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", opacity: busy ? 0.8 : 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1">Available Input Bags</Typography>
                <Chip label={`${available.length}`} size="small" />
              </Stack>
              <Tooltip title={busy ? "Machine busy" : "Refresh list"}>
                <span>
                  <IconButton size="small" onClick={fetchReprocessBags} disabled={bagsLoading || busy || statusLoading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search bag/weight"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={busy || statusLoading}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ flex: 1, minHeight: { xs: 260, md: 300 }, overflowY: "auto", pr: 1 }}>
              {bagsLoading && !busy ? (
                <LinearProgress sx={{ mt: 1 }} />
              ) : (
                <>
                  {filteredAvailable.map((bag) => {
                    const maxed = loaderBags.length >= 4;
                    const bw = fmt1(parseNum(bag?.weight));
                    return (
                      <Paper key={bag.bag_no} sx={{ p: 1, mb: 1, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography fontSize={13} fontWeight={600}>{bag.bag_no}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Chip label={`${bw} kg`} size="small" variant="outlined" />
                              <Chip label={new Date(bag.screening_out_dt).toLocaleString()} size="small" variant="outlined" />
                            </Stack>
                          </Box>
                          <Tooltip title={busy ? "Machine busy" : (maxed ? "Max 4 bags can be loaded" : "Load into screening")}>
                            <span>
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                onClick={() => addBagToLoader(bag)}
                                disabled={busy || maxed || statusLoading}
                                sx={{ borderRadius: 999, minWidth: 36, width: 36, height: 28, p: 0 }}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    );
                  })}
                  {!filteredAvailable.length && !bagsLoading && !busy && (
                    <Alert severity="info" sx={{ mt: 1 }}>No bags match your search.</Alert>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Center: Loader + Output Grades (below) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden", width: LEFT_WIDTH, boxSizing: "border-box" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Screening Loader</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">{busy ? "Busy" : "Idle"}</Typography>
                  <Switch size="small" checked={busy} disabled />
                </Stack>
                <Chip label={`${loaderBags.length}/4 loaded`} size="small" />
              </Stack>
            </Stack>

            <Box sx={{ flex: 1, minHeight: { xs: 250, md: 300 }, overflowY: "auto", overflowX: "hidden", pr: 1, width: "100%", scrollbarGutter: "stable" }}>
              {loaderBags.length === 0 ? (
                <Alert severity={busy ? "warning" : "info"} sx={{ width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                  {busy ? "Machine busy: No additional bags can be loaded." : "Click the orange oval → to load. Max 4."}
                </Alert>
              ) : (
                loaderBags.map((bag) => (
                  <Paper key={bag.bag_no} sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontSize={13} fontWeight={700}>{bag.bag_no}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip label={`${fmt1(parseNum(bag?.weight))} kg`} size="small" variant="outlined" />
                        </Stack>
                      </Box>
                      <IconButton size="small" onClick={() => removeFromLoader(bag)} disabled={busy || statusLoading}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Output Grades (active only) */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Output Grades (Settings)</Typography>
              <Button size="small" onClick={clearGrades} disabled={gradesLoading || savingLive}>Clear</Button>
            </Stack>

            {gradesLoading ? (
              <Box sx={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LinearProgress sx={{ width: "100%" }} />
              </Box>
            ) : (
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {error}
                  </Alert>
                )}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.75,
                    width: "100%",
                    maxWidth: "100%",
                    height: { xs: 112, md: 128 },
                    overflowY: "auto",
                    overflowX: "hidden",
                    pr: 1,
                    alignItems: "center",
                  }}
                >
                  {gradeOptions.map((g) => {
                    const on = selectedGrades.includes(g);
                    return (
                      <Chip
                        key={g}
                        label={g}
                        size="small"
                        variant={on ? "filled" : "outlined"}
                        color={on ? "primary" : "default"}
                        onClick={() => toggleGrade(g)}
                        disabled={savingLive}
                        sx={{
                          borderStyle: on ? "solid" : "dashed",
                          height: 28,
                          alignSelf: "center",
                          maxWidth: "100%",
                          "& .MuiChip-label": { px: 1, fontSize: 12 },
                        }}
                      />
                    );
                  })}
                </Box>
                {selectedGrades.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    Select at least one output grade to start.
                  </Typography>
                )}
              </>
            )}

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: "auto" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontSize={13}>Total loaded:</Typography>
                <Chip label={`${fmt1(loadedWeight)} kg`} size="small" color={loadedWeight > 0 ? "primary" : "default"} />
              </Stack>
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                disabled={busy || loaderBags.length === 0 || selectedGrades.length === 0 || savingLive || statusLoading}
                onClick={startScreening}
              >
                Start
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Status & Output — only visible after Start */}
        {started && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, display: "flex", flexDirection: "column", width: RIGHT_WIDTH, boxSizing: "border-box", overflowX: "hidden" }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1">Machine Status & Output</Typography>
                <Chip label={busy ? "BUSY" : "IDLE"} color={busy ? "warning" : "success"} size="small" />
              </Stack>

              {/* Totals */}
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontSize={13}>Loaded</Typography>
                  <Chip size="small" label={`${fmt1(parseNum(loadedWeight))} kg`} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontSize={13}>Σ Output</Typography>
                  <Chip size="small" label={`${fmt1(parseNum(outputsTotal))} kg`} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontSize={13}>Δ</Typography>
                  <Chip
                    size="small"
                    label={`${fmt2(loadedWeight - outputsTotal)} kg`}
                    color={Math.abs((loadedWeight - outputsTotal)) <= tolerance ? "success" : "error"}
                  />
                </Stack>
              </Stack>

              <LinearProgress variant="determinate" value={Math.min(100, (outputsTotal / (loadedWeight || 1)) * 100)} />

              {/* Two columns */}
              <Grid container spacing={1} sx={{ mt: 1, flex: 1, overflow: "hidden" }}>
                {/* LEFT COLUMN: Per-grade / Grade chips */}
                <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", maxHeight: 360 }}>
                  {busy ? (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Output Grades</Typography>
                      <Box sx={{ overflowY: "auto", pr: 1 }}>
                        {selectedGrades.length === 0 && (
                          <Alert severity="warning" sx={{ mb: 1 }}>Select at least one grade.</Alert>
                        )}
                        {selectedGrades.map((g) => {
                          const count = serverOutBags.filter((r) => r.grade === g).length;
                          const weightValid = Number.isFinite(Number(newLabelWeight[g])) && Number(newLabelWeight[g]) > 0;
                          return (
                            <Paper key={g} sx={{ p: 1, mb: 1, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Typography fontSize={13}>{g}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip size="small" label={`${count} labels`} />
                                  <TextField
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 0, step: 0.1 }}
                                    placeholder="wt"
                                    value={newLabelWeight[g] || ""}
                                    onChange={(e) => setNewLabelWeight((prev) => ({ ...prev, [g]: e.target.value }))}
                                    sx={{
                                      width: 65,
                                      "& .MuiOutlinedInput-input": { padding: "2px 6px", fontSize: 12 },
                                      "& .MuiOutlinedInput-root": { height: 28 },
                                    }}
                                    disabled={outSaving}
                                  />
                                  <Typography fontSize={12} color="text.secondary">kg</Typography>
                                  <Tooltip title="Create label">
                                    <span>
                                      <IconButton
                                            size="small"
                                            onClick={() => handleAddOut(g)}
                                            disabled={!weightValid || outSaving}
                                            color="warning"
                                            sx={{
                                              width: 48,
                                              height: 28,
                                              p: 0,
                                              borderRadius: 999,         // pill/oval
                                              bgcolor: 'warning.main',   // fill
                                              color: 'warning.contrastText',
                                              boxShadow: 1,
                                              '&:hover': { bgcolor: 'warning.dark' },
                                              '&.Mui-disabled': {
                                                bgcolor: 'action.disabledBackground',
                                                color: 'action.disabled',
                                                boxShadow: 'none',
                                              },
                                            }}
                                          >
                                          <LabelOutlinedIcon sx={{ fontSize: 16, transform: 'rotate(-45deg)' }} />
                                        </IconButton>

                                    </span>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            </Paper>
                          );
                        })}
                      </Box>
                    </>
                  ) : (
                    <>
                      {/* IDLE: keep your existing grade chips UI */}
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Output Grades (Settings)</Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                          width: "100%",
                          maxWidth: "100%",
                          height: { xs: 112, md: 128 },
                          overflowY: "auto",
                          overflowX: "hidden",
                          pr: 1,
                          alignItems: "center",
                        }}
                      >
                        {gradeOptions.map((g) => {
                          const on = selectedGrades.includes(g);
                          return (
                            <Chip
                              key={g}
                              label={g}
                              size="small"
                              variant={on ? "filled" : "outlined"}
                              color={on ? "primary" : "default"}
                              onClick={() => toggleGrade(g)}
                              disabled={savingLive}
                              sx={{
                                borderStyle: on ? "solid" : "dashed",
                                height: 28,
                                alignSelf: "center",
                                maxWidth: "100%",
                                "& .MuiChip-label": { px: 1, fontSize: 12 },
                              }}
                            />
                          );
                        })}
                      </Box>
                      {selectedGrades.length === 0 && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          Select at least one output grade to start.
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>

                {/* RIGHT COLUMN: Output list / Labels list */}
                <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", maxHeight: 360 }}>
                  {busy ? (
                    <>
                      <Typography variant="subtitle2">Output Bags</Typography>
                      <Box sx={{ overflowY: "auto", overflowX: "hidden", pr: 1, flex: 1, width: "100%", scrollbarGutter: "stable" }}>
                        {Array.isArray(serverOutBags) && serverOutBags.length > 0 ? (
                          serverOutBags.map((r, i) => (
                            <Paper
                              key={`${r.bag_no}-${i}`}
                              sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Chip size="small" label={r.bag_no} />
                                  <Chip size="small" variant="outlined" label={r.grade || "—"} />
                                  <Chip size="small" label={`${fmt1(parseNum(r.bag_weight))} kg`} />
                                  
                                </Stack>
                              
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteOut(r.bag_no)}
                                  disabled={outSaving}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Paper>
                          ))
                        ) : (
                          <Alert severity="info">No output yet.</Alert>
                        )}
                      </Box>
                    </>
                  ) : (
                    <>
                      {/* IDLE: your existing label list UI */}
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Labels (right list)</Typography>
                      <Box sx={{ overflowY: "auto", overflowX: "hidden", pr: 1, flex: 1, width: "100%", scrollbarGutter: "stable" }}>
                        {labels.length === 0 ? (
                          <Alert
                            severity="info"
                            sx={{ width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}
                          >
                            No labels yet. Enter a weight and press the label icon.
                          </Alert>
                        ) : (
                          labels.map((l) => (
                            <Paper key={l.id} sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Chip size="small" label={l.labelId} />
                                  <Chip size="small" variant="outlined" label={l.grade} />
                                  <Chip size="small" label={`${fmt1(parseNum(l.weight))} kg`} />
                                </Stack>
                                <IconButton size="small" onClick={() => deleteLabel(l.id)}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Paper>
                          ))
                        )}
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<DoneAllIcon />}
                  disabled={!canMoveToStock}
                  onClick={moveToStock}
                >
                  Move to Stock
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Floating snackbar for any backend error */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="error" variant="filled" sx={{ width: "100%" }}>
          {error || "Error"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
