// src/Operations/PostActivation.jsx
import * as React from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// ---- Stub content per tab ----
function Section({ title }) {
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      {/* If content can overflow vertically, enable scroll here (not on the page) */}
      <Box sx={{ flex: 1, minHeight: 0 /* , overflow: 'auto' */ }}>
        {title} content goes here…
      </Box>
    </Paper>
  );
}

const TAB_ITEMS = [
  { label: 'Lab',              Component: () => <Section title="Lab" /> },
  { label: 'Screening',        Component: () => <Section title="Screening" /> },
  { label: 'Crushing',         Component: () => <Section title="Crushing" /> },
  { label: 'De-Dusting',       Component: () => <Section title="De-Dusting" /> },
  { label: 'De-Magnatizing',   Component: () => <Section title="De-Magnatizing" /> },
  { label: 'Blending',         Component: () => <Section title="Blending" /> },
  { label: 'Packaging',        Component: () => <Section title="Packaging" /> },
];

const a11yProps = (i) => ({ id: `postact-tab-${i}`, 'aria-controls': `postact-tabpanel-${i}` });

function TabPanel({ children, value, index }) {
  const active = value === index;
  return (
    <Box
      role="tabpanel"
      hidden={!active}
      id={`postact-tabpanel-${index}`}
      aria-labelledby={`postact-tab-${index}`}
      sx={{
        display: active ? 'flex' : 'none',
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        // no overflow here — let children decide
      }}
    >
      {active && children}
    </Box>
  );
}

export default function PostActivation() {
  const [tab, setTab] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: {xs:'100vw',sm:`calc(100vw - 300px)`},
        height: {
            xs: `calc(100dvh - 56px)`,
            sm: `calc(100dvh - 100px)`,
            },           // fit whatever PageLayout gives
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflowX: 'hidden',       // ← CRITICAL: prevent iOS page-wide horizontal scroll
        mt: { xs: -11, sm: -2 },
        ml: { xs: 0},
      }}
    >
      {/* Tabs header */}
      <Paper
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}
      >
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? false : 'auto'}
            allowScrollButtonsMobile
            aria-label="Post Activation Tabs"
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{
              minHeight: 40,
              '& .MuiTabs-scroller': {
                overflowX: 'auto !important',      // horizontal scroll lives inside tabs
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
              '& .MuiTabs-flexContainer': { flexWrap: 'nowrap' },
            }}
          >
            {TAB_ITEMS.map((t, i) => (
              <Tab
                key={t.label}
                label={t.label}
                {...a11yProps(i)}
                disableRipple
                sx={{
                  textTransform: 'none',
                  minHeight: 36,
                  minWidth: { xs: 'auto', sm: 160 },  // ← remove big default on mobile
                  px: { xs: 1.25, sm: 2 },
                  flexShrink: 0,                       // don’t shrink; enables horizontal scroll
                  whiteSpace: 'nowrap',
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Content area (no horizontal overflow; inner components manage vertical scroll) */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          p: { xs: 0, sm: 0 },
          overflowX: 'hidden',   // extra guard if any child tries to exceed width
          
        }}
      >
        {TAB_ITEMS.map((t, i) => (
          <TabPanel key={t.label} value={tab} index={i}>
            <t.Component />
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
