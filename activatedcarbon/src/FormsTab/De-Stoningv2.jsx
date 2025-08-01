import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Card, Tabs, Tab, useMediaQuery } from "@mui/material";
import axios from "axios";
import whitebag from './whitebag.jpg';
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

  return (
    <Box height="100%" display="flex" flexDirection="column" justifyContent="space-between">
      <Box display="flex" justifyContent="flex-start" alignItems="flex-start" gap={2} flexWrap="nowrap" flex={1} overflow="hidden">
        <Card sx={{ width: 250, minHeight: 250, maxHeight:250, background: '#aaa', boxShadow: 4, p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{activeTray.replace("KO", "Kiln ")}</Typography>
          </Box>

          <Tabs
            value={activeTray}
            onChange={handleTrayChange}
            variant="fullWidth"
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ minHeight: 36, height: 36 }}
          >
            <Tab label="Kiln A" value="KOA" sx={{ minHeight: 36, height: 36 }} />
            <Tab label="Kiln B" value="KOB" sx={{ minHeight: 36, height: 36 }} />
            <Tab label="Kiln C" value="KOC" sx={{ minHeight: 36, height: 36 }} />
          </Tabs>

          <Box mt={1} flex={1} overflow="auto">
            {trayItems[activeTray].map((item) => (
              <Box key={item.bag_no} display="flex" justifyContent="space-between" alignItems="center" mb={1} bgcolor="#ccc" p={0.5} borderRadius={1}>
                <Typography fontSize={isMobile ? '0.75rem' : '1rem'}>{item.bag_no}</Typography>
                <Button size="small" variant="contained" onClick={() => handleLoad(item)} sx={{ minWidth: 24 }}>{">"}</Button>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ width: 250, minHeight: 250, maxHeight: 250, background: '#aaa', boxShadow: 4, p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>De-Stoner</Typography>
            <Typography sx={{ fontSize: '0.9rem' }}>{Number(loadedWeight).toFixed(1)} kg</Typography>
            <Button
              disabled={isBusy || loading || loaderItems.length === 0}
              variant="contained"
              color="success"
              onClick={submitLoad}
              sx={{ minWidth: 60, height: 30, fontSize: '0.75rem' }}
            >
              {isBusy ? 'Running' : loading ? 'Loading...' : 'Load'}
            </Button>
          </Box>

          <Box flex={1} overflow="auto">
            {loaderItems.map((item) => (
              <Box key={item.bag_no} display="flex" alignItems="center" mb={1} bgcolor="#ccc" p={0.5} borderRadius={1}>
                <Button size="small" variant="contained" disabled={isBusy} onClick={() => handleUnload(item)} sx={{ minWidth: 24 }}>{"<"}</Button>
                <Typography ml={1} fontSize={isMobile ? '0.75rem' : '1rem'}>{item.bag_no}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {isBusy && (
        <Box mt={2} display="flex" flexDirection="column" alignItems="flex-start">
            <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
                <img src={whitebag} alt="Bag" style={{ height: '40px' }} />

                <Box display="flex" alignItems="center" gap={1}>
                    <Box>
                        <Typography fontSize="1rem">Enter Weight</Typography>
                        <input
                        type="number"
                        value={phase2Weight}
                        onChange={(e) => setPhase2Weight(e.target.value)}
                        placeholder="Weight Out"
                        style={{ width: '100px', padding: '4px' }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePhase2Submit}
                        disabled={creatingTag}
                        sx={{ height: '36px' }}
                    >
                        {creatingTag ? "Creating..." : "Create Tag"}
                    </Button>
                </Box>
            </Box>
        </Box>

      )}
    </Box>
  );
}
