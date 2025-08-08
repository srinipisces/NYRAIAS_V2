// DashboardFlow.jsx
import React from 'react';
import { Paper,Box, Grid, Typography} from '@mui/material';
import FlowStageBar from './FlowStageBar';
import GradeWiseStockChart from './GradeWiseStockChart';
import RawMaterialStock from './RawMaterialChart';
import KilnYieldCharts from './KilnYieldCharts';
import GCharcoalChartsWrapper from './GcharcoalChart';
const DummyBox = ({ label, color }) => (
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      border: `2px solid ${color}`,
      height: 200,
    }}
  >
    <Typography>{label}</Typography>
  </Paper>
);

const Dashboard = () => (
  <Box sx={{ px: 2, pt: 2 }}>
  <Typography variant="h5" gutterBottom>
    Production & Stock Dashboard
  </Typography>

  <FlowStageBar />

  {/* Grade + Raw Material Charts */}
  <Grid
    container
    spacing={2}
    sx={{ mt: 1 }}
    columns={12}
  >
    <Grid item xs={12} sm={4} md= {3} >
      <GradeWiseStockChart />
    </Grid>
    <Grid item xs={12} sm={8} md={9} >
     
        <RawMaterialStock />
      
    </Grid>
  </Grid>

  {/* Kiln Charts */}
  <Box sx={{ mt: 2 }}>
    <KilnYieldCharts />
  </Box>

  {/* GCharcoal Charts */}
  <Box sx={{ mt: 2 }}>
    <GCharcoalChartsWrapper />
  </Box>
</Box>


);

export default Dashboard;