import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Box,
  IconButton,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function SearchBarWithStatus({ onSearch, onBulkUpdate }) {
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dynamically adjust status options
  useEffect(() => {
    const prefix = searchText.trim().charAt(0).toUpperCase();
    if (prefix === 'S') setStatusOptions(['Delivered', 'Screening']);
    else if (prefix === 'K') setStatusOptions(['Delivered']);
    else setStatusOptions([]);
    setStatus('');
  }, [searchText]);

  const handleSearchClick = () => {
    try {
      setError('');
      onSearch(searchText, status);
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong while filtering.');
    }
  };

  const handleBulkUpdateClick = () => {
    if (!searchText || !status) {
      setError('Both bag and status are required for bulk update.');
      return;
    }
    setError('');
    setConfirmOpen(true);
  };

  const confirmBulkUpdate = async () => {
    setConfirmOpen(false);
    try {
      await onBulkUpdate(searchText, status);
      setSearchText('');
      setStatus('');
      setStatusOptions([]);
    } catch (err) {
      console.error('Bulk update error:', err);
      setError('Something went wrong while updating stock.');
    }
  };

  return (
    <>
      <Box display="flex" gap={2} alignItems="flex-end" mb={2} flexWrap="wrap">
        <TextField
          label="Search Bag"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSearchClick}
          sx={{ mb: 0.5 }}
        >
          <FilterListIcon />
        </IconButton>

        <TextField
          select
          label="Select Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={statusOptions.length === 0}
          size="small"
          sx={{ minWidth: 180 }}
        >
          {statusOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          onClick={handleBulkUpdateClick}
          disabled={!searchText || !status}
          sx={{ fontSize: '0.75rem', padding: '4px 8px', height: 36 }}
        >
          Bulk Update
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Bulk Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update all matching bags to <strong>{status}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmBulkUpdate} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
