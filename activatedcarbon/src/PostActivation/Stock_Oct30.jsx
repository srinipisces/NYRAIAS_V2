// Stock.jsx — Filters + Download + Pagination + Per‑row Quality/Remarks
// Plain JS (no sx), MUI v7 compatible

import * as React from "react";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, CircularProgress, Alert, Button,
  Chip, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import PrintLabelButton from '../QR/PrintLabel';


const API = import.meta.env.VITE_API_URL;

const EXCLUDE_QUALITY_KEYS = new Set(["remarks", "remark"]);

// ---------- helpers for quality rendering ----------
function sortMetricKeys(keys) {
  return Array.from(new Set(keys)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

function getQualityVal(q, key) {
  if (!q) return null;
  if (Array.isArray(q)) {
    const hit = q.find(
      (it) => it?.key === key || it?.label === key || it?.name === key
    );
    if (!hit) return null;
    if (typeof hit === "object") {
      return hit.value ?? hit.val ?? hit.v ?? hit.min ?? hit.max ?? JSON.stringify(hit);
    }
    return hit;
  }
  if (typeof q === "object") {
    const v = q[key];
    return (v && typeof v === "object" && "value" in v) ? v.value : v;
  }
  return null;
}

function fmtQualityVal(v) {
  if (v == null) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}

function getRowQualityKeys(row, metricsByGrade) {
  const grade = row?.grade;
  let keys = [];
  if (grade && Array.isArray(metricsByGrade?.[grade])) {
    keys = metricsByGrade[grade].filter(
      (k) => !EXCLUDE_QUALITY_KEYS.has(k.toLowerCase())
    );
  } else {
    const q = row?.quality;
    if (Array.isArray(q)) {
      keys = q.map((it) => it?.key ?? it?.label ?? it?.name).filter(Boolean);
    } else if (q && typeof q === "object") {
      keys = Object.keys(q);
    }
    keys = keys.filter((k) => !EXCLUDE_QUALITY_KEYS.has(String(k).toLowerCase()));
  }
  return sortMetricKeys(keys);
}

function getRowRemarks(row) {
  if (row && row.remarks != null) return row.remarks;
  const q = row?.quality;
  if (!q) return "";
  if (Array.isArray(q)) {
    const hit = q.find((it) => {
      const k = (it?.key ?? it?.label ?? it?.name ?? "").toLowerCase();
      return k === "remarks" || k === "remark";
    });
    if (!hit) return "";
    if (typeof hit === "object") return hit.value ?? hit.text ?? hit.remark ?? "";
    return hit;
  }
  if (typeof q === "object") {
    return q.remarks ?? q.remark ?? "";
  }
  return "";
}

function normalizeMetricsMap(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [grade, list] of Object.entries(raw)) {
    if (!Array.isArray(list)) { out[grade] = []; continue; }
    const keys = [];
    for (const item of list) {
      if (item == null) continue;
      if (typeof item === "string") keys.push(item);
      else if (typeof item === "object") {
        const k = item.key ?? item.label ?? item.name ?? null;
        if (k) keys.push(String(k));
      }
    }
    out[grade] = keys.filter((k) => !EXCLUDE_QUALITY_KEYS.has(k.toLowerCase()));
  }
  return out;
}

const miniThStyle = { border: "1px solid rgba(0,0,0,0.2)", padding: "2px 6px", fontSize: 12, textAlign: "left", whiteSpace: "nowrap" };
const miniTdStyle = { border: "1px solid rgba(0,0,0,0.12)", padding: "3px 6px", fontSize: 12, whiteSpace: "nowrap" };

export default function Stock({ panels = [], barHeight = 52, visibleRows = 10, rowPx = 32 }) {
  const [expandedKey, setExpandedKey] = React.useState(null);
  const [data, setData] = React.useState({}); // { [key]: { columns, rows } }
  const [loading, setLoading] = React.useState({});
  const [pageState, setPageState] = React.useState({}); // { [key]: { page, pageSize, total, hasMore } }
  const [err, setErr] = React.useState({});
  const [metricsByGrade, setMetricsByGrade] = React.useState({});
  const [downloading, setDownloading] = React.useState({});
  const [filters, setFilters] = React.useState({}); // { [panelKey]: { bag_no, status, created_from, created_to } }
  const [filterDialog, setFilterDialog] = React.useState({
    open: false,
    panelKey: null,
    draft: { bag_no: "", status: "", created_from: "", created_to: "" },
  });

  const PAGE_SIZE = 50;
  const headerPx = 38;
  const viewportPx = headerPx + visibleRows * rowPx;

  const hasActiveFilter = (f) => !!(f && (f.bag_no || f.status || f.created_from || f.created_to));

  // Prefetch metrics map once
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = await fetch(
          `${API}/api/settings/quality-params/metrics?includeInactive=1`,
          { credentials: "include" }
        );
        if (!resp.ok) return;
        const payload = await resp.json();
        const map = normalizeMetricsMap(payload?.data || payload?.metrics || {});
        if (alive) setMetricsByGrade(map);
        
      } catch (e) {
        // non-fatal; fallback to row.quality
        console.error("metrics fetch error", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  const fetchPage = async (panel, nextPage, { replace = false,filtersOverride } = {}) => {
    if (typeof panel.loadData !== "function") return;
    const key = panel.key;
    try {
      setLoading((s) => ({ ...s, [key]: true }));
      setErr((s) => ({ ...s, [key]: null }));

      const res = await panel.loadData({
        page: nextPage,
        pageSize: PAGE_SIZE,
        ...(filtersOverride || filters[key] || {}),
      });

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

      const hasMore = total != null ? nextPage * PAGE_SIZE < total : rows.length === PAGE_SIZE;
      setPageState((s) => ({ ...s, [key]: { page: nextPage, pageSize: PAGE_SIZE, total, hasMore } }));
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

  function openFilter(panel) {
    const key = panel.key;
    const current = filters[key] || {};
    setFilterDialog({
      open: true,
      panelKey: key,
      draft: {
        bag_no: current.bag_no || "",
        status: current.status || "",
        created_from: current.created_from || "",
        created_to: current.created_to || "",
      },
    });
  }

  async function applyFilter() {
    const { panelKey, draft } = filterDialog;
    setFilters((s) => ({ ...s, [panelKey]: { ...draft } }));
    setFilterDialog({ open: false, panelKey: null, draft: { bag_no: "", status: "", created_from: "", created_to: "" } });
    const panel = panels.find((p) => p.key === panelKey);
    if (panel) await fetchPage(panel, 1, { replace: true, filtersOverride: draft });
  }

  async function handleClearFilter(panel) {
    const key = panel.key;
    setFilters((s) => ({ ...s, [key]: {} }));
    //await fetchPage(panel, 1, { replace: true });
    setPageState((s) => ({ ...s, [key]: { page: 0, pageSize: PAGE_SIZE, total: null, hasMore: true } }));
    await fetchPage(panel, 1, { replace: true, filtersOverride: {} });
  }

   async function handleDownload(panel) {
     const key = panel.key;
     const f = filters[key] || {};
     const url = new URL(`${API}/api/post_activation/records/download`);
     url.searchParams.set("key", key);
     if (f.bag_no)       url.searchParams.set("bag_no", f.bag_no);
     if (f.status)       url.searchParams.set("status", f.status);
     if (f.created_from) url.searchParams.set("created_from", f.created_from);
     if (f.created_to)   url.searchParams.set("created_to", f.created_to);

     setDownloading((s) => ({ ...s, [key]: true }));
     try {
       const resp = await fetch(url.toString(), { credentials: "include" });
       if (!resp.ok) {
         const text = await resp.text().catch(() => "");
         throw new Error(`Download failed (${resp.status}) ${text}`);
       }
       const blob = await resp.blob();
       // Try to honor server filename if provided
       let filename = `${key}_records.csv`;
       const cd = resp.headers.get("Content-Disposition");
       if (cd) {
         // filename*= or filename=  (basic parse)
         const mStar = /filename\\*=(?:UTF-8''|)([^;]+)/i.exec(cd);
         const m = mStar || /filename=\"?([^\";]+)\"?/i.exec(cd);
         if (m && m[1]) {
           try { filename = decodeURIComponent(m[1].trim()); } catch { filename = m[1].trim(); }
         }
       }
       const href = URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = href;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       a.remove();
       URL.revokeObjectURL(href);
     } catch (e) {
       console.error("download error", e);
       alert(`Download failed: ${e?.message || "Unknown error"}`);
     } finally {
       setDownloading((s) => ({ ...s, [key]: false }));
     }
   }

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

    // Move 'quality' to the last-but-one column and ensure a trailing 'remarks' column
    const baseCols = cols.filter((c) => c !== "quality" && c !== "remarks");
    const headerCols = [...baseCols, "quality", "remarks","actions"];

    function toKeyValueString(val) {
      if (typeof val === "string") {
        const s = val.trim();
        if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
          try { val = JSON.parse(s); } catch { return s; }
        } else {
          return s;
        }
      }
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

    const f = filters[key] || {};
    const filterOn = hasActiveFilter(f);
    const STATUS_OPTIONS = [
        "Screening",
        "Screening_Loaded",
        "Blending",
        "Blending_Loaded",
        "De-Dusting",
        "De-Dusting_Loaded",
        "De-Magnetize",
        "De-Magnetize_Loaded",
        "Crushing",
        "Crushing_Loaded",
        "InStock",
        "Quality"
      ];

   
    return (
      <div>
        {/* toolbar: filter chip + buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Chip
              label={filterOn ? "Filters: ON" : "Filters: OFF"}
              size="small"
              color={filterOn ? "success" : "default"}
            />
            {filterOn && (
              <Button size="small" onClick={() => handleClearFilter(panel)}>
                Clear
              </Button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button size="small" onClick={() => openFilter(panel)}>Filter</Button>
             <Button
               size="small"
               disabled={!!downloading[key]}
               onClick={() => handleDownload(panel)}
             >
               {downloading[key] ? "Downloading…" : "Download"}
             </Button>
          </div>
        </div>

        <TableContainer style={{ maxHeight: viewportPx, minHeight: viewportPx, overflowY: "auto", overflowX: "auto" }}>
          <Table size="small" stickyHeader style={{ tableLayout: "auto", minWidth: 720 }}>
            <TableHead>
              <TableRow>
                {headerCols.map((c) => (
                  <TableCell key={c} style={{ fontWeight: 600, paddingTop: 6, paddingBottom: 6, fontSize: 13 }}>
                    {c === "quality" ? "Quality" : (c === "remarks" ? "Remarks" : c)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={Math.max(headerCols.length, 1)} align="center">
                    No records.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const qKeys = getRowQualityKeys(row, metricsByGrade);
                  const remarks = getRowRemarks(row);
                  return (
                    <TableRow key={idx}>
                      {baseCols.map((c) => (
                        <TableCell key={c} style={{ paddingTop: 6, paddingBottom: 6, fontSize: 13 }}>
                          {toKeyValueString(row?.[c])}
                        </TableCell>
                      ))}

                      {/* Quality (last-but-one): mini table inside the cell */}
                      <TableCell key="quality" style={{ paddingTop: 6, paddingBottom: 6, fontSize: 13 }}>
                        {qKeys.length === 0 ? (
                          ""
                        ) : (
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ borderCollapse: "collapse", minWidth: 320 }}>
                              <thead>
                                <tr>
                                  {qKeys.map((k) => (
                                    <th key={`qth-${idx}-${k}`} style={miniThStyle}>{k}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  {qKeys.map((k) => (
                                    <td key={`qtd-${idx}-${k}`} style={miniTdStyle}>
                                      {fmtQualityVal(getQualityVal(row?.quality, k))}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </TableCell>

                      {/* Remarks (last) */}
                      <TableCell key="remarks" style={{ paddingTop: 6, paddingBottom: 6, fontSize: 13 }}>
                        {toKeyValueString(remarks)}
                      </TableCell>
                    
                      <TableCell key="actions" style={{ paddingTop: 6, paddingBottom: 6, fontSize: 13, whiteSpace: "nowrap" }}>
                        {row?.bag_no && (
                          <PrintLabelButton
                            bag_no={row.bag_no}                          // <-- print using bag_no
                            weight={row.bag_weight ?? row.weight ?? row.weight_out ?? undefined} // optional
                            heightIn={2.5}                               // keep your standard label size
                          />
                        )}
                      </TableCell>

                    </TableRow>
                  );
                })
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

        {/* Filter dialog scoped to this panel */}
        <Dialog
          open={filterDialog.open && filterDialog.panelKey === key}
          onClose={() => setFilterDialog({ open: false, panelKey: null, draft: { bag_no: "", status: "", created_from: "", created_to: "" } })}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Filter — {label}</DialogTitle>
          <DialogContent dividers>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
              <TextField
                label="Bag No (contains)"
                size="small"
                value={filterDialog.draft.bag_no}
                onChange={(e) => setFilterDialog(s => ({ ...s, draft: { ...s.draft, bag_no: e.target.value } }))}
              />
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filterDialog.draft.status || ""}
                  onChange={(e) => setFilterDialog(s => ({ ...s, draft: { ...s.draft, status: e.target.value } }))}
                >
                  <MenuItem value="">{/* empty = any */}</MenuItem>
                  {STATUS_OPTIONS.map((st) => (
                    <MenuItem key={st} value={st}>{st}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Created From"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filterDialog.draft.created_from || ""}
                onChange={(e) => setFilterDialog(s => ({ ...s, draft: { ...s.draft, created_from: e.target.value } }))}
              />
              <TextField
                label="Created To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filterDialog.draft.created_to || ""}
                onChange={(e) => setFilterDialog(s => ({ ...s, draft: { ...s.draft, created_to: e.target.value } }))}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialog({ open: false, panelKey: null, draft: { bag_no: "", status: "", created_from: "", created_to: "" } })}>
              Cancel
            </Button>
            <Button color="warning" onClick={() => {
              // Only clear the *draft* inputs; user will press Apply to commit
              setFilterDialog(s => ({ ...s, draft: { bag_no: "", status: "", created_from: "", created_to: "" } }));
            }}>
              Clear
            </Button>
            <Button variant="contained" onClick={applyFilter}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
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
                backgroundColor: "#f5f5f7",
                boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
                border: "1px solid #e6e6ea",
              }}
            >
              <AccordionSummary
                expandIcon={isOpen ? <RemoveRoundedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />}
                style={{
                  minHeight: barHeight,
                  backgroundColor: "#eeeeee",
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
