import React, { useEffect, useState } from 'react';
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

export default function KilnYieldCharts() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard/kiln_yield_chart`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setData(res.data.data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err) {
        console.error("Failed to fetch kiln yield chart:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading kiln yield data
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: 'row',
        },
        gap: 2,
        width: '100%',
        overflowX: 'auto',
        pb: 2,
      }}
    >
      {Object.keys(data).map((kilnLabel) => {
        const kilnData = data[kilnLabel];
        const xAxisData = kilnData.map((entry) => entry.date);
        const yAxisData = kilnData.map((entry) => entry.yield);

        return (
          <Paper
            key={kilnLabel}
            sx={{
              p: 2,
              minWidth: 250,
              width: 250,
              flexShrink: 0,
              overflowX: 'hidden',
              backgroundColor: '#f6f8fa',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {`Yield Chart (${kilnLabel})`}
            </Typography>
            <LineChart
              xAxis={[
                {
                  scaleType: 'point',
                  data: xAxisData,
                  tickLabelStyle: { display: 'none' },
                },
              ]}
              yScale={{ type: 'linear', min: 0 }}
              series={[
                {
                  data: yAxisData,
                  label: kilnLabel,
                  color: '#1976d2',
                },
              ]}
              height={200}
              tooltip={{
                trigger: 'item',
                render: ({ dataIndex }) => {
                  const date = xAxisData[dataIndex];
                  const value = yAxisData[dataIndex];
                  return (
                    <Box sx={{ fontSize: '0.75rem', p: 1 }}>
                      <div><strong>Date:</strong> {date}</div>
                      <div><strong>Yield:</strong> {value}%</div>
                    </Box>
                  );
                },
              }}
            />
          </Paper>
        );
      })}
    </Box>
  );
}
