import React, { useState, useContext } from 'react';
import {
  Box, TextField, Button, Typography,
  Paper, Grid, Snackbar, Alert
} from '../../node_modules/@mui/material';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export default function AddSupplierForm({ accountid, createdBy, onSuccess, onCancel }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    supplier_name: '',
    street: '',
    city: '',
    pincode: '',
    contact_person: '',
    contact_number: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.supplier_name) {
      return setSnackbar({ open: true, message: 'Supplier name is required', severity: 'error' });
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        create_userid: createdBy
      };

      await axios.post(`${API_BASE}/api/suppliers/create/${accountid}`, payload, {
        withCredentials: true
      });

      setSnackbar({ open: true, message: 'Supplier added successfully', severity: 'success' });
      onSuccess?.();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add supplier', severity: 'error' });
      console.error('Error adding supplier:', err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Add New Supplier</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField label="Supplier Name" value={formData.supplier_name} onChange={handleChange('supplier_name')} fullWidth size="small" required />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Street" value={formData.street} onChange={handleChange('street')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="City" value={formData.city} onChange={handleChange('city')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Pincode" value={formData.pincode} onChange={handleChange('pincode')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Contact Person" value={formData.contact_person} onChange={handleChange('contact_person')} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Contact Number" value={formData.contact_number} onChange={handleChange('contact_number')} fullWidth size="small" />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Supplier'}
          </Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
        </Grid>
      </Grid>

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
