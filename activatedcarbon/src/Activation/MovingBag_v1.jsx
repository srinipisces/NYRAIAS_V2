// components/MovingBag.jsx
import * as React from "react";

/**
 * Props:
 * - bag, startMs, index, nowMs
 * - layout: { m, yTimeline, pxPerMin, minutes, innerWidth }
 *   where innerWidth = contentW (usable width between margins)
 * - options?: { chipSide?: 'auto' | 'left' | 'right' }  // which side of dot the chip sits
 */
export default function MovingBag({
  bag,
  startMs,
  index,
  layout,
  nowMs,
  options = { chipSide: "auto" },
}) {
  const { m, yTimeline, pxPerMin, minutes, innerWidth } = layout;

  // Real-time progress
  const elapsedMin = Math.max(0, (nowMs - startMs) / 60000);
  const x = m.left + Math.min(minutes, elapsedMin) * pxPerMin;

  // Alternate above/below timeline
  const isTop = index % 2 === 0;
  const laneOffset = 36;     // distance from timeline to chip center
  const chipCenterY = yTimeline + (isTop ? -laneOffset : laneOffset);

  // Chip sizing from text
  const padX = 10;
  const chipH = 24;
  const textLen = Math.max(8, bag.length);
  const chipW = Math.min(240, Math.max(90, textLen * 7 + padX * 2));

  // Decide chip's X so it "moves with" the circle but stays readable.
  // Default: keep chip just to the LEFT of the moving circle.
  let side = options.chipSide;
  if (side === "auto") {
    // auto-flip to avoid going off-screen edges
    side = (x - chipW - 12 < m.left) ? "right" : "left";
    if (x + chipW + 12 > m.left + innerWidth) side = "left";
  }

  const gap = 12; // small gap between circle and chip
  const chipX =
    side === "right"
      ? Math.min(x + gap, m.left + innerWidth - chipW)
      : Math.max(x - chipW - gap, m.left);

  const chipY = chipCenterY - chipH / 2;

  // Connector: always from chip center to the circle center
  const x1 = chipX + chipW / 2;
  const y1 = chipCenterY;
  const x2 = x;
  const y2 = yTimeline;

  // Simple tooltip via <title/> (native, fast, works on SVG)
  const loadedAt = new Date(startMs);
  const hh = String(loadedAt.getHours()).padStart(2, "0");
  const mm = String(loadedAt.getMinutes()).padStart(2, "0");
  const tooltip = `${bag}\nLoaded at ${hh}:${mm}\nT+${elapsedMin.toFixed(1)} min`;

  return (
    <g>
      <title>{tooltip}</title>

      {/* connector */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#58677a"
        strokeOpacity="0.9"
      />

      {/* moving circle */}
      <circle cx={x} cy={y2} r={6} fill="#1976d2" stroke="white" strokeWidth="1.5" />

      {/* chip */}
      <rect
        x={chipX}
        y={chipY}
        width={chipW}
        height={chipH}
        rx={12}
        ry={12}
        fill="#eef3f8"
        stroke="#9fb2c7"
      />
      <text
        x={chipX + padX}
        y={chipY + chipH / 2 + 4}
        fontSize={12}
        fill="#23313d"
        style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}
      >
        {bag}
      </text>
    </g>
  );
}
