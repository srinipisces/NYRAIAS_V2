import React ,{useState} from 'react';
import { Typography ,Box} from '../../node_modules/@mui/material';
import KilnOutputQuality from '../FormsTab/KilnOutputQuality';
import KilnOutputTable from '../Tables/KilnOutputTable';
export default function KlinOutputQualityTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box><h2>Kiln Output</h2>
    <KilnOutputQuality onSuccess={handleRefreshTable}/>
    <KilnOutputTable key={refreshKey} />
    </Box>
  );
}
