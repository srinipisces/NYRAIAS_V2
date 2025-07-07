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
} from '@mui/material';

import SecurityTab from './SecurityTab';
import LabTab from './LabTab';
import MatInwTab from './MatInwTab';
import CrushPerfTab from './CrushPerfTab';
import MatOutTab from './MatOutTab';
import KlinFeedTab from './KlinFeedTab';
import KlinFeedQualityTab from './KlinFeedQualityTab';
import BoilerPerfTab from './BoilerPerfTab';
import KlinOutputTab from './KlinOutputTab';
import ScreeningInwTab from './ScreeningInwTab';
import ScreeningOutTab from './ScreeningOutTab';

const tabs = [
  { label: '@Security', component: <SecurityTab /> },
  { label: '@Lab', component: <LabTab /> },
  { label: 'Material Inward', component: <MatInwTab /> },
  { label: 'Crusher Performance', component: <CrushPerfTab /> },
  { label: 'Material Outward', component: <MatOutTab /> },
  { label: 'Kiln Feed', component: <KlinFeedTab /> },
  { label: 'Kiln Feed Quality', component: <KlinFeedQualityTab /> },
  { label: 'Boiler Performance', component: <BoilerPerfTab /> },
  { label: 'Kiln Output', component: <KlinOutputTab /> },
  { label: 'Screening Inward', component: <ScreeningInwTab /> },
  { label: 'Screening Outward', component: <ScreeningOutTab /> }
];

export default function OperationPage() {
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
