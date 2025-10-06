// KilnTimelineLive.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Chip, Paper, Stack, Typography, useMediaQuery } from "@mui/material";

// --- helpers ---
const HOUR_MS = 3600_000;
const MIN_MS  = 60_000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hoursBetween = (now, past) => (now - past) / HOUR_MS;

// choose a nice tick step so grid/labels stay readable
function pickTickEvery(hoursWindow, axisWidthPx) {
  const minGapPx = 100; // try to keep >=100px between verticals
  const pxPerHour = axisWidthPx / hoursWindow;
  const candidates = [0.25, 0.5, 1, 2, 3, 4]; // 15m, 30m, 1h, 2h...
  for (const step of candidates) {
    if (pxPerHour * step >= minGapPx) return step;
  }
  return candidates[candidates.length - 1];
}

export default function KilnTimelineLive({
  hoursWindow = 4,        // show 0..4h to make real-time motion visible (~5px/min @ 1200px)
  height = 260,
  paperWidth = 800,       // OUTER fixed width (desktop)
  innerWidth = 2400,      // SCROLLABLE content width
  axisPaddingLeft = 40,
  axisPaddingRight = 40,
  axisY: axisYProp,       // if omitted, we center it
}) {
  const isXs = useMediaQuery("(max-width:600px)");

  // center the baseline by default
  const axisY = axisYProp ?? Math.round(height / 2);

  // ensure SVG is exactly the scrollable inner width
  const axisWidth = Math.max(200, innerWidth - axisPaddingLeft - axisPaddingRight);
  const svgWidth  = innerWidth;

  const tickEvery = pickTickEvery(hoursWindow, axisWidth);

  // --- Dummy live data ---
  const initialBags = useMemo(() => {
    const now = Date.now();
    return [
      { bag_no: "KOA_300925_101", loadedAt: new Date(now - 20 * MIN_MS) },   // 0.33h
      { bag_no: "KOA_300925_095", loadedAt: new Date(now - 90 * MIN_MS) },   // 1.5h
      { bag_no: "KOB_300925_076", loadedAt: new Date(now - 192 * MIN_MS) },  // 3.2h
      { bag_no: "KOC_300925_042", loadedAt: new Date(now - 240 * MIN_MS) },  // 4.0h
    ];
  }, []);

  // --- Real-time clock: 1 tick/sec (no speed-up) ---
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const items = useMemo(() => {
    return initialBags.map((b, i) => {
      const h = hoursBetween(now, b.loadedAt);
      const x = clamp((h / hoursWindow) * axisWidth, 0, axisWidth);
      return { ...b, hoursIn: h, x, row: i % 2 === 0 ? "top" : "bottom" };
    });
  }, [initialBags, now, axisWidth, hoursWindow]);

  const chipHalf = 60; // ~120px chips
  const dotR = 5;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        borderColor: "#d0d7de",
        width: { xs: "100%", sm: `${paperWidth}px` },
        maxWidth: "100%",
        bgcolor: "transparent",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>Kiln Timeline — Live (0 = Now)</Typography>
        <Typography variant="caption" color="text.secondary">
          Inner: {innerWidth}px · Window: {hoursWindow}h · Tick: {tickEvery}h
        </Typography>
      </Stack>

      {/* Scroll area */}
      <Box sx={{ position: "relative", width: "100%", overflowX: "auto", overflowY: "hidden",
                 border: "1px dashed #e5e7eb", borderRadius: 1 }}>
        {/* Fixed-width inner layer so scrolling works */}
        <Box sx={{ position: "relative", width: `${innerWidth}px`, height }}>
          {/* SVG base layer (axis + grid + dots/lines) */}
          <svg width={svgWidth} height={height} style={{ display: "block" }}>
            {/* Axis baseline (CENTERED) */}
            <line
              x1={axisPaddingLeft}
              x2={axisPaddingLeft + axisWidth}
              y1={axisY}
              y2={axisY}
              stroke="#1f2328"
              strokeWidth="1.5"
            />

            {/* Dotted vertical grid + labels */}
            {Array.from({ length: Math.floor(hoursWindow / tickEvery) + 1 }, (_, i) => i * tickEvery).map((h) => {
              const x = axisPaddingLeft + (h / hoursWindow) * axisWidth;
              return (
                <g key={`tick-${h}`}>
                  <line x1={x} x2={x} y1={8} y2={height - 8} stroke="#8c959f" strokeDasharray="4 6" strokeWidth="1" />
                  <text x={x} y={axisY + 18} textAnchor="middle" fontSize="11" fill="#57606a">
                    {Number.isInteger(h) ? h : h.toFixed(2).replace(/\.00$/, "")}
                  </text>
                </g>
              );
            })}

            {/* "0 (now)" label at left */}
            <text
              x={axisPaddingLeft}
              y={axisY - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#1f2328"
            >
              0 (now)
            </text>

            {/* connectors + dots + hour tooltips */}
            {items.map((b, idx) => {
              const baseX = axisPaddingLeft + b.x;
              const clampedChipX = clamp(baseX, axisPaddingLeft + chipHalf, axisPaddingLeft + axisWidth - chipHalf);
              const isTop = b.row === "top";
              const chipY = isTop ? axisY - 78 : axisY + 34;

              return (
                <g key={`bag-${idx}`}>
                  {/* solid connector */}
                  <line x1={baseX} y1={axisY} x2={clampedChipX} y2={chipY + 18} stroke="#1f2328" strokeWidth="1" />
                  {/* dot */}
                  <circle cx={baseX} cy={axisY} r={dotR} fill="#0969da" />
                  {/* small hours text near dot */}
                  <text x={baseX} y={isTop ? axisY - 10 : axisY + 22} textAnchor="middle" fontSize="10" fill="#24292f">
                    {b.hoursIn < 0 ? "—" : `${b.hoursIn.toFixed(1)}h`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Chip overlay (same width so it scrolls perfectly with SVG) */}
          <Box sx={{ position: "absolute", inset: 0, width: `${innerWidth}px`, pointerEvents: "none" }}>
            {items.map((b, idx) => {
              const baseX = axisPaddingLeft + b.x;
              const clampedChipX = clamp(baseX, axisPaddingLeft + chipHalf, axisPaddingLeft + axisWidth - chipHalf);
              const isTop = b.row === "top";
              const chipY = isTop ? axisY - 96 : axisY + 14;
              return (
                <Chip
                  key={`chip-${idx}`}
                  label={b.bag_no}
                  size="small"
                  sx={{
                    position: "absolute",
                    left: clampedChipX - chipHalf,
                    top: chipY,
                    fontWeight: 600,
                    bgcolor: "#f1f8ff",
                    border: "1px solid #c8e1ff",
                    pointerEvents: "auto",
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ mt: 1, display: "block" }} color="text.secondary">
        Real-time speed. To make motion larger: increase <code>innerWidth</code> (e.g., 1600) or decrease <code>hoursWindow</code> (e.g., 3).
      </Typography>
    </Paper>
  );
}
