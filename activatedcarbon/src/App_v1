import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './AuthContext';

import PageLayout from './Components/v2/PageLayout';
import Dashboard from './pages/Dashboard';
import OperationPage from './pages/Operations';
import SettingsPage from './pages/settings';
import ReportsPage from './pages/Reports';

function App() {
  const { access } = useContext(AuthContext);

  return (
    <Routes>
      {/* All routes live under PageLayout */}
      <Route path="/" element={<PageLayout />}>
        {/* Dashboard is always accessible */}
        <Route index element={<Dashboard />} />

        {/* Operations route: check if any "Operations.*" access exists */}
        <Route
          path="operations"
          element={
            access?.some(a => a.startsWith('Operations.')) ? (
              <OperationPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Settings route: needs "Settings" access */}
        <Route
          path="settings"
          element={
            access?.includes('Settings') ? (
              <SettingsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Reports route: needs "Reports" access */}
        <Route
          path="reports"
          element={
            access?.includes('Reports') ? (
              <ReportsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
