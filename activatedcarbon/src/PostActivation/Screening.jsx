// Screening.jsx — full component (aligned to Load_Unload model, with requested changes)
// - No BUSY/IDLE chip, no Start button, unlimited loader items
// - Status from /api/post_activation/status_cont_load (today+ yesterday counters + last10)
// - Center column fixed width on laptop/desktop, 100% on mobile
// - Yesterday counters moved to LEFT panel footer
// - Output panel: "Machine Output" header, Σ (left) and Δ (right), divider, then Output Grades (create labels)
// - Middle panel: Output Grade Settings (select chips). Output panel shows ONLY selected grades.
// - Create label shows toast success/failure; goes to quality automatically (handled backend)

import React, { useEffect, useMemo, useState,useRef } from "react";
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
  Snackbar,
  Menu,
  MenuItem
} from "@mui/material";

// put near your other imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import axios from "axios";
import PrintLabelButton from "../QR/PrintLabel";
import QrScannerDialog from "./QrScannerDialog";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL || "/", withCredentials: true, timeout: 20000 });

const paperSx = { p: 2, bgcolor: "#f6f8fa", borderRadius: 3, boxShadow: 1 };
const PAPER_HEIGHT = 560;

// helpers
const parseNum = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const fmt1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "0.0");
const uniq = (arr = []) => Array.from(new Set(arr.filter(Boolean)));

