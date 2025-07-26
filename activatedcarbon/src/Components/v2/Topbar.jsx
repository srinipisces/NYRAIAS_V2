import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Tooltip, Avatar,
  Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ChangePasswordDialog from './ChangePasswordDialog';
import { useAuth } from '../../AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Topbar({ onMenuClick }) {
  const { userid, accountid } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [branding, setBranding] = useState({ logo: null, logo_text: '' });

  useEffect(() => {
    axios
      .get(`${API_URL}/api/users/branding`, { withCredentials: true })
      .then((res) => {
        setBranding({
          logo: res.data.logo || null,
          logo_text: res.data.logo_text || '',
        });
      })
      .catch((err) => {
        console.warn('Branding fetch failed', err);
      });
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#fff',
          color: '#000',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                {branding.logo && !branding.logoFailed ? (
                <img
                    src={branding.logo}
                    alt="Logo"
                    height={40}
                    onError={() =>
                    setBranding((prev) => ({ ...prev, logoFailed: true }))
                    }
                />
                ) : branding.logo_text ? (
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                    {branding.logo_text}
                </Typography>
                ) : (
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                    {accountid.toUpperCase()}
                </Typography>
                )}
          </Box>


          <Box sx={{ ml: 2 }}>
            <Tooltip title={`${userid}@${accountid}`}>
              <Avatar
                onClick={handleMenuOpen}
                sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
              >
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
              <MenuItem disableRipple>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                  User: {userid}@{accountid}
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => { setOpenDialog(true); handleMenuClose(); }}>
                Change Password
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <ChangePasswordDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </>
  );
}
