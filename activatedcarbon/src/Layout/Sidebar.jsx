// src/Settings/SidebarV2.jsx
import * as React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip,
  Snackbar, Alert
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CircleIcon from '@mui/icons-material/Circle';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

// Icon registry (backend provides string keys; we map them here)
const ICONS = {
  dashboard: <DashboardIcon />,
  workspaces: <WorkspacesIcon />,
  operations: <WorkspacesIcon />,
  assessment: <AssessmentIcon />,
  reports: <AssessmentIcon />,
  settings: <SettingsIcon />,
  logout: <LogoutIcon />,
};

const iconFrom = (iconMap, key) =>
  ICONS[(iconMap[key.toLowerCase()] || key.toLowerCase())] ?? <CircleIcon sx={{ fontSize: 8 }} />;

// access: enabled if user has exact or prefix (Top.* or Top.Child.*)
const hasAccessToken = (access, key) =>
  access.includes(key) || access.some(a => a.startsWith(`${key}.`));

// ---------- MAIN BUILDER (route-driven; preserves order from menu_structure) ----------
/**
 * Rules:
 * - Only keys that have a route in `routes` become menu items.
 * - Level-2 without a route => becomes a tab on its parent (not a menu item).
 * - Top-level arrays => tabs on that top-level page (needs a route in `routes`).
 * - We DO NOT invent routes; if a top-level has no route and only tabs, those tabs are ignored (so provide a route).
 */
function buildItemsFromConfig(cfg, access) {
  const items = [];
  const tabsByRoute = {};

  const menu = cfg?.menu_structure || {};
  const routesMap = cfg?.routes || {};
  const iconMap = Object.fromEntries(
    Object.entries(cfg?.icons || {}).map(([k, v]) => [k.toLowerCase(), v])
  );

  // --- NEW: order + meta handling ------------------------------------
  const META_KEYS = new Set(['menu_order', 'child_order']);

  // Top-level order comes from menu_structure.menu_order if present
  const topOrder = Array.isArray(menu.menu_order) && menu.menu_order.length
    ? menu.menu_order
    : Object.keys(menu).filter(k => !META_KEYS.has(k));

  // Child order map lives inside menu_structure.child_order
  const childOrderMap = (menu.child_order && typeof menu.child_order === 'object')
    ? menu.child_order
    : {};
  // -------------------------------------------------------------------

  for (const topKey of topOrder) {
    if (!(topKey in menu)) continue;                   // skip unknown keys
    const value = menu[topKey];
    const topRoute = typeof routesMap[topKey] === 'string' ? routesMap[topKey].trim() : null;

    const isArray = Array.isArray(value);
    const isObject = value && typeof value === 'object' && !isArray;

    // === Arrays (e.g., Reports) — keep your existing behavior ===
    if (isArray) {
      // If your code already treats arrays as tabs, keep it:
      if (topRoute) {
        tabsByRoute[topRoute] = value.slice();         // preserve given order
        items.push({
          label: topKey,
          icon: iconFrom(iconMap, topKey),
          to: topRoute,
          enabled: hasAccessToken(access, topKey),
        });
      } else {
        // or your existing fallback if any
        items.push({
          label: topKey,
          icon: iconFrom(iconMap, topKey),
          enabled: hasAccessToken(access, topKey),
        });
      }
      continue;
    }

    // === Objects (groups) — use child_order if provided ===
    if (isObject) {
      const group = value;
      const childOrder = Array.isArray(childOrderMap[topKey])
        ? childOrderMap[topKey]
        : Object.keys(group);

      const children = [];
      for (const childKey of childOrder) {
        if (!(childKey in group)) continue;
        const leaf = group[childKey];

        const childRouteKey = `${topKey}.${childKey}`;
        const childRoute = typeof routesMap[childRouteKey] === 'string'
          ? routesMap[childRouteKey].trim()
          : null;

        if (Array.isArray(leaf)) {
          // If this child has tabs (array), keep your existing handling
          if (childRoute) tabsByRoute[childRoute] = leaf.slice();
          if (childRoute) {
            children.push({
              label: childKey,
              to: childRoute,
              enabled: hasAccessToken(access, childRouteKey),
            });
          }
        } else {
          // leaf is an object or primitive — use your existing logic
          if (childRoute) {
            children.push({
              label: childKey,
              to: childRoute,
              enabled: hasAccessToken(access, childRouteKey),
            });
          }
        }
      }

      const topEnabled =
        hasAccessToken(access, topKey) || children.some(c => c.enabled);

      if (children.length > 0 || topRoute) {
        items.push({
          label: topKey,
          icon: iconFrom(iconMap, topKey),
          ...(children.length ? { children } : { to: topRoute }),
          enabled: topEnabled,
        });
      }
      continue;
    }

    // === Primitive/unknown: render only if it has a route ===
    if (topRoute) {
      items.push({
        label: topKey,
        icon: iconFrom(iconMap, topKey),
        to: topRoute,
        enabled: hasAccessToken(access, topKey),
      });
    }
  }

  // Keep your existing "Logout" item append here if you have one
  items.push({
      label: 'Logout',
      icon: ICONS[(cfg?.icons?.logout || 'logout').toLowerCase()] || ICONS.logout,
      logout: true,              // <- mark it so we can place it at bottom
      enabled: true,
    });
  return { items, tabsByRoute };
}


