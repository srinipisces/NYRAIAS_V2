import React ,{useState} from 'react';
import { Typography ,Box} from '../../node_modules/@mui/material';
import DeStoningQualityForm from '../FormsTab/DeStoningQualityForm';
import DestoningOutTable from '../Tables/DestoningOutTable';
import SearchBar from './SearchBar';
export default function Re_Process_Quality() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchText, setSearchText] = useState('');
  const handleRefreshTable = () => {
    setRefreshKey(prev => prev + 1); // Force RawMaterialIncoming to re-render
  };
  
  const handleSearch = (text) => setSearchText(text);
  return (
    <Box><h2>Kiln Output</h2>
    <DeStoningQualityForm onSuccess={handleRefreshTable}/>
    <SearchBar onSearch={handleSearch} />
    <DestoningOutTable key={refreshKey} searchText={searchText} />
    </Box>
  );
}
