import { useState, useContext } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Typography,
} from '../../node_modules/@mui/material';

import { AuthContext } from '../AuthContext';

import SecurityTab from './SecurityTab';
import LabTab from './LabTab';
import MatInwTab from './MatInwTab';
import CrushPerfTab from './CrushPerfTab';
import MatOutTab from './MatOutTab';
import KlinFeedTab from './KlinFeedTab';
import KlinFeedQualityTab from './KlinFeedQualityTab';
import BoilerPerfTab from './BoilerPerfTab';
import KilnTemp from './KilnTempTab'
import KlinOutputTab from './KlinOutputTab';
import ScreeningInwTab from './ScreeningInwTab';
import ScreeningOutTab from './ScreeningOutTab';
import DeStoningTab from './DeStoningTab';
import KlinOutputQualityTab from './KlinOutputQualityTab'
import DeStoningQuality from './DeStoningQuality';
import Stock from './Stock';
import Re_Process from './Re_Process';
import Re_Process_Quality from './Re_Process_Quality';

// Full list of all operations tabs
const allTabs = [
  { label: 'Security', component: <SecurityTab /> },
  { label: 'Lab', component: <LabTab /> },
  { label: 'Raw-Material Inward', component: <MatInwTab /> },
  { label: 'Crusher Performance', component: <CrushPerfTab /> },
  { label: 'Raw-Material Outward', component: <MatOutTab /> },
  { label: 'Kiln Feed', component: <KlinFeedTab /> },
  { label: 'Kiln Feed Quality', component: <KlinFeedQualityTab /> },
  { label: 'Boiler Performance', component: <BoilerPerfTab /> },
  { label: 'Kiln Temperature', component: <KilnTemp /> },
  { label: 'Kiln Output', component: <KlinOutputTab /> },
  { label: 'Kiln Output Quality', component: <KlinOutputQualityTab /> },
  { label: 'De-Stoning', component: <DeStoningTab /> },
  { label: 'De-Stoning Quality', component: <DeStoningQuality /> },
  { label: 'Screening Inward', component: <ScreeningInwTab /> },
  { label: 'Screening Outward', component: <ScreeningOutTab /> },
  { label: 'Re-Process', component: <Re_Process /> },
  { label: 'Re-Process Quality', component: <Re_Process_Quality /> },
  { label: 'Stock', component: <Stock /> }
];

export default function OperationPage() {
  const { access = [], accountid, userid } = useContext(AuthContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const selectedBorderColor = theme.palette.primary.main;
  // Only allow tabs with "Operations.<tab.label>" in access array
  const allowedTabs = allTabs.filter(tab =>
    access.includes(`Operations.${tab.label}`)
  );

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!allowedTabs.length) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Typography>No sections available based on your access.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
      <Box sx={{ width: 800 }}>
        {/* Tabs or Dropdown based on screen size */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
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
              {allowedTabs.map((tab, index) => (
                <Tab key={index} label={tab.label} disableRipple />
              ))}
            </Tabs>
          
        </Box>

        {/* Content Area */}
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
          {allowedTabs[activeTab]?.component}
        </Paper>
      </Box>
    </Box>
  );
}
