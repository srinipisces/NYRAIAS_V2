import * as React from 'react';
import { Box, CssBaseline, Drawer, Divider, Toolbar } from '@mui/material';
import Topbar from './Topbar';      // ensure correct path
import Sidebar from './Sidebar';    // ensure correct path
import { Outlet } from 'react-router-dom';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

export default function PageLayout({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* TOP BAR */}
      <Topbar
        onMenuClick={openMobile}
        sidebarWidth={sidebarWidth}
        // ...userName/userId/onLogout if needed
      />

      {/* SIDEBAR CONTAINER */}
      <Box component="nav" sx={{ width: { md: sidebarWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile (temporary) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: EXPANDED_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Divider />
          <Sidebar collapsed={false} logoSrc="/static-logos/nyra.png" onItemClick={closeMobile} />
        </Drawer>

        {/* Desktop (permanent) */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Toolbar />
          <Divider />
          <Sidebar collapsed={collapsed} logoSrc="/static-logos/nyra.png" />
        </Drawer>
      </Box>

      {/* MAIN */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
        {children}
      </Box>
    </Box>
  );
}
