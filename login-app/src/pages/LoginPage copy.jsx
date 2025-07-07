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

  // 🔐 On load: validate token using HTTP-only cookie
  useEffect(() => {
    axios
      .get(`${API_URL}/api/users/validate-token`, {
        withCredentials: true, // ensure cookie is sent
      })
      .then((res) => {
        const { accountid } = res.data;
        window.location.href = `/${accountid}`;
      })
      .catch(() => {
        // No valid token or error; stay on login page
      });
  }, []);

  const handleLogin = async () => {
    try {
      const [userid, accountid] = username.split('@');

      if (!userid || !accountid) {
        setError('Username format should be userid@accountid');
        return;
      }

      await axios.post(
        `${API_URL}/api/users/login`,
        { userid, accountid, password },
        {
          withCredentials: true, // send and accept cookies
        }
      );

      window.location.href = `/${accountid}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
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
        />
        <TextField
          fullWidth
          type="password"
          margin="normal"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
