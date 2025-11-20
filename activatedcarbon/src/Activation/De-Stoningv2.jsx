import React, { useState, useEffect,useCallback } from "react";
import { Box, Button, Typography, Card, Tabs, Tab, useMediaQuery } from "@mui/material";
import axios from "axios";
import whitebag from './whitebag.jpg';
import {
  Grid,
  Paper,
   Stack,
   Chip,
   Divider,
   IconButton,
   TextField,
   Snackbar,
   Alert,
   InputAdornment
 } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import QrScannerDialog from "../QR/QrScannerDialog.jsx";


const MAX_LOADER = 6;

export default function DeStoningLoader() {
  const [activeTray, setActiveTray] = useState("KOA");
  const [trayItems, setTrayItems] = useState({ KOA: [], KOB: [], KOC: [] });
  const [loaderItems, setLoaderItems] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [loadedWeight, setLoadedWeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phase2Weight, setPhase2Weight] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [scannerOpen, setScannerOpen] = useState(false);


  useEffect(() => {
    checkDeStonerStatus();
  }, []);

  const calculateWeight = (bags) => {
    return bags.reduce((sum, bag) => sum + (parseFloat(bag.weight) || 0), 0);
  };

  const checkDeStonerStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/destoning/status`, { withCredentials: true });
      if (res.data.busy) {
        setIsBusy(true);
        setLoaderItems(res.data.loaded_bags || []);
        setLoadedWeight(parseFloat(res.data.loaded_weight) || calculateWeight(res.data.loaded_bags || []));
        setTrayItems({ KOA: [], KOB: [], KOC: [] });
      } else {
        const trays = res.data.kiln_trays || { KOA: [], KOB: [], KOC: [] };
        setTrayItems(trays);
        setLoaderItems([]);
        setLoadedWeight(0);
      }
    } catch (err) {
      console.error("Failed to check De-Stoner status", err);
      alert("Error while loading");
    }
  };

  const handleTrayChange = (event, newValue) => {
    setActiveTray(newValue);
  };

  const handleLoad = (item) => {
    if (isBusy || loaderItems.length >= MAX_LOADER) return;
    setTrayItems((prev) => {
      return {
        ...prev,
        [activeTray]: prev[activeTray].filter((i) => i.bag_no !== item.bag_no)
      };
    });
    setLoaderItems((prev) => {
      const updated = [...prev, { ...item, sourceTray: activeTray }];
      setLoadedWeight(calculateWeight(updated));
      return updated;
    });
  };

  const handleUnload = (item) => {
    if (isBusy) return;
    setLoaderItems((prev) => {
      const updated = prev.filter((i) => i.bag_no !== item.bag_no);
      setLoadedWeight(calculateWeight(updated));
      return updated;
    });
    setTrayItems((prev) => ({
      ...prev,
      [item.sourceTray]: [...prev[item.sourceTray], item]
    }));
  };

  const submitLoad = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/destoning/load`,
        {
          loaded_bags: loaderItems.map(b => b.bag_no),
          loaded_weight: loadedWeight
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsBusy(true);
      }
    } catch (err) {
      console.error("Load failed:", err);
      alert(err.response?.data?.error || "Error while loading. Please try again.");
      setLoading(false);

    } finally {
      if (!isBusy) setLoading(false);
    }
  };

  const handlePhase2Submit = async () => {
    setCreatingTag(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/destoning/complete`, {
        destination: "",
        weight_out: parseFloat(phase2Weight),
        loaded_bags: loaderItems.map(b => b.bag_no)
      }, { withCredentials: true });

      if (res.data.success) {
        alert(`Tag created. Bag No: ${res.data.bag_no}`);
        setIsBusy(false);
        setLoaderItems([]);
        setPhase2Weight("");
        checkDeStonerStatus();
      }
    } catch (err) {
      console.error("Phase 2 failed:", err);
      alert("Error in creating tag.");
    } finally {
      setCreatingTag(false);
    }
  };
  const handleScanDetected = useCallback((raw) => {
    //const bagNo = String(raw || "").trim(); 
    const bagNo= String(raw ?? "").split("|", 1)[0].trim();
    console.log(bagNo);
    if (!bagNo) return;

    if (isBusy) return alert("Machine is busy.");
    if ((loaderItems?.length ?? 0) >= MAX_LOADER) return alert("Max 6 bags loaded.");

    // Find the bag in any tray
    const trays = ["KOA", "KOB", "KOC"];
    for (const tray of trays) {
      const found = (trayItems[tray] || []).find(b => b.bag_no === bagNo);
      if (found) {
        // If the item is in a different tray than currently active, switch first.
        if (tray !== activeTray) {
          setActiveTray(tray);
          // give React a tick to update the state, then load
          setTimeout(() => handleLoad(found), 0);
        } else {
          handleLoad(found);
        }
        return;
      }
    }

    alert(`Bag ${bagNo} not found in available trays.`);
  }, [isBusy, loaderItems, trayItems, activeTray, handleLoad]);

  return (
      <Box sx={{ p: 1 }}>
          {/* Header: title + status chips + summary + primary CTA */}
          {/* <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>De-Stoning – Machine</Typography>
                <Chip
                size="small"
                label={isBusy ? "BUSY" : "IDLE"}
                color={isBusy ? "warning" : "success"}
                variant={isBusy ? "filled" : "outlined"}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip size="small" label={`${loaderItems?.length ?? 0}/${MAX_LOADER} loaded`} variant="outlined" />
                <Chip size="small" label={`Total: ${Number(loadedWeight || 0).toFixed(2)} kg`} variant="outlined" />
                <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
                <Button
                size="small"
                variant="contained"
                disabled={isBusy || (loaderItems?.length ?? 0) === 0}
                onClick={() => {
                // Optional: keep just the middle-panel Load button as the primary action.
                // If you want the header button to trigger the same, call your existing handler here if applicable.
                // For UI parity, we keep this as a disabled/enabled indicator.
                }}
                >
                {isBusy ? "Running" : "Load"}
                </Button>
              </Stack>
            </Stack>
          </Paper> */}
          {/* 3-column layout on desktop; stacked on mobile */}
          <Grid container spacing={1.5}>
            {/* Left panel — Available Input Bags (Kiln Trays) */}
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 1, borderRadius: 3, height: { xs: 420, md: 560 }, display: "flex", flexDirection: "column" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Available Input Bags</Typography>
                  <Chip size="small" label={activeTray.replace("KO", "Kiln ")} />
                </Stack>

                {/* Kiln Tabs */}
                <Tabs
                  value={activeTray}
                  onChange={handleTrayChange}
                  variant="fullWidth"
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{ minHeight: 36, height: 36, mb: 1 }}
                >
                  <Tab label="Kiln A" value="KOA" sx={{ minHeight: 36, height: 36 }} />
                  <Tab label="Kiln B" value="KOB" sx={{ minHeight: 36, height: 36 }} />
                  <Tab label="Kiln C" value="KOC" sx={{ minHeight: 36, height: 36 }} />
                </Tabs>
                {/* Scrollable list */}
                <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
                  {(trayItems?.[activeTray] ?? []).map((item, idx) => (
                  <Paper key={`${item?.bag_no || idx}-avail`} variant="outlined" sx={{ p: 0.75, mb: 1, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Stack>
                      <Typography variant="body2" fontWeight={700}>{item?.bag_no}</Typography>
                      <Stack direction="row" spacing={0.75}>
                        <Chip size="small" label={`${Number(item?.weight || 0).toFixed(2)} kg`} variant="outlined" />
                    </Stack>
                  </Stack>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={isBusy || (loaderItems?.length ?? 0) >= MAX_LOADER}
                    onClick={() => handleLoad(item)}
                    sx={{ minWidth: 32 }}
                  >
                  {"→"}
                  </Button>
                  </Stack>
                  </Paper>
                  ))}
                </Box>
              </Paper>
            </Grid>
            {/* Middle panel — De-Stoner Loader */}
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 1, borderRadius: 3, height: { xs: 420, md: 560 }, width:{xs:'100%',md:300}, display: "flex", flexDirection: "column" }}>
                <Stack sx={{ mb: 1 }}>
                  {/* Row 1: Title + Scan button */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" width='100%'>
                    <Typography variant="subtitle2" fontWeight={700}>De-Stoner Loader  - </Typography>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<QrCodeScannerIcon />}
                      onClick={() => setScannerOpen(true)}
                      disabled={isBusy || (loaderItems?.length ?? 0) >= MAX_LOADER}
                    >
                      Scan
                    </Button>
                  </Stack>

                  {/* Row 2: Chips right-aligned */}
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                    <Chip size="small" label={`${loaderItems?.length ?? 0}/${MAX_LOADER}`} />
                    <Chip size="small" label={`${Number(loadedWeight || 0).toFixed(2)} kg`} variant="outlined" />
                  </Stack>
                </Stack>

                {/* Scrollable loaded list */}
                <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
                  {loaderItems?.map((item, idx) => (
                    <Paper key={`${item?.bag_no || idx}-loader`} variant="outlined" sx={{ p: 0.75, mb: 1, borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Stack>
                          <Typography variant="body2" fontWeight={700}>{item?.bag_no}</Typography>
                          <Stack direction="row" spacing={0.75}>
                            <Chip size="small" label={`${Number(item?.weight || 0).toFixed(2)} kg`} variant="outlined" />
                          </Stack>
                        </Stack>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          disabled={isBusy}
                          onClick={() => handleUnload(item)}
                          sx={{ minWidth: 32 }}
                        >
                          {"✕"}
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
                <Divider sx={{ my: 1 }} />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Total loaded</Typography>
                  <Chip size="small" label={`${Number(loadedWeight || 0).toFixed(2)} kg`} />
                </Stack>

                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={isBusy || (loaderItems?.length ?? 0) === 0}
                    onClick={submitLoad}
                    >
                    {isBusy ? "Running" : "Load"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
            {/* Right panel — Machine Status & Output (Phase 2) shown only when BUSY */}
            <Grid item xs={12} md={4} sx={{ display: isBusy ? "block" : { xs: "block", md: "none" } }}>
              <Paper variant="outlined" sx={{ p: 1, borderRadius: 3, height: { xs: 420, md: 560 }, display: "flex", flexDirection: "column" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Machine Status & Output</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label="L" />
                    <Chip size="small" label={`${Number(loadedWeight || 0).toFixed(2)} kg`} variant="outlined" />
                   </Stack>
                </Stack>

                {/* Small preview */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: 1, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                    <img src={whitebag} alt="bag" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                  <Typography    variant="caption" color="text.secondary">Create DS bag after entering output weight</Typography>
                </Box>
                {/* Output weight */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <TextField
                    size="small"
                    label="Output weight (kg)"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    value={phase2Weight}
                    onChange={(e) => setPhase2Weight(e.target.value)}
                    sx={{ mb: 1 }}
                    // fullWidth
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handlePhase2Submit}
                    disabled={creatingTag || !phase2Weight}
                    sx={{ height: 36 }}
                  >
                    {creatingTag ? "Creating…" : "Create Tag"}
                  </Button>
                </Stack>
                

                {/* Loaded bag recap (read-only) */}
                <Typography variant="caption" sx={{ mb: 0.5 }} color="text.secondary">Loaded bags</Typography>
                <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
                  {loaderItems?.map((bag, idx) => (
                    <Stack key={`${bag?.bag_no || idx}-recap`} direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Typography variant="body2" fontWeight={700}>{bag?.bag_no}</Typography>
                      <Chip size="small" label={`${Number(bag?.weight || 0).toFixed(2)} kg`} variant="outlined" />
                    </Stack>
                  ))}
                </Box>

                {/* <Divider sx={{ my: 1 }} /> */}

                
              </Paper>
            </Grid>
          </Grid>
          <QrScannerDialog
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            closeOnScan
            onDetected={(text) => handleScanDetected(text)}
          />

      </Box>
  );
}
