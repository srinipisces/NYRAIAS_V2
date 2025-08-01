import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './AuthContext';

import PageLayout from './Components/v2/PageLayout';
import Dashboard from './pages/Dashboard';
import OperationPage from './pages/Operations';
import SettingsPage from './pages/settings';
import ReportsPage from './Reports/Reports';
import DataFlow from './pages/DataFlow';
import Unauthorized from './pages/Unauthorized'; // Make sure this file exists

function App() {
  const { access } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        {/* Show Dashboard only if access is allowed */}
        {access?.includes('Dashboard') && (
          <Route index element={<Dashboard />} />
        )}

        {/* If Dashboard is not allowed, redirect index to another accessible route */}
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
              ): (
                <Navigate to="/unauthorized" replace />
              )
            }
          />
        )}

        {/* Operations Route */}
        <Route
          path="operations"
          element={
            access?.some((a) => a.startsWith('Operations.')) ? (
              <OperationPage />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          }
        />

        {/* Reports Route */}
        <Route
          path="reports"
          element={
            access?.includes('Reports') ? (
              <ReportsPage />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          }
        />

        {/* Settings Route */}
        <Route
          path="settings"
          element={
            access?.includes('Settings') ? (
              <SettingsPage />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          }
        />
        {/* DataFlow Route */}
        <Route
          path="dataflow"
          element={
            access?.includes('DataFlow') ? (
              <DataFlow />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          }
        />

        {/* Unauthorized Fallback */}
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
    </Routes>
  );
}

export default App;
