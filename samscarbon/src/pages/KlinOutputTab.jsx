import React ,{useState} from 'react';
import { Typography ,Box} from '@mui/material';
import KilnOutputFormTab from '../FormsTab/KilnOutputFormTab';
import KilnOutputTable from '../Tables/KilnOutputTable';
export default function KlinOutputTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box><h2>Kiln Output</h2>
    <KilnOutputFormTab onSuccess={handleRefreshTable}/>
    <KilnOutputTable key={refreshKey} />
    </Box>
  );
}
