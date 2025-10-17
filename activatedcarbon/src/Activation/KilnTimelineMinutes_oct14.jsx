import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import LoadBagsMenu from "./LoadBagsMenu";
import MovingBag from "./MovingBag";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
});

export default function KilnTimeline({
  minutes = 360,      // 6 hours
  pxPerMin = 20,
  innerHeight = 160,
  gridY = 12,
  kiln = "Kiln A",
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  // ---------- layout ----------
  const m = { top: 8, right: 16, bottom: 8, left: 16 };
  const contentW = minutes * pxPerMin;
  const svgW = contentW + m.left + m.right;
  const svgH = innerHeight + m.top + m.bottom;

  const yTop = m.top;
  const yBottom = m.top + innerHeight;
  const yTimeline = m.top + innerHeight / 2;

  const minuteXs = Array.from({ length: minutes + 1 }, (_, i) => m.left + i * pxPerMin);
  const hourXs = Array.from({ length: Math.floor(minutes / 60) + 1 }, (_, i) => m.left + i * 60 * pxPerMin);
  const rowCount = Math.floor(innerHeight / gridY);
  const rowYs = Array.from({ length: rowCount + 1 }, (_, i) => yTop + i * gridY);

  // ---------- state ----------
  const [todayTotals, setTodayTotals] = React.useState({ bagCount: 0, totalWeightKg: 0 });
  const [activeLoads, setActiveLoads] = React.useState([]); // items to render
  const [pendingBag, setPendingBag] = React.useState(null); // { bag, inward }
  const [weightDlgOpen, setWeightDlgOpen] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState("");
  const [nowMs, setNowMs] = React.useState(() => Date.now());
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ---------- lane assignment ----------
  // lanes: left (inline), top1/bot1/top2/bot2 around the red line
  // Four fixed lanes (no inline lane at the red line)
   /*  const PATTERN = ["top1", "bot1", "top2", "bot2"]; // repeat

    const minuteKey = (ms) => Math.floor(ms / 60000);

    const assignLanes = React.useCallback((items) => {
    const clusters = new Map();
    items.forEach((it, idx) => {
        const key = minuteKey(it.startMs);
        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key).push(idx);
    });

    const next = items.map((it) => ({ ...it }));
    for (const [, idxList] of clusters) {
        idxList.forEach((idx, j) => {
        const lane = PATTERN[j % PATTERN.length];     // top1 → bot1 → top2 → bot2 → …
        next[idx].options = {
            ...(next[idx].options || {}),
            lane,
            chipSide: "right",                           // keep chips to the right of the dot
        };
        });
    }
    return next;
    }, []); */

  // ---------- lane assignment (rule-based) ----------
  // Rules:
  // - Odd last digit -> top*, Even -> bot*
  // - _A_ -> lane1, _B_ -> lane2, _C_ -> lane3
  // - Default letter lane = 1 if none found
  const assignLanes = React.useCallback((items) => {
    const getLastDigit = (s = "") => {
      for (let i = s.length - 1; i >= 0; i--) {
        const ch = s[i];
        if (ch >= "0" && ch <= "9") return Number(ch);
      }
      return null;
    };

    const getLetterLane = (s = "") => {
      if (s.includes("_A_")) return 1;
      if (s.includes("_B_")) return 2;
      if (s.includes("_C_")) return 3;
      return 1; // fallback lane if no marker provided
    };

    const next = items.map((it) => {
      const bag = it.bag ?? "";
      const lastDigit = getLastDigit(bag);
      const letterLane = getLetterLane(bag); // 1..3

      // Decide top/bot; if no digit, keep original item as-is
      let lane;
      if (lastDigit === null) {
        lane = (it.options?.lane) || "top1"; // gentle fallback
      } else {
        const side = lastDigit % 2 === 1 ? "top" : "bot";
        lane = `${side}${letterLane}`; // e.g., "top2", "bot3"
      }

      return {
        ...it,
        options: {
          ...(it.options || {}),
          lane,
          chipSide: "right",
        },
      };
    });
    return next;
  }, []);


  const applyAndSetActive = React.useCallback(
    (rawItems) => setActiveLoads(assignLanes(rawItems)),
    [assignLanes]
  );

  // ---------- initial fetch (GET /kiln/loads) ----------
  React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const url = `${API_URL}/api/activation/kiln/loads?kiln=${encodeURIComponent(kiln)}`;
        const resp = await fetch(url, { credentials: "include", signal: ac.signal });
        if (!resp.ok) throw new Error(await resp.text());

        const payload = await resp.json(); // { success, kiln, loads, today }
        if (!payload?.success) throw new Error("Failed to load data");

        const { loads = [], today = { bagCount: 0, totalWeightKg: 0 } } = payload;
        const now = Date.now();
        const mapped = loads.map((d, i) => ({
          id: `${d.bag_no}-${i}`,
          bag: d.bag_no,
          weight: d.kiln_loaded_weight ?? null,
          startMs: now - (Number(d.hoursAgo) || 0) * 3600 * 1000,
        }));

        applyAndSetActive(mapped);
        setTodayTotals({
          bagCount: Number(today.bagCount || 0),
          totalWeightKg: Number(today.totalWeightKg || 0),
        });
        setNowMs(now);
      } catch (err) {
        if (err.name !== "AbortError") alert(`Failed to load ${kiln} history: ${err.message || err}`);
      }
    })();
    return () => ac.abort();
  }, [kiln, API_URL, applyAndSetActive]);

  // ---------- user flows ----------
  const handleLoadSelected = (bag, inward) => {
    setPendingBag({ bag, inward });
    setWeightInput("");
    setWeightDlgOpen(true);
  };

  const handleConfirmWeight = async () => {
    const w = parseFloat(weightInput);
    if (!Number.isFinite(w) || w <= 0) {
      alert("Please enter a valid weight (e.g., 12.5)");
      return;
    }
    const { bag, inward } = pendingBag;

    try {
      setSaving(true);
      const { data } = await api.post("/api/activation/kilnfeed", {
        inward_number: inward,
        bag_no: bag,
        bags_loaded_for: kiln,
        kiln_loaded_bag_weight: w,
      });

      const ok = data && (data.operation === "success" || data.success === true);
      if (!ok) throw new Error("Backend reported failure");

      // use the response (same shape as GET /kiln/loads)
      const now = Date.now();
      const mapped = (data.loads || []).map((d, i) => ({
        id: `${d.bag_no}-${i}`,
        bag: d.bag_no,
        weight: d.kiln_loaded_weight ?? null,
        startMs: now - (Number(d.hoursAgo) || 0) * 3600 * 1000,
      }));
      applyAndSetActive(mapped);
      setTodayTotals({
        bagCount: Number(data.today?.bagCount || 0),
        totalWeightKg: Number(data.today?.totalWeightKg || 0),
      });

      setPendingBag(null);
      setWeightDlgOpen(false);
    } catch (err) {
      alert(err?.message || "Error while loading. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelWeight = () => {
    setPendingBag(null);
    setWeightDlgOpen(false);
  };

  // share layout with MovingBag
  const layout = React.useMemo(
    () => ({
      m,
      yTimeline,
      pxPerMin,
      minutes,
      innerWidth: contentW,
    }),
    [m, yTimeline, pxPerMin, minutes, contentW]
  );

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <Paper
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 800 },
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "transparent",
        }}
      >
        {/* Header row 1: title */}
        <Box sx={{ p: 1, borderBottom: "1px solid #e0e6eb", bgcolor: "white" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {kiln} - Loader
          </Typography>
        </Box>

        {/* Header row 2: day chip + menu */}
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: "1px solid #e0e6eb",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid #e0e6eb",
              bgcolor: "#f8fafc",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {todayTotals.bagCount} - {todayTotals.totalWeightKg.toFixed(2)} kg
          </Typography>

          <LoadBagsMenu onLoad={handleLoadSelected} />
        </Box>

        {/* Scrollable canvas */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            height: 320,
            overflow: "auto",
            "& > .canvas": { width: svgW, height: svgH, display: "inline-block" },
          }}
        >
          <div className="canvas">
            <svg width={svgW} height={svgH}>
              {/* background */}
              <rect x={0} y={0} width={svgW} height={svgH} fill="white" rx="4" />

              {/* horizontal grid */}
              <g stroke="#c8d2dc" strokeOpacity={0.35}>
                {rowYs.map((y, idx) => (
                  <line key={`row-${idx}`} x1={m.left} y1={y} x2={m.left + contentW} y2={y} />
                ))}
              </g>

              {/* vertical minute grid */}
              <g stroke="#c8d2dc" strokeOpacity={0.35}>
                {minuteXs.map((x, idx) => (
                  <line key={`min-${idx}`} x1={x} y1={yTop} x2={x} y2={yBottom} />
                ))}
              </g>

              {/* hour lines + labels */}
              <g stroke="#9aa9b7">
                {hourXs.map((x, i) => (
                  <g key={`hr-${i}`}>
                    <line x1={x} y1={yTop} x2={x} y2={yBottom} strokeDasharray="4 2" strokeOpacity={0.9} />
                    <text x={x + 4} y={yTop + 12} fontSize={11} fill="#516173">{`${i}h`}</text>
                  </g>
                ))}
              </g>

              {/* inner border */}
              <rect x={m.left} y={yTop} width={contentW} height={innerHeight} fill="none" stroke="#c5d0db" />

              {/* red timeline */}
              <line x1={m.left} y1={yTimeline} x2={m.left + contentW} y2={yTimeline} stroke="red" strokeWidth={2} />

              {/* minute ticks */}
              <g stroke="red" strokeOpacity={0.7}>
                {minuteXs.map((x, idx) => (
                  <line key={`tick-${idx}`} x1={x} y1={yTimeline - 4} x2={x} y2={yTimeline + 4} />
                ))}
              </g>

              {/* active loads */}
              <g>
                {activeLoads.map((load) => (
                  <MovingBag
                    key={load.id}
                    bag={load.bag}
                    startMs={load.startMs}
                    index={0}               // not used for lanes; kept for compatibility
                    layout={layout}
                    nowMs={nowMs}
                    options={load.options}  // { lane: "left"|"top1"|"bot1"|"top2"|"bot2", chipSide: "left"|"right" }
                  />
                ))}
              </g>
            </svg>
          </div>
        </Box>

        {/* weight dialog */}
        <Dialog open={weightDlgOpen} onClose={handleCancelWeight} maxWidth="xs" fullWidth>
          <DialogTitle>Enter Weight</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              {pendingBag ? pendingBag.bag : ""}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              label="Weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelWeight} disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmWeight} disabled={saving}>
              {saving ? "Saving…" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
