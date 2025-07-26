import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Switch, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Typography,
  Snackbar, Alert, FormControlLabel, Checkbox, Box
} from '../../node_modules/@mui/material';
import { AuthContext } from '../AuthContext'; // adjust path if needed

const AccessPages = {
  'Dashboard': [],
  'Operations': [
    'Security', 'Lab', 'Raw-Material Inward', 'Crusher Performance', 'Raw-Material Outward',
    'Kiln Feed','Kiln Feed Quality','Boiler Performance', 'Kiln Temperature','Kiln Output','Kiln Output Quality', 'De-Stoning','Screening Inward', 'Screening Outward','Stock'
  ],
  'Reports': [],
  'Settings': [],
  'DataFlow': [],
};

const API_URL = import.meta.env.VITE_API_URL;

export default function UserTable({ users, onUserUpdated }) {
  const { accountid, userid: loggedInUser } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [resetDialog, setResetDialog] = useState({ open: false, user: null, password: '' });
  const [accessDialog, setAccessDialog] = useState({
    open: false,
    user: null,
    access: {},
    changed: false,
    isAllOperationsSelected: false,
    isOperationsIndeterminate: false,
    isSaving: false, // New state to track if the access update is in progress
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setRows(users.map(u => ({ ...u, changed: false, loading: false })));
  }, [users]);

  // Open the Access Dialog
  const handleAccessClick = (user) => {
    const access = {
      Dashboard: user.access?.includes('Dashboard') || false,
      Reports: user.access?.includes('Reports') || false,
      Settings: user.access?.includes('Settings') || false,
      DataFlow: user.access?.includes('DataFlow') || false,
      Operations: AccessPages.Operations.filter(op => user.access?.includes(`Operations.${op}`)) || [],
    };


    setAccessDialog({
      open: true,
      user,
      access,
      changed: false,
      isAllOperationsSelected: access.Operations.length === AccessPages.Operations.length,
      isOperationsIndeterminate: access.Operations.length > 0 && access.Operations.length < AccessPages.Operations.length,
      isSaving: false, // Reset the saving state
    });
  };

  // Handle the change for the Operations parent checkbox
  const handleChangeOperationsParent = (event) => {
    const newAccess = event.target.checked ? [...AccessPages.Operations] : [];
    const isAllSelected = event.target.checked;
    const isIndeterminate = false;

    setAccessDialog(prevState => ({
      ...prevState,
      access: { ...prevState.access, Operations: newAccess },
      changed: true,
      isAllOperationsSelected: isAllSelected,
      isOperationsIndeterminate: isIndeterminate
    }));
  };

  // Handle the change for each individual Operations child checkbox
  const handleChangePageAccess = (page) => {
    setAccessDialog(prevState => {
      const updatedOperations = prevState.access.Operations.includes(page)
        ? prevState.access.Operations.filter(op => op !== page)
        : [...prevState.access.Operations, page];

      const isAllOperationsSelected = updatedOperations.length === AccessPages.Operations.length;
      const isOperationsIndeterminate = updatedOperations.length > 0 && updatedOperations.length < AccessPages.Operations.length;

      return {
        ...prevState,
        access: { ...prevState.access, Operations: updatedOperations },
        changed: true,
        isOperationsIndeterminate,
        isAllOperationsSelected
      };
    });
  };

  // Handle changes in the access dialog for other categories (Dashboard, Reports, Settings)
  const handleChangeAccess = (category) => {
    setAccessDialog(prevState => {
      const updatedAccess = { ...prevState.access };
      updatedAccess[category] = !updatedAccess[category];

      return { ...prevState, access: updatedAccess, changed: true }; // Mark as changed
    });
  };

  // Save the updated access
  const handleSaveAccess = async () => {
    // Disable the button while the update is in progress
    setAccessDialog(prevState => ({
      ...prevState,
      isSaving: true, // Indicating that the save operation is in progress
    }));

    const updatedAccessPages = [
      ...Object.keys(accessDialog.access).filter(cat => accessDialog.access[cat] && cat !== 'Operations'),
      ...accessDialog.access.Operations.map(op => `Operations.${op}`)
    ];

    try {
      const res = await fetch(`${API_URL}/api/users/updateAccess/${accountid}/${accessDialog.user.userid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ access: updatedAccessPages, updatedBy: loggedInUser })
      });

      const data = await res.json();

      if (res.ok) {
        showSnackbar('User access updated successfully', 'success');
        
        // Update the specific user's access in the frontend table
        setRows(prevRows => prevRows.map(row => {
          if (row.userid === accessDialog.user.userid) {
            return { ...row, access: updatedAccessPages };  // Update the access data of the modified user
          }
          return row;
        }));

        setAccessDialog({ open: false, user: null, access: {}, changed: false, isAllOperationsSelected: false, isOperationsIndeterminate: false, isSaving: false });
      } else {
        showSnackbar(data.message || 'Error updating access', 'error');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Server error during update', 'error');
    } finally {
      // Re-enable the button after the update completes (success or failure)
      setAccessDialog(prevState => ({
        ...prevState,
        isSaving: false, // End saving state
      }));
    }
  };

  // Show Snackbar for feedback
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // handle change for email,phone,status
  const handleChange = (index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        changed: true,
      };
      return updated;
    });
  };

  //update call when the user updates the name / email / phone / status
  const handleUpdateUserDetails = async (index) => {
      const user = rows[index];
      setRows(prev => {
        const updated = [...prev];
        updated[index] = { ...user, loading: true };
        return updated;
      });

      try {
        const res = await fetch(`${API_URL}/api/users/updateuser/${accountid}/${user.userid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
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
          onUserUpdated?.(); // Refresh from parent if needed
        } else {
          showSnackbar(data.message || 'Error updating user', 'error');
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
            {rows.map((user, i) => (
              <TableRow key={user.userid}>
                <TableCell>{user.userid}</TableCell>
                <TableCell>
                  <TextField
                    value={user.name || ''}
                    onChange={e => handleChange(i, 'name', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={user.email || ''}
                    onChange={e => handleChange(i, 'email', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={user.phone || ''}
                    onChange={e => handleChange(i, 'phone', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.status}
                    onChange={e => handleChange(i, 'status', e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleAccessClick(user)}>
                    Edit Access
                  </Button>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!user.changed || user.loading}
                      onClick={() => handleUpdateUserDetails(i)}
                    >
                      {user.loading ? 'Saving...' : 'Update'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleResetPassword(user)}
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

      {/* Access Pages Edit Dialog */}
      <Dialog open={accessDialog.open} onClose={() => setAccessDialog({ open: false })}>
        <DialogTitle>Select Access Pages</DialogTitle>
        <DialogContent>
          {Object.keys(AccessPages).map((category) => (
            <Box key={category}>
              {/* Operations parent checkbox */}
              {category === 'Operations' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accessDialog.isAllOperationsSelected}
                      indeterminate={accessDialog.isOperationsIndeterminate}
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
                      checked={accessDialog.access[category] || false}
                      onChange={() => handleChangeAccess(category)}
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
                          checked={Array.isArray(accessDialog.access.Operations) && accessDialog.access.Operations.includes(page)}  // Safe check for Operations
                          onChange={() => handleChangePageAccess(page)}
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
          <Button onClick={() => setAccessDialog({ open: false, user: null, access: {}, changed: false })}>
            Cancel
          </Button>
          <Button onClick={handleSaveAccess} disabled={!accessDialog.changed || accessDialog.isSaving}>
            {accessDialog.isSaving ? 'Saving...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false })}>
        <DialogTitle>Password Reset</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            New password for <strong>{resetDialog.user?.name}</strong> is:
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {resetDialog.password}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog({ open: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
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
