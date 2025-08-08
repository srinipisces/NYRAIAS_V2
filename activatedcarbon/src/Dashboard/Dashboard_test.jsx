import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';

const DummyBox = ({ label, color }) => (
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      border: `2px solid ${color}`,
      height: 200,
    }}
  >
    <Typography>{label}</Typography>
  </Paper>
);

export default function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Grid Layout Test
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DummyBox label="Left Box (xs=12 md=6)" color="green" />
        </Grid>
        <Grid item xs={12} md={6}>
          <DummyBox label="Right Box (xs=12 md=6)" color="blue" />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <DummyBox label="Chart A (xs=12 md=4)" color="red" />
        </Grid>
        <Grid item xs={12} md={4}>
          <DummyBox label="Chart B (xs=12 md=4)" color="orange" />
        </Grid>
        <Grid item xs={12} md={4}>
          <DummyBox label="Chart C (xs=12 md=4)" color="purple" />
        </Grid>
      </Grid>
    </Box>
  );
}
