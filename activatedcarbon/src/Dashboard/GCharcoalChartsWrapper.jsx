import { Box, Paper, Typography, Alert, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import GCharcoalCharts from './GCharcoalCharts';

export default function GCharcoalChartsWrapper() {
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/gcharcoal`, {
          withCredentials: true,
        });
        setData(res?.data?.data ?? {});
        setState({ loading: false, error: null });
      } catch (err) {
        setState({ loading: false, error: err.message || 'Unknown error' });
      }
    })();
  }, []);

  if (state.loading) return <Paper sx={{ p: 2 }}><LinearProgress /></Paper>;
  if (state.error)   return <Alert severity="error">Failed to load data: {state.error}</Alert>;

  return <GCharcoalCharts data={data} />;
}
