// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { TextField, IconButton, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function SearchBar({ onSearch }) {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    onSearch(searchText);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{ mb: 2, flexWrap: 'nowrap',pt:2 }}
    >
      <TextField
        label="Search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="small"
        sx={{ width: 200 }} // 👈 adjust width as needed
      />
      <IconButton color="primary" onClick={handleSearch}>
        <FilterListIcon />
      </IconButton>
    </Box>
  );
}
