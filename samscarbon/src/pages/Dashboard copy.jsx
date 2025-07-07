import React, {useState,useEffect} from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import InteractiveLineChart from '../Components/Linechart';
import RawMaterialStock from '../Components/RawMaterialStock';
import LabTest from '../Components/LabTest';

const Dashboard = () => {

  const [stock, setStock] = useState(0); // ⬅️ Store total stock

  const handleStockCalculated = (value) => {
    setStock(value);
  };

  const renderChartCard = (Component, label) => (
    <Paper
      elevation={2}
      sx={{
        width: '450px',
        height: '300px',
        p: 1.5,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.grey[100],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems:"flex-start"
      }}
    >
      <Typography variant="caption" sx={{ mt: 1, textAlign: 'center',fontSize: 15 }}>
        {label}
      </Typography>
      <Component />
      
    </Paper>
  );

  const section = (title, components) => (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" sx={{ mb: 2, borderBottom: '1px solid #ccc' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {components.map(([Component, label], idx) => (
          <Grid item key={idx}>
            {renderChartCard(Component,label)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3}}>
      {section(`Charcoal In Stock : ${stock} kg`, [
        [() => <RawMaterialStock onStockCalculated={handleStockCalculated} />, 'Charcoal in stock'],
        [LabTest, 'Lab Test Results For Inward Stock'],
        
      ])}
    </Box>
  );
};

export default Dashboard;

  