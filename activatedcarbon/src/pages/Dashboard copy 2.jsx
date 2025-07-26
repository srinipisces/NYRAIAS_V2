import React, {useState,useEffect} from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import InteractiveLineChart from '../Components/Linechart';
import RawMaterialStock from '../Components/RawMaterialStock';
import LabTest from '../Components/LabTest';

const API_URL = import.meta.env.VITE_API_URL+'/api/dashboard/rawmaterial';  // your Express endpoint

const Dashboard = () => {


  const [rawdata, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  
  useEffect(() => {
    fetch(API_URL,{
      method: 'GET', // or 'POST', 'PUT', etc.
      credentials: 'include', // 👈 REQUIRED to send cookies
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(json => {
        setRawData(json.data)
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  //console.log(rawdata,loading,API_URL);
  //console.log(rawdata.Charcoal_chart_keys);

  const Charcoal_chart_keys = rawdata.Charcoal_chart_keys;
  const Charcoal_chartdata = rawdata.Charcoal_chartData;
  const labTestData = rawdata.labTestData;


  const GCharcoal_chart_keys = rawdata.GCharcoal_chart_keys;
  const GCharcoal_chartdata = rawdata.GCharcoal_chartData;
  
  //console.log(Charcoal_chartdata, Charcoal_chart_keys);
  const renderChartCard = (Component, label, props = {}) => (
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
      <Component {...props} />
      
    </Paper>
  );

  const section = (title, components) => (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" sx={{ mb: 2, borderBottom: '1px solid #ccc' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
      {components.map(([Component, label, props = {}], idx) => (
          <Grid item key={idx}>
            {renderChartCard(Component, label, props)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3}}>
      {
      section(`Charcoal In Stock : ${rawdata.Charcoal_stock} kg`, 
      [
        [RawMaterialStock, 'Charcoal in stock', { data: Charcoal_chartdata, keys:Charcoal_chart_keys }],
        [LabTest, 'Lab Test Results For Inward Stock', { data:labTestData }],
      ]
    )
    }
    {
      section(`Granulated Charcoal In Stock : ${rawdata.GCharcoal_stock} kg`, 
      [
        [RawMaterialStock, 'Granulated Charcoal in stock', { data:GCharcoal_chartdata, keys:GCharcoal_chart_keys }],
        // [LabTest, 'Lab Test Results For Inward Stock', { data: labTestData }],
      ]
    )
    }
    </Box>
  );
};

export default Dashboard;

  