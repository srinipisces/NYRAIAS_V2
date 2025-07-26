import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Tooltip, Avatar,
  Menu, MenuItem
} from '../../../node_modules/@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import samcarbonLogo from './samcarbon.webp';
import ChangePasswordDialog from './ChangePasswordDialog';
import { useAuth } from '../../AuthContext'; // ✅ read from context

export default function Topbar({ onMenuClick }) {
  const { userid } = useAuth(); // ✅ No more token decoding
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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
            <img src={samcarbonLogo} alt="Sam Carbon Logo" height={40} />
          </Box>

          <Box sx={{ ml: 2 }}>
            <Tooltip title={userid || 'User'}>
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
                  User: {userid}
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
