// ProcessRecords.jsx
import * as React from "react";
import axios from "axios";
import Stock from "./Stock";

const PANELS = [
  { key: "destoning",   label: "De-Stoning" },
  { key: "screening",   label: "Screening" },
  { key: "blending",    label: "Blending" },
  // Make sure these match your backend keys:
  { key: "de_dusting",   label: "De-Dusting" },     // or "de_dusting" if your backend uses that
  { key: "de_magnetize", label: "De-Magnetize" },   // or "de_magnetize"
  { key: "crushing",    label: "Crushing" },
];

export default function ProcessRecords() {
  return (
    <div style={{ marginTop: 20 }}>
      <Stock
        visibleRows={10} // internal scroll ~10 rows; no pagination
        panels={PANELS.map((p) => ({
          ...p,
          loadData: async () => {
            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/post_activation/records`,
              { params: { key: p.key }, withCredentials: true } // ✅ correct params
            );

            // ✅ Normalize backend shape:
            // - If backend returns an array, infer columns from first row.
            // - If backend returns {columns, rows}, pass through.
            const d = res.data;
            if (Array.isArray(d)) {
              return { columns: Object.keys(d[0] || {}), rows: d };
            }
            if (d && Array.isArray(d.rows)) {
              const cols = Array.isArray(d.columns) && d.columns.length
                ? d.columns
                : Object.keys(d.rows[0] || {});
              return { columns: cols, rows: d.rows };
            }
            // Fallback – empty
            return { columns: [], rows: [] };
          },
        }))}
      />
    </div>
  );
}
