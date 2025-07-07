import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const [userid, accountid] = username.split('@');

      if (!userid || !accountid) {
        setError('Username format should be userid@accountid');
        return;
      }

      const res = await axios.post(`http://localhost:8000/api/login`, {
        userid,
        accountid,
        password,
      });

      const { token } = res.data;

      localStorage.setItem('token', token);

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
