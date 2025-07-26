import { useState } from 'react';
import { Box, Drawer, useMediaQuery, Toolbar } from '../../../node_modules/@mui/material';
import { useTheme } from '../../../node_modules/@mui/material/styles';
import Sidebar from './SidebarV2';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

export default function PageLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <Sidebar onNavigate={() => isMobile && setMobileOpen(false)} />
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar onMenuClick={toggleDrawer} />

      {/* Sidebar */}
      <Box component="nav">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              position: 'fixed',
              top: 64, // ✅ match height of AppBar (usually 64px)
                height: 'calc(100% - 64px)', // ✅ full height minus topbar
                overflowY: 'auto',
                zIndex: (theme) => theme.zIndex.appBar - 1, // ✅ ensures it's under AppBar
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main" 
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { md: '240px' },
          
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
