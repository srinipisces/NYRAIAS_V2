import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography
} from '../../node_modules/@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import nyralogo from './NYRA_Logo.png';
import indopure from './indopure.png'

const API_URL = import.meta.env.VITE_API_URL;

const menuStructure = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/', accessKey: 'Dashboard' },
  { label: 'Operations', icon: <DashboardIcon />, path: '/operations', accessPrefix: 'Operations.' },
  { label: 'Reports', icon: <DashboardIcon />, path: '/reports', accessKey: 'Reports' },
  { label: 'Settings', icon: <DashboardIcon />, path: '/settings', accessKey: 'Settings' },
  { label: 'DataFlow', icon: <DashboardIcon />, path: '/dataflow', accessKey: 'DataFlow' },
  { label: 'Logout', icon: <DashboardIcon />, logout: true },
];

export default function Sidebar({ onNavigate }) {
  const { access } = useAuth(); // ✅ Read from context
  const [openMenus, setOpenMenus] = useState({});

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

  const hasAccess = ({ accessKey, accessPrefix, label }) => {
    if (accessPrefix) return access.some((a) => a.startsWith(accessPrefix));
    if (accessKey) return access.includes(accessKey);
    return access.includes(label); // fallback
  };

  return (
    <Box sx={{ width: 240, height: '100vh', bgcolor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1 }}>
        {menuStructure.map(({ label, icon, path, logout, accessKey, accessPrefix }) => {

          if (logout) {
            return (
              <ListItemButton key={label} onClick={handleLogout}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          }

          if (!hasAccess({ accessKey, accessPrefix, label })) return null;

          return (
            <ListItemButton key={label} component={NavLink} to={path} onClick={onNavigate}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Powered by:</Typography>
        <img src={indopure} alt="Logo" width={150} />
        
      </Box>
    </Box>
  );
}
