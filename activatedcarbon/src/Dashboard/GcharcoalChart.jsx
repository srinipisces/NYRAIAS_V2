import { Box, Paper, Typography, Alert } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ImpuritySmallMultiples from './ImpuritySmallMultiples';

export default function GCharcoalChartsWrapper() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/gcharcoal`, {
          withCredentials: true,
        });
        if (res.data?.data) setData(res.data.data);
        else throw new Error('Invalid API response structure');
      } catch (err) {
        console.error('Error fetching GCharcoal data:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography sx={{ p: 2 }}>Loading...</Typography>;
  if (error) return <Alert severity="error">Failed to load data: {error}</Alert>;

  return <GCharcoalCharts data={data} />;
}

function GCharcoalCharts({ data }) {
  const {
    GCharcoal_chartData = [],
    GCharcoal_chart_keys = [],
    GCharcoal_impurities_chart = [],
  } = data || {};

  return (
      <Paper sx={{
          p: 1,
          height: { xs: 'auto', sm: 350 },
          width: '100%',
          minWidth: 0,                // important in Grid/Flex
          backgroundColor: '#f6f8fa',
          overflowX: 'auto',
        }}>
        <Box sx={{p:2}} >
        <Typography variant="subtitle1">
          GC Stock 
        </Typography>
        <Box sx={{ height: 300 ,width:'100%',mt:2}}>
          <ResponsiveBar
            data={GCharcoal_chartData}
            keys={GCharcoal_chart_keys}
            enableGridX
            indexBy="supplier_name"
            groupMode="stacked"
            margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
            padding={0.3}
            colors={{ scheme: 'nivo' }}
            axisBottom={null}
            tooltip={({ id, value, indexValue }) => (
              <Box sx={{ p: 1, fontSize: '0.75rem',background: '#fff', border: '1px solid #ccc', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                <div><strong>{id}</strong>: {value} kg</div>
                <div><strong>Supplier:</strong> {indexValue}</div>
              </Box>
            )}
          />
        </Box>
        </Box>
      </Paper>

      
  
  );
}
