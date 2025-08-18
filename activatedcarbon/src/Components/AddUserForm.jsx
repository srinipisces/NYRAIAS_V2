import React, { useState, useContext } from 'react';
import {
  Box, TextField, Button, Typography,
  Paper, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Snackbar, Alert
} from '../../node_modules/@mui/material';
import { AuthContext } from '../AuthContext';

const AccessPages = {
  'Dashboard': [],
  'Operations': [
    'Security', 'Lab', 'Raw-Material Inward', 'Crusher Performance', 'Raw-Material Outward',
    'Kiln Feed','Kiln Feed Quality', 'Boiler Performance', 'Kiln Temperature','Kiln Output', 'Kiln Output Quality','De-Stoning','De-Stoning Quality','Screening Inward', 
    'Screening Outward', 'Re-Process','Re-Process Quality','Stock'
  ],
  'Reports': [],
  'Settings': [],
  'DataFlow' : []
};

const API_BASE = import.meta.env.VITE_API_URL;

export default function AddUserForm({ onCancel, onSuccess }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    userid: '',
    name: '',
    email: '',
    phone: '',
    access: {
      Dashboard: false,  // Default Dashboard to unselected
      Operations: [],   // Default Operations as an empty array
      Reports: false,    // Default Reports to unselected
      Settings: false,    // Default Settings to unselected
      DataFlow: false
    },
  });
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Check if all pages in Operations are selected
  const isAllOperationsSelected = formData.access.Operations.length === AccessPages.Operations.length;

  // Check if some pages in Operations are selected but not all
  const isOperationsIndeterminate = formData.access.Operations.length > 0 && !isAllOperationsSelected;

  // Toggle the Operations parent checkbox (Select/Deselect all pages in Operations)
  const handleChangeOperationsParent = (event) => {
    const newAccess = event.target.checked ? [...AccessPages.Operations] : [];
    setFormData((prevState) => ({
      ...prevState,
      access: { ...prevState.access, Operations: newAccess }
    }));
  };

  // Toggle individual page selection within the Operations category
  const handleChangePageAccess = (page) => {
    setFormData((prevState) => {
      const access = prevState.access.Operations.includes(page)
        ? prevState.access.Operations.filter((p) => p !== page)
        : [...prevState.access.Operations, page];

      return {
        ...prevState,
        access: { ...prevState.access, Operations: access },
      };
    });
  };

  // Handle submit to send only selected pages
  const handleSubmit = async () => {
    if (!formData.userid || !formData.email || !formData.name) {
      return setSnackbar({ open: true, message: 'Name, User ID, and Email are required', severity: 'error' });
    }

    // Prepare the array of selected pages
    const selectedAccessPages = [];
    
    // Check and add categories to the selected array
    for (const [category, isSelected] of Object.entries(formData.access)) {
      if (isSelected) {
        if (category === 'Operations') {
          // For Operations, include child pages with `Operations.<page-name>`
          formData.access.Operations.forEach((page) => {
            selectedAccessPages.push(`Operations.${page}`);
          });
        } else {
          // For other categories (Dashboard, Reports, Settings), include them directly
          selectedAccessPages.push(category);
        }
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/createuser/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          accountid: user.accountid,  // Send accountid from AuthContext
          access: selectedAccessPages, // Send the selected pages array to the backend
          status: true,
          createdBy: user.userid
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
        onSuccess?.();
      } else if (res.status === 409) {
        setSnackbar({ open: true, message: 'User ID already exists', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to create user', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Add New User</Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField label="User ID" value={formData.userid} onChange={handleChange('userid')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label="Name" value={formData.name} onChange={handleChange('name')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label="Email" value={formData.email} onChange={handleChange('email')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label="Phone" value={formData.phone} onChange={handleChange('phone')} fullWidth size="small" />
        </Grid>

        <Grid item xs={12} md={3}>
          <Button variant="outlined" onClick={() => setAccessDialogOpen(true)}>
            Select Access Pages
          </Button>
        </Grid>

        <Grid item xs={12} md={9} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </Grid>
      </Grid>

      <Dialog open={accessDialogOpen} onClose={() => setAccessDialogOpen(false)}>
        <DialogTitle>Select Access Pages</DialogTitle>
        <DialogContent>
          {Object.keys(AccessPages).map((category) => (
            <Box key={category}>
              {/* Operations parent checkbox */}
              {category === 'Operations' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAllOperationsSelected}
                      indeterminate={isOperationsIndeterminate}
                      onChange={handleChangeOperationsParent}
                    />
                  }
                  label={category}
                />
              )}

              {/* Normal checkboxes for Dashboard, Reports, and Settings */}
              {category !== 'Operations' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.access[category]}  // Check if category is selected
                      onChange={() => {
                        setFormData({
                          ...formData,
                          access: { ...formData.access, [category]: !formData.access[category] }
                        });
                      }} // Toggle category selection
                    />
                  }
                  label={category}
                />
              )}

              {/* Show child pages only for Operations */}
              {category === 'Operations' && (
                <Box sx={{ ml: 3 }}>
                  {AccessPages[category].map((page) => (
                    <FormControlLabel
                      key={page}
                      control={
                        <Checkbox
                          checked={formData.access.Operations.includes(page)}  // Check if the page is selected
                          onChange={() => handleChangePageAccess(page)}  // Toggle page selection
                        />
                      }
                      label={page}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
