// src/layout/Topbar.jsx (or wherever you keep it)
import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Tooltip, Avatar,
  Menu, MenuItem, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ChangePasswordDialog from './ChangePasswordDialog';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Topbar({ onMenuClick, onLogout }) {
  const { userid, accountid } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [branding, setBranding] = useState({ logo: null, logo_text: '', logoFailed: false });

  useEffect(() => {
    axios
      .get(`${API_URL}/api/users/branding`, { withCredentials: true })
      .then((res) => {
        setBranding({
          logo: res.data.logo || null,
          logo_text: res.data.logo_text || '',
          logoFailed: false,
        });
      })
      .catch((err) => {
        console.warn('Branding fetch failed', err);
      });
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        color="default"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: '#fff',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pl: { sm: 2 },
          pr: { sm: 3 },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Mobile menu button */}
          <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }} aria-label="open navigation">
            <MenuIcon />
          </IconButton>

          {/* Centered brand (logo -> text -> accountid) */}
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            {branding.logo && !branding.logoFailed ? (
              <img
                src={branding.logo}
                alt="Logo"
                height={40}
                onError={() => setBranding((prev) => ({ ...prev, logoFailed: true }))}
              />
            ) : branding.logo_text ? (
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {branding.logo_text}
              </Typography>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {accountid?.toUpperCase?.() || 'ACCOUNT'}
              </Typography>
            )}
          </Box>

          {/* Right-side profile */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title={`${userid}@${accountid}`}>
              <Avatar onClick={handleMenuOpen} sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}>
                <PersonIcon />
              </Avatar>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {/* Header: user + id */}
              <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.1 }}>
                  {userid}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {accountid}
                </Typography>

                {/* “Change password” directly under ID */}
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: 'primary.main', cursor: 'pointer' }}
                  onClick={() => {
                    setOpenDialog(true);
                    handleMenuClose();
                  }}
                >
                  Change password
                </Typography>
              </Box>

              <Divider />

              {/* Logout below */}
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onLogout?.(); // let parent handle token clearing / redirect
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Your existing dialog */}
      <ChangePasswordDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </>
  );
}
