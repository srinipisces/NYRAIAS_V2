// Stock.jsx — NO sx anywhere (MUI v7, plain JS)
import * as React from "react";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, CircularProgress, Alert, Button
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
  const [pageState, setPageState] = React.useState({}); // { [key]: { page, pageSize, total, hasMore } }

  const PAGE_SIZE = 50;
  const [err, setErr] = React.useState({});

  const headerPx = 38;
  const viewportPx = headerPx + visibleRows * rowPx;

  const fetchPage = async (panel, nextPage, { replace = false } = {}) => {
    if (typeof panel.loadData !== "function") return;

    const key = panel.key;
    try {
      setLoading((s) => ({ ...s, [key]: true }));
      setErr((s) => ({ ...s, [key]: null }));

      // Ask backend for a specific chunk. Your loadData should forward these.
      const res = await panel.loadData({ page: nextPage, pageSize: PAGE_SIZE });

      // ---- normalize response ----
      let rows = [];
      let columns = [];
      let total = null;

      if (Array.isArray(res)) {
        rows = res;
        columns = Object.keys(res[0] || {});
      } else if (res && typeof res === "object") {
        rows = Array.isArray(res.rows) ? res.rows : Array.isArray(res.data) ? res.data : [];
        if (Array.isArray(res.columns) && res.columns.length) {
          columns = res.columns;
        } else {
          columns = Object.keys(rows[0] || {});
        }
        if (Number.isFinite(res.total)) total = res.total;
      }

      setData((s) => {
        const prevRows = replace ? [] : (s?.[key]?.rows || []);
        return { ...s, [key]: { columns, rows: [...prevRows, ...rows] } };
      });

      // hasMore: prefer server `total`; fallback to “page returned < PAGE_SIZE”
      const hasMore = total != null
        ? nextPage * PAGE_SIZE < total
        : rows.length === PAGE_SIZE;

      setPageState((s) => ({
        ...s,
        [key]: { page: nextPage, pageSize: PAGE_SIZE, total, hasMore },
      }));
    } catch (e) {
      setErr((s) => ({ ...s, [key]: e?.message || "Failed to load" }));
    } finally {
      setLoading((s) => ({ ...s, [key]: false }));
    }
  };


  const pruneTo = (keyOrNull) => {
    if (!keyOrNull) { setData({}); setLoading({}); setErr({}); return; }
    setData((s) => (s && s[keyOrNull] ? { [keyOrNull]: s[keyOrNull] } : {}));
    setLoading((s) => (s && s[keyOrNull] ? { [keyOrNull]: s[keyOrNull] } : {}));
    setErr((s) => (s && s[keyOrNull] ? { [keyOrNull]: s[keyOrNull] } : {}));
  };

    const handleChange = (panel) => async (_e, isExpanded) => {
      if (!isExpanded) { setExpandedKey(null); pruneTo(null); return; }
      setExpandedKey(panel.key);
      pruneTo(panel.key);
      await fetchPage(panel, 1, { replace: true });
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

      const meta = pageState[key] || { page: 0, pageSize: PAGE_SIZE, total: null, hasMore: rows.length >= PAGE_SIZE };
      const panel = panels.find((p) => p.key === key);
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
      <div>
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
          <Typography style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
            Loaded {rows.length}{meta.total != null ? ` / ${meta.total}` : ""} rows
          </Typography>
          <Button
            size="small"
            disabled={!!loading[key] || !meta.hasMore}
            onClick={() => fetchPage(panel, (meta.page || 1) + 1)}
          >
            Load {PAGE_SIZE} more
          </Button>
        </div>
      </div>
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
