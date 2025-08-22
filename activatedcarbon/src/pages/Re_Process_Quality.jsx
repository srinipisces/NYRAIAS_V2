import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  InputBase,
  Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/Save";

/**
 * Bag Data Entry (MUI version) with Bucket Navigation
 * - Left: bag list with bucket nav (<  Bucket  >)
 * - Right: 8 metrics as Chip + compact input (80px), two per row
 * - Inputs are draft-friendly: free typing, commit on blur / Enter
 * - Remarks, Next Destination, Save / Save & Next
 * - Mobile: bag dropdown + Prev/Next (from current bucket only)
 */

const DECIMAL_PLACES = 2;
const STEP = 0.01; // 2 decimal places

const METRICS = [
  { key: "+3", label: "+3", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "3/4", label: "3/4", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "4/8", label: "4/8", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "8/12", label: "8/12", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "12/30", label: "12/30", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "-30", label: "-30", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "CBD", label: "CBD", min: 0, max: 100, step: STEP, unit: "%" },
  { key: "CTC", label: "CTC", min: 0, max: 100, step: STEP, unit: "%" },
];

const DESTINATIONS = [
  "InStock",
  "Crushing",
  "DeMagnetizing",
  "Screening",
  "ReBagging",
  "Reject",
];

// Buckets for the bag list tabs
const BUCKETS = [
  "Destoning",
  "Crushing",
  "Bundling",
  "Screening",
  "De-Magmetize",
  "De- Dusting",
];

// Helpers
export function formatNum(n) {
  return isFinite(n) ? n.toFixed(DECIMAL_PLACES) : (0).toFixed(DECIMAL_PLACES);
}
export function clampRound2(value, min = 0, max = 100) {
  const num = Number.isFinite(value) ? value : 0;
  const clamped = Math.max(min, Math.min(max, num));
  return Math.round(clamped * 100) / 100; // 2 decimals
}

// Focus-only bordered input built on InputBase
const FocusInput = styled(InputBase)(({ theme }) => ({
  width: 80,
  padding: "4px 8px",
  borderRadius: 6,
  border: "2px solid transparent",
  transition: theme.transitions.create("border-color", { duration: 120 }),
  "&.Mui-focused": {
    borderColor: theme.palette.primary.main,
  },
}));

