import React, { useState, useEffect } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, Button, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const tabOptions = [
  "Kiln",
  "Rotary",
  "Screening Outward - grade",
  "Screening Inward - grade",
  "Screening Inward - Output Required",
  "Raw-Material Outward"
];

export default function DropdownSettingsManager() {
  const [selectedTab, setSelectedTab] = useState('');
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modified, setModified] = useState(false);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const fetchSettings = async (tabname) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/settings/dropdown`, {
        params: { tabname },
        withCredentials: true
      });
      setSettings(res.data.settings || []);
      setModified(false);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('Unable to fetch data from backend.');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab) {
      fetchSettings(selectedTab);
    }
  }, [selectedTab]);

  const handleStatusToggle = (index) => {
    const updated = [...settings];
    updated[index].status = !updated[index].status;
    setSettings(updated);
    setModified(true);
  };

  const handleWasteToggle = (index) => {
    const updated = [...settings];
    updated[index].waste = !updated[index].waste;
    setSettings(updated);
    setModified(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/api/settings/dropdown/update`, {
        tabname: selectedTab,
        settings
      }, { withCredentials: true });
      setModified(false);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed.');
    }
  };

  const handleAddDialogSubmit = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      alert('Label cannot be empty.');
      return;
    }

    const exists = settings.some(row => row.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert('Label already exists.');
      return;
    }

    const newRow = {
      label: trimmed,
      status: true,
      ...(selectedTab === 'Raw-Material Outward' && { waste: true })
    };

    const updatedSettings = [...settings, newRow];

    try {
      await axios.post(`${API_URL}/api/settings/dropdown/update`, {
        tabname: selectedTab,
        settings: updatedSettings
      }, { withCredentials: true });

      setAddDialogOpen(false);
      setNewLabel('');
      fetchSettings(selectedTab); // Refresh table
    } catch (err) {
      console.error('Add failed:', err);
      alert('Add failed.');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Manage Dropdown Settings
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Tab</InputLabel>
          <Select
            value={selectedTab}
            label="Select Tab"
            onChange={(e) => setSelectedTab(e.target.value)}
            disabled={loading}
          >
            {tabOptions.map((tab) => (
              <MenuItem key={tab} value={tab}>{tab}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={() => setAddDialogOpen(true)} disabled={!selectedTab || loading}>
          Add
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={!modified || loading}
        >
          Save
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Status</TableCell>
              {selectedTab === 'Raw-Material Outward' && <TableCell>Waste</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.label}</TableCell>
                <TableCell>
                  <Switch
                    checked={row.status}
                    onChange={() => handleStatusToggle(idx)}
                  />
                </TableCell>
                {selectedTab === 'Raw-Material Outward' && (
                  <TableCell>
                    <Switch
                      checked={row.waste}
                      onChange={() => handleWasteToggle(idx)}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Entry</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDialogSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
