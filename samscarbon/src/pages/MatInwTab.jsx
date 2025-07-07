import React, { useState } from 'react';
import { Typography ,Box} from '@mui/material';
import MaterialInwardTab from '../FormsTab/MaterialInwardTab';
import MaterialInward from '../Tables/MaterialInward';

export default function MetInwTab() {

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
      <h2>Raw-Material received at Gate</h2>
      <MaterialInwardTab onSuccess={handleRefreshTable}/>
      <MaterialInward key={refreshKey}/>
    </Box>
  );
}
