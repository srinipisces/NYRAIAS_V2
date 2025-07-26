import React,{useState} from 'react';
import {Box} from '../../node_modules/@mui/material';
import CrusherPerformanceTab from '../FormsTab/CrusherPerformanceTab';
import CrusherDetails from '../Tables/CrusherDetails';

export default function CrushPerfTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
      <h2>Charcoal Crusher Details</h2>
      <CrusherPerformanceTab onSuccess={handleRefreshTable}/>
      <CrusherDetails key={refreshKey}/>
    </Box>
  );
}
