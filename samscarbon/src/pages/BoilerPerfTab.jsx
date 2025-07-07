import React from 'react';
import { Typography,Box } from '@mui/material';
import BoilerPerformanceTab from '../FormsTab/BoilerPerformanceTab';
import BoilerPerformanceTable from '../Tables/BoilerPerformanceTable';
export default function BoilerPerfTab() {
  return (
    <Box>
    <h2>Boiler Performance</h2>
    <BoilerPerformanceTab />
    <BoilerPerformanceTable />
    </Box>
  );
}
