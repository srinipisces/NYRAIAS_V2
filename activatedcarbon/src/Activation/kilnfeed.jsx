import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import KilnTimelineMinutes from "./KilnTimelineMinutes";
import KilnOutputPanel from "./KilnOutputPanel";


export default function KilnArea() {
  const H = 260;

  // 'A' | 'B' | 'C'
  const OPTIONS = ["Kiln A", "Kiln B", "Kiln C"];
  const [kiln, setKiln] = useState(OPTIONS[0]); // first item
  // If any child needs the verbose label (e.g., for display)
  const kilnLabel = useMemo(() => `Kiln ${kiln}`, [kiln]);
  
  


  return (
    <Paper variant="outlined" sx={{ p: 1, mt: 2,width: { xs: '100%', md: 1000 } }}>
      {/* Header row: title + kiln selector */}
      <Stack
        direction="row"
        alignItems="center"
        //justifyContent="space-between"
        sx={{ mb: 1 }}
        spacing={2}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Kiln Load / Unload
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={kiln} onChange={(e) => setKiln(e.target.value)} >
            {OPTIONS.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Box
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          flex: "0 0 auto",
          minHeight: H,
        }}
      >
        {/* 6h @ 12 px/min => ~4320px wide */}
        <KilnTimelineMinutes
          minutesWindow={60 * 6}
          pxPerMin={12}
          height={H}
          kiln={kiln}          // pass 'A' | 'B' | 'C' for API queries
          kilnLabel={kilnLabel} // optional: if component wants "Kiln A/B/C" for display
        />
        <KilnOutputPanel
          kiln={kiln}
        />
      </Box>
    </Paper>
  );
}

