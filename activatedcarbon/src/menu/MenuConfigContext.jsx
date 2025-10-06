import React from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const MenuConfigContext = React.createContext(null);
export const useMenuConfig = () => React.useContext(MenuConfigContext);

// Vite: preload every page component you might reference from the JSON.
// (Keep paths real so bundler includes them)
const COMPONENT_MODULES = import.meta.glob('/src/**/*.{jsx,tsx}', { eager: false });

const hasAccessToken = (access, key) =>
  Array.isArray(access) && (access.includes(key) || access.some(a => a.startsWith(`${key}.`)));

function buildFromConfig(cfg, access) {
  const items = [];
  const tabsByRoute = {};
  const menu = cfg?.menu_structure || {};
  const routesMap = cfg?.routes || {};
  const componentsMap = cfg?.components || {};
  const icons = cfg?.icons || {};

  const getRoute = (key) =>
    typeof routesMap[key] === 'string' ? routesMap[key].trim() : null;

  const addTop = (topKey, topRoute, children) => {
    const topEnabled =
      hasAccessToken(access, topKey) || (children?.some?.((c) => c.enabled) ?? false);

    if (children?.length) {
      items.push({ label: topKey, iconKey: icons[topKey?.toLowerCase?.()] || topKey, enabled: topEnabled, children });
    } else if (topRoute) {
      items.push({ label: topKey, iconKey: icons[topKey?.toLowerCase?.()] || topKey, to: topRoute, enabled: topEnabled });
    }
  };

  for (const [topKey, value] of Object.entries(menu)) {
    const topRoute = getRoute(topKey);
    const isArray = Array.isArray(value);
    const isObject = value && typeof value === 'object' && !isArray;

    if (isArray) {
      // e.g., Reports: [] -> tabs (needs a top route)
      if (topRoute) {
        tabsByRoute[topRoute] = value.slice();
        addTop(topKey, topRoute, null);
      }
      continue;
    }

    if (isObject) {
      const children = [];
      for (const [childKey, leafArray] of Object.entries(value)) {
        const childRoute = getRoute(`${topKey}.${childKey}`);
        const tabs = Array.isArray(leafArray) ? leafArray : [];

        if (childRoute) {
          if (tabs.length) tabsByRoute[childRoute] = tabs.slice();
          children.push({
            label: childKey,
            to: childRoute,
            enabled: hasAccessToken(access, `${topKey}.${childKey}`),
          });
        } else if (topRoute) {
          // no child route => becomes a tab on top page
          tabsByRoute[topRoute] = [ ...(tabsByRoute[topRoute] || []), childKey ];
        }
      }
      addTop(topKey, topRoute, children);
      continue;
    }

    if (topRoute) addTop(topKey, topRoute, null);
  }

  // always add Logout
  items.push({ label: 'Logout', iconKey: 'logout', logout: true, enabled: true });

  return { items, tabsByRoute, routesMap, componentsMap };
}

/* const iconEl = (key) => {
  // map your small set of icon keys -> MUI components
  // (keep consistent with your Sidebar)
  switch ((key || '').toLowerCase()) {
    case 'dashboard': return (await import('@mui/icons-material/Dashboard')).default;
    default: return null;
  }
}; */

export function MenuConfigProvider({ children, access }) {
  const [state, setState] = React.useState({ items: [], tabsByRoute: {}, routesMap: {}, componentsMap: {}, raw: null });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/menu_strucutre`, { withCredentials: true });
        if (!alive) return;
        const built = buildFromConfig(data, access);
        setState({ ...built, raw: data });
      } catch (e) {
        // minimal fallback
        const fallback = {
          menu_structure: { Dashboard: [], Settings: [] },
          routes: { Dashboard: '/', Settings: '/settings' },
          components: {
            Dashboard: '/src/Dashboard/Dashboard.jsx',
            Settings: '/src/Settings/settings.jsx',
          }
        };
        const built = buildFromConfig(fallback, access);
        setState({ ...built, raw: fallback });
      }
    })();
    return () => { alive = false; };
  }, [access]);

  // dynamic component loader by key in cfg.components
  const loadComponent = React.useCallback((key) => {
    const path = state.componentsMap[key];
    if (path && COMPONENT_MODULES[path]) {
      return React.lazy(COMPONENT_MODULES[path]);
    }
    // fallback empty page to avoid crash
    return React.lazy(async () => ({ default: () => <div style={{ padding: 16 }}>Page not available</div> }));
  }, [state.componentsMap]);

  const value = React.useMemo(() => ({
    items: state.items,
    tabsByRoute: state.tabsByRoute,
    routesMap: state.routesMap,
    componentsMap: state.componentsMap,
    raw: state.raw,
    loadComponent,
  }), [state, loadComponent]);

  return <MenuConfigContext.Provider value={value}>{children}</MenuConfigContext.Provider>;
}
