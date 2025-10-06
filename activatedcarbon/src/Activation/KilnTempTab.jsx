import React,{useState} from 'react';
import { Typography,Box } from '../../node_modules/@mui/material';
import KilnTempForm from './KilnTempForm';
import KilnTempTable from './KilnTempTable';

export default function KilnTemp() {
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
        <h2>Kiln Temperature</h2>
        <KilnTempForm onSuccess={handleRefreshTable}/>
        <KilnTempTable key={refreshKey}/>
    </Box>
  );
}
