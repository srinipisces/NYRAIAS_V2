import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '../../node_modules/@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import UserTable from './UserTable';
import AddUserForm from './AddUserForm';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { userid: currentUser, accountid: accountId } = useContext(AuthContext);

  useEffect(() => {
    if (accountId) {
      fetchUsers(accountId);
    }
  }, [accountId]);

  const fetchUsers = async (accountid) => {
    try {
      const res = await axios.get(`${API_URL}/api/users/listallusers/${accountid}`, {
        withCredentials: true,
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      users.filter((user) =>
        Object.values(user).some((val) =>
          String(val).toLowerCase().includes(term)
        )
      )
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Search users..."
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
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? 'Cancel' : 'Add User'}
        </Button>
      </Box>

      {showAddForm && (
        <Box mb={3}>
          <AddUserForm
            accountid={accountId}
            createdBy={currentUser}
            onSuccess={() => {
              fetchUsers(accountId);
              setShowAddForm(false);
            }}
          />
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      <UserTable
        users={filteredUsers}
        accountid={accountId}
        updatedBy={currentUser}
        onRefresh={() => fetchUsers(accountId)}
      />
    </Box>
  );
};

export default UserManagement;
