import React, { useState } from "react";
import { Box, Button, Typography, Card, Tabs, Tab, useMediaQuery } from "@mui/material";

const kilnData = {
  KOA: ["KOA_230725_1001", "KOA_230725_1002", "KOA_230725_1003","KOA_230725_1004", "KOA_230725_1005", "KOA_230725_1006","KOA_230725_1007", "KOA_230725_1008", "KOA_230725_1009","KOA_230725_1010", "KOA_230725_1011", "KOA_230725_1012","KOA_230725_1013", "KOA_230725_1014", "KOA_230725_1015"],
  KOB: ["KOB_230725_1004", "KOB_230725_1005"],
  KOC: ["KOC_230725_1006", "KOC_230725_1007"]
};

const MAX_LOADER = 6;
const BOX_HEIGHT = 56 * MAX_LOADER + 32; // ~item height * 6 + padding

export default function DeStoningLoader() {
  const [activeTray, setActiveTray] = useState("KOA");
  const [trayItems, setTrayItems] = useState(kilnData);
  const [loaderItems, setLoaderItems] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleTrayChange = (event, newValue) => {
    setActiveTray(newValue);
  };

  const handleLoad = (item) => {
    if (loaderItems.length >= MAX_LOADER) return;
    setTrayItems((prev) => {
      const trayKey = item.slice(0, 3);
      return {
        ...prev,
        [trayKey]: prev[trayKey].filter((i) => i !== item)
      };
    });
    setLoaderItems((prev) => [...prev, item]);
  };

  const handleUnload = (item) => {
    const trayKey = item.slice(0, 3);
    setLoaderItems((prev) => prev.filter((i) => i !== item));
    setTrayItems((prev) => ({
      ...prev,
      [trayKey]: [...prev[trayKey], item]
    }));
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      gap={2}
      p={2}
      flexWrap="nowrap"
      sx={{ flexDirection: isMobile ? "row" : "row" }}
    >
      {/* Tray Box */}
      <Card
        sx={{
          flex: 1,
          background: '#aaa',
          boxShadow: 4,
          p: 1,
          minWidth: 0,
          height: BOX_HEIGHT,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
          <Typography variant="h6">{activeTray.replace("KO", "Kiln ")}</Typography>
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
            <Box key={item} display="flex" justifyContent="space-between" alignItems="center" mb={1} bgcolor="#ccc" p={0.5} borderRadius={1}>
              <Typography fontSize={isMobile ? '0.75rem' : '1rem'}>{item}</Typography>
              <Button size="small" variant="contained" onClick={() => handleLoad(item)}>{">"}</Button>
            </Box>
          ))}
        </Box>
      </Card>

      {/* De-Stoner Loader Box */}
      <Card
        sx={{
          flex: 1,
          background: '#aaa',
          boxShadow: 4,
          p: 1,
          minWidth: 0,
          height: BOX_HEIGHT,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box display="flex" justifyContent="flex-start" alignItems="center" mb={1}>
          <Typography variant="h6" textAlign="center" mb={1} >De-Stoner</Typography>
        </Box>
        <Box flex={1} overflow="auto">
          {loaderItems.map((item) => (
            <Box key={item} display="flex" alignItems="center" mb={1} bgcolor="#ccc" p={0.5} borderRadius={1}>
              <Button size="small" variant="contained" onClick={() => handleUnload(item)}>{"<"}</Button>
              <Typography ml={1} fontSize={isMobile ? '0.75rem' : '1rem'}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
