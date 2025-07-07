import React, { useState } from 'react';
import { Typography ,Box} from '@mui/material';
import From_Security from '../FormsTab/FromSecurityTab';
import RawMaterialIncoming from '../Tables/RawMaterialIncoming'

export default function SecurityTab() {

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
      <h2>Raw-Material received at Gate</h2>
      <From_Security onSuccess={handleRefreshTable}/>
      <RawMaterialIncoming key={refreshKey}/>
    </Box>
  );
}
