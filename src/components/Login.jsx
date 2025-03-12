import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await axios.get('http://localhost:5000/api/csrf-token');
      setCsrfToken(response.data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !password) {
      setMessage('Email and password are required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage('Invalid email address');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/employees/login', { email, password }, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });

      console.log('Response data:', response.data); // Debugging statement

      if (response.data.success) {
        console.log('Navigation to dashboard');
        alert(response.data.message);
        onLogin();
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'DM Sans, sans-serif',
        // backgroundColor: '#f0f0f0', // Light grey background
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 1,
          backgroundColor: '#fff',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ fontFamily: 'DM Sans, sans-serif', color: '#333' }}>
          Employee Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, fontFamily: 'DM Sans, sans-serif', backgroundColor: '#1976d2', color: '#fff' }}
          >
            Login
          </Button>
        </Box>
        {message && <Typography color="error" sx={{ fontFamily: 'DM Sans, sans-serif' }}>{message}</Typography>}
      </Box>
    </Container>
  );
};

export default Login;