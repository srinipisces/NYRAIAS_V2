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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        width: '100%',
        flexWrap: 'wrap',
      }}
    >
      {/* Chart 1: GCharcoal Stock Supplier Wise */}
      <Paper sx={{ flex: 1, minWidth: { xs: '100%', sm: '0' }, p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          GCharcoal Stock Supplier Wise
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveBar
            data={GCharcoal_chartData}
            keys={GCharcoal_chart_keys}
            indexBy="supplier_name"
            groupMode="stacked"
            margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            padding={0.3}
            colors={{ scheme: 'nivo' }}
            tooltip={({ id, value, indexValue }) => (
              <Box sx={{ p: 1, fontSize: '0.75rem' }}>
                <div><strong>{id}</strong>: {value} kg</div>
                <div><strong>Supplier:</strong> {indexValue}</div>
              </Box>
            )}
          />
        </Box>
      </Paper>

      {/* Chart 2: Impurities as vertical stack of horizontal-bar charts */}
      <Paper sx={{ flex: 1, minWidth: { xs: '100%', sm: '0' }, p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Impurities (per Inward Number)
        </Typography>
        <ImpuritySmallMultiples raw={GCharcoal_impurities_chart} />
      </Paper>
    </Box>
  );
}
