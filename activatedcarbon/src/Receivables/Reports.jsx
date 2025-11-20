// Receivables_Records.jsx
import * as React from "react";
import {
  Box, Paper, Stack, Button, TextField, MenuItem, Typography, Chip,
  Divider, IconButton, Tooltip, CircularProgress, useMediaQuery, Menu
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import DownloadIcon from "@mui/icons-material/Download";
import SaveRounded from "@mui/icons-material/SaveRounded";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import {
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination,
} from "@mui/material";

import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;           // e.g. https://nyraias.com
const BASE = `${API_URL}/api/receivables`;              // keep your path

const EDITABLE_FIELDS = new Set([
  "dc_number",
  "supplier_weight",
  "our_weight",
  "moisture",
  "dust",
  "ad_value",
  "admit_load",
]);

const COL_WIDTH = {
  inward_number: 160,
  material_arrival_time: 220,
  supplier_name: 240,
  dc_number: 160,
  supplier_weight: 140,
  our_weight: 140,
  moisture: 120,
  dust: 120,
  ad_value: 120,
  lab_result_time: 220,
  admit_load: 140,
  __actions: 130,
};

const redirectHome = () => {
  // keep this simple so it works even outside react-router
  window.location.href = "/";
};

const authFetch = async (input, init) => {
  const resp = await fetch(input, init);
  if (resp.status === 401) {
    redirectHome();
    // Stop further handling in the caller
    throw new Error("Unauthorized (401)");
  }
  return resp;
};


export default function Receivables_Records() {
  const { access } = useAuth();
  const canEdit = Array.isArray(access) && access.includes("Operations.Receivables.Edit");

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  // edit mode toggle
  const [editMode, setEditMode] = React.useState(false);

  // data
  const [rows, setRows] = React.useState([]);
  const [columns, setColumns] = React.useState([]);
  const [total, setTotal] = React.useState(0);      // filtered
  const [totalAll, setTotalAll] = React.useState(0);// all records
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // server pagination (50/page)
  const [page, setPage] = React.useState(0);
  const pageSize = 50;

  // sorting
  const [sortBy, setSortBy] = React.useState("material_arrival_time");
  const [sortDir, setSortDir] = React.useState("DESC");

  // filters (draft vs applied)
  const initialFilters = React.useMemo(() => ({
    inward_number: "",
    supplier_name: "",
    admit: "All",
    from: "",
    to: "",
  }), []);
  const [filtersDraft, setFiltersDraft] = React.useState(initialFilters);
  const [filters, setFilters] = React.useState(initialFilters);
  const [showFilters, setShowFilters] = React.useState(false);

  // actions overflow menu (mobile)
  const [menuEl, setMenuEl] = React.useState(null);
  const openMenu = (e) => setMenuEl(e.currentTarget);
  const closeMenu = () => setMenuEl(null);

  const filtersApplied =
    !!filters.inward_number ||
    !!filters.supplier_name ||
    filters.admit !== "All" ||
    !!filters.from ||
    !!filters.to;

  // per-row draft edits
  const [drafts, setDrafts] = React.useState({}); // { rowId: { field: value } }

  const buildGridQuery = () => {
    const params = new URLSearchParams();
    params.set("page", String(page + 1));
    params.set("pageSize", String(pageSize));
    if (filters.inward_number) params.set("inward_number", filters.inward_number);
    if (filters.supplier_name) params.set("supplier_name", filters.supplier_name);
    if (filters.admit && filters.admit !== "All") params.set("admit", filters.admit);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);
    }
    return params.toString();
  };

  const buildDownloadQuery = () => {
    const params = new URLSearchParams();
    if (filters.inward_number) params.set("inward_number", filters.inward_number);
    if (filters.supplier_name) params.set("supplier_name", filters.supplier_name);
    if (filters.admit && filters.admit !== "All") params.set("admit", filters.admit);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);
    }
    return params.toString();
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    const ctrl = new AbortController();
    try {
      const qs = buildGridQuery();
      const resp = await authFetch(`${BASE}/RawMaterialIncoming?${qs}`, {
        credentials: "include",
        signal: ctrl.signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const keyedRows = (data.rows || []).map((r, idx) => ({
        id:
          r.inward_number && r.material_arrival_time
            ? `${r.inward_number}__${r.material_arrival_time}`
            : `row_${page}_${idx}`,
        ...r,
      }));

      const serverCols = (data.columns || [])
        .filter((c) => c.field !== "audit_trail")
        .map((c) => ({
          field: c.field,
          headerName:
            c.headerName ||
            c.field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        }));

      // actions column only in Edit mode for editors
      const finalCols =
        canEdit && editMode
          ? [...serverCols, { field: "__actions", headerName: "" }]
          : serverCols;

      setColumns(finalCols);
      setRows(keyedRows);
      setTotal(Number(data.total || 0));
      setTotalAll(Number(data.totalAll || data.total || 0));

      // prune drafts not on this page
      setDrafts((old) => {
        const keep = new Set(keyedRows.map((r) => r.id));
        const next = {};
        for (const k of Object.keys(old)) if (keep.has(k)) next[k] = old[k];
        return next;
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setError("Failed to load data.");
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
    return () => ctrl.abort();
    // include editMode so columns reconfigure when toggled
  }, [page, pageSize, filters, sortBy, sortDir, canEdit, editMode]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  // Apply / Clear (panel auto-closes)
  const handleApply = () => {
    setFilters(filtersDraft);
    setPage(0);
    setShowFilters(false);
    closeMenu();
  };
  const handleClearFilters = () => {
    setFiltersDraft(initialFilters);
    setFilters(initialFilters);
    setPage(0);
    setShowFilters(false);
    closeMenu();
  };

  const handleDownloadCsv = () => {
 
      const qs = buildDownloadQuery();
      const url = `${BASE}/RawMaterialIncoming/download.csv${qs ? `?${qs}` : ""}`;
      (async () => {
         try {
           const resp = await authFetch(url, { credentials: "include" });
           if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
           const blob = await resp.blob();
           const dlUrl = URL.createObjectURL(blob);
           const a = document.createElement("a");
           a.href = dlUrl;
           a.download = "RawMaterialIncoming.csv";
           document.body.appendChild(a);
           a.click();
           a.remove();
           URL.revokeObjectURL(dlUrl);
          } catch (e) {
            // if 401, authFetch already redirected; otherwise show a gentle error
            if (String(e?.message || "").includes("Unauthorized")) return;
            console.error(e);
            setError("Failed to download CSV.");
          } finally {
            closeMenu();
          }
       })();
  };

  // edit mode + cancel drafts
  const toggleEditMode = () => {
  setEditMode((prev) => {
    if (prev) {
      // exiting edit mode → discard all unsaved changes
      setDrafts({});
    }
    return !prev;
  });
  closeMenu();
};

  const handleCancelEdits = () => {
    setDrafts({});
    closeMenu();
  };

  const onEditChange = (rowId, field, value) => {
    if (!(canEdit && editMode) || !EDITABLE_FIELDS.has(field)) return;
    setDrafts((prev) => {
      const next = { ...(prev[rowId] || {}), [field]: value };
      return { ...prev, [rowId]: next };
    });
  };

  const saveRow = async (row) => {
    if (!(canEdit && editMode)) return;
    const d = drafts[row.id];
    if (!d || Object.keys(d).length === 0) return;

    try {
      const payload = {};
      if ("dc_number" in d) payload.dc_number = d.dc_number ?? null;
      if ("supplier_weight" in d) payload.supplier_weight = d.supplier_weight ?? null;
      if ("our_weight" in d) payload.our_weight = d.our_weight ?? null;
      if ("moisture" in d) payload.moisture = d.moisture ?? null;
      if ("dust" in d) payload.dust = d.dust ?? null;
      if ("ad_value" in d) payload.ad_value = d.ad_value ?? null;
      if ("admit_load" in d) payload.admit_load = d.admit_load ?? null;

      const resp = await authFetch(
        `${BASE}/RawMaterialIncoming/${encodeURIComponent(row.inward_number)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data?.error || `Save failed (${resp.status})`);

      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...data.row } : r)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Save failed");
    }
  };

  const toggleSort = (field) => {
    if (field === "__actions") return;
    if (sortBy !== field) {
      setSortBy(field); setSortDir("ASC"); setPage(0);
    } else {
      setSortDir((d) => (d === "ASC" ? "DESC" : "ASC")); setPage(0);
    }
  };

  const tableMinWidth = React.useMemo(
    () => columns.reduce((sum, c) => sum + (COL_WIDTH[c.field] ?? 140), 0) + 24,
    [columns]
  );

  const renderCell = (row, col) => {
    const field = col.field;
    const value = (drafts[row.id]?.[field] ?? row[field]);
    const width = COL_WIDTH[field] ?? 140;

    // READ-ONLY when not in edit mode (even if user can edit)
    if (!(canEdit && editMode) || !EDITABLE_FIELDS.has(field)) {
      return (
        <Typography noWrap sx={{ fontSize: 13, width }}>
          {value ?? ""}
        </Typography>
      );
    }

    const commonProps = {
      size: "small",
      fullWidth: true,
      inputProps: { style: { fontSize: 13 }, inputMode: "decimal", step: "any" },
    };

    if (["supplier_weight","our_weight","moisture","dust","ad_value"].includes(field)) {
      const extra = ["moisture","dust"].includes(field)
        ? { inputProps: { ...commonProps.inputProps, min:0, max:100 } }
        : {};
      return (
        <TextField
          type="number"
          value={value ?? ""}
          onChange={(e) => onEditChange(row.id, field, e.target.value === "" ? null : Number(e.target.value))}
          {...commonProps}
          {...extra}
        />
      );
    }

    if (field === "admit_load") {
      return (
        <TextField
          select
          value={value ?? ""}
          onChange={(e) => onEditChange(row.id, field, e.target.value || null)}
          {...commonProps}
        >
          <MenuItem value="">(none)</MenuItem>
          <MenuItem value="Approve">Approve</MenuItem>
          <MenuItem value="Deny">Deny</MenuItem>
        </TextField>
      );
    }

    return (
      <TextField
        value={value ?? ""}
        onChange={(e) => onEditChange(row.id, field, e.target.value)}
        {...commonProps}
      />
    );
  };

  const rowIsDirty = (row) => !!drafts[row.id] && Object.keys(drafts[row.id]).length > 0;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
          mt: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "#f6f8fa",
            p: { xs: 1, sm: 2 },
            boxSizing: "border-box",
            overflow: "hidden",
            borderRadius: 1.5,
          }}
        >
          {/* Top: title + actions (responsive) */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1, minWidth: 0 }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Raw Material Incoming
            </Typography>

            {/* MD+ : show all action buttons inline */}
            {!isSmDown ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
                  <Button
                    size="small"
                    startIcon={<FilterAltIcon />}
                    variant={showFilters ? "contained" : "outlined"}
                    onClick={() => setShowFilters((s) => !s)}
                  >
                    Filter
                  </Button>
                </Tooltip>

                <Tooltip title="Download CSV (filtered if applied)">
                  <IconButton aria-label="Download CSV" onClick={handleDownloadCsv}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                {filtersApplied && (
                  <Tooltip title="Clear all filters">
                    <IconButton aria-label="Clear all filters" color="error" onClick={handleClearFilters}>
                      <ClearAllIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {/* {canEdit && (
                  <>
                    {canEdit && (
                      <Tooltip title={editMode ? "Done editing" : "Edit mode"}>
                        <Button
                          size="small"
                          variant={editMode ? "contained" : "outlined"}
                          color={editMode ? "success" : "primary"}
                          startIcon={editMode ? <DoneIcon /> : <EditOutlinedIcon />}
                          onClick={toggleEditMode}
                        >
                          {editMode ? "Done" : "Edit"}
                        </Button>
                      </Tooltip>
                    )}

                  </>
                )} */}
              </Stack>
            ) : (
              // SM- : collapse into a More menu
              <>
                <IconButton aria-label="More actions" onClick={openMenu}>
                  <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={closeMenu}>
                  <MenuItem onClick={() => { setShowFilters((s) => !s); closeMenu(); }}>
                    <FilterAltIcon fontSize="small" style={{ marginRight: 8 }} /> {showFilters ? "Hide Filters" : "Show Filters"}
                  </MenuItem>
                  <MenuItem onClick={handleDownloadCsv}>
                    <DownloadIcon fontSize="small" style={{ marginRight: 8 }} /> Download CSV
                  </MenuItem>
                  {filtersApplied && (
                    <MenuItem onClick={handleClearFilters}>
                      <ClearAllIcon fontSize="small" style={{ marginRight: 8 }} /> Clear Filters
                    </MenuItem>
                  )}
                  {/* {canEdit && (
                    <MenuItem onClick={toggleEditMode}>
                      {editMode ? <DoneIcon fontSize="small" style={{ marginRight: 8 }} /> : <EditOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />}
                      {editMode ? "Done Editing" : "Edit Mode"}
                    </MenuItem>
                  )} */}
                </Menu>

              </>
            )}
          </Stack>

          {/* Filter status + counts */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: showFilters ? 1 : 2, minWidth: 0, flexWrap: "wrap" }}
          >
            <Typography variant="body2">
              Filters:{" "}
              {filtersApplied
                ? <Chip size="small" color="primary" label="Applied" />
                : <Chip size="small" variant="outlined" label="None" />}
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
              Showing {total} of {totalAll}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {filters.inward_number && <Chip size="small" label={`Inward ~ ${filters.inward_number}`} />}
              {filters.supplier_name && <Chip size="small" label={`Supplier ~ ${filters.supplier_name}`} />}
              {filters.admit !== "All" && <Chip size="small" label={`Admit = ${filters.admit}`} />}
              {filters.from && <Chip size="small" label={`From ${filters.from}`} />}
              {filters.to && <Chip size="small" label={`To ${filters.to}`} />}
            </Stack>
          </Stack>

          {/* Filters panel */}
          {showFilters && (
            <Box
              sx={{
                p: 1,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                mb: 2,
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                <TextField
                  size="small"
                  label="Inward Number"
                  value={filtersDraft.inward_number}
                  onChange={(e) => setFiltersDraft((f) => ({ ...f, inward_number: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Supplier Name"
                  value={filtersDraft.supplier_name}
                  onChange={(e) => setFiltersDraft((f) => ({ ...f, supplier_name: e.target.value }))}
                />
                <TextField
                  size="small"
                  select
                  label="Admit"
                  value={filtersDraft.admit}
                  onChange={(e) => setFiltersDraft((f) => ({ ...f, admit: e.target.value }))}
                  sx={{ minWidth: 160 }}
                >
                  {["All", "Approve", "Deny"].map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={filtersDraft.from}
                  onChange={(e) => setFiltersDraft((f) => ({ ...f, from: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  value={filtersDraft.to}
                  onChange={(e) => setFiltersDraft((f) => ({ ...f, to: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <Button size="small" variant="contained" onClick={handleApply}>
                  Apply
                </Button>
                {filtersApplied && <Button size="small" color="error" onClick={handleClearFilters}>Clear</Button>}
              </Stack>
            </Box>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* TABLE — scrolls inside the Paper */}
          <TableContainer
            sx={{
              height: { xs: "60dvh", sm: "70dvh" },
              width: "100%",
              minWidth: 0,
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            <Table stickyHeader size="small" sx={{ tableLayout: "fixed", minWidth: tableMinWidth }}>
              <TableHead sx={{ userSelect: "none" }}>
                <TableRow>
                  {columns.map((c) => {
                    const w = COL_WIDTH[c.field] ?? 140;
                    const isSorted = sortBy === c.field;
                    return (
                      <TableCell
                        key={c.field}
                        role="columnheader"
                        aria-sort={isSorted ? (sortDir === "ASC" ? "ascending" : "descending") : "none"}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleSort(c.field)}
                        sx={{ fontWeight: 700, fontSize: 13, minWidth: w, width: w, cursor: "pointer" }}
                        onClick={() => toggleSort(c.field)}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <span>{c.headerName}</span>
                          {isSorted ? (sortDir === "ASC" ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />) : null}
                        </Stack>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(columns.length, 1)}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
                        <CircularProgress size={18} /> <Typography sx={{ fontSize: 13 }}>Loading…</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(columns.length, 1)} align="center" sx={{ color: "error.main" }}>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={Math.max(columns.length, 1)} align="center">No records.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((c) =>
                        c.field === "__actions" ? (
                          <TableCell key="__actions" sx={{ minWidth: COL_WIDTH.__actions, width: COL_WIDTH.__actions }}>
                            {canEdit && editMode && (
                              <Tooltip title={rowIsDirty(row) ? "Save changes" : "No changes"}>
                                <span>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<SaveRounded />}
                                    onClick={() => saveRow(row)}
                                    disabled={!rowIsDirty(row)}
                                    aria-label={`Save changes for row ${row.inward_number}`}
                                  >
                                    Save
                                  </Button>
                                </span>
                              </Tooltip>
                            )}
                          </TableCell>
                        ) : (
                          <TableCell key={c.field} sx={{ minWidth: COL_WIDTH[c.field] ?? 140, width: COL_WIDTH[c.field] ?? 140 }}>
                            {renderCell(row, c)}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={() => {}}
            rowsPerPageOptions={[pageSize]}
          />
        </Paper>
      </Box>
    </div>
  );
}
