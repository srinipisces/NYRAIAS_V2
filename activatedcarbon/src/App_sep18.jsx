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
// Real page:
const PostActivation = lazy(() => import('./PostActivation/PostActivation'));

// TEMP: point all Ops child routes to PostActivation until ready
const Receivables = PostActivation;
const RMS = PostActivation;
const Activation = PostActivation;
const Delivery = PostActivation;

function App() {
  const { access } = useContext(AuthContext);

  return (
    <Suspense fallback ={<div style={{ padding: 16 }}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          {/* Dashboard (index) */}
          {access?.includes('Dashboard') && <Route index element={<Dashboard />} />}

          {/* If Dashboard not allowed, pick first accessible section */}
          {!access?.includes('Dashboard') && (
            <Route
              index
              element={
                access?.some(a => a.startsWith('Operations.')) ? (
                  <Navigate to="/operations" replace />
                ) : access?.includes('Reports') ? (
                  <Navigate to="/reports" replace />
                ) : access?.includes('Settings') ? (
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
            element={
              access?.includes('Operations.Receivables') ? (
                <Receivables />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />
          <Route
            path="operations/rms"
            element={
              access?.includes('Operations.RMS') ? (
                <RMS />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />
          <Route
            path="operations/activation"
            element={
              access?.includes('Operations.Activation') ? (
                <Activation />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />
          <Route
            path="operations/post-activation"
            element={
              access?.includes('Operations.PostActivation') ? (
                <PostActivation />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />
          <Route
            path="operations/delivery"
            element={
              access?.includes('Operations.Delivery') ? (
                <Delivery />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />

          {/* Reports */}
          <Route
            path="reports"
            element={
              access?.includes('Reports') ? <ReportsPage /> : <Navigate to="/unauthorized" replace />
            }
          />

          {/* Settings */}
          <Route
            path="settings"
            element={
              access?.includes('Settings') ? <SettingsPage /> : <Navigate to="/unauthorized" replace />
            }
          />

          {/* DataFlow */}
          <Route
            path="dataflow"
            element={
              access?.includes('DataFlow') ? <DataFlow /> : <Navigate to="/unauthorized" replace />
            }
          />

          {/* Unauthorized */}
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
