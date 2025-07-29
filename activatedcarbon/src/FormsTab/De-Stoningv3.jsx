import React, { useState } from "react";
import { Box, Button, Typography, Card, IconButton, Tabs, Tab } from "@mui/material";

const kilnData = {
  KOA: ["KOA_230725_1001", "KOA_230725_1002", "KOA_230725_1003"],
  KOB: ["KOB_230725_1004", "KOB_230725_1005"],
  KOC: ["KOC_230725_1006", "KOC_230725_1007"]
};

const MAX_LOADER = 6;

export default function DeStoningLoader() {
  const [activeTray, setActiveTray] = useState("KOA");
  const [trayItems, setTrayItems] = useState(kilnData);
  const [loaderItems, setLoaderItems] = useState([]);

  const handleTrayChange = (event, newValue) => {
    setActiveTray(newValue);
  };

  const handleLoad = (item) => {
    if (loaderItems.length >= MAX_LOADER) return;
    setTrayItems((prev) => ({
      ...prev,
      [activeTray]: prev[activeTray].filter((i) => i !== item)
    }));
    setLoaderItems((prev) => [...prev, item]);
  };

  const handleUnload = (item) => {
    setLoaderItems((prev) => prev.filter((i) => i !== item));
    setTrayItems((prev) => ({
      ...prev,
      [activeTray]: [...prev[activeTray], item]
    }));
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" gap={4} p={4}>
      {/* Tray Box */}
      <Card sx={{ width: 250, minHeight: 300, background: '#aaa', boxShadow: 4, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          
          <Typography variant="h6">{activeTray.replace("KO", "Kiln ")}</Typography>

        </Box>

        <Tabs
          value={activeTray}
          onChange={handleTrayChange}
          variant="fullWidth"
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Kiln A" value="KOA" />
          <Tab label="Kiln B" value="KOB" />
          <Tab label="Kiln C" value="KOC" />
        </Tabs>

        <Box mt={2}>
          {trayItems[activeTray].map((item) => (
            <Box key={item} display="flex" justifyContent="space-between" alignItems="center" mb={1} bgcolor="#ccc" p={1} borderRadius={1}>
              <Typography>{item}</Typography>
              <Button size="small" variant="contained" onClick={() => handleLoad(item)}>{">"}</Button>
            </Box>
          ))}
        </Box>
      </Card>

      {/* De-Stoner Loader Box */}
      <Card sx={{ width: 250, minHeight: 300, background: '#aaa', boxShadow: 4, p: 2 }}>
        <Typography variant="h6" mb={2}>De-Stoner</Typography>
        <Box>
          {loaderItems.map((item) => (
            <Box key={item} display="flex" alignItems="center" mb={1} bgcolor="#ccc" p={1} borderRadius={1}>
              <Button size="small" variant="contained" onClick={() => handleUnload(item)}>{"<"}</Button>
              <Typography ml={1}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
