import React,{useState} from 'react';
import FromLabTab from '../FormsTab/FromLabTab';
import LabTest from '../Tables/LabTest';
import { Typography ,Box} from '../../node_modules/@mui/material';
export default function LabTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
      <h2>Lab Test - Incoming Raw-Material</h2>
      <FromLabTab onSuccess={handleRefreshTable}/>
      <LabTest key={refreshKey}/>
    </Box>
  );
}
