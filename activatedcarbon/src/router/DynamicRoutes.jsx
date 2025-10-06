import React, { Suspense, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';
import Unauthorized from '../pages/Unauthorized';
import { useMenuConfig } from '../menu/MenuConfigContext';
import { AuthContext } from '../AuthContext';

const has = (access, key) =>
  Array.isArray(access) && access.some(a => a === key || a.startsWith(`${key}.`));

export default function DynamicRoutes() {
  const { access } = useContext(AuthContext);
  const { items, routesMap, loadComponent } = useMenuConfig();

  // Build <Route> elements from items
  const routeEls = [];

  // Helper to push a route if it has a path and component key
  const pushRoute = (label, pathKey, accessKey) => {
    const path = routesMap[pathKey];
    if (!path) return;

    const Elem = loadComponent(pathKey);
    routeEls.push(
      <Route
        key={pathKey}
        path={path.replace(/^\//, '')} // Routes are nested under "/"
        element={ has(access, accessKey) ? <Elem /> : <Navigate to="/unauthorized" replace /> }
      />
    );
  };

  // Top-level / children
  for (const it of items) {
    if (it.logout) continue;

    if (it.to) {
      // top-level page
      const key = it.label;
      pushRoute(it.label, key, key);
    }
    if (Array.isArray(it.children)) {
      for (const c of it.children) {
        const key = `${it.label}.${c.label}`;
        pushRoute(c.label, key, key);
      }
    }
  }

  // Default index: first accessible route or Unauthorized
  const firstAccessible = (() => {
    for (const it of items) {
      if (it.logout) continue;
      if (it.to && has(access, it.label)) return routesMap[it.label] || '/';
      if (it.children) {
        for (const c of it.children) {
          const key = `${it.label}.${c.label}`;
          if (has(access, key)) return routesMap[key];
        }
      }
    }
    return '/unauthorized';
  })();

  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<Navigate to={firstAccessible} replace />} />
          {routeEls}
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
