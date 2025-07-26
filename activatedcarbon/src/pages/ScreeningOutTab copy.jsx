import React,{useState} from 'react';
import { Typography, Box } from '../../node_modules/@mui/material';
import ScreeningOutwardFormTab from '../FormsTab/ScreeningOutwardFormTab';
import ScreeningOutwardTable from '../Tables/ScreeningOutwardTable';
export default function ScreeningOutTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
    <h2>Screening Outward</h2>
    <ScreeningOutwardFormTab onSuccess={handleRefreshTable}/>
    <ScreeningOutwardTable key={refreshKey}/>
    </Box>
  );
}
