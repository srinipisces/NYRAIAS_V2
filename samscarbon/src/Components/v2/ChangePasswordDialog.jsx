import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function ChangePasswordDialog({ open, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword) {
      setError('Both fields are required');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/users/changepassword`, {
        oldPassword,
        newPassword,
      }, {
        withCredentials: true, // ✅ Send cookie
      });

      setSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          type="password"
          margin="dense"
          label="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          fullWidth
          type="password"
          margin="dense"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
