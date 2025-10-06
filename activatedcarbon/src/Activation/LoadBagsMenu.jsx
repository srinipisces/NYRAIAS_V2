import * as React from "react";
import {
  Button,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Chip,
  Box,
  Divider,
  TextField,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import QrScannerDialog from "../QR/QrScannerDialog";
import { Snackbar, Alert, Stack } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., https://nyraias.com
  withCredentials: true,                 // <-- sends auth cookies
  timeout: 15000,
});
/**
 * Props:
 * - data?: Array<{ inward: string, bags: string[] }>
 * - onLoad: (bag: string, inward: string) => void
 * - buttonLabel?: string
 * - buttonProps?: object
 * - width?: number (popover width, default 360)
 * - maxHeight?: number (popover maxHeight, default 440)
 */
export default function LoadBagsMenu({
  data,
  onLoad,
  buttonLabel = "Load",
  buttonProps,
  width = 360,
  maxHeight = 440,
}) {


  function findBagInList(bagNo) {
    const source = remoteData || [];
    for (const row of source) {
      if (row?.bags?.includes(bagNo)) return { inward: row.inward, bag: bagNo };
    }
    return null;
  }

  const scanLockRef = React.useRef(false);

  async function handleScanDetected(rawText) {
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    // parse bag_no from QR: take text before first "|" and trim
    const bagNo = String(rawText ?? "").split("|", 1)[0].trim();
    if (!bagNo) { scanLockRef.current = false; return; }

    // close scanner FIRST so it stops re-firing
    setScannerOpen(false);

    const hit = findBagInList(bagNo);
    if (!hit) {
      alert("Not a valid bag to load");
      setTimeout(() => { scanLockRef.current = false; }, 300);
      return;
    }

    // hand off to parent (opens weight dialog)
    onLoad?.(hit.bag, hit.inward);

    // release lock shortly after
    setTimeout(() => { scanLockRef.current = false; }, 300);
    handleClose();
  }




  // Dummy data if none provided
  const fallback = React.useMemo(() => {
    const list = [];
    for (let i = 1001; i <= 1008; i++) {
      const inward = `I-${i}`;
      const bags = Array.from({ length: 6 }, (_, k) => `${inward}_Out_${k + 1}`);
      list.push({ inward, bags });
    }
    return list;
  }, []);

  const [remoteData, setRemoteData] = React.useState(null); // null = not fetched yet
  const [loading, setLoading] = React.useState(false);
  const [loadErr, setLoadErr] = React.useState(null);

  const handleOpen = async (e) => {
    setAnchorEl(e.currentTarget);
    try {
      setLoading(true);
      setLoadErr(null);
      const { data: grouped } = await api.get("/api/activation/inwardnumber_kilnfeed_bag_no_select");
      const list = Object.entries(grouped || {}).map(([inward, bags]) => ({
        inward,
        bags: Array.isArray(bags) ? bags : [],
      }));
      console.log(list);
      setRemoteData(list); // [] => “No bags to load”
    } catch (err) {
      setRemoteData([]);
      setLoadErr(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };




  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [snack, setSnack] = React.useState({ open: false, msg: "", severity: "info" });

  //const inwards = data && data.length ? data : fallback;
  //const inwards = remoteData ?? (data && data.length ? data : fallback);
  const inwards = remoteData ?? (data && data.length ? data : []); // fallback only if remoteData is null


  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [expanded, setExpanded] = React.useState(null); // inward key
  const [query, setQuery] = React.useState("");

  //const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    // keep expanded state between opens (feels nicer), or reset with: setExpanded(null)
  };

  const toggle = (key) => {
    setExpanded((prev) => (prev === key ? null : key)); // only one at a time
  };

  // basic filter (matches inward id or bag id)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inwards;
    return inwards
      .map((row) => ({
        inward: row.inward,
        bags: row.bags.filter(
          (b) => b.toLowerCase().includes(q) || row.inward.toLowerCase().includes(q)
        ),
      }))
      .filter((row) => row.bags.length > 0 || row.inward.toLowerCase().includes(q));
  }, [inwards, query]);

  const choose = (bag, inward) => {
    onLoad?.(bag, inward);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={handleOpen}
        {...buttonProps}
      >
        {buttonLabel}
      </Button>

      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow:
              "0 10px 24px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.08)",
          },
        }}
      >
        {/* Search bar */}
        <Box sx={{ p: 1, bgcolor: "background.paper", borderBottom: "1px solid #e6ebf1" }}>
          <Button
              size="small"
              variant="outlined"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScannerOpen(true)}
            >
              Scanner
            </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <TextField
              size="small"
              variant="standard"
              placeholder="Search inward or bag…"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
          </Box>
        </Box>

        {/* Scrollable list */}
        <Box sx={{ maxHeight, overflow: "auto" }}>

          {loading && (
                <Box sx={{ py: 2, textAlign: "center", fontSize: 14 }}>Loading…</Box>
              )}
              {!loading && !loadErr && remoteData && remoteData.length === 0 && (
                <Box sx={{ py: 2, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
                  No bags to load
                </Box>
              )}
              {!loading && loadErr && (
                <Box sx={{ py: 2, textAlign: "center", color: "error.main", fontSize: 14 }}>
                  {loadErr}
                </Box>
              )
            }

          <List disablePadding>
            {filtered.length === 0 && (
              <Box sx={{ py: 3, textAlign: "center", color: "text.secondary", fontSize: 14 }}>
                No matches
              </Box>
            )}

            {filtered.map(({ inward, bags }, idx) => {
              const isOpen = expanded === inward;
              return (
                <Box key={inward}>
                  <ListItemButton
                    onClick={() => toggle(inward)}
                    sx={{
                      py: 1,
                      "& .MuiListItemText-primary": { fontWeight: 700 },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: "text.secondary" }}>
                      <Inventory2OutlinedIcon fontSize="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary={inward}
                      secondary={`${bags.length} bag${bags.length === 1 ? "" : "s"}`}
                      secondaryTypographyProps={{ fontSize: 12, color: "text.secondary" }}
                    />

                    <Chip
                      size="small"
                      label={bags.length}
                      sx={{ mr: 1 }}
                      variant="outlined"
                    />
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Divider />
                    <List dense disablePadding>
                      {bags.map((bag) => (
                        <ListItemButton
                          key={bag}
                          sx={{
                            pl: 7,
                            pr: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => choose(bag, inward)}
                            aria-label={`Load ${bag}`}
                            sx={{
                              mr: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1.5,
                            }}
                          >
                            <ChevronLeftIcon fontSize="small" />
                          </IconButton>

                          <Box
                            sx={{
                              //fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                              fontSize: 13,
                              color: "text.primary",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={bag}
                          >
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
        </Box>
      </Popover>
      <QrScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        closeOnScan
        onDetected={handleScanDetected}
      />
    </>
  );
}



