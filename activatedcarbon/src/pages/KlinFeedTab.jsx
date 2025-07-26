import React ,{useState} from 'react';
import KilnFeedTab from '../FormsTab/KilnFeedTab';
import KilnfeedTable from '../Tables/KilnFeedTable';
import { Typography, Box } from '../../node_modules/@mui/material';

export default function KlinFeedTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
      <h2>Kiln Feed</h2>
      <KilnFeedTab onSuccess={handleRefreshTable}/>
      <KilnfeedTable key={refreshKey} />
      {/* <LabTest key={refreshKey}/> */}
    </Box>
  );
}
