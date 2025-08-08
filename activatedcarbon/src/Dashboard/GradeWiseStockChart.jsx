import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import axios from 'axios';

const colors = ['skyblue', 'orange'];

export default function GradeWiseStockChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/dashboard/gradeinstock`, { withCredentials: true })
      .then(res => setData(res.data.data.grade_chartData || []))
      .catch(err => console.error('Error fetching grade data', err));
  }, []);

  return (
    <Paper sx={{ p: 2, height: '100%', width: '100%', boxSizing: 'border-box' ,overflowY:'auto',backgroundColor: '#f6f8fa'}}>
      <Typography variant="subtitle1">Grade-wise Stock</Typography>
      {data.map((g, idx) => (
        <Box key={idx} sx={{ mt: 2 }}>
          <Typography fontSize={14}>{g.grade}</Typography>
          <Box
            sx={{
              height: 20,
              borderRadius: 1,
              bgcolor: colors[idx % 2],
            }}
          />
          <Typography fontSize={12}>Weight: {g.weight} kg</Typography>
        </Box>
      ))}
    </Paper>
  );
}
