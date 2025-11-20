import React from "react";
import {
  Box, Paper, Stack, Typography, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, MenuItem, Select, InputLabel, FormControl, Chip, Divider,
  CircularProgress, TablePagination, Tooltip,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 50;
const MOVE_OPTIONS = ["Packaging", "Screening", "De-Dusting", "De-Magnetize", "Blending","Crushing"];
//const DEFAULT_GRADES = ["exkiln", "Grade 1st stage - Rotary A", "Grade 2nd stage - Rotary B"];

// format helper
const fmtDT = (v) => (v ? new Date(v).toLocaleString() : "");
const fmtNum = (n, d = 2) => (typeof n === "number" ? n.toFixed(d) : n ?? "");

/**
 * Table (not DataGrid) for: In-Stock with CTC
 * - Checkbox select per row + header select-all (current page only)
 * - Optional filters: dateFrom, dateTo, grade[]
 * - Bulk "Move to" action (destinations above)
 * - Server paging (50/page), shows Total from backend
 * - Columns: bag_created_time | bag_no | grade | weight | ctc | status
 * - Hidden data field: source (destoning|postactivation) used for move API
 */
export default function InStockCTCRecordsTable() {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0); // 0-based for UI
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // filters (all optional)
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [grades, setGrades] = React.useState([]);

  // selection (current page)
  const [selectedIds, setSelectedIds] = React.useState(new Set()); // id = `${source}:${bag_no}`

  // move to
  const [moveTo, setMoveTo] = React.useState("");

  const cols = [
    { key: "bag_created_time", label: "Bag Created Time", align: "left" },
    { key: "bag_no",           label: "Bag No",           align: "left" },
    { key: "grade",            label: "Grade",            align: "left" },
    { key: "weight",           label: "Weight (kg)",      align: "right" },
    { key: "ctc",              label: "CTC",              align: "right" },
    { key: "status",           label: "Status",           align: "left" },
  ];

  // state
  const [gradeOptions, setGradeOptions] = React.useState([]);
  const [loadingGrades, setLoadingGrades] = React.useState(false);

  // helper
  const buildGradeList = (payload) => {
    const gradeMap = payload?.data && typeof payload.data === "object" ? payload.data : {};
    return Object.keys(gradeMap);
  };

  // effect
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingGrades(true);
        // Active grades only (de-active skipped by backend).
        const res = await fetch(`${API_URL}/api/settings/quality-params/metrics?includeInactive=1`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        if (!alive) return;
        setGradeOptions(buildGradeList(data));
      } catch (e) {
        console.error("grade fetch failed:", e);
        // keep whatever we have; ensure exkiln exists
        setGradeOptions((prev) => Array.from(new Set(["exkiln", ...(prev || [])])));
      } finally {
        if (alive) setLoadingGrades(false);
      }
    })();
    return () => { alive = false; };
  }, [API_URL]);


  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1)); // API is 1-based
      params.set("pageSize", String(PAGE_SIZE));
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (grades.length) params.set("grade", grades.join(","));

      const url = `${API_URL}/api/delivery/instock-ctc?${params}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mapped = (data.rows || []).map((r) => ({
        id: `${r.source}:${r.bag_no}`,
        ...r,
      }));

      setRows(mapped);
      setTotal(Number(data.total || 0));
      // keep selection to current page only
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      setError("Failed to load");
      setRows([]);
      setTotal(0);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, dateFrom, dateTo, grades]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  // selection handlers (page scope)
  const allOnPageSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));
  const someOnPageSelected = rows.some(r => selectedIds.has(r.id));

  const toggleSelectAll = (checked) => {
    const next = new Set(selectedIds);
    if (checked) rows.forEach(r => next.add(r.id));
    else rows.forEach(r => next.delete(r.id));
    setSelectedIds(next);
  };

  const toggleRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApplyMove = async () => {
    if (!moveTo || selectedIds.size === 0) return;
    const items = Array.from(selectedIds).map((id) => {
      const [source, ...rest] = id.split(":");
      return { source, bag_no: rest.join(":") };
    });
    try {
      const resp = await fetch(`${API_URL}/api/delivery/instock-ctc/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ target: moveTo, items }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error(data);
        alert(data.error || "Failed to move items");
        return;
      }
      // refresh (moved rows will likely disappear, no longer InStock)
      setSelectedIds(new Set());
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to move items");
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <Paper sx={{ p: 1.25 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>In-Stock with CTC</Typography>
          <Typography variant="body2">Total: {total}</Typography>
        </Stack>

        {/* Toolbar: filters + move */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
          <TextField
            label="Date From"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => { setPage(0); setDateFrom(e.target.value); }}
          />
          <TextField
            label="Date To"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => { setPage(0); setDateTo(e.target.value); }}
          />
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="grade-label">Grade</InputLabel>
            <Select
              labelId="grade-label"
              multiple
              value={grades}
              label="Grade"
              onChange={(e) => { setPage(0); setGrades(e.target.value); }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((v) => <Chip key={v} label={v} />)}
                </Box>
              )}
            >
              {gradeOptions.map((g) => (
                <MenuItem key={g} value={g} disabled={loadingGrades && g !== "exkiln"}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="move-to">Move to</InputLabel>
            <Select
              labelId="move-to"
              value={moveTo}
              label="Move to"
              onChange={(e) => setMoveTo(e.target.value)}
            >
              {MOVE_OPTIONS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            disabled={!moveTo || selectedIds.size === 0}
            onClick={handleApplyMove}
          >
            Apply
          </Button>

          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Table */}
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    checked={allOnPageSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    inputProps={{ "aria-label": "select all rows on page" }}
                  />
                </TableCell>
                {cols.map(c => (
                  <TableCell key={c.key} align={c.align}>{c.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={cols.length + 1} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={cols.length + 1} align="center">No records</TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow hover key={r.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleRow(r.id)}
                      />
                    </TableCell>
                    <TableCell>{fmtDT(r.bag_created_time)}</TableCell>
                    <TableCell>{r.bag_no}</TableCell>
                    <TableCell>{r.grade}</TableCell>
                    <TableCell align="right">{fmtNum(r.weight)}</TableCell>
                    <TableCell align="right">{r.ctc}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paging */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <TablePagination
            component="div"
            rowsPerPageOptions={[PAGE_SIZE]}
            count={total}
            rowsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={() => {}}
          />
        </Box>
      </Paper>
    </Box>
  );
}
