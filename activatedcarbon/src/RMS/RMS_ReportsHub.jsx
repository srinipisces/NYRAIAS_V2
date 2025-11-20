import * as React from "react";
import {
  Box, Paper, Typography, Stack, Divider,
  Select, MenuItem, FormControl, InputLabel,
  TextField, Button, Chip, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Pagination, Tooltip, Alert,TablePagination
} from "@mui/material";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer
} from "recharts";
import reportConfigs from "./RMS_reportConfigs.js";

const API = import.meta.env.VITE_API_URL;
//const QualityReport = React.lazy(() => import("./QualityReport.jsx"));

// Keep: import axios from "axios";
const api = axios.create({ withCredentials: true });

// Any 401 anywhere -> bounce to home (or '/login')
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
      window.location.replace('/'); // or '/login'
    }
    return Promise.reject(err);
  }
);


// small helpers
const columnsFromRows = (rows) =>
  rows?.length ? Array.from(new Set(rows.flatMap((r) => Object.keys(r || {})))) : [];
const fmt = (v) => (v == null ? "" : v instanceof Date ? v.toISOString() : String(v));
const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// field renderer
function Field({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <FormControl size="small" fullWidth>
        <InputLabel>{field.label}</InputLabel>
        <Select
          label={field.label}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          {(field.options || []).map((opt) => (
            <MenuItem key={String(opt.value)} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  return (
    <TextField
      size="small"
      fullWidth
      type={field.type === "date" ? "date" : "text"}
      label={field.label}
      InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
      value={value ?? ""}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder || ""}
    />
  );
}

export default function ReportsHub() {
  const [selectedId, setSelectedId] = React.useState(reportConfigs[0]?.id || "");
  const selected = reportConfigs.find((r) => r.id === selectedId);

  // filters per report
  const [filters, setFilters] = React.useState({});
  // data & paging
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const pageSize = selected?.pageSize || 50;

  // ui state
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [validationError, setValidationError] = React.useState("");

  // do NOT auto-fetch on change; user must click Generate
  React.useEffect(() => {
    if (!selected) return;
    // ensure bucket exists
    setFilters((prev) => ({ ...prev, [selected.id]: { ...(prev[selected.id] || {}) } }));
    // reset view
    setRows([]);
    setTotal(0);
    setPage(1);
    setError("");
    setValidationError("");
  }, [selectedId]);

  const activeFilters = filters[selected?.id] || {};

  const handleFilterChange = (name, value) => {
    setFilters((s) => ({ ...s, [selected.id]: { ...(s[selected.id] || {}), [name]: value } }));
  };

  const clearFilters = () => {
    // blank window and clear active filters
    setFilters((s) => ({ ...s, [selected.id]: {} }));
    setRows([]);
    setTotal(0);
    setPage(1);
    setError("");
    setValidationError("");
  };

  // date validations (front-end)
  const validateForGenerate = () => {
    const { from, to } = activeFilters;
    // if either is present, both must be present
    if ((from && !to) || (!from && to)) {
      return "Please select both From and To dates.";
    }
    // if both present, format   order check
    if (from && to) {
      if (!isValidYMD(from) || !isValidYMD(to)) {
        return "Dates must be in YYYY-MM-DD format.";
      }
      if (new Date(from) > new Date(to)) {
        return "'From' date cannot be after 'To' date.";
      }
    }
    return "";
  };

  async function fetchPage(targetPage = 1) {
    if (!selected) return;
    const err = validateForGenerate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError("");
    setLoading(true);
    setError("");

    try {
      const { method, path } = selected.endpoint;
      const cfg = selected.buildParams({
        filters: activeFilters,
        page: targetPage,
        pageSize,
        sort: undefined,
        dir: undefined,
      }) || {};

      const url = `${API}${path}`;
      const axiosOpts = { withCredentials: true, ...(cfg || {}) };

      let res;
      if ((method || "GET").toUpperCase() === "GET") {
        //res = await axios.get(url, axiosOpts);
        res = await api.get(url, axiosOpts);
      } else {
        const body = cfg.body || {};
        const params = cfg.params || {};
        //res = await axios.post(url, body, { withCredentials: true, params });
        res = await api.post(url, body, { withCredentials: true, params });
      }

      const { rows: fetchedRows, total: fetchedTotal } = selected.readResponse(res);
      setRows(fetchedRows || []);
      setTotal(fetchedTotal || 0);
      setPage(targetPage);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  // CSV mirrors the same params, but only when Generate rules pass
  const handleDownloadCSV = () => {
    if (!selected?.csv) return;
    const err = validateForGenerate();
    if (err) {
      setValidationError(err);
      return;
    }
    const { path } = selected.csv;
    const cfg = selected.buildParams({
      filters: activeFilters,
      page: 1,
      pageSize,
      sort: undefined,
      dir: undefined,
    }) || {};
    //const qs = new URLSearchParams(cfg.params || {}).toString();
    //const url = `${API}${path}?${qs}`;
    //window.location.href = url; // trigger browser download
    const qs = new URLSearchParams(cfg.params || {}).toString();
    const url = `${API}${path}?${qs}`;
    api.get(url, { responseType: 'blob' })
        .then((res) => {
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'text/csv' });
        const link = document.createElement('a');
        const cd = res.headers['content-disposition'] || '';
        const match = /filename="?([^"]+)"?/.exec(cd);
        //const fname = match?.[1] || `${(selected?.id || 'report')}.csv`;
        const fname =
           (match && match[1]) ? match[1]
           : `${((selected && selected.id) ? selected.id : 'report')}.csv`;
        link.href = URL.createObjectURL(blob);
        link.download = fname;
        document.body.appendChild(link);
        link.click();
        link.remove();
        })
        .catch((err) => {
        // Non-401 errors will be shown by the component's error state if needed
        setError(err?.response?.data?.error || err?.message || "Failed to download CSV");
        });
    };

  const cols = columnsFromRows(rows);
  const hasActiveFilter = !!Object.values(activeFilters || {}).filter(Boolean).length;

  // Chart logic
  const showChart = selected?.shouldShowChart?.(activeFilters) && rows.length > 0;
  const chartData = showChart ? selected.buildChart?.(rows) : [];
  

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" ,marginTop:2}}>
      <Paper variant="outlined" sx={{ width: { xs: "100%", md: 1100 }, p: 2 }}>
        {/* selector   description */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Report</InputLabel>
            <Select
              label="Report"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {reportConfigs.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
            {selected?.description || ""}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* --- content area --- */}
        {selected?.component === "QualityReport" ? (
            <React.Suspense fallback={null}>
                <QualityReport
                apiBase={API}
                pageSize={selected?.pageSize ?? 50}
                // optional: bubble total up if you show a total badge in Hub
                onTotalChange={(n) => setTotal?.(n)}   // if you have a total state at Hub level
                />
            </React.Suspense>
        ) : (
            <>
            {/* dynamic filters */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
            {selected?.fields?.map((f) => (
                <Box key={f.name} sx={{ width: { xs: "100%", md: 240 } }}>
                <Field field={f} value={activeFilters[f.name]} onChange={handleFilterChange} />
                </Box>
            ))}
            <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="contained" size="small" onClick={() => fetchPage(1)} disabled={loading}>
                {loading ? "Loading…" : "Generate"}
                </Button>
                <Button variant="outlined" size="small" onClick={handleDownloadCSV} disabled={loading || !selected?.csv}>
                Download CSV
                </Button>
                <Button variant="text" size="small" onClick={clearFilters} disabled={loading}>
                Clear
                </Button>
                {hasActiveFilter ? (
                <Chip label="Filters: ON" size="small" color="primary" variant="outlined" />
                ) : (
                <Chip label="Filters: OFF" size="small" variant="outlined" />
                )}
            </Stack>
            </Stack>

            {validationError && <Alert severity="warning" sx={{ mt: 2 }}>{validationError}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {/* chart (when allowed) */}
            {showChart && (
            <Box sx={{ height: 260, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <RTooltip />
                    <Line type="monotone" dataKey="count" stroke="#1976d2" dot />
                </LineChart>
                </ResponsiveContainer>
            </Box>
            )}

            {/* result header */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2">Total: {total}</Typography>
            {loading && <CircularProgress size={16} />}
            </Stack>

            {/* table */}
            <Box sx={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 1 }}>
            <Table size="small">
                <TableHead>
                <TableRow>
                    {cols.length === 0 ? (
                    <TableCell>No data</TableCell>
                    ) : (
                    cols.map((c) => (
                        <TableCell key={c} sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                        {c}
                        </TableCell>
                    ))
                    )}
                </TableRow>
                </TableHead>
                <TableBody>
                {rows.length === 0 ? (
                    <TableRow>
                    <TableCell
                        colSpan={Math.max(cols.length, 1)}
                        align="center"
                        sx={{ py: 3, color: "text.secondary" }}
                    >
                        {loading ? "Loading…" : "No rows"}
                    </TableCell>
                    </TableRow>
                ) : (
                    rows.map((r, i) => (
                    <TableRow key={i}>
                        {cols.map((c) => (
                        <TableCell key={c}>
                            <Tooltip title={fmt(r[c])} arrow>
                            <span
                                style={{
                                display: "inline-block",
                                maxWidth: 260,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                }}
                            >
                                {fmt(r[c])}
                            </span>
                            </Tooltip>
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </Box>

            {/* pagination (Generate triggers fetching) */}
            {/* Pagination with range text, fixed 50 rows per page */}
            <TablePagination
                component="div"
                rowsPerPageOptions={[50]}
                rowsPerPage={pageSize}
                count={total}
                page={Math.max(0, page - 1)}                 // TablePagination is 0-based
                onPageChange={(_, newPage) => fetchPage(newPage + 1)}
                onRowsPerPageChange={() => {}}
            />
        </>
        )}
        </Paper>
    </Box>
  );
}
