import React, { useState, useEffect, useContext } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Button, Snackbar, Alert
} from '@mui/material';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierTable({ data, onRefresh }) {
  const { accountid, userid } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const updated = data.map((row) => ({ ...row, changed: false, loading: false }));
    setRows(updated);
  }, [data]);

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        changed: true,
      };
      return updated;
    });
  };

  const handleUpdate = async (index) => {
    const supplier = rows[index];
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...supplier, loading: true };
      return updated;
    });

    try {
      const res = await fetch(`${API_URL}/api/suppliers/update/${accountid}/${encodeURIComponent(supplier.supplier_name)}`, {
        method: 'PUT',
        credentials: 'include', // ✅ send cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...supplier,
          updatedBy: userid,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        showSnackbar('Supplier updated successfully');
        setRows((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], changed: false, loading: false };
          return updated;
        });
        onRefresh?.();
      } else {
        showSnackbar(result.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.error('Update error:', err);
      showSnackbar('Server error during update', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Supplier Name</TableCell>
              <TableCell>Street</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Pincode</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.supplier_name + i}>
                <TableCell>{row.supplier_name}</TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.street || ''}
                    onChange={(e) => handleChange(i, 'street', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.city || ''}
                    onChange={(e) => handleChange(i, 'city', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.pincode || ''}
                    onChange={(e) => handleChange(i, 'pincode', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.contact_person || ''}
                    onChange={(e) => handleChange(i, 'contact_person', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.contact_number || ''}
                    onChange={(e) => handleChange(i, 'contact_number', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>{row.create_userid}</TableCell>
                <TableCell>{new Date(row.created_dt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!row.changed || row.loading}
                    onClick={() => handleUpdate(i)}
                  >
                    {row.loading ? 'Saving...' : 'Update'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
