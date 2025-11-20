import React, { useState, useContext } from 'react';
import {
  Box, TextField, Button, Typography,
  Paper, Grid, Snackbar, Alert
} from '@mui/material';
import { AuthContext } from '../AuthContext';

// NEW: import your grouped dialog component (the sample you attached)
import EditAccessDialog from './EditAccessDialog';

const API_BASE = import.meta.env.VITE_API_URL;

// (kept) Your access catalog constant can remain in this file if you use it elsewhere.
// It's no longer used for rendering the dialog here.
const AccessPages = {
  "Dashboard": [],
  "Operations": {
    "Receivables": ["Security", "Lab","Edit","Reports"],
    "RMS": ["Raw-Material Inward", "Crusher Performance", "Raw-Material Outward","Edit","Reports"],
    "Activation": ["Kiln Feed Quality","Kiln Feed","Kiln Output Quality","Boiler Performance","Kiln Temperature","Kiln Output","De-Stoning","De-Stoning Quality","Edit","Reports"],
    "PostActivation": ["Quality","Screening","Crushing","De-Dusting","De-Magnetize","Blending","Edit","Reports"],
    "Delivery": []
  },
  "Reports": ["Receivables","RMS","Activation","PostActivation","Stock","General"],
  "Settings": ["User Management","Add Suppliers","Grade Management"],
};

export default function AddUserForm({ onCancel, onSuccess }) {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    userid: '',
    name: '',
    email: '',
    phone: '',
    // keep your original access flags to avoid any UI changes elsewhere
    access: {
      Dashboard: false,
      Operations: [],   // kept but unused for the dialog now
      Reports: false,
      Settings: false,
      DataFlow: false
    },
  });

  // NEW: this holds the grouped-format tokens coming back from EditAccessDialog
  // e.g., ["Dashboard","Reports.Stock","Operations.RMS.Raw-Material Inward", ...]
  const [accessTokens, setAccessTokens] = useState([]);

  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // SUBMIT: send tokens returned by the grouped dialog (no UI changes)
  const handleSubmit = async () => {
    if (!formData.userid || !formData.email || !formData.name) {
      return setSnackbar({ open: true, message: 'Name, User ID, and Email are required', severity: 'error' });
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/users/createuser/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          accountid: user.accountid,
          // ⬇️ send the grouped tokens exactly as the dialog builds them
          access: accessTokens,
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
    } finally {
      setSubmitting(false);
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

        {/* Same button as before — only behavior change is it opens your grouped dialog */}
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

      {/* REPLACEMENT: use your EditAccessDialog for the grouped view */}
      <EditAccessDialog
        open={accessDialogOpen}
        onClose={() => setAccessDialogOpen(false)}
        // pass minimal identity so the dialog title can show the userid if needed
        user={{ userid: formData.userid, access: accessTokens }}
        accessConfig={AccessPages}   // uses your exact structure & order
        tokens={accessTokens}        // current selection tokens
        onSave={(updatedTokens) => { // called by the dialog’s Save/Update handler
          setAccessTokens(updatedTokens);
          setAccessDialogOpen(false);
        }}
      />

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
