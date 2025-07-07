import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const generatePath = (parentLabel, childLabel) => {
  const format = (label) => label.toLowerCase().replace(/\s+/g, '_');
  return `/${format(parentLabel)}/${format(childLabel)}`;
};

const menuStructure = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Operations', icon: <DashboardIcon />, path: '/operations' },
  { label: 'Reports', icon: <DashboardIcon />, path: '/reports' },
  { label: 'Settings', icon: <DashboardIcon />, path: '/settings' },
  { label: 'Logout', icon: <DashboardIcon />, logout: true },
];

export default function Sidebar({ onNavigate }) {
  const [openMenus, setOpenMenus] = useState({});

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('Logout failed (maybe token expired):', err.message);
    }
    localStorage.removeItem('token');
    window.location.href = 'http://10.0.0.211/'; // 🔁 External login page
  };

  return (
    <Box sx={{ width: 240, height: '100vh', overflowY: 'auto', bgcolor: '#f9f9f9' }}>
      <List>
        {menuStructure.map(({ label, icon, path, logout, children }) => {
          const isOpen = openMenus[label] || false;

          if (logout) {
            return (
              <ListItemButton key={label} onClick={handleLogout}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          }

          if (children) {
            return (
              <Box key={label}>
                <ListItemButton onClick={() => handleToggle(label)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {children.map((childLabel) => (
                      <ListItemButton
                        key={childLabel}
                        component={NavLink}
                        to={generatePath(label, childLabel)}
                        onClick={onNavigate}
                        sx={{
                          pl: 4,
                          '&.active': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '& .MuiListItemIcon-root': { color: 'white' },
                          },
                        }}
                      >
                        <ListItemText primary={childLabel} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItemButton
              key={label}
              component={NavLink}
              to={path}
              onClick={onNavigate}
              sx={{
                '&.active': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2, textAlign: 'center', mt: 'auto' }}>
        <img src="/logo192.png" alt="Logo" width={100} />
      </Box>
    </Box>
  );
}
