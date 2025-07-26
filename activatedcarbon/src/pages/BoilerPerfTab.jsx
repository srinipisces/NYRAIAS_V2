import {useState} from 'react';
import { Box } from '../../node_modules/@mui/material';
import BoilerPerformanceTab from '../FormsTab/BoilerPerformanceTab';
import BoilerPerformanceTable from '../Tables/BoilerPerformanceTable';
export default function BoilerPerfTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  
    const handleRefreshTable = () => {
      setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
    };
  return (
    <Box>
    <h2>Boiler Performance</h2>
    <BoilerPerformanceTab onSuccess={handleRefreshTable}/>
    <BoilerPerformanceTable key={refreshKey}/>
    </Box>
  );
}
