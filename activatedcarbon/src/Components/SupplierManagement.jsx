import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Divider, Button, TextField, InputAdornment
} from '../../node_modules/@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import SupplierTable from './SupplierTable';
import AddSupplierForm from './AddSupplierForm';
import { AuthContext } from '../AuthContext'; // ✅ Make sure path is correct

const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierManagement() {
  const { accountid, userid } = useContext(AuthContext); // ✅ read from context
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (accountid) fetchSuppliers(accountid);
  }, [accountid]);

  const fetchSuppliers = async (accountid) => {
    try {
      const res = await axios.get(`${API_URL}/api/suppliers/list/${accountid}`, {
        withCredentials: true,
      });
      setSuppliers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFiltered(
      suppliers.filter((s) =>
        s.supplier_name.toLowerCase().includes(value)
      )
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Supplier Management
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Search by supplier name..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Cancel' : 'Add Supplier'}
        </Button>
      </Box>

      {showForm && (
        <Box mb={3}>
          <AddSupplierForm
            accountid={accountid}
            createdBy={userid}
            onSuccess={() => {
              fetchSuppliers(accountid);
              setShowForm(false);
            }}
          />
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      <SupplierTable data={filtered} />
    </Box>
  );
}
