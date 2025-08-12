import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LineChart } from '@mui/x-charts';
import axios from 'axios';

const COLORS = ['#1976d2', '#2e7d32', '#ef6c00']; // A, B, C (extend if more)

export default function KilnYieldCharts() {
  const [series, setSeries] = useState([]);
  const [xData, setXData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/kiln_yield_chart`,
          { withCredentials: true }
        );
        if (!res?.data?.success) throw new Error('API returned unsuccessful response');

        const obj = res.data.data || {}; // { "Kiln A": [{date,yield},...], "Kiln B": [...], ... }

        // Build a unified, ordered list of dates (keep first-seen order)
        const dateList = [];
        const seen = new Set();
        Object.values(obj).forEach((rows) => {
          (rows || []).forEach(({ date }) => {
            if (date != null && !seen.has(date)) {
              seen.add(date);
              dateList.push(date);
            }
          });
        });

        // Build one series per kiln, aligning to xData (null for missing)
        const kilnNames = Object.keys(obj);
        const nextSeries = kilnNames.map((name, i) => {
          const map = new Map((obj[name] || []).map((r) => [r.date, Number(r.yield)]));
          return {
            label: name,
            data: dateList.map((d) => (map.has(d) ? map.get(d) : null)),
            color: COLORS[i % COLORS.length],
            showMark: true,
          };
        });

        setXData(dateList);
        setSeries(nextSeries);
        setError(null);
      } catch (err) {
        setError(err?.message || 'Failed to load kiln yield data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading kiln yield data: {error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3, bgcolor: '#f6f8fa', width:'100%', height: 350 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Kiln Yield (All Kilns)
      </Typography>
      
      <LineChart
        xAxis={[
          {
            scaleType: 'point',
            data: xData,
            tickLabelStyle: {
              fontSize: isSmallScreen ? 10 : 12,
              angle: isSmallScreen ? -45 : 0,
              textAnchor: isSmallScreen ? 'end' : 'middle',
            },
          },
        ]}
        yScale={{ type: 'linear', min: 0 }} // add max: 100 if yield is % out of 100
        series={series}
        height={isSmallScreen ? 260 : 300}
        grid={{ vertical: true, horizontal: true }}
        tooltip={{ trigger: 'axis' }} // shows all kiln values for the hovered date
        margin={{ left: 0, right: 35, top: 8, bottom: isSmallScreen ? 10 : 5 }}
      />
      
    </Paper>
  );
}