// Bag List with bucket navigation header
function BagList({ items, selectedId, onSelect, search, setSearch, bucketName, onPrevBucket, onNextBucket }) {
  return (
    <Card variant="outlined" sx={{ height: 500 }}>
      <CardHeader
        title={
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 0 }}>
            <Button size="small" variant="text" onClick={onPrevBucket}>&lt;</Button>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 ,}}>{bucketName}</Typography>
              
            </Box>
            <Button size="small" variant="text" onClick={onNextBucket}>&gt;</Button>
            <Box></Box>
            <Box sx={{alignItems: "center"}}><Chip size="small" label={`No.of bags in Bucket : ${items.length}`} color="default" /></Box>
          </Box>
          
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SearchIcon fontSize="small" />
          <InputBase
            fullWidth
            placeholder="Search bag no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: (t) => (t.palette.mode === "dark" ? t.palette.grey[800] : t.palette.grey[100]),
            }}
          />
        </Box>
        <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
          <List dense>
            {items.map((b) => {
              const selected = b.id === selectedId;
              return (
                <ListItemButton
                  key={b.id}
                  selected={selected}
                  onClick={() => onSelect(b.id)}
                  sx={{ borderRadius: 1.5, mb: 0.5, border: 1, borderColor: selected ? "primary.light" : "divider" }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Inventory2Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={600}>{b.id}</Typography>}
                    secondary={
                      <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "nowrap", alignItems: "center" }}>
                        {typeof b.weightKg === "number" && (
                          <Chip size="small" label={`${b.weightKg} kg`} color={selected ? "primary" : "default"} />
                        )}
                        <Chip size="small" label={b.grade ? `Grade ${b.grade}` : "Grade —"} color={selected ? "primary" : "default"} />
                      </Box>
                    }
                  />
                </ListItemButton>
              );
            })}
            {items.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                No bags found.
              </Typography>
            )}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Re_Process_Quality() {
  // Sample data — replace with real API data; ensure each bag has a 'stage' for the bucket
  const [bags] = useState([
    { id: "BAG_300725_0001", weightKg: 25.4, grade: "A", stage: "Destoning" },
    { id: "BAG_300725_0002", weightKg: 26.1, grade: "B", stage: "Crushing" },
    { id: "BAG_300725_0003", weightKg: 24.9, grade: "A", stage: "Bundling" },
    { id: "BAG_300725_0004", weightKg: 25.0, grade: "C", stage: "Screening" },
    { id: "BAG_300725_0005", weightKg: 26.0, grade: "B", stage: "De-Magmetize" },
    { id: "BAG_300725_0006", weightKg: 25.2, grade: "A", stage: "De- Dusting" },
  ]);

  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => bags.filter((b) => b.id.toLowerCase().includes(search.trim().toLowerCase())),
    [bags, search]
  );

  // bucket state + visible list
  const [bucketIndex, setBucketIndex] = useState(0);
  const currentBucket = BUCKETS[bucketIndex];
  const visible = useMemo(
    () => filtered.filter((b) => (b.stage || "").toLowerCase() === currentBucket.toLowerCase()),
    [filtered, currentBucket]
  );

  // selection within current bucket
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [currentBucket, search]);
  const selected = visible[index] ?? visible[0] ?? null;

  // metric values + draft buffers
  const [values, setValues] = useState({
    "+3": 0, "3/4": 0, "4/8": 0, "8/12": 0, "12/30": 0, "-30": 0, CBD: 0, CTC: 0,
  });
  const [drafts, setDrafts] = useState({});
  const [remarks, setRemarks] = useState("");
  const [destination, setDestination] = useState(DESTINATIONS[0]);

  const onPrevBucket = () => setBucketIndex((i) => (i - 1 + BUCKETS.length) % BUCKETS.length);
  const onNextBucket = () => setBucketIndex((i) => (i + 1) % BUCKETS.length);

  const canPrev = index > 0;
  const canNext = index < visible.length - 1;

  const handleSave = () => {
    if (!selected) return;
    const payload = {
      bucket: currentBucket,
      bag_no: selected.id,
      metrics: values,
      remarks,
      next_destination: destination,
    };
    console.log("SAVE", payload);
  };

  const jumpToBag = (bagId) => {
    const i = visible.findIndex((b) => b.id === bagId);
    if (i >= 0) setIndex(i);
  };

  // programmatic numeric update
  const onChangeMetric = (key, next) => {
    setValues((prev) => ({ ...prev, [key]: clampRound2(next, 0, 100) }));
  };

  // Draft editing helpers
  const commitDraft = (key) => {
    const raw = drafts[key];
    if (raw === undefined) return;
    const parsed = parseFloat(String(raw).replace(",", "."));
    const def = METRICS.find((m) => m.key === key) || { min: 0, max: 100 };
    if (!Number.isFinite(parsed)) {
      setDrafts((p) => { const c = { ...p }; delete c[key]; return c; });
      return;
    }
    const next = clampRound2(parsed, def.min, def.max);
    setValues((prev) => ({ ...prev, [key]: next }));
    setDrafts((p) => { const c = { ...p }; delete c[key]; return c; });
  };
  const revertDraft = (key) => {
    setDrafts((p) => { const c = { ...p }; delete c[key]; return c; });
  };
  const stepBy = (key, delta) => {
    const def = METRICS.find((m) => m.key === key) || { min: 0, max: 100 };
    const current = drafts[key] !== undefined ? parseFloat(String(drafts[key]).replace(",", ".")) : values[key];
    const base = Number.isFinite(current) ? current : 0;
    const next = clampRound2(base + delta, def.min, def.max);
    setValues((prev) => ({ ...prev, [key]: next }));
    setDrafts((p) => { const c = { ...p }; delete c[key]; return c; });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1440, mx: "auto", p: 0.5 }}>
      <Grid container spacing={2} wrap="nowrap" alignItems="flex-start">
        {/* Left: Bag List with buckets */}
        <Grid item sx={{ width: { xs: 220, sm: 240, md: 260, lg: 300 }, flexShrink: 0 }}>
          <BagList
            items={visible}
            selectedId={selected?.id}
            onSelect={(id) => jumpToBag(id)}
            search={search}
            setSearch={setSearch}
            bucketName={currentBucket}
            onPrevBucket={onPrevBucket}
            onNextBucket={onNextBucket}
          />
        </Grid>

        {/* Right: Data Entry */}
        <Grid item xs sx={{ minWidth: 0 }}>
          <Card variant="outlined">
            <CardHeader
              title={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* Desktop header */}
                  <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="subtitle1">
                      {selected ? (
                        <><strong>Selected:</strong> {selected.id}</>
                      ) : (
                        <strong>No selection</strong>
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => canPrev && setIndex((v) => v - 1)}
                        disabled={!canPrev}
                        startIcon={<ChevronLeftIcon fontSize="small" />}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => canNext && setIndex((v) => v + 1)}
                        disabled={!canNext}
                        endIcon={<ChevronRightIcon fontSize="small" />}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  {/* Mobile bag picker (current bucket only) */}
                  <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="bag-select-label">Select Bag</InputLabel>
                      <MuiSelect
                        labelId="bag-select-label"
                        label="Select Bag"
                        value={selected?.id || ""}
                        onChange={(e) => jumpToBag(e.target.value)}
                      >
                        {visible.map((b) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.id}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => canPrev && setIndex((v) => v - 1)}
                        disabled={!canPrev}
                        startIcon={<ChevronLeftIcon fontSize="small" />}
                        fullWidth
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => canNext && setIndex((v) => v + 1)}
                        disabled={!canNext}
                        endIcon={<ChevronRightIcon fontSize="small" />}
                        fullWidth
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                </Box>
              }
            />

            <CardContent>
              {/* Metrics Grid: chip + 80px input, two per row */}
              <Grid container spacing={1.5}>
                {METRICS.map((m) => (
                  <Grid item xs={12} sm={6} key={m.key}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Chip
                        label={m.label}
                        variant="filled"
                        sx={{
                          borderRadius: 999,
                          px: 2,
                          width: 96,
                          justifyContent: "center",
                          bgcolor: (t) => (t.palette.mode === "dark" ? t.palette.grey[800] : t.palette.grey[200]),
                          color: "text.primary",
                        }}
                      />
                      <FocusInput
                        type="text"
                        value={drafts[m.key] !== undefined ? drafts[m.key] : formatNum(values[m.key])}
                        onChange={(e) => setDrafts((p) => ({ ...p, [m.key]: e.target.value }))}
                        onFocus={() =>
                          setDrafts((p) =>
                            p[m.key] === undefined ? { ...p, [m.key]: String(values[m.key]) } : p
                          )
                        }
                        onBlur={() => commitDraft(m.key)}
                        onKeyDown={(e) => {
                          const step = m.step ?? STEP;
                          if (e.key === "Enter" || e.key === "Tab") commitDraft(m.key);
                          else if (e.key === "Escape") revertDraft(m.key);
                          else if (e.key === "ArrowUp") { e.preventDefault(); stepBy(m.key, step); }
                          else if (e.key === "ArrowDown") { e.preventDefault(); stepBy(m.key, -step); }
                        }}
                        inputProps={{ inputMode: "decimal" }}
                      />

                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 1 ,mt:1}} />
              {/* Remarks & Destination */}
              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Remarks"
                    placeholder="Optional notes about this bag..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="dest-select-label">Next Destination</InputLabel>
                    <MuiSelect
                      labelId="dest-select-label"
                      label="Next Destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      {DESTINATIONS.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleSave();
                        if (canNext) setIndex((v) => v + 1);
                      }}
                    >
                      Save & Next
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * Lightweight dev tests (run only in dev builds)
 * These assertions check number formatting & clamping/rounding behavior.
 */
function runDevTests() {
  const cases = [];

  // formatNum tests
  console.assert(formatNum(1) === "1.00", "formatNum: 1 → 1.00");
  console.assert(formatNum(1.2) === "1.20", "formatNum: 1.2 → 1.20");
  console.assert(formatNum(NaN) === "0.00", "formatNum: NaN → 0.00");

  // clampRound2 tests
  console.assert(clampRound2(-5) === 0, "clampRound2: below min clamps to 0");
  console.assert(clampRound2(105) === 100, "clampRound2: above max clamps to 100");
  console.assert(clampRound2(33.333) === 33.33, "clampRound2: rounds down to 2dp");
  console.assert(clampRound2(33.335) === 33.34, "clampRound2: rounds up to 2dp");
  console.assert(clampRound2(0.005) === 0.01, "clampRound2: tiny round up");
}

try {
  if (typeof window !== "undefined" && import.meta?.env?.MODE !== "production") {
    runDevTests();
  }
} catch (e) {
  // no-op
}

/**
 * Other pattern options (not implemented here, but easy to swap in):
 * - Steppers: replace slider with +/- buttons that bump by 0.01 or 0.10 (long-press for faster).
 * - Single-metric focus: swipe left/right to change metric; large oval slider for the active metric.
 */
