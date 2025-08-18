import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  Chip,
} from "@mui/material";
import Slider from "@mui/material/Slider";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/Save";

/**
 * Bag Data Entry (MUI version)
 * - Left: bag list (hidden on mobile)
 * - Right: 8 metrics with oval slider (orange thumb, green→neon track) + 2dp numeric input
 * - Remarks, Next Destination, Save / Save & Next
 * - Mobile: bag dropdown + Prev/Next
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

// Helpers
export function formatNum(n) {
  return isFinite(n) ? n.toFixed(DECIMAL_PLACES) : (0).toFixed(DECIMAL_PLACES);
}
export function clampRound2(value, min = 0, max = 100) {
  const num = Number.isFinite(value) ? value : 0;
  const clamped = Math.max(min, Math.min(max, num));
  return Math.round(clamped * 100) / 100; // 2 decimals
}

// Styled MUI Slider: oval orange thumb + green→neon track

// Re_Process-style Bag List
function BagList({ items, selectedId, onSelect, search, setSearch }) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Inventory2Icon fontSize="small" /> Bags
            </Typography>
            <Chip size="small" label={`${items.length}`} color="default" />
          </Box>
        }
      />
      <CardContent>
        <TextField
          size="small"
          fullWidth
          placeholder="Search bag no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, position: "sticky", top: 0, background: (t) => t.palette.background.paper, zIndex: 1 }}
        />
        <List dense sx={{ maxHeight: 420, overflowY: "auto", pr: 0.5 }}>
          {items.map((b) => {
            const selected = b.id === selectedId;
            return (
              <ListItemButton
                key={b.id}
                selected={selected}
                onClick={() => onSelect(b.id)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  border: 1,
                  borderColor: selected ? "primary.light" : "divider",
                  backgroundColor: selected ? "action.selected" : "background.paper",
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Inventory2Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>{b.id}</Typography>}
                  secondary={
                    <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        label={b.grade ? `Grade ${b.grade}` : "Grade —"}
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                      />
                    </Box>
                  }
                />
                {typeof b.weightKg === "number" && (
                  <Chip
                    size="small"
                    label={`${b.weightKg} kg`}
                    color={selected ? "primary" : "default"}
                    variant={selected ? "filled" : "outlined"}
                  />
                )}
              </ListItemButton>
            );
          })}
          {items.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              No bags found.
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
}

export default function Re_Process_Quality() {
  // Sample data — replace with props or API data
  const [bags] = useState([
    { id: "BAG_300725_0001", weightKg: 25.4 },
    { id: "BAG_300725_0002", weightKg: 26.1 },
    { id: "BAG_300725_0003", weightKg: 24.9 },
    { id: "BAG_300725_0004", weightKg: 25.0 },
    { id: "BAG_300725_0005", weightKg: 26.0 },
    { id: "BAG_300725_0006", weightKg: 25.2 },
  ]);

  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      bags.filter((b) =>
        b.id.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [bags, search]
  );

  const [index, setIndex] = useState(0);
  const selected = filtered[index] ?? filtered[0] ?? null;

  const [values, setValues] = useState({
    "+3": 0,
    "3/4": 0,
    "4/8": 0,
    "8/12": 0,
    "12/30": 0,
    "-30": 0,
    CBD: 0,
    CTC: 0,
  });
  const [remarks, setRemarks] = useState("");
  const [destination, setDestination] = useState(DESTINATIONS[0]);

  const onChangeMetric = (key, next) => {
    setValues((prev) => ({ ...prev, [key]: clampRound2(next, 0, 100) }));
  };

  const canPrev = index > 0;
  const canNext = index < filtered.length - 1;

  const handleSave = () => {
    if (!selected) return;
    const payload = {
      bag_no: selected.id,
      metrics: values,
      remarks,
      next_destination: destination,
    };
    // TODO: Replace with real API call
    // await axios.post("/api/bag/metrics", payload)
    console.log("SAVE", payload);
  };

  const jumpToBag = (bagId) => {
    const i = filtered.findIndex((b) => b.id === bagId);
    if (i >= 0) setIndex(i);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1440, mx: "auto", p: 2 }}>
      <Grid container spacing={2} wrap="nowrap" alignItems="flex-start">
        {/* Left: Bag List (hidden on mobile) */}
        <Grid item sx={{ width: { xs: 280, sm: 320, md: 340, lg: 380 }, flexShrink: 0 }}>
  <BagList
    items={filtered}
    selectedId={selected?.id}
    onSelect={(id) => jumpToBag(id)}
    search={search}
    setSearch={setSearch}
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

                  {/* Mobile bag picker */}
                  <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="bag-select-label">Select Bag</InputLabel>
                      <Select
                        labelId="bag-select-label"
                        label="Select Bag"
                        value={selected?.id || ""}
                        onChange={(e) => jumpToBag(e.target.value)}
                      >
                        {filtered.map((b) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.id}
                          </MenuItem>
                        ))}
                      </Select>
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
              {/* Metrics Grid */}
              <Grid container spacing={2}>
                {METRICS.map((m) => (
                  <Grid item xs={12} md={6} key={m.key}>
                    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2, minHeight: 130, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto", columnGap: 2, alignItems: "center", mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{m.label}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            inputMode="decimal"
                            value={formatNum(values[m.key])}
                            onChange={(e) => onChangeMetric(m.key, Number(e.target.value))}
                            inputProps={{ step: m.step ?? STEP }} sx={{ width: 72 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ width: 28, textAlign: "right" }}>
                            {m.unit || ""}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ px: 1 }}>
                        <Slider valueLabelDisplay="auto" valueLabelFormat={(v) => formatNum(v)}
                          value={values[m.key]}
                          min={m.min}
                          max={m.max}
                          step={m.step ?? STEP}
                          onChange={(_, v) => onChangeMetric(m.key, Array.isArray(v) ? v[0] : v)}
                          aria-label={`${m.label} slider`}
                        />
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{formatNum(m.min)}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatNum(values[m.key])}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatNum(m.max)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Remarks & Destination */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    <Select
                      labelId="dest-select-label"
                      label="Next Destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      {DESTINATIONS.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                      Save
                    </Button>
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
