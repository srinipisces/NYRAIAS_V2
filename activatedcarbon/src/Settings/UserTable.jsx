// src/Settings/UserTable.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Switch, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Typography,
  Snackbar, Alert
} from '@mui/material';

import { AuthContext } from '../AuthContext';
import EditAccessDialog from './EditAccessDialog.jsx';

const API_URL = import.meta.env.VITE_API_URL;

/** Fallback per-account menu if the backend doesn't return one */
const DEFAULT_ACCESS_PAGES = {
  Dashboard: [],
  Operations: {
    Receivables: ['Security', 'Lab'],
    RMS: ['Raw-Material Inward', 'Crusher Performance', 'Raw-Material Outward'],
    Activation: ['Kiln Feed','Kiln Feed Quality','Boiler Performance','Kiln Temperature','Kiln Output','De-Stoning'],
    PostActivation: ['Quality','Screening','Crushing','De-Dusting','De-Magnetize','Blending'],
    Delivery: [],
  },
  Reports: ['Receivables','RMS','Activation','PostActivation','Stock','General'],
  Settings: [],
};

export default function UserTable({ users = [], onUserUpdated }) {
  // ---- Auth ----
  const auth = useContext(AuthContext) || {};
  const accountid = auth?.accountid || auth?.user?.accountid;
  const loggedInUser = auth?.userid || auth?.user?.userid;

  // ---- Local rows for the grid ----
  const [rows, setRows] = useState([]);
  useEffect(() => {
    setRows(users.map(u => ({ ...u, changed: false, loading: false })));
  }, [users]);

  // ---- Access config (per-account) ----
  const [accessConfig, setAccessConfig] = useState(DEFAULT_ACCESS_PAGES);
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!accountid) return;
      try {
        const res = await fetch(`${API_URL}/api/users/menu_structure`, { credentials: 'include' });
        if (!res.ok) throw new Error('No access-config for account');
        const cfg = await res.json();
        if (!ignore && cfg && typeof cfg === 'object' && Object.keys(cfg).length) {
          setAccessConfig(cfg.menu_structure);
          //console.log(cfg.menu_structure);
        } else if (!ignore) {
          setAccessConfig(DEFAULT_ACCESS_PAGES);
        }
      } catch {
        if (!ignore) setAccessConfig(DEFAULT_ACCESS_PAGES);
      }
    })();
    return () => { ignore = true; };
  }, [accountid]);

  // ---- Edit Access dialog state ----
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAccessClick = (row) => {
    setSelectedUser(row);
    setEditOpen(true);
  };

  // ---- Snackbar ----
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // ---- Reset Password dialog ----
  const [resetDialog, setResetDialog] = useState({ open: false, user: null, password: '' });

  // ---- Handlers for inline edits ----
  const handleChange = (index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value, changed: true };
      return updated;
    });
  };

  async function handleUpdateUserDetails(index) {
    const user = rows[index];
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...user, loading: true };
      return updated;
    });

    try {
      const res = await fetch(`${API_URL}/api/users/updateuser/${accountid}/${user.userid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          access: user.access || [],
          updatedBy: loggedInUser,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showSnackbar('User updated successfully');
        setRows(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], changed: false };
          return updated;
        });
        onUserUpdated?.();
      } else {
        showSnackbar(data?.message || 'Error updating user', 'error');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Server error', 'error');
    } finally {
      setRows(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], loading: false };
        return updated;
      });
    }
  }

  const handleResetPassword = async (user) => {
    try {
      const res = await fetch(`${API_URL}/api/users/resetpassword/${accountid}/${user.userid}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Reset failed');
      //console.log(data?.newPassword,data);
      setResetDialog({ open: true, user, password: data?.newPassword || '(generated)' });
    } catch (e) {
      showSnackbar(e.message || 'Server error during reset', 'error');
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 150 }}>User ID</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Name</TableCell>
              <TableCell sx={{ minWidth: 300 }}>Email</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Access Pages</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.userid}>
                <TableCell>{row.userid}</TableCell>

                <TableCell>
                  <TextField
                    value={row.name || ''}
                    onChange={e => handleChange(i, 'name', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    value={row.email || ''}
                    onChange={e => handleChange(i, 'email', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    value={row.phone || ''}
                    onChange={e => handleChange(i, 'phone', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>

                <TableCell>
                  <Switch
                    checked={!!row.status}
                    onChange={e => handleChange(i, 'status', e.target.checked)}
                  />
                </TableCell>

                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleAccessClick(row)}>
                    Edit Access
                  </Button>
                </TableCell>

                <TableCell>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!row.changed || row.loading}
                      onClick={() => handleUpdateUserDetails(i)}
                    >
                      {row.loading ? 'Saving...' : 'Update'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleResetPassword(row)}
                    >
                      Reset Password
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Access — separate component */}
      <EditAccessDialog
        open={editOpen}
        user={selectedUser}
        accessConfig={accessConfig}
        tokens={selectedUser?.access}
        apiBase={API_URL}
        accountid={accountid}
        updatedBy={loggedInUser}
        onClose={() => setEditOpen(false)}
        onUpdated={(updatedTokens) => {
          // patch row locally and notify
          setRows(prev => prev.map(r =>
            r.userid === selectedUser.userid ? { ...r, access: updatedTokens } : r
          ));
          showSnackbar('User access updated successfully', 'success');
        }}
      />

      {/* Password Reset Dialog */}
      <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false })}>
        <DialogTitle>Password Reset</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            New password for <strong>{resetDialog.user?.name || resetDialog.user?.userid}</strong> is:
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {resetDialog.password}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog({ open: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
