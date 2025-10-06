import React ,{useState} from 'react';
import KilnFeedQualityFormTab from './KilnFeedQualityFormTab';
import KilnFeedQualityTable from './KilnFeedQualityTable';
import { Typography, Box } from '../../node_modules/@mui/material';

export default function KlinFeedQualityTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    
    <Box
      sx={{
        width: { xs: "100%", sm: 800 },
      }}
    >
      
      <h2>Kiln Feed Quality</h2>
      <KilnFeedQualityFormTab onSuccess={handleRefreshTable}/>
      <KilnFeedQualityTable key={refreshKey} />
      {/* <LabTest key={refreshKey}/> */}
     
    </Box>
    
  );
}

