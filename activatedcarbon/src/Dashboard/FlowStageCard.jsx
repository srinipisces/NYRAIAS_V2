import React from 'react';
import { Box, Typography } from '@mui/material';

export default function FlowStageCard({ label, value, note }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="h6">{value}</Typography>
      {/* {note && <Typography fontSize={12}>{note}</Typography>} */}
    </Box>
  );
}
