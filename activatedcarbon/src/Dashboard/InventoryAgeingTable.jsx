import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const ageing = [
  { stage: 'Inward', count: 10, age: '3 days' },
  { stage: 'Exkiln', count: 7, age: '2 days' },
  { stage: 'Exkiln With Stone', count: 8, age: '1 day' },
];

export default function InventoryAgeingTable() {
  return (
    <Paper sx={{ p: 2, height: { xs: 'auto', sm: 350 }, width: '100%' }}>
      <Typography variant="subtitle1">Inventory Ageing</Typography>
      <Box component="table" sx={{ width: '100%', mt: 2, borderCollapse: 'collapse' }}>
        <Box component="thead">
          <Box component="tr">
            <Box component="th" sx={{ borderBottom: '1px solid #ccc', p: 1 }}>Stage</Box>
            <Box component="th" sx={{ borderBottom: '1px solid #ccc', p: 1 }}>No. of Bags</Box>
            <Box component="th" sx={{ borderBottom: '1px solid #ccc', p: 1 }}>Oldest Bag</Box>
          </Box>
        </Box>
        <Box component="tbody">
          {ageing.map((row, idx) => (
            <Box component="tr" key={idx}>
              <Box component="td" sx={{ p: 1 }}>{row.stage}</Box>
              <Box component="td" sx={{ p: 1 }}>{row.count}</Box>
              <Box component="td" sx={{ p: 1 }}>{row.age}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
