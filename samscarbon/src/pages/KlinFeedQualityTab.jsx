import React ,{useState} from 'react';
import KilnFeedQualityFormTab from '../FormsTab/KilnFeedQualityFormTab';
import KilnfeedTable from '../Tables/KilnFeedTable';
import { Typography, Box } from '@mui/material';

export default function KlinFeedQualityTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box>
      <h2>Kiln Feed</h2>
      <KilnFeedQualityFormTab onSuccess={handleRefreshTable}/>
      <KilnfeedTable key={refreshKey} />
      {/* <LabTest key={refreshKey}/> */}
    </Box>
  );
}

