// DashboardFlow.jsx
import React from 'react';
import { Paper,Box, Grid, Typography} from '@mui/material';
import FlowStageBar from './FlowStageBar';
import GradeWiseStockChart from './GradeWiseStockChart';
import RawMaterialStock from './RawMaterialChart';
import KilnYieldCharts from './KilnYieldCharts';
import GCharcoalChartsWrapper from './GcharcoalChart';
import ImpuritiesChart from './ImpuritiesChart';
import RMSLossChart from './RMSLossChart';



const Dashboard = () => (
  <Box sx={{ px: 0, pt: 2 ,width: {xs:'100%',sm:1000}}}>
  <Typography variant="h5" gutterBottom>
    Production & Stock Dashboard
  </Typography>

  <FlowStageBar />

  {/* Grade + Raw Material Charts */}
  <Grid
    container
    spacing={3} columnSpacing={3}
  >
    <Grid  size={{xs:12,sm:5}}>
      <RawMaterialStock /> 
    </Grid>
    <Grid  size={{xs:12,sm:5}}> 
      <GCharcoalChartsWrapper /> 
    </Grid>
    <Grid  size={{xs:12,sm:2}}> 
      <GradeWiseStockChart />
    </Grid>
  </Grid>
  <Grid
    container
    spacing={1}
    sx={{mt:2}}
  >
    <Grid size={12} > 
    <ImpuritiesChart />
    </Grid>
    </Grid>
    <Grid
      container
      spacing={1}
      sx={{mt:2}}
    >
    <Grid size={12} > 
    <KilnYieldCharts />
    </Grid></Grid>
    <Grid
      container
      spacing={1}
      sx={{mt:2}}
    >
    <Grid size={12} > 
    <RMSLossChart />
    </Grid>
  </Grid>
  

</Box>


);

export default Dashboard;