export default function Screening({ tabName }) {
  // State: available and loader bags
  const [available, setAvailable] = useState([]);
  const [loaderBags, setLoaderBags] = useState([]);
  const [search, setSearch] = useState("");
  const [bagsLoading, setBagsLoading] = useState(false);

  // Status counters
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);

  // Output creation
  const [newLabelWeight, setNewLabelWeight] = useState({});
  const [outSaving, setOutSaving] = useState(false);

  // QR dialog/menu
  const [scanOpen, setScanOpen] = useState(false);
  const [menuEl, setMenuEl] = useState(null);
  const menuOpen = Boolean(menuEl);

  const [snack, setSnack] = useState({ open: false, sev: "success", msg: "" });
  const showError = (msg) => setSnack({ open: true, sev: "error", msg: msg || "Something went wrong." });
  const showSuccess = (msg) => setSnack({ open: true, sev: "success", msg });

  // Popup-only memory (no weight/outSaving added)
  const pendingGradeRef = useRef(null);
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [machineDialogValue, setMachineDialogValue] = useState(""); // "Gyro" | "Shaker"


  // --- Fetchers ---
  const fetchAvailable = async () => {
    setBagsLoading(true);
    try {
      const resp = await api.get(`/api/post_activation/bags_to_process`, { params: { tabName }, withCredentials: true });
      setAvailable(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      console.error(e);
      showError(e?.message || "Failed to load available bags.");
    } finally {
      setBagsLoading(false);
    }
  };

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const { data } = await api.get(`/api/post_activation/status_cont_load`, {
        params: { tabname: tabName },   // <-- send tab here
        withCredentials: true
      });
      setStatusData(data || null);
      
    } catch (e) {
      console.error(e);
      showError(e?.message || "Failed to load status.");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchAvailable();
  }, []);

  // --- Grade settings state & APIs ---
  const [gradeOptions, setGradeOptions] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [gradesError, setGradesError] = useState("");
  const [savingLive, setSavingLive] = useState(false);

  const fetchActiveGrades = async () => {
    try {
      const resp = await api.get("/api/settings/output-grades", { params: { activeOnly: true }, withCredentials: true });
      const map = resp.data?.data?.Output_Grades || {};
      return Object.keys(map).sort();
    } catch (e) {
      setGradesError(e?.response?.data?.error || e?.message || "Failed to load active output grades.");
      return [];
    }
  };

  const fetchLiveGrades = async () => {
    try {
      const resp = await api.get("/api/settings/output-grades-live", { withCredentials: true });
      return Array.isArray(resp.data?.data) ? resp.data.data : [];
    } catch (e) {
      setGradesError(e?.response?.data?.error || e?.message || "Failed to load current output grades.");
      return [];
    }
  };

  const saveLiveGrades = async (grades, remarks = "Updated from Screening Loader") => {
    setGradesError("");
    setSavingLive(true);
    try {
      await api.put("/api/settings/output-grades-live", { grades }, { withCredentials: true });
    } catch (e) {
      setGradesError(e?.response?.data?.error || e?.message || "Failed to save output grades.");
      throw e;
    } finally {
      setSavingLive(false);
    }
  };

  const loadGradeSettings = async () => {
    setGradesError("");
    setGradesLoading(true);
    try {
      const [actives, liveRaw] = await Promise.all([fetchActiveGrades(), fetchLiveGrades()]);
      setGradeOptions(actives);
      const live = (liveRaw || []).filter((g) => actives.includes(g));
      if ((!live || live.length === 0) && actives.length > 0) {
        await saveLiveGrades(actives, "Init: default all active");
        setSelectedGrades(actives);
      } else {
        setSelectedGrades(live);
      }
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    loadGradeSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Output panel should show exactly what the user selected
  const outputGradesForCreate = useMemo(
    () => (Array.isArray(selectedGrades) ? selectedGrades : []),
    [selectedGrades]
  );

  // --- Derived from status ---
  const today = statusData?.todayCounters;
  const yesterday = statusData?.yesterdayCounters;
  const last10Output = statusData?.last10Output || [];
  const last10Loaded = statusData?.last10Loaded || [];
  console.log(today);
  console.log(statusData);
  // Available list filtering
  const sortByDateDesc = (list) =>
    [...list].sort((a, b) => new Date(b?.screening_out_dt ?? 0) - new Date(a?.screening_out_dt ?? 0));
  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortByDateDesc(
      available.filter((b) => (!q ? true : b.bag_no?.toLowerCase().includes(q) || String(b.weight).includes(q)))
    );
  }, [search, available]);

  // Loader actions — NO 4-bag limit anymore
  const addBagToLoader = (bag) => {
    setLoaderBags((prev) => (prev.find((x) => x.bag_no === bag.bag_no) ? prev : [...prev, bag]));
    setAvailable((prev) => prev.filter((b) => b.bag_no !== bag.bag_no));
  };
  const removeFromLoader = (bag) => {
    setLoaderBags((prev) => prev.filter((b) => b.bag_no !== bag.bag_no));
    setAvailable((prev) => sortByDateDesc([bag, ...prev]));
  };

  // Create output label → auto to Quality (backend). Show toast on success/failure.
  const handleAddOut = async (grade,machine) => {
    const w = Number(newLabelWeight[grade]);
    if (!Number.isFinite(w) || w <= 0) return;
    setOutSaving(true);
    try {
      const { data } = await api.post(`/api/post_activation/createlabel_cont`, { grade, weight: w,machine }, { params: { tabName }, withCredentials: true });
      setNewLabelWeight((prev) => ({ ...prev, [grade]: "" }));
      showSuccess(`Label created: ${data?.created?.bag_no}`);
      
      // update counters without an extra call
      if (data?.counters) {
        setStatusData(prev => ({ ...prev, ...data.counters }));
      }
      //await fetchStatus();
    } catch (e) {
      console.error(e);
      showError(e?.message || "Failed to create output label.");
      alert(e?.response?.data?.error || e?.message || 'Failed to create label.');
    } finally {
      setOutSaving(false);
    }
  };

  // QR menu handlers
  const handleOpenMenu = (e) => setMenuEl(e.currentTarget);
  const handleCloseMenu = () => setMenuEl(null);

  // Load dialog state
    const [loadDlg, setLoadDlg] = useState({ open: false, bag: null, weight: "", machine: "" });

    // Open dialog prefilled
    const openLoadDialog = (bag) => {
    setLoadDlg({ open: true, bag, weight: bag?.weight ? String(bag.weight) : "", machine: "" });
    };

    // Close dialog
    const closeLoadDialog = () =>
    setLoadDlg({ open: false, bag: null, weight: "", machine: "" });

    // Optimistic counters until backend is wired
    /* const applyLocalCountersAfterLoad = (w) => {
      setStatusData((prev) => {
          if (!prev) return prev;
          const today = { ...(prev.todayCounters || {}) };
          const loaded = { ...(today.loaded || {}) };
          const output = { ...(today.output || {}) };
          const newCount = (loaded.count || 0) + 1;
          const newLoadedW = (Number(loaded.totalWeight) || 0) + (Number(w) || 0);
          const newDelta = newLoadedW - (Number(output.totalWeight) || 0);
          return {
          ...prev,
          todayCounters: {
              ...today,
              loaded: { ...loaded, count: newCount, totalWeight: newLoadedW },
              delta: { weight: newDelta },
          },
          };
      });
      }; */

      // Confirm: add locally + counters + toast
      const confirmLoadDialog = async () => {
        const normTab = String(tabName || '').trim();
        const needsMachine = normTab === 'Screening';
        const bag = loadDlg.bag;
        const w = Number(loadDlg.weight);
        const machine = loadDlg.machine;
        if (!bag || !Number.isFinite(w) || w <= 0 || (needsMachine && !machine)) return;

        try {
          const { data } = await api.post(
            '/api/post_activation/load_bags_cont',
            { bag_no: bag.bag_no, weight: w, machine: needsMachine ? machine : null },
            { params: { tabName: normTab }, withCredentials: true }
          );

          // remove from available silently
          if (data?.removedFromAvailable) {
            setAvailable(prev => prev.filter(x => x.bag_no !== bag.bag_no));
          }
          // update counters silently
          if (data?.counters) {
            setStatusData(prev => ({
              ...prev,
              ...data.counters,
              todayCounters: data.counters.todayCounters,
              yesterdayCounters: data.counters.yesterdayCounters,
              last10Loaded: data.counters.last10Loaded,
              last10Output: data.counters.last10Output
            }));
          }

          // show and close
          showSuccess(`Loaded ${bag.bag_no} (${w} kg)${needsMachine ? ` on ${machine}` : ''}`);
          // after successful POST
          await fetchAvailable();   // same function your Refresh button uses
          //await fetchStatus();      // if you also refresh the right-side counters

          closeLoadDialog();
        } catch (e) {
          console.error(e);
          alert(e?.response?.data?.error || e?.message || 'Failed to load bag.'); // ask to refresh on 409
        }
      };

      const handleCreateLabelClick = (grade) => {
      const isScreening = String(tabName || "").trim() === "Screening";

      if (isScreening) {
        // Show popup ONLY for Screening; remember which grade was clicked
        pendingGradeRef.current = grade;
        setMachineDialogValue(""); // force explicit selection
        setMachineDialogOpen(true);
        return;
      }

      // All other tabs: call as-is
      handleAddOut(grade);
    };

    const handleConfirmMachine = () => {
      if (!machineDialogValue || !pendingGradeRef.current) return;

      const grade = pendingGradeRef.current;
      setMachineDialogOpen(false);
      pendingGradeRef.current = null;

      // Same endpoint; include { machine } ONLY for Screening
      handleAddOut(grade, machineDialogValue);
    };

    const handleCancelMachine = () => {
      setMachineDialogOpen(false);
      pendingGradeRef.current = null;
    };


  // --- UI ---
  return (
    <Box sx={{ p: { xs: 1, md: 2 }, width: "100%" }}>
      {statusLoading && <LinearProgress sx={{ mb: 1 }} />}

      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }} sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{tabName} – Machine</Typography>
        <Box sx={{ flex: 1 }} />
      </Stack>

      <Grid
        container
        columnSpacing={2}
        rowSpacing={2}
        alignItems="stretch"
        sx={{ flexWrap: { xs: "wrap", md: "nowrap" } 
        }}
      >
        {/* Left: Available Inputs — ALWAYS enabled */}
        <Grid item xs={12} sx={{ flexGrow: 1, minWidth: 0 ,width: { xs: '100%', md: 340 },
            flexBasis: { xs: '100%', md: 340 },
            maxWidth: { xs: '100%', md: 340 },}}>
          <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1">Available Input Bags</Typography>
                <Chip label={`${available.length}`} size="small" />
              </Stack>
              <Tooltip title="Refresh list">
                <span>
                  <IconButton size="small" onClick={fetchAvailable} disabled={bagsLoading || statusLoading}>
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
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ) }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ flex: 1, minHeight: { xs: 260, md: 300 }, overflowY: "auto", pr: 1 }}>
              {bagsLoading ? (
                <LinearProgress sx={{ mt: 1 }} />
              ) : (
                <>
                  {filteredAvailable.map((bag) => {
                    const bw = fmt1(parseNum(bag?.weight));
                    return (
                      <Paper key={bag.bag_no} sx={{ p: 1, mb: 1, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography fontSize={13} fontWeight={600}>{bag.bag_no}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Chip label={`${bw} kg`} size="small" variant="outlined" />
                            </Stack>
                          </Box>
                          <Tooltip title="Load into screening">
                            <span>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="warning"
                                    onClick={() => openLoadDialog(bag)}   // <-- open the dialog (not addBagToLoader)
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
                  {!filteredAvailable.length && !bagsLoading && (
                    <Alert severity="info" sx={{ mt: 1 }}>No bags match your search.</Alert>
                  )}
                </>
              )}
            </Box>

            {/* Yesterday counters */}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Chip size="small" label={`L: ${yesterday ? yesterday.loaded.count : 0} · ${fmt1(parseNum(yesterday?.loaded.totalWeight))} kg`} />
                <Chip size="small" label={`Σ: ${fmt1(parseNum(yesterday?.output.totalWeight || 0))} kg`} />
                {/* <Chip size="small" label={`Δ: ${fmt1(parseNum(yesterday?.delta.weight || 0))} kg`} /> */}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Center: Loader — fixed 340px on md+; 100% on xs/sm */}
        <Grid
          item
          xs={12}
          sx={{
            width: { xs: '100%', md: 340 },
            flexBasis: { xs: '100%', md: 340 },
            maxWidth: { xs: '100%', md: 340 },
            flexGrow: { xs: 1, md: 0 },
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, display: "flex", flexDirection: "column" }}>
            {/* Header: title on first line; chip + menu left-aligned on second line */}
            <Box sx={{ mb: 1 ,width:'100%'}}>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                {tabName} Loader
            </Typography>

            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ width: '100%' }}   // <-- full width so it can right-align
                >
                <Chip
                    size="small"
                    label={`Loaded Today: ${today ? today.loaded.count : 0} bags / ${fmt1(parseNum(today?.loaded.totalWeight))} kg`}
                />

                <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu anchorEl={menuEl} open={menuOpen} onClose={() => setMenuEl(null)} keepMounted>
                    <MenuItem onClick={() => { setScanOpen(true); setMenuEl(null); }}>
                    <QrCodeScannerIcon sx={{ mr: 1 }} fontSize="small" /> Scan to Load
                    </MenuItem>
                </Menu>
            </Stack>

            <Divider sx={{ my: 1 }} />
            </Box>
             

            {/* Loader list (no cap) */}
            <Box sx={{ flex: 1, minHeight: { xs: 220, md: 260 }, overflowY: "auto", overflowX: "hidden", pr: 1, width: "100%", scrollbarGutter: "stable" }}>
              {last10Loaded.length === 0 ? (
                <Alert severity="info" sx={{ width: "100%" }}>Click the orange arrow to load, or use Scan from the menu.</Alert>
              ) : (
                last10Loaded.map((bag) => (
                  <Paper key={bag.bag_no} sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontSize={13} fontWeight={700}>{bag.bagNo}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip label={`${fmt1(parseNum(bag?.weight))} kg`} size="small" variant="outlined" />
                          {bag?.grade && <Chip label={bag.grade} size="small" variant="outlined" />}
                        </Stack>
                      </Box>
                     {/*  <IconButton size="small" onClick={() => removeFromLoader(bag)}>
                        <CloseIcon fontSize="small" />
                      </IconButton> */}
                    </Stack>
                  </Paper>
                ))
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Output Grade Settings (middle panel) */}
            <Typography variant="subtitle2" sx={{ mb: 0.5, mt: 1 }}>Output Grade Settings</Typography>

            {gradesLoading ? (
              <LinearProgress sx={{ mb: 1 }} />
            ) : (
              <>
                {gradesError && <Alert severity="error" sx={{ mb: 1 }}>{gradesError}</Alert>}

                {/* Toggleable grade chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pr: 1, maxHeight: 128, overflowY: 'auto', mb: 1 }}>
                  {gradeOptions.map((g) => {
                    const on = selectedGrades.includes(g);
                    return (
                      <Chip
                        key={g}
                        label={g}
                        size="small"
                        variant={on ? "filled" : "outlined"}
                        color={on ? "primary" : "default"}
                        onClick={async () => {
                          const next = on ? selectedGrades.filter((x) => x !== g) : [...selectedGrades, g];
                          setSelectedGrades(next);
                          try { await saveLiveGrades(next, "Chip toggled"); } catch { setSelectedGrades(selectedGrades); }
                        }}
                        sx={{ borderStyle: on ? "solid" : "dashed", height: 28, "& .MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                    );
                  })}
                </Box>

                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    size="small"
                    onClick={() => { setSelectedGrades([]); saveLiveGrades([], "Clear all").catch(()=>{}); }}
                    disabled={savingLive}
                  >
                    Clear
                  </Button>
                </Stack>

                {selectedGrades.length === 0 && (
                  <Typography variant="caption" color="error">
                    Select at least one grade to enable bag creation.
                  </Typography>
                )}
              </>
            )}

          </Paper>
        </Grid>

        {/* Right: Output */}
        <Grid item xs={12} sx={{ flexGrow: 1, minWidth: 0 ,width: { xs: '100%', md: 340 },
            flexBasis: { xs: '100%', md: 400 },
            maxWidth: { xs: '100%', md: 400 },}}>
          <Paper sx={{ ...paperSx, height: { xs: "100%", sm: PAPER_HEIGHT }, display: "flex", flexDirection: "column", boxSizing: "border-box", overflowX: "hidden", width:'100%' }}>
            {/* Header */}
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Machine Output</Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Chip size="small" label={`Σ ${fmt1(parseNum(today?.output?.totalWeight || 0))} kg`} />
              <Chip size="small" label={`Δ ${fmt1(parseNum(today?.delta?.weight || 0))} kg`} />
            </Stack>
            <Divider sx={{ mb: 1 }} />

            {/* Output Grades (create labels) */}
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Output Grades</Typography>

            {gradesLoading ? (
              <LinearProgress sx={{ mb: 1 }} />
            ) : outputGradesForCreate.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 1 }}>
                Select at least one output grade in the middle panel to create bags.
              </Alert>
            ) : (
              <Box sx={{ overflowY: "auto", pr: 1, maxHeight: 180, mb: 1 }}>
                {outputGradesForCreate.map((g) => {
                  const count = (last10Output || []).filter((r) => r.grade === g).length;
                  const weightValid = Number.isFinite(Number(newLabelWeight[g])) && Number(newLabelWeight[g]) > 0;
                  return (
                    <Paper key={g} sx={{ p: 1, mb: 1, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography fontSize={13}>{g}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {/* <Chip size="small" label={`${count} labels`} /> */}
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
                                onClick={() => handleCreateLabelClick(g)}
                                disabled={!weightValid || outSaving}
                                color="warning"
                                sx={{
                                  width: 48,
                                  height: 28,
                                  p: 0,
                                  borderRadius: 999,
                                  bgcolor: 'warning.main',
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
            )}

            {/* Last 10 Output */}
            <Typography variant="subtitle2">Last 10 Output of {(today?.output?.count || 0)}</Typography>
            <Box sx={{ overflowX: "hidden", pr: 1, flex: 1, width: "100%", overflowY: 'auto', scrollbarGutter: 'stable' }}>
              {Array.isArray(last10Output) && last10Output.length > 0 ? (
                last10Output.map((r, i) => (
                  <Paper key={`${r.bagNo}-${i}`} sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={r.bagNo} />
                        <Chip size="small" label={`${fmt1(parseNum(r.weight))} kg`} />
                        <Chip size="small" label={r.grade} />
                        <PrintLabelButton bag_no={r.bagNo} grade={r.grade} weight={r.weight} heightIn={2.5} />
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Alert severity="info">No output yet.</Alert>
              )}
            </Box>

          </Paper>
        </Grid>
      </Grid>

      {/* QR Scanner Dialog */}
        <QrScannerDialog
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        closeOnScan
        onDetected={(text) => {
            const candidate = String(text || "").trim();
            const found = available.find(
            (b) => String(b.bag_no).toUpperCase() === candidate.toUpperCase()
            );
            if (found) {
            openLoadDialog(found);
            setScanOpen(false);
            } else {
            showError(`Not found in Available: ${candidate}`);
            }
        }}
        />

        {/* Load Bag Dialog */}
        <Dialog open={loadDlg.open} onClose={closeLoadDialog} fullWidth maxWidth="xs">
        <DialogTitle>Load Bag</DialogTitle>
        <DialogContent>
            {loadDlg.bag && (
            <Stack spacing={1} sx={{ mt: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip size="small" label={`Bag: ${loadDlg.bag.bag_no}`} />
                {loadDlg.bag.grade && (
                    <Chip size="small" label={`Grade: ${loadDlg.bag.grade}`} />
                )}
                </Stack>

                <TextField
                label="Weight (kg)"
                type="number"
                value={loadDlg.weight}
                onChange={(e) =>
                    setLoadDlg((d) => ({ ...d, weight: e.target.value }))
                }
                inputProps={{ min: 0, step: 0.1 }}
                fullWidth
                sx={{ mt: 0.5 }}
                />
                {/* Machine only for Screening */}
                {tabName === 'Screening' && (
                  <FormControl sx={{ mt: 1 }}>
                  <FormLabel>Machine Type</FormLabel>
                  <RadioGroup
                      row
                      value={loadDlg.machine}
                      onChange={(e) =>
                      setLoadDlg((d) => ({ ...d, machine: e.target.value }))
                      }
                  >
                      <FormControlLabel value="Gyro" control={<Radio />} label="Gyro" />
                      <FormControlLabel value="Shaker" control={<Radio />} label="Shaker" />
                  </RadioGroup>
                  </FormControl>
                )}
            </Stack>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={closeLoadDialog}>Cancel</Button>
            <Button
            variant="contained"
            onClick={confirmLoadDialog}
            disabled={
                !Number.isFinite(Number(loadDlg.weight)) ||
                Number(loadDlg.weight) <= 0 ||
                (tabName === 'Screening' && !loadDlg.machine)  // require machine only for Screening //!loadDlg.machine
            }
            >
            Confirm & Load
            </Button>
        </DialogActions>
        </Dialog>

        <Dialog open={machineDialogOpen} onClose={handleCancelMachine} fullWidth maxWidth="xs">
          <DialogTitle sx={{ pb: 1 }}>Select machine</DialogTitle>
          <DialogContent dividers>
            <FormControl>
              <RadioGroup
                value={machineDialogValue}
                onChange={(e) => setMachineDialogValue(e.target.value)}
              >
                <FormControlLabel value="Gyro"   control={<Radio size="small" />} label="Gyro" />
                <FormControlLabel value="Shaker" control={<Radio size="small" />} label="Shaker" />
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelMachine}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleConfirmMachine}
              disabled={!machineDialogValue}        // must explicitly pick
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
