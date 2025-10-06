import React,{useState} from 'react';
import {Box} from '../../node_modules/@mui/material';
import CrusherPerformanceTab from './CrusherPerformanceTab';
import CrusherPerformanceTable from './CrusherDetails';

export default function CrushPerfTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <div style={{ display: "grid", gap: 12 ,width:'700px'}}>
    <Box>
      <h2>Charcoal Crusher Details</h2>
      <CrusherPerformanceTab onSuccess={handleRefreshTable}/>
      <CrusherPerformanceTable />
    </Box>
    </div>
  );
}
