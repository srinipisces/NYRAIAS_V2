import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '../../node_modules/@mui/material';

import UserManagement from '../Components/UserManagement';
import SupplierManagement from '../Components/SupplierManagement';
import DropdownSettingsManager from '../Components/Dropdownsettings';

const tabs = [
  { label: 'User Management', component: <UserManagement /> },
  { label: 'Add Suppliers', component: <SupplierManagement /> },
  { label: 'Grade Management', component: <DropdownSettingsManager /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const selectedBorderColor = theme.palette.primary.main;

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
      <Box sx={{ width: 800 }}>
        {/* Tabs or Dropdown based on screen size */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          {isMobile ? (
            <FormControl fullWidth size="small">
              <InputLabel id="tab-select-label">Select Section</InputLabel>
              <Select
                labelId="tab-select-label"
                value={activeTab}
                label="Select Section"
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {tabs.map((tab, index) => (
                  <MenuItem key={index} value={index}>
                    {tab.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Tabs
              value={activeTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  border: '1px solid #ccc',
                  borderBottom: 'none',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  backgroundColor: '#f5f5f5',
                  minHeight: '42px',
                  px: 3,
                  mx: 0.5,
                },
                '& .Mui-selected': {
                  backgroundColor: '#fff',
                  borderColor: selectedBorderColor,
                  borderBottom: 'none',
                  fontWeight: 'bold',
                  zIndex: 1,
                  position: 'relative',
                  top: '1px',
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} disableRipple />
              ))}
            </Tabs>
          )}
        </Box>

        {/* Fixed Size Content Area */}
        <Paper
          elevation={2}
          sx={{
            height: '500px',
            width: '800px',
            overflowY: 'auto',
            border: `1px solid ${selectedBorderColor}`,
            borderTop: 'none',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            backgroundColor: '#fff',
            p: 2,
          }}
        >
          {tabs[activeTab].component}
        </Paper>
      </Box>
    </Box>
  );
}
