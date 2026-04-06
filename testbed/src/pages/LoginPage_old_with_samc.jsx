import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 On load: validate token using HTTP-only cookie
  useEffect(() => {
    axios
      .get(`${API_URL}/api/users/validate-token`, {
        withCredentials: true,
      })
      .then((res) => {
        const { accountid, access } = res.data;
        const nextPath = getFirstAccessiblePath(access);
        const fullPath = `${window.location.origin}/${accountid}${nextPath}`;
        if (window.location.href !== fullPath) {
          window.location.href = fullPath;
        }
      })
      .catch(() => {
        // Not logged in — stay on login page
      });
  }, []);

  const handleLogin = async () => {
    try {
      const [userid, accountid] = username.split('@');

      if (!userid || !accountid) {
        setError('Username format should be userid@accountid');
        return;
      }

      setLoading(true);
      setError('');

      // Step 1: login to set token
      await axios.post(
        `${API_URL}/api/users/login`,
        { userid, accountid, password },
        { withCredentials: true }
      );

      // Step 2: fetch access details
      const res = await axios.get(`${API_URL}/api/users/validate-token`, {
        withCredentials: true,
      });

      const { access } = res.data;
      const nextPath = getFirstAccessiblePath(access);
      window.location.href = `${window.location.origin}/${accountid}${nextPath}`;
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 404) {
        setError(`❌ ${msg}`); // likely "Invalid accountid"
      } else if (status === 401) {
        setError(`❌ ${msg}`); // likely "Invalid userid or password"
      } else if (status === 400) {
        setError('❌ Missing credentials. Please fill in all fields.');
      } else {
        setError('❌ Login failed. Please try again.');
        console.log(err);
      }
    } finally {
      setLoading(false);
    }
  };


  const getFirstAccessiblePath = (access = []) => {
    if (access.includes('Dashboard')) return '/';
    if (access.some((a) => a.startsWith('Operations.'))) return '/operations';
    if (access.includes('Reports')) return '/reports';
    if (access.includes('Settings')) return '/settings';
    return '/unauthorized';
  };

  return (
    <Container maxWidth="xs">
      <Box mt={10}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Username (userid@accountid)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <TextField
          fullWidth
          type="password"
          margin="normal"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
