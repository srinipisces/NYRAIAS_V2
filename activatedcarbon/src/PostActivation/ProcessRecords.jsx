// ProcessRecords.jsx
import * as React from "react";
import axios from "axios";
import Stock from "./Stock";
import Stock_Loaded from "./Stock_Loaded";
import { Box } from "@mui/material";

const PANELS = [
  { key: "Screening",   label: "Screening Output" },
  { key: "Blending",    label: "Blending Output" },
  // Make sure these match your backend keys:
  { key: "De-Dusting",   label: "De-Dusting Output" },     // or "de_dusting" if your backend uses that
  { key: "De-Magnetize", label: "De-Magnetize Output" },   // or "de_magnetize"
  { key: "Crushing",    label: "Crushing Output" },
];

const PANELS_LOADED = [
  { key: "Screening_Loaded",   label: "Screening Loaded" },
  { key: "Blending_Loaded",    label: "Blending Loaded" },
  // Make sure these match your backend keys:
  { key: "De-Dusting_Loaded",   label: "De-Dusting Loaded" },     // or "de_dusting" if your backend uses that
  { key: "De-Magnetize_Loaded", label: "De-Magnetize Loaded" },   // or "de_magnetize"
  { key: "Crushing_Loaded",    label: "Crushing Loaded" },
];

export default function ProcessRecords() {
  return (
    <Box sx={{width: { xs: '100%', md: 1100 }}}>
    <div style={{ marginTop: 20 }}>
      <Stock
        visibleRows={10} // internal scroll ~10 rows; no pagination
        panels={PANELS.map((p) => ({
          ...p,
          // Stock will call: loadData({ page, pageSize })
          loadData: async ({ page, pageSize, bag_no, status, created_from, created_to } = {}) => {
            const params = { key: p.key, page, pageSize };
            if (bag_no)       params.bag_no = bag_no;
            if (status)       params.status = status;           // string or array (backend allows both)
            if (created_from) params.created_from = created_from; // YYYY-MM-DD or ISO
            if (created_to)   params.created_to = created_to;     // YYYY-MM-DD or ISO

            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/post_activation/records`,
              { params, withCredentials: true }
            );
            const d = res.data;
            // Keep columns/rows compatible and preserve optional total/page info for pagination UI
            if (Array.isArray(d)) {
              return { columns: Object.keys(d[0] || {}), rows: d, total: null };
            }
            if (d && Array.isArray(d.rows)) {
              const cols = Array.isArray(d.columns) && d.columns.length
                ? d.columns
                : Object.keys(d.rows[0] || {});
              return {
                columns: cols,
                rows: d.rows,
                total: Number.isFinite(d.total) ? d.total : null,
                page: d.page,
                pageSize: d.pageSize,
              };
            }
            return { columns: [], rows: [], total: 0 };
          },
        }))}
      />
    </div>
    <div style={{ marginTop: 20 }}>
       <Stock_Loaded
        visibleRows={10} // internal scroll ~10 rows; no pagination
        panels={PANELS_LOADED.map((p) => ({
          ...p,
          // Stock will call: loadData({ page, pageSize })
          loadData: async ({ page, pageSize, bag_no, created_from, created_to } = {}) => {
            const params = { key: p.key, page, pageSize };
            if (bag_no)       params.bag_no = bag_no;
            if (created_from) params.from = created_from; // YYYY-MM-DD or ISO
            if (created_to)   params.to = created_to;     // YYYY-MM-DD or ISO

            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/post_activation/records_loaded`,
              { params, withCredentials: true }
            );
            const d = res.data;
            // Keep columns/rows compatible and preserve optional total/page info for pagination UI
            if (Array.isArray(d)) {
              return { columns: Object.keys(d[0] || {}), rows: d, total: null };
            }
            if (d && Array.isArray(d.rows)) {
              const cols = Array.isArray(d.columns) && d.columns.length
                ? d.columns
                : Object.keys(d.rows[0] || {});
              return {
                columns: cols,
                rows: d.rows,
                total: Number.isFinite(d.total) ? d.total : null,
                page: d.page,
                pageSize: d.pageSize,
              };
            }
            return { columns: [], rows: [], total: 0 };
          },
        }))}
      />
    </div>
    </Box>
  );
}
