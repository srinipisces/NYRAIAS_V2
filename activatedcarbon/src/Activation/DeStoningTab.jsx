import React, { useState } from 'react';
import { Divider ,Box} from '../../node_modules/@mui/material';
import DeStoningLoader from './De-Stoningv2';

export default function DeStoningTab() {

  const [refreshKey, setRefreshKey] = useState(0);
    const [searchText, setSearchText] = useState('');

  const handleRefreshTable = () => setRefreshKey(prev => prev + 1);
  const handleSearch = (text) => setSearchText(text);
  return (
    <Box>
      <h3>De-Stoning Out</h3>
      <DeStoningLoader/>
      
    </Box>
  );
}
