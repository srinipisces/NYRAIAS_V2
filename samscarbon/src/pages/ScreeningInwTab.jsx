import React,{useState} from 'react';
import { Typography ,Box} from '@mui/material';
import ScreeningInwardFormTab from '../FormsTab/ScreeningInwardFormTab';
import ScreeningInwardTable from '../Tables/ScreeningInwardTable';
export default function ScreeningInwTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box><h2>Screening Inward</h2>
    <ScreeningInwardFormTab onSuccess={handleRefreshTable}/>
    <ScreeningInwardTable key={refreshKey} /> 
    </Box>
  );
}
