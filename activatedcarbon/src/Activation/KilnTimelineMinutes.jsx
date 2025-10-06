import * as React from "react";
import {Box,Paper,Typography,Dialog,DialogTitle,DialogContent,
  DialogActions,TextField,Button,
} from "@mui/material";
import LoadBagsMenu from "./LoadBagsMenu";
import MovingBag from "./MovingBag";
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., https://nyraias.com
  withCredentials: true,                 // <-- sends auth cookies
  timeout: 15000,
});

export default function KilnTimeline({
  minutes = 360,      // 6 hours
  pxPerMin = 20,
  innerHeight = 160,
  gridY = 12,
  title = "Kiln A",
  kiln={kiln} 
}) {

const API_URL = import.meta.env.VITE_API_URL;


  // --- state ---
 /*  const [inwards, setInwards] = React.useState(() => {
    // use your real data here; fallback dummy:
    const list = [];
    for (let i = 1001; i <= 1006; i++) {
      const inward = `I-${i}`;
      const bags = Array.from({ length: 6 }, (_, k) => `${inward}_Out_${k + 1}`);
      list.push({ inward, bags });
    }
    return list;
  }); */

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

  // ...
  const [activeLoads, setActiveLoads] = React.useState([]);
  // { id, bag, inward, startMs }
  const [pendingBag, setPendingBag] = React.useState(null); // {bag, inward}
  const [weightDlgOpen, setWeightDlgOpen] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState("");
  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);


  React.useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const url = `${API_URL}/api/activation/kiln/loads?kiln=${encodeURIComponent(kiln)}`; // no minutes param
        const resp = await fetch(url, { credentials: "include", signal: ac.signal });
        if (!resp.ok) throw new Error(await resp.text());

        const data = await resp.json(); // array of { bag_no, kiln, kiln_loaded_weight, kiln_feed_status, kiln_load_time, hoursAgo }

        const now = Date.now();
        const mapped = (Array.isArray(data) ? data : []).map((d, i) => ({
          id: `${d.bag_no}-${i}`,
          bag: d.bag_no,
          weight: d.kiln_loaded_weight ?? null,
          startMs: now - (Number(d.hoursAgo) || 0) * 3600 * 1000, // convert scalar hours -> start time
        }));

        setActiveLoads(mapped);   // <- your existing state
        setNowMs(now);            // <- keep your existing animation baseline
      } catch (err) {
        if (err.name !== "AbortError") {
          alert(`Failed to load ${kiln} history: ${err.message || err}`);
        }
      }
    })();

    return () => ac.abort();
  }, [kiln]);
  /* const handleLoadSelected = (bag, inward) => {
    setActiveLoads((prev) => [
      ...prev,
      { id: `${bag}-${Date.now()}`, bag, inward, startMs: Date.now() },
    ]);
  }; */
 
  // Kiln lanes: one above, one below the red timeline
  const chipX = m.left; // left column for chips
  const chipTopY = yTimeline - 48;   // ~48px above timeline
  const chipBottomY = yTimeline + 24; // ~24px below timeline

  // compute layout once (after you compute contentW etc.)
  const layout = React.useMemo(() => ({
    m,
    yTimeline,
    pxPerMin,
    minutes,
    innerWidth: contentW, // available width for drawing (no margins)
  }), [m, yTimeline, pxPerMin, minutes, contentW]);

  // fired when user clicks "<" in the menu
  const handleLoadSelected = (bag, inward) => {
    setPendingBag({ bag, inward });
    setWeightInput("");
    setWeightDlgOpen(true);
  };

  const [saving, setSaving] = React.useState(false); // near your other state

  const handleConfirmWeight = async () => {
    const w = parseFloat(weightInput);
    if (!Number.isFinite(w) || w <= 0) {
      alert("Please enter a valid weight (e.g., 12.5)");
      return;
    }
    const { bag, inward } = pendingBag;  // set by onLoad from the menu/scanner

    try {
      setSaving(true);

      // NOTE: if your api.baseURL does NOT include "/api", call "/api/activation/kilnfeed" here.
      const { data } = await api.post("/api/activation/kilnfeed", {
        inward_number: inward,
        bag_no: bag,
        bags_loaded_for: kiln,                // kiln string, e.g. "Kiln A"
        kiln_loaded_bag_weight: w,            // number from the dialog
      });

      if (!data || data.operation !== "success") {
        throw new Error("Backend reported failure");
      }

      // On success: add to the timeline (same as you already do)
      setActiveLoads(prev => ([
        ...prev,
        { id: `${bag}-${Date.now()}`, bag, inward, weight: w, startMs: Date.now() },
      ]));

      // Close dialog
      setPendingBag(null);     // if your Dialog uses open={!!pendingBag}
      setWeightDlgOpen(false);

    } catch (err) {
      alert("Error while loading. Please try again."); // per your requirement
      // (optional) console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelWeight = () => {
    setPendingBag(null);
    setWeightDlgOpen(false);
  };




  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <Paper
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 800 }, // 100% on mobile, 800px on larger screens
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",             // prevent page scrollbar
          bgcolor: "transparent",
        }}
      >
        {/* Header stays fixed */}
       <Box
          sx={{
            p: 1,
            borderBottom: "1px solid #e0e6eb",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>{kiln} - Loader</Typography>

          <LoadBagsMenu
            // optional: pass your own data; otherwise it uses a dummy list
            // data={[{ inward: 'I-1001', bags: ['I-1001_Out_1', 'I-1001_Out_2'] }]}
            //data={inwards}
            onLoad={handleLoadSelected}
          />
        </Box>

        {/* Scrollable content area only */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,            // allow child to scroll inside a flex column
            height: 320,             // viewport height for the timeline area
            overflow: "auto",        // the ONLY place that scrolls
            // prevent wide SVG from forcing outer width
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
              <line
                x1={m.left}
                y1={yTimeline}
                x2={m.left + contentW}
                y2={yTimeline}
                stroke="red"
                strokeWidth={2}
              />

              {/* minute ticks on the red timeline */}
              <g stroke="red" strokeOpacity={0.7}>
                {minuteXs.map((x, idx) => (
                  <line key={`tick-${idx}`} x1={x} y1={yTimeline - 4} x2={x} y2={yTimeline + 4} />
                ))}
              </g>

              {/* active loads */}
              <g>
                {activeLoads.map((load, idx) => (
                  <MovingBag
                    key={load.id}
                    bag={load.bag}
                    startMs={load.startMs}
                    index={idx}
                    layout={layout}
                    nowMs={nowMs}
                    // options={{ chipSide: 'auto' }} // optional
                  />
                ))}
              </g>

            </svg>
          </div>
        </Box>
        <Dialog open={weightDlgOpen} onClose={handleCancelWeight} maxWidth="xs" fullWidth>
          <DialogTitle>Enter Weight</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              {pendingBag ? `${pendingBag.bag}` : ""}
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
            {/* <Button onClick={handleCancelWeight}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmWeight}>Add</Button> */}
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
