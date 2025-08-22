import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import nyralogo from './NYRA_Logo.png'


const API_URL = import.meta.env.VITE_API_URL;

const menuStructure = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Operations', icon: <DashboardIcon />, path: '/operations' },
  { label: 'Reports', icon: <DashboardIcon />, path: '/reports', accessKey: 'Reports' },
  { label: 'Settings', icon: <DashboardIcon />, path: '/settings', accessKey: 'Settings' },
  { label: 'Logout', icon: <DashboardIcon />, logout: true },
];

export default function Sidebar({ onNavigate }) {
  const { access } = useAuth(); // ✅ Read from context
  const [openMenus, setOpenMenus] = useState({});

  const hasAccessToOperations = access.some((item) => item.startsWith('Operations.'));

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/users/logout`, {}, {
        withCredentials: true, // ✅ Send cookie
      });
    } catch (err) {
      console.warn('Logout failed (maybe token expired):', err.message);
    }
    window.location.href = import.meta.env.VITE_REDIRECT; // Redirect to login
  };

  return (
    <Box sx={{ width: 240, height: '100vh', bgcolor: '#f9f9f9' ,flexDirection: 'column'}}>
      <List>
        {menuStructure.map(({ label, icon, path, logout, accessKey }) => {
          if (logout) {
            return (
              <ListItemButton key={label} onClick={handleLogout}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          }

          if (label === 'Dashboard') {
            return (
              <ListItemButton key={label} component={NavLink} to={path} onClick={onNavigate}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          }

          if (label === 'Operations' && !hasAccessToOperations) return null;
          if (accessKey && !access.includes(accessKey)) return null;

          return (
            <ListItemButton key={label} component={NavLink} to={path} onClick={onNavigate}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2, textAlign: 'center', mt: 'auto' }}>
        <img src={nyralogo} alt="Logo" width={100} />
      </Box>
    </Box>
  );
}
