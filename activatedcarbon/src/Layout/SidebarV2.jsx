import * as React from 'react';
import {
  Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CircleIcon from '@mui/icons-material/Circle';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

// Optional: fallback logo imports if you want them
import indopure from './indopure.png';

const API_URL = import.meta.env.VITE_API_URL;

export default function Sidebar({
  collapsed = false,       // pass true when the mini variant is active
  onItemClick,             // called after navigation (e.g., to close mobile drawer)
  logoSrc,                 // fixed logo file path (e.g., '/static-logos/nyra.png')
}) {
  const { access = [] } = useAuth();

  // --- ACCESS HELPERS (same logic as your current sidebar) ---
  const hasAccess = React.useCallback((keyOrObj) => {
    const { accessKey, accessPrefix, label } =
      typeof keyOrObj === 'string' ? { accessKey: keyOrObj } : keyOrObj;

    if (accessPrefix) return access.some((a) => a.startsWith(accessPrefix));
    if (accessKey) return access.includes(accessKey);
    return access.includes(label);
  }, [access]);

  // --- MENU DEFINITION (Operations always expanded) ---
  const items = [
    { label: 'Dashboard', icon: <DashboardIcon />, to: '/', accessKey: 'Dashboard' },
    {
      label: 'Operations',
      icon: <WorkspacesIcon />,
      accessPrefix: 'Operations.',
      children: [
        { label: 'Receivables',    to: '/operations/receivables',     accessKey: 'Operations.Receivables' },
        { label: 'RMS',            to: '/operations/rms',             accessKey: 'Operations.RMS' },
        { label: 'Activation',     to: '/operations/activation',      accessKey: 'Operations.Activation' },
        { label: 'PostActivation', to: '/operations/post-activation', accessKey: 'Operations.PostActivation' },
        { label: 'Delivery',       to: '/operations/delivery',        accessKey: 'Operations.Delivery' },
      ],
    },
    { label: 'Reports',  icon: <AssessmentIcon />, to: '/reports',  accessKey: 'Reports' },
    { label: 'Settings', icon: <SettingsIcon />,   to: '/settings', accessKey: 'Settings' },
    { label: 'DataFlow', icon: <DashboardIcon />,  to: '/dataflow', accessKey: 'DataFlow' },
    { label: 'Logout',   icon: <DashboardIcon />,  logout: true },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/users/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn('Logout failed (maybe token expired):', err?.message);
    }
    window.location.href = import.meta.env.VITE_REDIRECT;
  };

  // row renderer that supports disabled (inactive) + tooltip + collapsed labels
  const Row = ({ label, icon, to, enabled = true, indent = false, logout = false }) => {
    const content = (
      <ListItemButton
        component={logout ? 'div' : enabled ? NavLink : 'div'}
        to={logout || !enabled ? undefined : to}
        onClick={() => {
          if (logout) return handleLogout();
          if (enabled) onItemClick?.();
        }}
        disabled={!enabled && !logout}
        sx={{
          borderRadius: 1,
          mx: 0.5,
          pl: indent ? 4 : 2,
          '&.Mui-disabled': { opacity: 0.5 },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
        <ListItemText
          primary={label}
          sx={{ opacity: collapsed ? 0 : 1, transition: 'opacity .2s' }}
        />
      </ListItemButton>
    );

    // Tooltips don't attach to disabled directly—wrap with a span
    return (
      <Tooltip
        placement="right"
        title={logout ? '' : (!enabled ? 'No access' : (collapsed ? label : ''))}
      >
        <span>{content}</span>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Menu - fixed 70% height, scrollable */}
      <Box sx={{ flex: '0 0 70%', overflowY: 'auto', px: 1, pt: 1 }}>
        <List dense sx={{ pt: 0 }}>
          {items.map((it) => {
            const { label, icon, to, logout, accessKey, accessPrefix, children } = it;
            const topEnabled = children?.length
              ? (hasAccess({ accessPrefix }) || children.some((c) => hasAccess(c)))
              : hasAccess({ accessKey, label });

            const topRow = (
              <Row
                key={`${label}-top`}
                label={label}
                icon={icon}
                to={to}
                enabled={logout ? true : topEnabled}
                logout={logout}
              />
            );

            if (!children || children.length === 0) return topRow;

            return (
              <Box key={label} sx={{ mb: 0.25 }}>
                {topRow}
                <List dense sx={{ pl: 0 }}>
                  {children.map((c) => (
                    <Row
                      key={c.label}
                      label={c.label}
                      icon={<CircleIcon sx={{ fontSize: 8 }} />}
                      to={c.to}
                      enabled={hasAccess(c)}
                      indent
                    />
                  ))}
                </List>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Logo - floats above bottom */}
      <Box
        sx={{
          mt: 'auto',               // push logo below menu
          mb: 4,                    // adjust this value to float higher
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {logoSrc ? (
          <Box
            component="img"
            src={indopure}
            alt="Logo"
            sx={{
              width: collapsed ? 48 : 160,   // was 36 / 120
              height: 'auto',
              objectFit: 'contain',
              justifyContent:'center'
            }}
          />

        ) : (
          <Box sx={{ width: collapsed ? 36 : 120, height: 28, bgcolor: 'action.hover', borderRadius: 1 }} />
        )}
      </Box>
    </Box>

  );
}
