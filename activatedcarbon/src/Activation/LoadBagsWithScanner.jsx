import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import axios from "axios";

/**
 * LoadBagsWithScanner — fresh component that embeds an inline QR scanner INSIDE the list dialog.
 *
 * API intentionally mirrors your existing component so post/weight flow in parent stays the same:
 *   - onLoad(bag: string, inward: string): parent opens weight dialog & posts — no change
 *   - open, onClose: control the main dialog
 *   - width?: dialog paper width (default 520)
 *   - maxHeight?: list max height (default 440)
 *   - fetchBags?: () => Promise<Array<{ inward: string, bags: string[] }>> (optional override)
 *
 * All scanner lifecycle+guards are internal. Scanner closes ONLY when a VALID bag is found;
 * dialog remains open. To scan another bag, user presses Scan again — same UX as now.
 */
export default function LoadBagsWithScanner({
  open,
  onClose,
  onLoad,
  width = 520,
  maxHeight = 440,
  fetchBags,
}) {
  // ---------- data state ----------
  const [loading, setLoading] = React.useState(false);
  const [loadErr, setLoadErr] = React.useState("");
  const [remoteData, setRemoteData] = React.useState([]); // [{ inward, bags: [] }]
  const [expanded, setExpanded] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [toast, setToast] = React.useState({ open: false, msg: "", severity: "success" });
  const showToast = (msg, severity = "success") => setToast({ open: true, msg, severity });
  // ---------- scanner state ----------
  const [scanMode, setScanMode] = React.useState(false);
  const scanLockRef = React.useRef(false);

  // ---------- fetch bags (same endpoint, overridable) ----------
  const api = React.useMemo(() => axios.create({
    baseURL: import.meta.env?.VITE_API_URL || "",
    withCredentials: true,
    timeout: 15000,
  }), []);

  const defaultFetch = React.useCallback(async () => {
    const { data: grouped } = await api.get("/api/activation/inwardnumber_kilnfeed_bag_no_select");
    const list = Object.entries(grouped || {}).map(([inward, bags]) => ({
      inward,
      bags: Array.isArray(bags) ? bags : [],
    }));
    return list;
  }, [api]);

  const doFetch = React.useCallback(async () => {
    try {
      setLoading(true); setLoadErr("");
      const list = await (fetchBags ? fetchBags() : defaultFetch());
      setRemoteData(Array.isArray(list) ? list : []);
    } catch (err) {
      setLoadErr(err?.message || String(err));
      setRemoteData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchBags, defaultFetch]);

  React.useEffect(() => { if (open) doFetch(); }, [open, doFetch]);

  const inwards = remoteData;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inwards;
    return inwards
      .map((row) => ({
        inward: row.inward,
        bags: (row.bags || []).filter((b) => b.toLowerCase().includes(q) || row.inward.toLowerCase().includes(q)),
      }))
      .filter((row) => row.bags.length > 0 || row.inward.toLowerCase().includes(q));
  }, [inwards, query]);

  const available = React.useMemo(() => {
    const rows = [];
    (remoteData || []).forEach(({ inward, bags }) => (bags || []).forEach((bag) => rows.push({ inward, bag })));
    return rows;
  }, [remoteData]);

  const removeFromList = React.useCallback((bag, inward) => {
    setRemoteData(prev =>
      (prev || []).map(g =>
        g.inward === inward ? { ...g, bags: (g.bags || []).filter(b => b !== bag) } : g
      ).filter(g => (g.bags || []).length > 0)  // drop empty groups
    );
  }, []);

  const findBagInList = React.useCallback((bagNo) => (
    available.find((r) => r.bag === bagNo) || null
  ), [available]);

  // ---------- inline scanner implementation ----------
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const barcodeCtlRef = React.useRef(null);
  const cancelledRef = React.useRef(false);

  const stopCamera = React.useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
    try { barcodeCtlRef.current?.stop?.(); } catch {}
    barcodeCtlRef.current = null;
    const s = streamRef.current; if (s) { try { s.getTracks().forEach((t) => t.stop()); } catch {} }
    streamRef.current = null;
    const v = videoRef.current; if (v) { try { v.pause(); } catch {}; v.srcObject = null; }
  }, []);

  React.useEffect(() => {
    cancelledRef.current = false;
    if (!scanMode) { stopCamera(); return; }

    const startNative = async () => {
      if (!("BarcodeDetector" in window)) return false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        });
        if (cancelledRef.current) { stream.getTracks().forEach((t) => t.stop()); return false; }
        streamRef.current = stream;

        const video = videoRef.current;
        video.setAttribute("playsinline", "true");
        video.muted = true; video.autoplay = true;
        video.srcObject = stream;
        await new Promise((resolve) => {
          if (video.readyState >= 1) return resolve();
          const onMeta = () => { video.removeEventListener("loadedmetadata", onMeta); resolve(); };
          video.addEventListener("loadedmetadata", onMeta);
        });
        try { await video.play(); } catch {}

        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelledRef.current) return;
          const v = videoRef.current, c = canvasRef.current;
          if (!v || !c || v.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }
          c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(v, 0, 0, c.width, c.height);
          try {
            const results = await detector.detect(c);
            if (results?.length) {
              const value = results[0]?.rawValue || "";
              if (value) { onDetected(value); return; }
            }
          } catch {}
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return true;
      } catch { return false; }
    };

    const startZXing = async () => {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const { BarcodeFormat, DecodeHintType } = await import("@zxing/library");
      const reader = new BrowserMultiFormatReader();
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      const ctl = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } } },
        videoRef.current,
        (result) => {
          if (cancelledRef.current) return;
          if (result) {
            const value = result.getText?.() ?? String(result?.text || "");
            if (value) onDetected(value);
          }
        }
      );
      barcodeCtlRef.current = ctl;
    };

    (async () => { stopCamera(); const ok = await startNative(); if (!ok) await startZXing(); })();
    return () => { cancelledRef.current = true; stopCamera(); };
  }, [scanMode, stopCamera]);

  const onDetected = React.useCallback(async (rawText) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    const bagNo = String(rawText ?? "").split("|", 1)[0].trim();
    if (!bagNo) { return void setTimeout(() => (scanLockRef.current = false), 200); }
    const hit = findBagInList(bagNo);
    if (!hit) {
      //alert(`${bagNo} is not in the available list`);
      showToast(`${bagNo} is not in the available list`, "error");
      return void setTimeout(() => (scanLockRef.current = false), 300);
    }
    // valid → close scanner UI and open weight dialog
   //setScanMode(false); // this stops camera via effect
   //openWeightDialog(hit.bag, hit.inward);
   //setTimeout(() => (scanLockRef.current = false), 300);
   // valid → close scanner, then run the same onLoad flow
   setScanMode(false); // stops camera
   try {
     const ok = await onLoad?.(hit.bag, hit.inward);
     if (ok !== false) {
       removeFromList(hit.bag, hit.inward);
       showToast(`Loaded ${hit.bag}`, "success");
     } else {
       showToast(`Failed to load ${hit.bag}`, "error");
     }
   } catch (err) {
     showToast(err?.message || `Failed to load ${hit.bag}`, "error");
   } finally {
     setTimeout(() => (scanLockRef.current = false), 300);
   }
  }, [findBagInList, onLoad]);

  // ---------- UI ----------
  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (scanMode && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose?.();
      }}
      onKeyDown={(e) => { if (scanMode && e.key === "Escape") { e.stopPropagation(); e.preventDefault(); } }}
      slotProps={{ backdrop: { onMouseDown: (e) => { if (scanMode) e.stopPropagation(); } } }}
      fullWidth
      maxWidth="sm"
      keepMounted
      disableRestoreFocus
      disableAutoFocus
      PaperProps={{ sx: { width } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Load Bags
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip size="small" label={`${available.length} bags`} />
          <Tooltip title={scanMode ? "Scanner active" : "Scan a bag"}>
            <span>
              <Button
                size="small"
                variant={scanMode ? "contained" : "outlined"}
                startIcon={<QrCodeScannerIcon />}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTimeout(() => setScanMode((v) => !v), 0); }}
              >
                {scanMode ? "Stop" : "Scan"}
              </Button>
            </span>
          </Tooltip>
          <IconButton onClick={() => { if (!scanMode) onClose?.(); }} aria-label="close" size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Scanner panel */}
        {scanMode && (
          <Box sx={{ p: 1, borderBottom: "1px solid #e6ebf1" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ fontWeight: 600, fontSize: 14 }}>Scan a bag</Box>
              <Button size="small" variant="outlined" onClick={() => setScanMode(false)}>Back to list</Button>
            </Box>
            <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", background: "#000" }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", display: "block" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 2 }} />
            </Box>
          </Box>
        )}

        {/* Search */}
        <Box sx={{ p: 1, borderBottom: "1px solid #e6ebf1" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search inward or bag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* List */}
        <Box sx={{ maxHeight, overflow: "auto" }}>
          {loading && (
            <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>Loading…</Box>
          )}
          {!loading && loadErr && (
            <Box sx={{ py: 2, textAlign: "center", color: "error.main", fontSize: 14 }}>{loadErr}</Box>
          )}
          {!loading && !loadErr && filtered.length === 0 && (
            <Box sx={{ py: 3, textAlign: "center", color: "text.secondary", fontSize: 14 }}>No bags to load</Box>
          )}
          {!loading && !loadErr && filtered.length > 0 && (
            <List disablePadding>
              {filtered.map(({ inward, bags }, idx) => {
                const isOpen = expanded === inward;
                return (
                  <Box key={inward}>
                    <ListItemButton onClick={() => setExpanded((p) => (p === inward ? null : inward))}>
                      <ListItemIcon sx={{ minWidth: 34, color: "text.secondary" }}>
                        <Inventory2OutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={inward}
                        secondary={`${bags.length} bag${bags.length === 1 ? "" : "s"}`}
                        secondaryTypographyProps={{ fontSize: 12, color: "text.secondary" }}
                      />
                      <Chip size="small" label={bags.length} sx={{ mr: 1 }} variant="outlined" />
                      {isOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Divider />
                      <List dense disablePadding>
                        {bags.map((bag) => (
                          <ListItemButton key={bag} sx={{ pl: 7, pr: 1, display: "flex", gap: 1 }}>
                             <IconButton
                                size="small"
                                onClick={async () => {
                                  try {
                                    const ok = await onLoad?.(bag, inward);
                                    if (ok !== false) {
                                      removeFromList(bag, inward);
                                      showToast(`Loaded ${bag}`, "success");
                                    } else {
                                      showToast(`Failed to load ${bag}`, "error");
                                    }
                                  } catch (err) {
                                    showToast(err?.message || `Failed to load ${bag}`, "error");
                                  }
                                }}
                                aria-label={`Load ${bag}`}
                                sx={{ mr: 1, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
                              >
                              <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                            <Box sx={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={bag}>
                              {bag}
                            </Box>
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                    {idx !== filtered.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={() => { if (!scanMode) onClose?.(); }}>Close</Button>
      </DialogActions>
      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast(s => ({ ...s, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>

    </Dialog>
  );
}
