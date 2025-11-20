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

  // ---------- lane assignment (number-based, modulo 6) ----------
  // Parse bag as "<Inward>_Out_<n>" and map n % 6 → lane:
  // 1→top1, 3→top2, 5→top3, 2→bot1, 4→bot2, 0→bot3
  const assignLanes = React.useCallback((items) => {
    const parseOutNumber = (bag = "") => {
     // Match either "-Out-<n>" or "_Out_<n>" (case-insensitive)
     // Also tolerates any trailing chars after the number.
     const m = /(?:^|[_-])Out(?:[_-])(\d+)/i.exec(bag);
     if (!m) return null;
     const n = parseInt(m[1], 10);
     return Number.isFinite(n) ? n : null;
   };

    const laneFromN = (n) => {
      if (!Number.isFinite(n)) return "top1"; // safe fallback
      const r = n % 6; // 0..5
      switch (r) {
        case 1: return "top1"; // 1,7,13,...
        case 3: return "top2"; // 3,9,15,...
        case 5: return "top3"; // 5,11,17,...
        case 2: return "bot1"; // 2,8,14,...
        case 4: return "bot2"; // 4,10,16,...
        case 0: return "bot3"; // 6,12,18,...
        default: return "top1";
      }
    };

    return items.map((it) => {
      const n = parseOutNumber(it.bag ?? "");
      const lane = laneFromN(n);
      return {
        ...it,
        options: {
          ...(it.options || {}),
          lane,
          chipSide: "right",
        },
      };
    });
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
         

          {/* <LoadBagsMenu onLoad={handleLoadSelected} /> */}
          <LoadBagsMenu 
            onLoad={handleLoadSelected}  
          />
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
                    options={load.options}  // { lane: "top1|top2|top3|bot1|bot2|bot3", chipSide: "left|right" }
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
