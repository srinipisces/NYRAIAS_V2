import React, { useState } from 'react';
import { Divider ,Box} from '../../node_modules/@mui/material';
import SearchBar from './SearchBar'
import DeStoningFormTab_out from '../FormsTab/DeStoningFormTab_out';
import DeStoningTable from '../Tables/De-StoningTable'; 

export default function DeStoningTab() {

  const [refreshKey, setRefreshKey] = useState(0);
    const [searchText, setSearchText] = useState('');

  const handleRefreshTable = () => setRefreshKey(prev => prev + 1);
  const handleSearch = (text) => setSearchText(text);
  return (
    <Box>
      <h3>De-Stoning Out</h3>
      <DeStoningFormTab_out onSuccess={handleRefreshTable}/>
      <SearchBar onSearch={handleSearch} />
      <DeStoningTable key={refreshKey}/>
    </Box>
  );
}
