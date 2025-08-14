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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneAllIcon from "@mui/icons-material/DoneAll";

// --- Mock data (with createdAt for strict sorting) ---
const SAMPLE_BAGS = [
  { ds_bag_no: "DSO_300725_001", weight_out: 42.5, datecode: "300725", createdAt: "2025-07-30T10:15:00Z" },
  { ds_bag_no: "DSO_300725_002", weight_out: 39.8, datecode: "300725", createdAt: "2025-07-30T10:25:00Z" },
  { ds_bag_no: "DSO_300725_010", weight_out: 41.1, datecode: "300725", createdAt: "2025-07-30T11:05:00Z" },
  { ds_bag_no: "DSO_310725_004", weight_out: 43.0, datecode: "310725", createdAt: "2025-07-31T09:10:00Z" },
  { ds_bag_no: "DSO_010825_003", weight_out: 40.2, datecode: "010825", createdAt: "2025-08-01T08:00:00Z" },
  { ds_bag_no: "DSO_020825_007", weight_out: 44.3, datecode: "020825", createdAt: "2025-08-02T13:30:00Z" },
];

// Tenant settings → output grade options (can be extended)
const SETTINGS_GRADES = [
  { grade: "3x4" },
  { grade: "8x16" },
  { grade: "4x16" },
  { grade: "30" },
  { grade: "4x8" },
];

// Compact helper
const paperSx = { p: 2, bgcolor: "#f6f8fa", borderRadius: 3, boxShadow: 1 };
const PAPER_HEIGHT = 560; // keep all main panels equal height

