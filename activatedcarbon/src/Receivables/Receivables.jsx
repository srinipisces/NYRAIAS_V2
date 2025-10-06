// src/Operations/Receivables.jsx
import * as React from "react";
import { Suspense } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  GlobalStyles,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "../AuthContext";

// ------- lazy-load tabs -------
const lazyWithTabName = (importer, tabName) =>
  React.lazy(() =>
    importer().then((mod) => ({
      default: (props) => <mod.default tabName={tabName} {...props} />,
    }))
  );

const SecurityTab = lazyWithTabName(() => import("./SecurityTab"), "Security");
const LabTab = lazyWithTabName(() => import("./InwardLab"), "Lab");
const RecordsTab = lazyWithTabName(
  () => import("./Receivables_Records"),
  "Records"
);

// ------- registry of all possible tabs -------
const TAB_ITEMS = [
  { label: "Security", key: "security", Component: SecurityTab },
  { label: "Lab", key: "lab", Component: LabTab },
  { label: "Records", key: "records", Component: RecordsTab },
];

// ------- helper: access check (Operations.Receivables.<Label>) -------
function hasAccessForTabLabel(accessList, tabLabel) {
  if (!Array.isArray(accessList) || !tabLabel) return false;
  const target = String(tabLabel).trim().toLowerCase(); // e.g. "lab"
  return accessList.some((token) => {
    if (typeof token !== "string") return false;
    const m = token.match(/^Operations\.Receivables\.(.+)$/i);
    if (!m) return false;
    const last = m[1].split(".").pop()?.trim().toLowerCase(); // after the prefix
    return last === target;
  });
}

// ------- a11y helpers -------
const a11yProps = (i) => ({
  id: `receivables-tab-${i}`,
  "aria-controls": `receivables-tabpanel-${i}`,
});

// ------- small error boundary for tab content -------
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
  }
  handleRetry = () =>
    this.setState((s) => ({ error: null, info: null, retryKey: s.retryKey + 1 }));
  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, borderColor: "error.light" }}>
            <Typography variant="subtitle1" sx={{ color: "error.main", mb: 1 }}>
              Something went wrong in this tab.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }} color="text.secondary">
              Try again. If it keeps happening, check logs/console.
            </Typography>
            <Button variant="contained" onClick={this.handleRetry}>
              Retry
            </Button>
          </Paper>
        </Box>
      );
    }
    return (
      <Box key={this.state.retryKey} sx={{ display: "contents" }}>
        {this.props.children}
      </Box>
    );
  }
}

// ------- clamp to container width; avoid horizontal overflow -------
function StrictClamp({ children }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "hidden",
        "& .MuiContainer-root, & .MuiPaper-root, & .MuiGrid-container, & .MuiGrid-item, & .MuiBox-root":
          { maxWidth: "100%", minWidth: 0 },
        "& table": { display: "block", width: "100%", maxWidth: "100%", overflowX: "auto" },
        "& img, & svg, & canvas, & video": { maxWidth: "100%", height: "auto" },
        "& [style*='width:']": { maxWidth: "100%" },
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
      id={`receivables-tabpanel-${index}`}
      aria-labelledby={`receivables-tab-${index}`}
      sx={{
        display: active ? "flex" : "none",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        minHeight: 0,
        overflowX: "hidden",
      }}
    >
      {active && (
        <TabErrorBoundary>
          <Suspense fallback={<Box sx={{ p: 2 }}>Loading…</Box>}>
            <StrictClamp>{children}</StrictClamp>
          </Suspense>
        </TabErrorBoundary>
      )}
    </Box>
  );
}

export default function Receivables() {
  const { access } = useAuth();
  const userAccess = Array.isArray(access) ? access : [];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // tabs the user is allowed to see; Records is ALWAYS visible
  const visibleTabs = React.useMemo(
    () =>
      TAB_ITEMS.filter(
        (t) => t.key === "records" || hasAccessForTabLabel(userAccess, t.label)
      ),
    [userAccess]
  );

  // default selection: Records if visible (it always is), else first visible
  const defaultIndex = React.useMemo(() => {
    const idx = visibleTabs.findIndex((t) => t.key === "records");
    return idx >= 0 ? idx : 0;
  }, [visibleTabs]);

  const [tab, setTab] = React.useState(0);

  // keep selected tab valid when access changes; prefer Records
  /* React.useEffect(() => {
    if (visibleTabs.length === 0) {
      setTab(0);
      return;
    }
    const preferRecords = visibleTabs.findIndex((t) => t.key === "records");
    const next = preferRecords >= 0 ? preferRecords : Math.min(tab, visibleTabs.length - 1);
    setTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTabs]); */

  // keep current tab if still valid; otherwise clamp to last index
  React.useEffect(() => {
    setTab((prev) => Math.min(prev, Math.max(visibleTabs.length - 1, 0)));
  }, [visibleTabs.length]);


  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <GlobalStyles
        styles={{
          "@media (max-width:600px)": {
            "html, body, #root": { overflowX: "hidden" },
          },
        }}
      />

      {/* Tabs header */}
      <Paper
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 0, sm: 2 } }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <Tabs
            value={Math.min(tab, Math.max(visibleTabs.length - 1, 0))}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons={isMobile ? false : "auto"}
            allowScrollButtonsMobile
            aria-label="Receivables Tabs"
            TabIndicatorProps={{ sx: { display: "none" } }}
            sx={{
              minHeight: 40,
              maxWidth: "100%",
              "& .MuiTabs-scroller": {
                overflowX: "auto !important",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              },
              "& .MuiTabs-flexContainer": { flexWrap: "nowrap", width: "max-content" },
              "& .MuiTabs-scrollButtons": { display: { xs: "none", sm: "flex" } },
            }}
          >
            {visibleTabs.map((t, i) => (
              <Tab
                key={t.key}
                label={t.label}
                {...a11yProps(i)}
                disableRipple
                sx={{
                  textTransform: "none",
                  minHeight: 36,
                  minWidth: { xs: "auto", sm: 120, md: 148 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          p: 0,
          overflowX: "hidden",
        }}
      >
        {visibleTabs.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No tabs available for your account.
            </Typography>
          </Box>
        ) : (
          visibleTabs.map((t, i) => (
            <TabPanel key={t.key} value={tab} index={i}>
              <Suspense fallback={<div style={{ padding: 16 }}>Loading {t.label}…</div>}>
                <t.Component />
              </Suspense>
            </TabPanel>
          ))
        )}
      </Box>
    </Box>
  );
}
