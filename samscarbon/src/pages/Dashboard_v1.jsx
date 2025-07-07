import React, {useState,useEffect} from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import InteractiveLineChart from '../Components/Linechart';
import RawMaterialStock from '../Components/RawMaterialStock';
import LabTest from '../Components/LabTest';

const API_URL = import.meta.env.VITE_API_URL+'/api/charcoalstock';  // your Express endpoint

const Dashboard = () => {

  const [data, setData] = useState([]);
  const [rawdata, setRawData] = useState([]);
  const [keys,setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stock, setStock] = useState(0);
  const [inwardData, setInwardData] = useState([]);
  
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(json => {
        setRawData(json.data)
        const totalWeight = json.data.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        setStock(totalWeight);
        
        
        const grouped = {};
  
        json.data.forEach(item => {
          const supplier = item.supplier_name;
          const inwardKey = item.inward_number.replace(/\s+/g, ''); // e.g. I976
          const weight = parseFloat(item.weight);
  
          if (!grouped[supplier]) {
            grouped[supplier] = { supplier_name: supplier };
          }
  
          grouped[supplier][inwardKey] = (grouped[supplier][inwardKey] || 0) + weight;
        });
  
        const chartData = Object.values(grouped);
        const allInwards = new Set(json.data.map(d => d.inward_number.replace(/\s+/g, '')));
      
        setData(chartData);
        setKeys(Array.from(allInwards));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  

  const labTestData = rawdata.map(({ inward_number, moisture, dust, ad_value }) => ({
    inward_number,
    moisture,
    dust,
    ad_value
  }));

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
      section(`Charcoal In Stock : ${stock} kg`, 
      [
        [RawMaterialStock, 'Charcoal in stock', { data, keys }],
        [LabTest, 'Lab Test Results For Inward Stock', { data: labTestData }],
      ]
    )
    }
    {
      section(`Granulated Charcoal In Stock : ${stock} kg`, 
      [
        [RawMaterialStock, 'Granulated Charcoal in stock', { data, keys }],
        [LabTest, 'Lab Test Results For Inward Stock', { data: labTestData }],
      ]
    )
    }
    </Box>
  );
};

export default Dashboard;

  