// src/Operations/PostActivation.jsx
import * as React from 'react';
import { Suspense } from 'react';
import { Box, Paper, Tabs, Tab, GlobalStyles, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Helper: lazy() + inject tabName
const lazyWithTabName = (importer, tabName) =>
  React.lazy(() =>
    importer().then((mod) => ({
      default: (props) => <mod.default tabName={tabName} {...props} />,
    }))
  );

// Quality stays standalone (no props injected)
const LabTab = React.lazy(() => import('./Quality'));

// Load_Unload with just tabName baked in
const ScreeningTab     = lazyWithTabName(() => import('./Load_Unload'), 'Screening');
const CrushingTab      = lazyWithTabName(() => import('./Load_Unload'), 'Crushing');
const DeDustingTab     = lazyWithTabName(() => import('./Load_Unload'), 'De-Dusting');
const DeMagnatizingTab = lazyWithTabName(() => import('./Load_Unload'), 'De-Magnetize');
const BlendingTab      = lazyWithTabName(() => import('./Load_Unload'), 'Blending');
const StockTab     = lazyWithTabName(() => import('./ProcessRecords'), 'ProcessRecords');

// Optional: your tab registry
const TAB_ITEMS = [
  { label: 'Quality',      key: 'quality',     Component: LabTab },
  { label: 'Screening',    key: 'screening',   Component: ScreeningTab },
  { label: 'Crushing',     key: 'crushing',    Component: CrushingTab },
  { label: 'De-Dusting',   key: 'dedusting',   Component: DeDustingTab },
  { label: 'De-Magnetize', key: 'demagnetize', Component: DeMagnatizingTab },
  { label: 'Blending',     key: 'blending',    Component: BlendingTab },
  { label: 'ProcessRecords',    key: 'processrecords',   Component: StockTab },
];

const a11yProps = (i) => ({ id: `postact-tab-${i}`, 'aria-controls': `postact-tabpanel-${i}` });

/** Error boundary that isolates each tab */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, retryKey: 0 };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    // Optional: send to your logger here
  }
  handleRetry = () => {
    this.setState((s) => ({ error: null, info: null, retryKey: s.retryKey + 1 }));
  };
  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.light' }}>
            <Typography variant="subtitle1" sx={{ color: 'error.main', mb: 1 }}>
              Something went wrong in this tab.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }} color="text.secondary">
              Try again. If the problem persists, check the console/logs.
            </Typography>
            <Button variant="contained" onClick={this.handleRetry}>Retry</Button>
            {/* Optional dev details:
            <Box component="pre" sx={{ mt: 2, fontSize: 12, whiteSpace: 'pre-wrap' }}>
              {String(this.state.error)}{'\n'}{this.state.info?.componentStack}
            </Box>
            */}
          </Paper>
        </Box>
      );
    }
    // remount children on retry
    return <Box key={this.state.retryKey} sx={{ display: 'contents' }}>{this.props.children}</Box>;
  }
}

/** Clamp EVERYTHING inside the active tab (prevents horizontal overflow) */
function StrictClamp({ children }) {
  return (
    <Box
      sx={{
        width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden',
        '& .MuiContainer-root, & .MuiPaper-root, & .MuiGrid-container, & .MuiGrid-item, & .MuiBox-root': {
          maxWidth: '100%', minWidth: 0,
        },
        '& table': { display: 'block', width: '100%', maxWidth: '100%', overflowX: 'auto' },
        '& img, & svg, & canvas, & video': { maxWidth: '100%', height: 'auto' },
        '& [style*="width:"]': { maxWidth: '100%' },
      }}
    >
      {children}
    </Box>
  );
}

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
        width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0,
        overflowX: 'hidden',
      }}
    >
      {active && (
        <TabErrorBoundary>
          <React.Suspense fallback={<Box sx={{ p: 2 }}>Loading…</Box>}>
            <StrictClamp>{children}</StrictClamp>
          </React.Suspense>
        </TabErrorBoundary>
      )}
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
        flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        overflowX: 'hidden', overflowY: 'auto', boxSizing: 'border-box',
      }}
    >
      {/* Guard against stray X-overflow on small screens */}
      <GlobalStyles styles={{
        '@media (max-width:600px)': { 'html, body, #root': { overflowX: 'hidden' } },
      }} />

      {/* Tabs header */}
      <Paper
        square elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 0, sm: 2 } }}
      >
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons={isMobile ? false : 'auto'}
            allowScrollButtonsMobile
            aria-label="Post Activation Tabs"
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{
              minHeight: 40, maxWidth: '100%',
              '& .MuiTabs-scroller': {
                overflowX: 'auto !important', overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
              '& .MuiTabs-flexContainer': { flexWrap: 'nowrap', width: 'max-content' },
              '& .MuiTabs-scrollButtons': { display: { xs: 'none', sm: 'flex' } },
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
                  minWidth: { xs: 'auto', sm: 120, md: 148 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 1,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Content area */}
      <Box
        sx={{
          flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, minHeight: 0,
          display: 'flex', flexDirection: 'column', p: 0, overflowX: 'hidden',
        }}
      >
        {TAB_ITEMS.map((t, i) => (
          <TabPanel key={t.key} value={tab} index={i}>
            <Suspense fallback={<div style={{ padding: 16 }}>Loading {t.label}…</div>}>
              <t.Component />
            </Suspense>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
