import React ,{useState} from 'react';
import { Typography ,Box} from '../../node_modules/@mui/material';
import DeStoningQualityForm from '../FormsTab/DeStoningQualityForm';
import KilnOutputTable from '../Tables/KilnOutputTable';
export default function DeStoningQuality() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  return (
    <Box><h2>Kiln Output</h2>
    <DeStoningQualityForm onSuccess={handleRefreshTable}/>
    <KilnOutputTable key={refreshKey} />
    </Box>
  );
}
