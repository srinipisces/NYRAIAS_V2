import React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Divider,
  CircularProgress,
  TablePagination,
  Tooltip,
  Chip,
  MenuItem,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 50;

const LIST_ENDPOINT = `${API_URL}/api/delivery/rms-instock`;
const MOVE_TO_PACKAGING_ENDPOINT = `${API_URL}/api/delivery/rms-instock/move-to-packaging`;

const GRADE_OPTIONS = [
  "Unburnt",
  "Stones",
  "-20 2nd Stage Rotary B",
  "-20 1st Stage Rotary A",
];

const fmtDT = (v) => (v ? new Date(v).toLocaleString() : "");
const fmtNum = (n, d = 2) => (typeof n === "number" ? n.toFixed(d) : n ?? "");

export default function RMSInStock() {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [showFilters, setShowFilters] = React.useState(false);

  // applied filters (used for fetch)
  const [applied, setApplied] = React.useState({
    bagNo: "",
    inwardNumber: "",
    grade: "",
    from: "",
    to: "",
  });

  // draft filters (edit-only until Apply)
  const [draft, setDraft] = React.useState({
    bagNo: "",
    inwardNumber: "",
    grade: "",
    from: "",
    to: "",
  });

  // selection
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [selectAllAcross, setSelectAllAcross] = React.useState(false);

  const filtersApplied =
    !!applied.bagNo.trim() ||
    !!applied.inwardNumber.trim() ||
    !!applied.grade.trim() ||
    !!applied.from ||
    !!applied.to;

  const cols = [
    { key: "bag_generated_datetime", label: "Bag Generated Time", align: "left" },
    { key: "inward_number", label: "Inward Number", align: "left" },
    { key: "bag_no", label: "Bag No", align: "left" },
    { key: "grade", label: "Grade", align: "left" },
    { key: "weight", label: "Weight (kg)", align: "right" },
    { key: "bag_status", label: "Status", align: "left" },
    { key: "bag_status_change_userid", label: "Status Changed By", align: "left" },
    { key: "bag_status_change_dt", label: "Status Changed Time", align: "left" },
  ];

  // When filter panel opens, load applied -> draft
  React.useEffect(() => {
    if (showFilters) setDraft(applied);
  }, [showFilters, applied]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1)); // backend 1-based

      if (applied.bagNo.trim()) params.set("bag_no", applied.bagNo.trim());
      if (applied.inwardNumber.trim()) params.set("inward_number", applied.inwardNumber.trim());
      if (applied.grade.trim()) params.set("grade", applied.grade.trim());
      if (applied.from) params.set("from", applied.from);
      if (applied.to) params.set("to", applied.to);

      const url = `${LIST_ENDPOINT}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const apiRows = Array.isArray(data.rows) ? data.rows : [];
      const mapped = apiRows.map((r) => ({ id: r.bag_no, ...r }));

      setRows(mapped);
      setTotal(Number(data.total_rows ?? data.total ?? 0) || 0);

      // keep select-all intent across pages; visually check current page
      if (selectAllAcross) setSelectedIds(new Set(mapped.map((r) => r.id)));
      else setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      setError("Failed to load");
      setRows([]);
      setTotal(0);
      setSelectedIds(new Set());
      setSelectAllAcross(false);
    } finally {
      setLoading(false);
    }
  }, [page, applied, selectAllAcross]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // selection UI state
  const allOnPageSelected =
    rows.length > 0 && (selectAllAcross || rows.every((r) => selectedIds.has(r.id)));
  const someOnPageSelected = !selectAllAcross && rows.some((r) => selectedIds.has(r.id));

  const toggleSelectAll = (checked) => {
    if (checked) {
      // header checkbox = "select all across current filters"
      setSelectAllAcross(true);
      setSelectedIds(new Set(rows.map((r) => r.id)));
    } else {
      setSelectAllAcross(false);
      setSelectedIds(new Set());
    }
  };

  const toggleRow = (id) => {
    // if selectAllAcross is active and user changes a row, switch to manual
    if (selectAllAcross) {
      const next = new Set(rows.map((r) => r.id));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectAllAcross(false);
      setSelectedIds(next);
      return;
    }

    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleResetDraft = () => {
    setDraft({ bagNo: "", inwardNumber: "", grade: "", from: "", to: "" });
  };

  const handleApplyFilters = () => {
    setPage(0);
    setApplied({
      bagNo: draft.bagNo,
      inwardNumber: draft.inwardNumber,
      grade: draft.grade,
      from: draft.from,
      to: draft.to,
    });

    // reset selection on new filters
    setSelectAllAcross(false);
    setSelectedIds(new Set());

    setShowFilters(false);
  };

  const handleMoveToPackaging = async () => {
    const count = selectAllAcross ? total : selectedIds.size;
    if (!count) return;

    const ok = window.confirm(`Move ${count} bag(s) to Packaging?`);
    if (!ok) return;

    const payload = selectAllAcross
      ? {
          mode: "select_all",
          filters: {
            bag_no: applied.bagNo?.trim() || "",
            inward_number: applied.inwardNumber?.trim() || "",
            grade: applied.grade?.trim() || "",
            from: applied.from || "",
            to: applied.to || "",
          },
        }
      : {
          mode: "selected",
          bag_nos: Array.from(selectedIds),
        };

    try {
      const resp = await fetch(MOVE_TO_PACKAGING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        alert(data?.error || "MoveToPackaging failed");
        return;
      }

      alert(data?.message || `Moved ${data?.updated ?? 0} bag(s) to Packaging`);

      setSelectAllAcross(false);
      setSelectedIds(new Set());
      fetchData(); // moved rows disappear (GET shows only InStock)
    } catch (e) {
      console.error(e);
      alert("MoveToPackaging failed");
    }
  };

  const moveDisabled = loading || (!selectAllAcross && selectedIds.size === 0);

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <Paper sx={{ p: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            RMS In-Stock
          </Typography>
          <Typography variant="body2">Total: {total}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={() => setShowFilters((s) => !s)}
          >
            Filter
          </Button>

          {filtersApplied && <Chip size="small" label="Filter On" />}

          {selectAllAcross && <Chip size="small" label={`Select All: ${total}`} />}

          <Button
            variant="contained"
            size="small"
            disabled={moveDisabled}
            onClick={handleMoveToPackaging}
          >
            MoveToPackaging
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {showFilters && (
          <Box sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <TextField
                label="Bag No (contains)"
                size="small"
                value={draft.bagNo}
                onChange={(e) => setDraft((d) => ({ ...d, bagNo: e.target.value }))}
              />

              <TextField
                label="Inward Number"
                size="small"
                value={draft.inwardNumber}
                onChange={(e) => setDraft((d) => ({ ...d, inwardNumber: e.target.value }))}
              />

              {/* ✅ Grade dropdown */}
              <TextField
                label="Grade"
                size="small"
                select
                value={draft.grade}
                onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value }))}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">All</MenuItem>
                {GRADE_OPTIONS.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Date From"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={draft.from}
                onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
              />

              <TextField
                label="Date To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={draft.to}
                onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              />

              <Button size="small" variant="text" onClick={handleResetDraft}>
                Reset
              </Button>
              <Button size="small" variant="contained" onClick={handleApplyFilters}>
                Apply
              </Button>
            </Stack>
          </Box>
        )}

        {error ? (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader sx={{ "& th, & td": { whiteSpace: "nowrap" } }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    checked={allOnPageSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </TableCell>
                {cols.map((c) => (
                  <TableCell key={c.key} align={c.align}>
                    {c.label}
                  </TableCell>
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
                  <TableCell colSpan={cols.length + 1} align="center">
                    No records
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow hover key={r.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectAllAcross || selectedIds.has(r.id)}
                        onChange={() => toggleRow(r.id)}
                      />
                    </TableCell>

                    <TableCell>{r.bag_generated_datetime || ""}</TableCell>
                    <TableCell>{r.inward_number}</TableCell>
                    <TableCell>{r.bag_no}</TableCell>
                    <TableCell>{r.grade}</TableCell>
                    <TableCell align="right">{fmtNum(r.weight)}</TableCell>
                    <TableCell>{r.bag_status}</TableCell>
                    <TableCell>{r.bag_status_change_userid}</TableCell>
                    <TableCell>{fmtDT(r.bag_status_change_dt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
