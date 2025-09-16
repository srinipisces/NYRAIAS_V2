// Stock.jsx — NO sx anywhere (MUI v7, plain JS)
import * as React from "react";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, CircularProgress, Alert
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

export default function Stock({
  panels = [],
  barHeight = 52,
  visibleRows = 10,
  rowPx = 32,
}) {
  const [expandedKey, setExpandedKey] = React.useState(null);
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState({});
  const [err, setErr] = React.useState({});

  const headerPx = 38;
  const viewportPx = headerPx + visibleRows * rowPx;

  const pruneTo = (keyOrNull) => {
    if (!keyOrNull) { setData({}); setLoading({}); setErr({}); return; }
    setData((s) => (s && s[keyOrNull] ? { [keyOrNull]: s[keyOrNull] } : {}));
    setLoading((s) => (s && s[keyOrNull] ? { [keyOrNull]: s[keyOrNull] } : {}));
    setErr((s) => (s && s[keyOrNull] ? { [keyOrNull]: s[keyOrNull] } : {}));
  };

    // 1) Replace handleChange with this version
    const handleChange = (panel) => async (_e, isExpanded) => {
      if (!isExpanded) { setExpandedKey(null); pruneTo(null); return; }
      setExpandedKey(panel.key);
      pruneTo(panel.key);

      if (typeof panel.loadData !== "function") return;

      try {
        setLoading({ [panel.key]: true });
        setErr({});

        const res = await panel.loadData(); // can be: array OR { columns, rows }

        let columns = [];
        let rows = [];

        if (Array.isArray(res)) {
          // Backend returned a plain array of rows
          rows = res;
          columns = Object.keys(res[0] || {});
        } else if (res && typeof res === "object") {
          // Backend returned an object (prefer {columns, rows})
          rows =
            Array.isArray(res.rows) ? res.rows :
            Array.isArray(res.data) ? res.data : // tolerate {data:[...]} too
            [];

          if (Array.isArray(res.columns) && res.columns.length) {
            columns = res.columns;
          } else {
            columns = Object.keys(rows[0] || {});
          }
        }

        setData({ [panel.key]: { columns, rows } });
      } catch (e) {
        setErr({ [panel.key]: e?.message || "Failed to load" });
      } finally {
        setLoading({ [panel.key]: false });
      }
    };


  // 2) Replace renderTable with this version
    const renderTable = (key, label) => {
      if (loading && loading[key]) {
        return (
          <div style={{ padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <CircularProgress size={18} />
            <Typography style={{ fontSize: 13 }}>Loading…</Typography>
          </div>
        );
      }
      if (err && err[key]) {
        return <Alert severity="error" style={{ margin: 12 }}>{err[key]}</Alert>;
      }

      const d = (data && data[key]) || {};
      // Fallback: if columns missing but rows exist, infer from first row
      const rows = Array.isArray(d.rows) ? d.rows : [];
      const cols = Array.isArray(d.columns) && d.columns.length
        ? d.columns
        : (rows[0] ? Object.keys(rows[0]) : []);

      if (cols.length === 0 && rows.length === 0) {
        return (
          <Typography style={{ padding: 12, color: "rgba(0,0,0,0.6)", fontSize: 13 }}>
            Open “{label}” to load records.
          </Typography>
        );
      }

      function toKeyValueString(val) {
  // If it's a JSON-looking string, try to parse first
  if (typeof val === "string") {
    const s = val.trim();
    if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
      try { val = JSON.parse(s); } catch { return s; } // fall back to original string
    } else {
      return s;
    }
  }

  // Flatten objects so nested fields become a.b: x
  const flatten = (obj, prefix = "") => {
        const out = [];
        Object.keys(obj || {}).sort().forEach((k) => {
          const v = obj[k];
          const key = prefix ? `${prefix}.${k}` : k;
          if (v !== null && typeof v === "object" && !Array.isArray(v)) {
            out.push(...flatten(v, key));
          } else if (Array.isArray(v)) {
            out.push(`${key}: ${v.map((x) => toKeyValueString(x)).join(", ")}`);
          } else {
            out.push(`${key}: ${v ?? ""}`);
          }
        });
        return out;
      };

      if (val == null) return "";
      if (Array.isArray(val)) return val.map((x) => toKeyValueString(x)).join(", ");
      if (typeof val === "object") return flatten(val).join(", ");
      return String(val);
    }


      // ~10 rows viewport with sticky header + internal scroll
      const headerPx = 38;
      const viewportPx = headerPx + visibleRows * rowPx;

      return (
        <TableContainer style={{ maxHeight: viewportPx, minHeight: viewportPx, overflowY: "auto" }}>
          <Table size="small" stickyHeader style={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {cols.map((c) => (
                  <TableCell key={c} style={{ fontWeight: 600, paddingTop: 6, paddingBottom: 6, fontSize: 13 }}>
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={Math.max(cols.length, 1)} align="center">
                    No records.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {cols.map((c) => (
                      <TableCell key={c} style={{ paddingTop: 6, paddingBottom: 6, fontSize: 13 }}>
                        {toKeyValueString(row?.[c])}
                      </TableCell>

                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      );
    };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Array.isArray(panels) && panels.length > 0 ? (
        panels.map((panel) => {
          const isOpen = expandedKey === panel.key;
          return (
            <Accordion
              key={panel.key}
              expanded={isOpen}
              onChange={handleChange(panel)}
              disableGutters
              square
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#f5f5f7", // light grey card
                boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
                border: "1px solid #e6e6ea",
              }}
            >
              <AccordionSummary
                expandIcon={isOpen ? <RemoveRoundedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />}
                style={{
                  minHeight: barHeight,
                  backgroundColor: "#eeeeee", // grey header
                  margin: 0,
                }}
              >
                <Typography style={{ fontWeight: 700, fontSize: 15 }}>
                  {panel.label}
                </Typography>
              </AccordionSummary>

              <AccordionDetails style={{ padding: 0, backgroundColor: "#ffffff" }}>
                {renderTable(panel.key, panel.label)}
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Alert severity="info">No panels configured.</Alert>
      )}
    </div>
  );
}
