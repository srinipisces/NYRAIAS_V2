// src/PostActivation/QualityReport.jsx
import React from "react";
import {
  Stack, Button, TextField, MenuItem, IconButton, Chip,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

// UPDATED: includes InStock, Quality
const STATUS_OPTIONS = [
  "Screening","Crushing","Blending","De-Dusting","De-Magnetize","InStock","Quality"
];

export default function QualityReport({ apiBase, pageSize = 50, onTotalChange }) {
  const [loadingOpts, setLoadingOpts] = React.useState(true);
  const [gradeMap, setGradeMap] = React.useState({});
  const [grade, setGrade] = React.useState("");
  const [statuses, setStatuses] = React.useState([]); // empty = ALL
  const [paramsForGrade, setParamsForGrade] = React.useState([]);
  const [conds, setConds] = React.useState([]);

  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);       // API is 1-based
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);
  const [busy, setBusy] = React.useState(false);

  // Load grade -> params (includes inactive)
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingOpts(true);
        const url = new URL(`${apiBase}/api/settings/quality-params/metrics`);
        url.searchParams.set("includeInactive", "1");
        const { data } = await axios.get(url.toString(), { withCredentials: true });
        setGradeMap(data?.data || {});
      } finally {
        setLoadingOpts(false);
      }
    })();
  }, [apiBase]);

  // Update params on grade change; exclude "remarks" from numeric filters
  /* React.useEffect(() => {
    const list = grade && gradeMap[grade] ? gradeMap[grade] : [];
    setParamsForGrade(list.filter(p => String(p?.key || "").toLowerCase() !== "remarks"));
    setConds([]); // reset conditions when grade changes
  }, [grade, gradeMap]); */

  React.useEffect(() => {
        const list = grade && gradeMap[grade] ? gradeMap[grade] : [];
        setParamsForGrade(list.filter(p => String(p?.key || "").toLowerCase() !== "remarks"));
        setConds([]);          // reset conditions
        setRows([]);           // ✅ clear previous data
        setTotal(0);           // ✅ reset total
        setPage(1);            // ✅ reset pagination
    }, [grade, gradeMap]);


  // ✅ Only Grade is required. If conditions exist, they must be valid.
  const canGenerate = !!grade && conds.every(c => {
    if (!c.key || !c.op) return false;
    if (c.op === "between") return c.min != null && c.max != null && Number(c.min) <= Number(c.max);
    return c.min != null;
  });

  // helpers
  const addCond = () => setConds(a => [...a, { key: "", op: "between", min: null, max: null }]);
  const removeCond = (idx) => setConds(a => a.filter((_, i) => i !== idx));
  const setCond = (idx, patch) => setConds(a => a.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  // fetch (POST) — ✅ default statuses to "ALL" when empty
  const fetchRows = async (p = 1, ps = rowsPerPage) => {
    setBusy(true);
    try {
      const effStatuses = (statuses && statuses.length) ? statuses : "ALL";
      const body = { page: p, pageSize: ps, grade, statuses: effStatuses, conditions: conds };
      const { data } = await axios.post(`${apiBase}/api/reports_postactivation/quality_report`, body, { withCredentials: true });
      const rows = data?.rows ?? [];
      const total = data?.total ?? 0;
      setRows(rows); setTotal(total); setPage(p); setRowsPerPage(ps);
      onTotalChange?.(total);
    } finally {
      setBusy(false);
    }
  };

  // CSV — ✅ default statuses to "ALL" when empty
  const downloadCsv = async () => {
    const effStatuses = (statuses && statuses.length) ? statuses : "ALL";
    const resp = await fetch(`${apiBase}/api/reports_postactivation/quality_report.csv`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade, statuses: effStatuses, conditions: conds }),
    });
    const blob = await resp.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quality_report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // columns from params + fixed columns
  const tableColumns = React.useMemo(() => {
    const qCols = paramsForGrade.map(p => ({ key: `q_${p.key}`, header: p.label || p.key, srcKey: p.key }));
    return [
      { key: "bag_no", header: "Bag No" },
      { key: "stock_status", header: "Status" },
      ...qCols,
      { key: "remarks", header: "Remarks" },
    ];
  }, [paramsForGrade]);

  // flatten
  const displayRows = React.useMemo(() => {
    return rows.map((r) => {
      const q = typeof r.quality === "string" ? safeParseJson(r.quality) : (r.quality || {});
      const out = {
        bag_no: r.bag_no,
        stock_status: r.stock_status,
        remarks: q?.remarks ?? "",
      };
      paramsForGrade.forEach(p => { out[`q_${p.key}`] = q?.[p.key] ?? ""; });
      return out;
    });
  }, [rows, paramsForGrade]);

  function safeParseJson(s) { try { return JSON.parse(s); } catch { return {}; } }

  return (
    <Stack spacing={1}>
      {/* Filters row (matches Hub density/spacing) */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Grade *</InputLabel>
          <Select
            label="Grade *"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={loadingOpts}
          >
            {Object.keys(gradeMap).filter(g => g !== "__DEFAULT__").map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Status (optional – ALL by default)</InputLabel>
          <Select
            multiple
            value={statuses}
            onChange={(e) => setStatuses(e.target.value)}
            input={<OutlinedInput label="Status (optional – ALL by default)" />}
            renderValue={(selected) => selected.length ? selected.join(", ") : "ALL"}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                <Checkbox checked={statuses.indexOf(s) > -1} />
                <ListItemText primary={s} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button size="small" startIcon={<AddIcon />} onClick={addCond} disabled={!grade || loadingOpts}>
          Add Quality Condition
        </Button>

        <Chip label={`${total} records`} size="small" />
      </Stack>

      {/* Condition rows */}
      <Stack spacing={1}>
        {conds.map((c, idx) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Param *</InputLabel>
              <Select
                label="Param *"
                value={c.key}
                onChange={(e) => setCond(idx, { key: e.target.value })}
              >
                {paramsForGrade.map((p) => (
                  <MenuItem key={p.key} value={p.key}>{p.label || p.key}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Operator *</InputLabel>
              <Select
                label="Operator *"
                value={c.op}
                onChange={(e) => setCond(idx, { op: e.target.value })}
              >
                <MenuItem value="between">Between</MenuItem>
                <MenuItem value="ge">≥</MenuItem>
                <MenuItem value="le">≤</MenuItem>
                <MenuItem value="gt">{">"}</MenuItem>
                <MenuItem value="lt">{"<"}</MenuItem>
                <MenuItem value="eq">=</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="number"
              label={c.op === "between" ? "Min *" : "Value *"}
              value={c.min ?? ""}
              onChange={(e) => setCond(idx, { min: e.target.value === "" ? null : Number(e.target.value) })}
              sx={{ width: 120 }}
            />
            {c.op === "between" && (
              <TextField
                size="small"
                type="number"
                label="Max *"
                value={c.max ?? ""}
                onChange={(e) => setCond(idx, { max: e.target.value === "" ? null : Number(e.target.value) })}
                sx={{ width: 120 }}
              />
            )}

            <IconButton size="small" onClick={() => removeCond(idx)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="contained" size="small" disabled={!canGenerate || busy} onClick={() => fetchRows(1, rowsPerPage)}>
          Generate
        </Button>
        <Button variant="outlined" size="small" disabled={!canGenerate || busy || total === 0} onClick={downloadCsv}>
          Download CSV
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {tableColumns.map(col => (
                <TableCell key={col.key} sx={{ fontWeight: 700 }}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.map((r) => (
              <TableRow key={r.bag_no}>
                {tableColumns.map(col => (
                  <TableCell key={col.key}>{r[col.key]}</TableCell>
                ))}
              </TableRow>
            ))}
            {displayRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumns.length} align="center">No data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={Math.max(0, page - 1)}
        onPageChange={(_, newPage) => fetchRows(newPage + 1, rowsPerPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => fetchRows(1, parseInt(e.target.value, 10))}
      />
    </Stack>
  );
}
