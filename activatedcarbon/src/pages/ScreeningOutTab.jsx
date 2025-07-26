import React, { useState } from 'react';
import { Box, Typography} from '@mui/material';
import ScreeningOutwardFormTab from '../FormsTab/ScreeningOutwardFormTab';
import ScreeningOutwardTable from '../Tables/ScreeningOutwardTable';
import SearchBar from './SearchBar'; // updated path

export default function ScreeningOutTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchText, setSearchText] = useState('');

  const handleRefreshTable = () => setRefreshKey(prev => prev + 1);
  const handleSearch = (text) => setSearchText(text);

  return (
    <Box>
      <Typography variant="h6">Screening Outward</Typography>
      <ScreeningOutwardFormTab onSuccess={handleRefreshTable} />
      <SearchBar onSearch={handleSearch} />
      <ScreeningOutwardTable key={refreshKey} searchText={searchText} />
    </Box>
  );
}
