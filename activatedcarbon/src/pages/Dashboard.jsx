import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';

const stages = [
  { label: 'Raw Material', value: '18,400 kg' },
  { label: 'RMS Inward', value: '15,200 kg' },
  { label: 'RMS Outward', value: '12,600 kg' },
  { label: 'Kiln-Out', value: '4,300 kg', note: '2 days idle' },
  { label: 'De-Stoner', value: '2,700 kg' },
  { label: 'Screening', value: '1,200 kg' },
  { label: 'Final Grade Stock', value: '6,700 kg' },
];

const gradeData = [
  { grade: 'Grade A', fromDSO: 12400, direct: 4800 },
  { grade: 'Grade B', fromDSO: 8000, direct: 3100 },
  { grade: 'Stones', fromDSO: 4000, direct: 0 },
  { grade: 'Unscreened', fromDSO: 1600, direct: 0 },
];

const ageing = [
  { stage: 'Inward', count: 10, age: '3 days' },
  { stage: 'Exkiln', count: 7, age: '2 days' },
  { stage: 'Kiln-Out', count: 8, age: '1 day' },
  { stage: 'Screening', count: 5, age: '4 days' },
];

const FlowStageCard = ({ label, value, note }) => (
  <Box sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
    <Typography variant="subtitle2">{label}</Typography>
    <Typography variant="h6">{value}</Typography>
    {note && <Typography fontSize={12}>{note}</Typography>}
  </Box>
);

const GradeWiseStockChart = () => (
  <Paper sx={{ p: 2, height: { xs: 'auto', sm: 350 }, width: '100%' }}>
    <Typography variant="subtitle1">Grade-wise Stock vs Movement</Typography>
    {gradeData.map((g, idx) => (
      <Box key={idx} sx={{ mt: 2 }}>
        <Typography fontSize={14}>{g.grade}</Typography>
        <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden', bgcolor: '#ddd' }}>
          <Box sx={{ width: `${(g.fromDSO / (g.fromDSO + g.direct)) * 100}%`, bgcolor: 'skyblue' }} />
          <Box sx={{ width: `${(g.direct / (g.fromDSO + g.direct)) * 100}%`, bgcolor: 'orange' }} />
        </Box>
        <Typography fontSize={12}>
          From DSO: {g.fromDSO} kg | Direct: {g.direct} kg
        </Typography>
      </Box>
    ))}
  </Paper>
);

const InventoryAgeingTable = () => (
  <Paper sx={{ p: 2, height: { xs: 'auto', sm: 350 }, width: '100%' }}>
    <Typography variant="subtitle1">Inventory Ageing</Typography>
    <Box component="table" sx={{ width: '100%', mt: 2, borderCollapse: 'collapse' }}>
      <Box component="thead">
        <Box component="tr">
          <Box component="th" sx={{ borderBottom: '1px solid #ccc', p: 1 }}>Stage</Box>
          <Box component="th" sx={{ borderBottom: '1px solid #ccc', p: 1 }}>No. of Bags</Box>
          <Box component="th" sx={{ borderBottom: '1px solid #ccc', p: 1 }}>Oldest Bag</Box>
        </Box>
      </Box>
      <Box component="tbody">
        {ageing.map((row, idx) => (
          <Box component="tr" key={idx}>
            <Box component="td" sx={{ p: 1 }}>{row.stage}</Box>
            <Box component="td" sx={{ p: 1 }}>{row.count}</Box>
            <Box component="td" sx={{ p: 1 }}>{row.age}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Paper>
);

const DashboardFlow = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" gutterBottom>
      Production & Stock Dashboard
    </Typography>

    {/* Flow Bar - Single line on large screens */}
    <Paper
      sx={{
        p: 2,
        mb: 4,
        display: 'flex',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: 2,
        justifyContent: 'flex-start',
        overflowX: 'auto'
      }}
    >
      {stages.map((stage, idx) => (
        <FlowStageCard key={idx} {...stage} />
      ))}
    </Paper>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <GradeWiseStockChart />
      </Grid>

      <Grid item xs={12} md={6}>
        <InventoryAgeingTable />
      </Grid>
    </Grid>

    {/* Kiln Yield Charts - same row on large screens */}
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, width: '100%' }}>
          <Typography>Yield Chart 1 (Kiln A)</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, width: '100%' }}>
          <Typography>Yield Chart 2 (Kiln B)</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, width: '100%' }}>
          <Typography>Yield Chart 3 (Kiln C)</Typography>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardFlow;
