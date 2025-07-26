import React,{useState} from 'react';
import { Typography ,Box} from '../../node_modules/@mui/material';
import MaterialOutwardTab from '../FormsTab/MaterialOutwardTab';
import MaterialOutwardTable from '../Tables/MaterialOutward';

export default function MatOutTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box sx={{pl:2}}>
    <h2>Material Outward</h2>
    <MaterialOutwardTab onSuccess={handleRefreshTable}/>
    <MaterialOutwardTable key={refreshKey}/>
    </Box>
  );
}
