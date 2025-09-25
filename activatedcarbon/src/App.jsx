// App.jsx
import { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './AuthContext';

import PageLayout from './Layout/PageLayout';
import Dashboard from './Dashboard/Dashboard';
import OperationPage from './pages/Operations';
import SettingsPage from './Settings/settings';
import ReportsPage from './Reports/Reports';
import DataFlow from './pages/DataFlow';
import Unauthorized from './pages/Unauthorized';

// --- Lazy pages ---
const PostActivation = lazy(() => import('./PostActivation/PostActivation'));
const ReceivablesPage = lazy(() => import('./Receivables/Receivables'));
const RMSPage = lazy(() => import('./RMS/rms'));
// TEMP: point all Ops child routes to PostActivation until ready
const Receivables = ReceivablesPage;
const RMS = RMSPage;
const Activation = PostActivation;
const Delivery = PostActivation;

function App() {
  const { access } = useContext(AuthContext);

  // helper: allow exact token OR any child token (prefix)
  const has = (key) =>
    Array.isArray(access) && access.some(a => a === key || a.startsWith(`${key}.`));

  return (
    <Suspense fallback ={<div style={{ padding: 16 }}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          {/* Dashboard (index) */}
          {has('Dashboard') && <Route index element={<Dashboard />} />}

          {/* If Dashboard not allowed, pick first accessible section */}
          {!has('Dashboard') && (
            <Route
              index
              element={
                access?.some(a => a.startsWith('Operations.')) ? (
                  <Navigate to="/operations" replace />
                ) : has('Reports') ? (
                  <Navigate to="/reports" replace />
                ) : has('Settings') ? (
                  <Navigate to="/settings" replace />
                ) : access?.includes('DataFlow') ? (
                  <Navigate to="/dataflow" replace />
                ) : (
                  <Navigate to="/unauthorized" replace />
                )
              }
            />
          )}

          {/* Operations landing */}
          <Route
            path="operations"
            element={
              access?.some(a => a.startsWith('Operations.')) ? (
                <OperationPage />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />

          {/* Operations children (TEMP all -> PostActivation) */}
          <Route
            path="operations/receivables"
            element={ has('Operations.Receivables') ? <Receivables /> : <Navigate to="/unauthorized" replace /> }
          />
          <Route
            path="operations/rms"
            element={ has('Operations.RMS') ? <RMS /> : <Navigate to="/unauthorized" replace /> }
          />
          <Route
            path="operations/activation"
            element={ has('Operations.Activation') ? <Activation /> : <Navigate to="/unauthorized" replace /> }
          />
          <Route
            path="operations/post-activation"
            element={ has('Operations.PostActivation') ? <PostActivation /> : <Navigate to="/unauthorized" replace /> }
          />
          <Route
            path="operations/delivery"
            element={ has('Operations.Delivery') ? <Delivery /> : <Navigate to="/unauthorized" replace /> }
          />

          {/* Reports (allow if Reports or any Reports.*) */}
          <Route
            path="reports"
            element={ has('Reports') ? <ReportsPage /> : <Navigate to="/unauthorized" replace /> }
          />

          {/* Settings */}
          <Route
            path="settings"
            element={ has('Settings') ? <SettingsPage /> : <Navigate to="/unauthorized" replace /> }
          />

          {/* DataFlow */}
          <Route
            path="dataflow"
            element={ access?.includes('DataFlow') ? <DataFlow /> : <Navigate to="/unauthorized" replace /> }
          />

          {/* Unauthorized */}
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
