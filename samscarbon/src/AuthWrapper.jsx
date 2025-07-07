import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const API_BASE = import.meta.env.VITE_API_URL;

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/users/validate-token`, {
        withCredentials: true, // ✅ send cookie
      })
      .then((res) => {
        const { userid, accountid, access } = res.data;
        setUser({ userid, accountid, access });
        setChecking(false);
      })
      .catch((err) => {
        console.warn('Token validation failed:', err?.response?.status);
        setChecking(false); // 🛠️ fix: stop spinner
        window.location.href = import.meta.env.VITE_REDIRECT; // 🔁 redirect to login
      });
  }, [navigate]);

  if (checking) return <div>Authenticating...</div>;

  return (
    <AuthContext.Provider
      value={{
        user,
        userid: user?.userid || null,
        accountid: user?.accountid || null,
        access: user?.access || [],
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthWrapper;
