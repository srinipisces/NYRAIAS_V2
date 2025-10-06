import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { AuthContext } from "../AuthContext";

/**
 * EditAccessDialog – grouped Operations incl. empty groups
 * Saves tokens as:
 *  - Top-level:        "Dashboard", "Settings", ...
 *  - Reports groups:   "Reports.<Group>"
 *  - Operations pages: "Operations.<Group>.<Page>"
 *  - Empty groups:     "Operations.<Group>"
 */
export default function EditAccessDialog({
  open,
  user,
  accessConfig = {},
  tokens,
  accountid,
  updatedBy,
  onClose,
  onUpdated,
  onSave,
}) {
  // --- AuthContext fallbacks ---
  const auth = useContext(AuthContext) || {};
  const ctxAccountId = auth?.accountid || auth?.user?.accountid || auth?.auth?.accountid;
  const ctxUserId = auth?.userid || auth?.user?.userid || auth?.auth?.userid;
  const ctxToken = auth?.token || auth?.accessToken || auth?.auth?.token;
  const apiBase = import.meta.env.VITE_API_URL;
  const resolvedAccountId = accountid ?? ctxAccountId;
  const resolvedUpdatedBy = updatedBy ?? ctxUserId;

   // --- Derived config ---
 const OP_GROUPS = accessConfig?.Operations || {};
 const REPORT_GROUPS = Array.isArray(accessConfig?.Reports) ? accessConfig.Reports : [];

  // ----- NEW: ordering from accessConfig (menu_structure) -----
  const META_KEYS = new Set(['menu_order', 'child_order']);

  // Top-level order: prefer menu_order, else keys (excluding meta)
  const TOP_ORDER = useMemo(() => {
    const menu = accessConfig || {};
    if (Array.isArray(menu.menu_order) && menu.menu_order.length) {
      return menu.menu_order.filter((k) => k in menu);
    }
    return Object.keys(menu).filter((k) => !META_KEYS.has(k));
  }, [accessConfig]);

  // Child order map (per section): e.g., { Operations: [...], Reports: [...] }
  const CHILD_ORDER = useMemo(() => {
    const m = accessConfig?.child_order;
    return (m && typeof m === 'object') ? m : {};
  }, [accessConfig]);

  // Reports groups in requested order (fallback to backend array order)
  const ORDERED_REPORT_GROUPS = useMemo(() => {
    const asked = Array.isArray(CHILD_ORDER.Reports) ? CHILD_ORDER.Reports : null;
    return asked ? asked.filter((g) => REPORT_GROUPS.includes(g)) : REPORT_GROUPS;
  }, [CHILD_ORDER, REPORT_GROUPS]);

  // Operations groups in requested order (fallback to object key order)
  const ORDERED_OP_GROUPS = useMemo(() => {
    const groups = OP_GROUPS || {};
    const asked = Array.isArray(CHILD_ORDER.Operations) ? CHILD_ORDER.Operations : null;
    return asked ? asked.filter((g) => Object.prototype.hasOwnProperty.call(groups, g))
                : Object.keys(groups);
  }, [CHILD_ORDER, OP_GROUPS]);


  const EMPTY_OP_GROUPS = useMemo(
    () =>
      Object.entries(OP_GROUPS)
        .filter(([, pages]) => !Array.isArray(pages) || pages.length === 0)
        .map(([g]) => g),
    [OP_GROUPS]
  );

  const ALL_OPERATIONS = useMemo(() => {
    const list = [];
    for (const pages of Object.values(OP_GROUPS)) {
      if (Array.isArray(pages)) list.push(...pages);
    }
    return list;
  }, [OP_GROUPS]);

  // --- Helpers to build initial state ---
  const buildEmptyTop = () => {
    const top = {};
    for (const key of Object.keys(accessConfig || {})) {
      if (key === "Operations" || key === "Reports") continue;
      top[key] = false;
    }
    return top;
  };

  const buildEmptyReports = () => {
    const rep = {};
    for (const g of REPORT_GROUPS) rep[g] = false;
    return rep;
  };

  const buildEmptyOpsPages = () => {
    const ops = {};
    for (const g of Object.keys(OP_GROUPS)) ops[g] = [];
    return ops;
  };

  const buildEmptyOpsGroups = () => {
    const groupsOnly = {};
    for (const g of EMPTY_OP_GROUPS) groupsOnly[g] = false;
    return groupsOnly;
  };

  const findOperationsGroupForPage = (page) => {
    for (const [group, pages] of Object.entries(OP_GROUPS)) {
      if (Array.isArray(pages) && pages.includes(page)) return group;
    }
    return null;
  };

  const computeTri = (opsPagesState, opsGroupsOnlyState, reportsState) => {
    // Ops global: count pages + empty-group toggles
    const totalOps = ALL_OPERATIONS.length + EMPTY_OP_GROUPS.length;
    const selectedOpsPages = Object.values(opsPagesState).reduce(
      (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    const selectedOpsGroups = Object.values(opsGroupsOnlyState || {}).filter(Boolean).length;
    const selectedOps = selectedOpsPages + selectedOpsGroups;
    const opsAll = totalOps > 0 && selectedOps === totalOps;
    const opsInd = selectedOps > 0 && selectedOps < totalOps;

    // Ops per group (pages groups tri-state; empty groups boolean)
    const groupTri = {};
    for (const [group, pages] of Object.entries(OP_GROUPS)) {
      const total = Array.isArray(pages) ? pages.length : 0;
      if (total > 0) {
        const picked = (opsPagesState?.[group] || []).length;
        groupTri[group] = { all: picked === total, ind: picked > 0 && picked < total };
      } else {
        const checked = !!opsGroupsOnlyState?.[group];
        groupTri[group] = { all: checked, ind: false };
      }
    }

    // Reports global
    const totalRep = REPORT_GROUPS.length;
    const selectedRep = Object.values(reportsState || {}).filter(Boolean).length;
    const repAll = totalRep > 0 && selectedRep === totalRep;
    const repInd = selectedRep > 0 && selectedRep < totalRep;

    return { opsAll, opsInd, groupTri, repAll, repInd };
  };

  // --- Parse tokens (new + legacy) -> state ---
  const parseTokens = (srcTokens = []) => {
    const top = buildEmptyTop();
    const reports = buildEmptyReports();
    const operations = buildEmptyOpsPages();
    const opsGroupsOnly = buildEmptyOpsGroups();

    for (const raw of srcTokens) {
      if (typeof raw !== "string") continue;
      const t = raw.trim();
      if (!t) continue;

      if (t.startsWith("Operations.")) {
        const rest = t.slice("Operations.".length);
        if (rest.includes(".")) {
          // New-format page token: Operations.<Group>.<Page>
          const [group, ...pageParts] = rest.split(".");
          const page = pageParts.join(".");
          if (group && page && Array.isArray(OP_GROUPS[group]) && OP_GROUPS[group].includes(page)) {
            if (!operations[group].includes(page)) operations[group].push(page);
          }
        } else {
          // Either group-level token (for empty groups) or legacy page token
          const group = rest;
          if (
            Object.prototype.hasOwnProperty.call(OP_GROUPS, group) &&
            (!Array.isArray(OP_GROUPS[group]) || OP_GROUPS[group].length === 0)
          ) {
            // Empty group toggle: Operations.<Group>
            opsGroupsOnly[group] = true;
          } else {
            // Legacy page token: Operations.<Page>
            const g = findOperationsGroupForPage(rest);
            if (g && Array.isArray(OP_GROUPS[g]) && OP_GROUPS[g].includes(rest)) {
              if (!operations[g].includes(rest)) operations[g].push(rest);
            }
          }
        }
      } else if (t.startsWith("Reports.")) {
        const group = t.slice("Reports.".length);
        if (Object.prototype.hasOwnProperty.call(reports, group)) reports[group] = true;
      } else if (t === "Reports") {
        // Legacy: treat as all reports selected
        for (const g of Object.keys(reports)) reports[g] = true;
      } else if (Object.prototype.hasOwnProperty.call(top, t)) {
        top[t] = true;
      }
    }

    const tri = computeTri(operations, opsGroupsOnly, reports);
    return { top, reports, operations, opsGroupsOnly, tri };
  };

  const [state, setState] = useState(() => parseTokens(tokens || user?.access || []));
  const [changed, setChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Re-init on open or input change
  useEffect(() => {
    if (!open) return;
    const src = Array.isArray(tokens) ? tokens : user?.access || [];
    const next = parseTokens(src);
    setState(next);
    setChanged(false);
    setErrorMsg("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.userid, ALL_OPERATIONS.length, REPORT_GROUPS.length, EMPTY_OP_GROUPS.length]);

  // ---- Handlers: Top-level
  const toggleTop = (cat) => {
    setState((prev) => {
      const top = { ...prev.top, [cat]: !prev.top[cat] };
      return { ...prev, top };
    });
    setChanged(true);
  };

  // ---- Handlers: Reports
  const toggleReportsParent = (checked) => {
    setState((prev) => {
      const reports = { ...prev.reports };
      for (const g of Object.keys(reports)) reports[g] = checked;
      const tri = computeTri(prev.operations, prev.opsGroupsOnly, reports);
      return { ...prev, reports, tri };
    });
    setChanged(true);
  };

  const toggleReportGroup = (group) => {
    setState((prev) => {
      const reports = { ...prev.reports, [group]: !prev.reports[group] };
      const tri = computeTri(prev.operations, prev.opsGroupsOnly, reports);
      return { ...prev, reports, tri };
    });
    setChanged(true);
  };

  // ---- Handlers: Operations
  const toggleOpsParent = (checked) => {
    setState((prev) => {
      const operations = buildEmptyOpsPages();
      const opsGroupsOnly = buildEmptyOpsGroups();
      if (checked) {
        for (const [group, pages] of Object.entries(OP_GROUPS)) {
          if (Array.isArray(pages) && pages.length > 0) operations[group] = [...pages];
        }
        for (const g of EMPTY_OP_GROUPS) opsGroupsOnly[g] = true;
      }
      const tri = computeTri(operations, opsGroupsOnly, prev.reports);
      return { ...prev, operations, opsGroupsOnly, tri };
    });
    setChanged(true);
  };

  const toggleOpsGroup = (group, checked) => {
    setState((prev) => {
      const operations = { ...prev.operations };
      const opsGroupsOnly = { ...prev.opsGroupsOnly };
      const pages = OP_GROUPS[group] || [];
      if (Array.isArray(pages) && pages.length > 0) {
        operations[group] = checked ? [...pages] : [];
      } else {
        opsGroupsOnly[group] = !!checked; // empty group -> boolean
      }
      const tri = computeTri(operations, opsGroupsOnly, prev.reports);
      return { ...prev, operations, opsGroupsOnly, tri };
    });
    setChanged(true);
  };

  const toggleOpsPage = (group, page) => {
    setState((prev) => {
      const current = new Set(prev.operations[group] || []);
      if (current.has(page)) current.delete(page);
      else current.add(page);
      const operations = { ...prev.operations, [group]: Array.from(current) };
      const tri = computeTri(operations, prev.opsGroupsOnly, prev.reports);
      return { ...prev, operations, tri };
    });
    setChanged(true);
  };

  // Build tokens to save
  const buildTokensToSave = () => {
    const out = [];
    // top-level
    for (const [k, v] of Object.entries(state.top || {})) if (v) out.push(k);
    // reports
    for (const [g, v] of Object.entries(state.reports || {})) if (v) out.push(`Reports.${g}`);
    // operations (grouped pages)
    for (const [g, pages] of Object.entries(state.operations || {})) {
      for (const p of pages) out.push(`Operations.${g}.${p}`);
    }
    // operations empty groups
    for (const [g, v] of Object.entries(state.opsGroupsOnly || {})) {
      if (v) out.push(`Operations.${g}`);
    }
    return out;
  };

  // Save
  const handleSave = async () => {
    const updatedTokens = buildTokensToSave();

    if (onSave) {
      try {
        setSaving(true);
        await Promise.resolve(onSave(updatedTokens));
        setSaving(false);
        setChanged(false);
        onUpdated?.(updatedTokens);
        onClose?.();
      } catch (e) {
        setSaving(false);
        setErrorMsg(e?.message || "Failed to save");
      }
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      if (!user?.userid) throw new Error("Missing user");

      const url = `${apiBase}/api/users/updateAccess/${resolvedAccountId ? `${resolvedAccountId}/` : ""}${user.userid}`;

      const body = { access: updatedTokens };
      if (resolvedUpdatedBy) body.updatedBy = resolvedUpdatedBy;

      const headers = { "Content-Type": "application/json" };
      if (ctxToken) headers["Authorization"] = `Bearer ${ctxToken}`; // optional; cookies still used

      const res = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);

      setSaving(false);
      setChanged(false);
      onUpdated?.(updatedTokens);
      onClose?.();
    } catch (e) {
      setSaving(false);
      setErrorMsg(e?.message || "Server error");
    }
  };

  // Render
  //const categories = Object.keys(accessConfig || {});
  const categories = TOP_ORDER;

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {user?.userid ? `Select Access – ${user.userid}` : "Select Access Pages"}
      </DialogTitle>
      <DialogContent dividers>
        {errorMsg && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {errorMsg}
          </Typography>
        )}

        {categories.map((category) => (
          <Box key={category}>
            {/* Reports (tri-state + groups) */}
            {category === "Reports" && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!state.tri?.repAll}
                      indeterminate={!!state.tri?.repInd}
                      onChange={(e) => toggleReportsParent(e.target.checked)}
                    />
                  }
                  label="Reports"
                />
                {ORDERED_REPORT_GROUPS.length > 0 && (
                  <Box sx={{ ml: 3 }}>
                    {ORDERED_REPORT_GROUPS.map((g) => (
                      <FormControlLabel
                        key={g}
                        control={
                          <Checkbox
                            checked={!!state.reports?.[g]}
                            onChange={() => toggleReportGroup(g)}
                          />
                        }
                        label={g}
                      />
                    ))}
                  </Box>
                )}
              </>
            )}

            {/* Operations (tri-state parent + tri-state per-group + pages / empty groups) */}
            {category === "Operations" && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!state.tri?.opsAll}
                      indeterminate={!!state.tri?.opsInd}
                      onChange={(e) => toggleOpsParent(e.target.checked)}
                    />
                  }
                  label="Operations"
                />
                <Box sx={{ ml: 3 }}>
                  {ORDERED_OP_GROUPS.map((group) => {
                    const pages = OP_GROUPS[group];
                    const hasPages = Array.isArray(pages) && pages.length > 0;
                    const gtri = state.tri?.groupTri?.[group] || { all: false, ind: false };
                    const checkedEmpty = !!state.opsGroupsOnly?.[group];
                    return (
                      <Box key={group} sx={{ mb: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={hasPages ? !!gtri.all : checkedEmpty}
                              indeterminate={hasPages ? !!gtri.ind : false}
                              onChange={(e) => toggleOpsGroup(group, e.target.checked)}
                            />
                          }
                          label={group}
                        />
                        {hasPages && (
                          <Box sx={{ ml: 3 }}>
                            {pages.map((page) => (
                              <FormControlLabel
                                key={`${group}::${page}`}
                                control={
                                  <Checkbox
                                    checked={(state.operations?.[group] || []).includes(page)}
                                    onChange={() => toggleOpsPage(group, page)}
                                  />
                                }
                                label={page}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}

            {/* Simple top-level (everything except Reports/Operations) */}
            {category !== "Reports" && category !== "Operations" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!state.top?.[category]}
                    onChange={() => toggleTop(category)}
                  />
                }
                label={category}
              />
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!changed || saving}>
          {saving ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} /> Saving...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