// ---------- Row ----------
const Row = ({ label, icon, to, enabled = true, indent = false, logout = false, onClick }) => {
  const content = (
    <ListItemButton
      component={logout ? 'div' : (enabled && to ? NavLink : 'div')}
      to={logout || !enabled ? undefined : to}
      onClick={onClick}
      disabled={!enabled && !logout}
      sx={{
        borderRadius: 1,
        mx: 0.5,
        pl: indent ? 4 : 2,
        '&.Mui-disabled': { opacity: 0.5 },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon ?? <CircleIcon sx={{ fontSize: 8 }} />}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );

  return (
    <Tooltip placement="right" title={logout ? '' : (!enabled ? 'No access' : '')}>
      <span>{content}</span>
    </Tooltip>
  );
};

// ---------- Component ----------
export default function SidebarV2({
  collapsed = false,
  onItemClick,
  logo,
}) {
  const auth = React.useContext(AuthContext) || {};
  const access = auth?.access || auth?.user?.access || []; // tokens from AuthContext

  const [items, setItems] = React.useState([]);
  const [tabsByRoute, setTabsByRoute] = React.useState({});
  const [snack, setSnack] = React.useState({ open: false, msg: '', sev: 'error' });

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/users/logout`, {}, { withCredentials: true });
    } catch (_) {}
    window.location.href = import.meta.env.VITE_REDIRECT;
  };

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/menu_structure`, { withCredentials: true });
        if (!alive) return;
        const built = buildItemsFromConfig(data, access);
        setItems(built.items);
        setTabsByRoute(built.tabsByRoute);
      } catch (e) {
        if (!alive) return;
        setSnack({ open: true, msg: 'Failed to load menu', sev: 'error' });
        // minimal fallback (only if backend is down)
        const fallback = buildItemsFromConfig(
          { menu_structure: { Dashboard: [], Settings: [] }, routes: { Dashboard: '/', Settings: '/settings' } },
          access
        );
        setItems(fallback.items);
        setTabsByRoute(fallback.tabsByRoute);
      }
    })();
    return () => { alive = false; };
  }, [access]);

  // Optional: expose tabs to pages (replace with proper context if you prefer)
  React.useEffect(() => {
    window.__TABS_BY_ROUTE__ = tabsByRoute;
  }, [tabsByRoute]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto', px: 1, pt: 1 }}>
        <List dense sx={{ pt: 0 }}>
          {items.map((it) => {
            const { label, icon, to, logout, enabled, children } = it;

            const topRow = (
              <Row
                key={`${label}-top`}
                label={label}
                icon={icon}
                to={to}
                enabled={enabled || logout}
                logout={logout}
                onClick={() => {
                  if (logout) return handleLogout();
                  onItemClick?.();
                }}
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
                      enabled={c.enabled}
                      indent
                      onClick={() => onItemClick?.()}
                    />
                  ))}
                </List>
              </Box>
            );
          })}
        </List>
      </Box>

      {logo && (
        <Box
          sx={{
            mt: 'auto',
            mb: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logo}
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
