import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'RawMaterial@Gate', icon: <AssignmentIcon />, path: '/materialatgate' },
  { label: 'RawMaterial@Lab', icon: <AssignmentIcon />, path: '/inwardmateriallabtest' },
  { label: 'RawMaterial Bagging', icon: <AssignmentIcon />, path: '/rawmaterialbagging' },
];

export default function Sidebar({ onNavigate }) {
  return (
    <Box sx={{ width: 240 }}>
      <List>
        {menuItems.map(({ label, icon, path }) => (
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
        ))}
      </List>
    </Box>
  );
}