function ddmmyy(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

export default function Re_Process() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Machine/session state
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false); // gate for showing the right column
  const [available, setAvailable] = useState(() =>
    [...SAMPLE_BAGS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
  const [loaderBags, setLoaderBags] = useState([]); // loaded into machine (max 4)
  const [search, setSearch] = useState("");

  // Output settings (persistent)
  const STORAGE_KEY = "screening_selected_grades";
  const [gradeOptions] = useState(SETTINGS_GRADES);
  const [selectedGrades, setSelectedGrades] = useState(SETTINGS_GRADES.map((g) => g.grade));
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved)) {
        const valid = saved.filter((g) => gradeOptions.some((o) => o.grade === g));
        if (valid.length) setSelectedGrades(valid);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedGrades)); } catch {}
  }, [selectedGrades]);

  // Label management (multiple labels per grade)
  // each label: { id, labelId: 'REPO_DDMMYY_001', grade, weight }
  const [labels, setLabels] = useState([]);
  const [labelCounter, setLabelCounter] = useState(1); // increments per created label (mock)
  const [newLabelWeight, setNewLabelWeight] = useState({}); // per-grade input before creating a label

  // Derived
  const sortAvailable = (list) => [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortAvailable(
      available.filter((b) =>
        !q ? true : b.ds_bag_no.toLowerCase().includes(q) || String(b.weight_out).includes(q)
      )
    );
  }, [search, available]);

  const loadedWeight = useMemo(
    () => loaderBags.reduce((sum, b) => sum + (b.weight_out || 0), 0),
    [loaderBags]
  );

  const outputsTotal = useMemo(
    () => labels.reduce((sum, l) => sum + (parseFloat(l.weight) || 0), 0),
    [labels]
  );

  const tolerance = 0.2; // kg (kept, but not gating Move to Stock)
  const diff = loadedWeight - outputsTotal;
  const canMoveToStock = started && outputsTotal > 0; // relaxed per your request

  // Actions: Available → Loader (click oval button adds immediately)
  const addBagToLoader = (bag) => {
    if (loaderBags.length >= 4) return; // capped at 4
    setLoaderBags((prev) => (prev.find((x) => x.ds_bag_no === bag.ds_bag_no) ? prev : [...prev, bag]));
    setAvailable((prev) => sortAvailable(prev.filter((b) => b.ds_bag_no !== bag.ds_bag_no)));
  };

  const removeFromLoader = (bag) => {
    setLoaderBags((prev) => prev.filter((b) => b.ds_bag_no !== bag.ds_bag_no));
    setAvailable((prev) => sortAvailable([bag, ...prev])); // reinsert and keep sorted
  };

  const startScreening = () => {
    if (!loaderBags.length || selectedGrades.length === 0) return; // guard
    setBusy(true);
    setStarted(true);
  };

  // Grade selection (can change even after start)
  const toggleGrade = (gname) => {
    setSelectedGrades((prev) => (prev.includes(gname) ? prev.filter((g) => g !== gname) : [...prev, gname]));
  };
  const clearGrades = () => setSelectedGrades([]);

  // Labels
  const createLabel = (grade) => {
    const w = parseFloat(newLabelWeight[grade]);
    if (!(w > 0)) return; // require weight before creating
    const seq = String(labelCounter).padStart(3, "0");
    const labelId = `REPO_${ddmmyy()}_${seq}`;
    setLabelCounter((n) => n + 1);
    setLabels((prev) => [{ id: `${grade}-${labelId}`, labelId, grade, weight: w }, ...prev]);
    setNewLabelWeight((prev) => ({ ...prev, [grade]: "" })); // clear input for that grade
  };
  const deleteLabel = (id) => setLabels((prev) => prev.filter((l) => l.id !== id));

  const resetAll = () => {
    setBusy(false);
    setStarted(false);
    setLabels([]);
    setLabelCounter(1);
    setLoaderBags([]);
    setAvailable(sortAvailable(SAMPLE_BAGS));
    setSearch("");
    // keep selectedGrades as-is (persisted)
  };

  const moveToStock = () => {
    if (!canMoveToStock) return;
    // In real app, POST /api/screening/move-to-stock, then reset
    resetAll();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, width: "100%" }}>
      {/* Top header */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }} sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Screening – Machine SCR‑1</Typography>
        <Box sx={{ flex: 1 }} />
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        {/* Left: Available Inputs (ALWAYS SORTED by createdAt DESC) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Available Input Bags</Typography>
              <Chip label={`${available.length}`} size="small" />
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search bag/weight"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ flex: 1, minHeight: { xs: 260, md: 300 }, overflowY: "auto", pr: 1 }}>
              {filteredAvailable.map((bag) => {
                const maxed = loaderBags.length >= 4;
                return (
                  <Paper key={bag.ds_bag_no} sx={{ p: 1, mb: 1, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography fontSize={13} fontWeight={600}>{bag.ds_bag_no}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip label={`${bag.weight_out.toFixed(1)} kg`} size="small" variant="outlined" />
                        </Stack>
                      </Box>
                      <Tooltip title={maxed ? "Max 4 bags can be loaded" : "Load into screening"}>
                        <span>
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => addBagToLoader(bag)}
                            disabled={busy || maxed}
                            sx={{ borderRadius: 999, minWidth: 36, width: 36, height: 28, p: 0 }}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Paper>
                );
              })}
              {!filteredAvailable.length && (<Alert severity="info" sx={{ mt: 1 }}>No bags match your search.</Alert>)}
            </Box>
          </Paper>
        </Grid>

        {/* Center: Loader + Grade Settings (below loader; always visible, fixed width) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden", width: 350, boxSizing: "border-box" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Screening Loader</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Idle</Typography>
                  <Switch size="small" checked={busy} onChange={() => setBusy((v) => !v)} />
                  <Typography variant="body2">Busy</Typography>
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
                  <Paper key={bag.ds_bag_no} sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontSize={13} fontWeight={700}>{bag.ds_bag_no}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip label={`${bag.weight_out.toFixed(1)} kg`} size="small" variant="outlined" />
                        </Stack>
                      </Box>
                      <IconButton size="small" onClick={() => removeFromLoader(bag)} disabled={busy}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))
              )}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Output Grades (Settings) below loader; always visible */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Output Grades (Settings)</Typography>
              <Button size="small" onClick={clearGrades}>Clear</Button>
            </Stack>
            <Box sx={{
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
            }}>
              {gradeOptions.map((g) => {
                const on = selectedGrades.includes(g.grade);
                return (
                  <Chip
                    key={g.grade}
                    label={g.grade}
                    size="small"
                    variant={on ? "filled" : "outlined"}
                    color={on ? "primary" : "default"}
                    onClick={() => toggleGrade(g.grade)}
                    sx={{
                      borderStyle: on ? "solid" : "dashed",
                      height: 28,
                      alignSelf: "center",
                      maxWidth: "100%",
                      '& .MuiChip-label': { px: 1, fontSize: 12 }
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

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: "auto" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontSize={13}>Total loaded:</Typography>
                <Chip label={`${loadedWeight.toFixed(1)} kg`} size="small" color={loadedWeight > 0 ? "primary" : "default"} />
              </Stack>
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
                disabled={busy || loaderBags.length === 0 || selectedGrades.length === 0}
                onClick={startScreening}
              >
                Start
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right: Machine Status & Output (labels on right) - only visible after Start */}
        {started && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ ...paperSx, height: PAPER_HEIGHT, display: "flex", flexDirection: "column", width: 710, boxSizing: "border-box", overflowX: "hidden" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1">Machine Status & Output</Typography>
                <Chip label={busy ? "BUSY" : "IDLE"} color={busy ? "warning" : "success"} size="small" />
              </Stack>

              {/* TOP summary above the list box */}
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontSize={13}>Loaded</Typography>
                  <Chip size="small" label={`${loadedWeight.toFixed(1)} kg`} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontSize={13}>Σ Output</Typography>
                  <Chip size="small" label={`${outputsTotal.toFixed(1)} kg`} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontSize={13}>Δ</Typography>
                  <Chip size="small" label={`${diff.toFixed(2)} kg`} color={Math.abs(diff) <= tolerance ? "success" : "error"} />
                </Stack>
              </Stack>
              <LinearProgress variant="determinate" value={Math.min(100, (outputsTotal / (loadedWeight || 1)) * 100)} />

              {/* Two-column: left = grade rows with Create Label; right = list box of labels */}
              <Grid container spacing={1} sx={{ mt: 1, flex: 1, overflow: "hidden" }}>
                <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", maxHeight: 360 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Grades</Typography>
                  <Box sx={{ overflowY: "auto", pr: 1 }}>
                    {selectedGrades.length === 0 && <Alert severity="warning" sx={{ mb: 1 }}>Select at least one grade.</Alert>}
                    {selectedGrades.map((g) => {
                      const count = labels.filter((l) => l.grade === g).length;
                      const weightValid = parseFloat(newLabelWeight[g]) > 0;
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
                                  '& .MuiOutlinedInput-input': { padding: '2px 6px', fontSize: 12 },
                                  '& .MuiOutlinedInput-root': { height: 28 },
                                }}
                              />
                              <Typography fontSize={12} color="text.secondary">kg</Typography>
                              <Button size="small" variant="outlined" onClick={() => createLabel(g)} disabled={!busy || !weightValid}>
                                Create label
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", maxHeight: 360 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Labels (right list)</Typography>
                  <Box sx={{ overflowY: "auto", overflowX: "hidden", pr: 1, flex: 1, width: "100%", scrollbarGutter: "stable" }}>
                    {labels.length === 0 ? (
                      <Alert severity="info" sx={{ width: "100%", boxSizing: "border-box", whiteSpace: "normal", wordBreak: "break-word" }}>
                        No labels yet. Enter a weight and press "Create label".
                      </Alert>
                    ) : (
                      labels.map((l) => (
                        <Paper key={l.id} sx={{ p: 1, mb: 1, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Chip size="small" label={l.labelId} />
                              <Chip size="small" variant="outlined" label={l.grade} />
                              <Chip size="small" label={`${(parseFloat(l.weight) || 0).toFixed(1)} kg`} />
                            </Stack>
                            <IconButton size="small" onClick={() => deleteLabel(l.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" color="success" startIcon={<DoneAllIcon />} disabled={!canMoveToStock} onClick={moveToStock}>
                  Move to Stock
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
