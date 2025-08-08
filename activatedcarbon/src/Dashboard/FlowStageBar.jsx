// FlowStageBar.jsx
import React, { useEffect, useState } from 'react';
import { Paper, CircularProgress, Box, Alert, useTheme, useMediaQuery } from '@mui/material';
import FlowStageCard from './FlowStageCard';
import axios from 'axios';

const fallbackStages = [
  { label: 'Charcoal Stock', value: '-' },
  { label: 'GCharcoal Stock', value: '-' },
  { label: 'Exkiln With Stone', value: '-' },
  { label: 'Exkiln Without Stone', value: '-' },
  { label: 'Final Grade Stock', value: '-' },
];

export default function FlowStageBar() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stages`, { withCredentials: true });
        setStages(res.data.stages);
      } catch (err) {
        console.error("Failed to fetch stage data", err);
        setStages(fallbackStages);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>Error while retrieving data</Alert>}
      <Paper
        sx={{
          p: 2,
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
          backgroundColor: '#f6f8fa'
        }}
      >
        {stages.map((stage, idx) => (
          <Box
            key={idx}
            sx={{
              flex: isSmallScreen ? '1 1 calc(50% - 16px)' : '1 1 auto',
              minWidth: 150,
              maxWidth: isSmallScreen ? 'calc(50% - 16px)' : 'none',
            }}
          >
            <FlowStageCard
              label={stage.label}
              value={stage.value}
            />
          </Box>
        ))}
      </Paper>
    </>
  );
}
