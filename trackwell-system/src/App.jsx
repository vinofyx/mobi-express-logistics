import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import Layout from './components/Layout/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CreatePickupPage from './pages/CreatePickupPage';
import ShipmentManagement from './pages/ShipmentManagement';
import CustomerDashboard from './pages/CustomerDashboard';
import ParcelsPage from './pages/ParcelsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/auth"  element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/"      element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pickups"   element={<ProtectedRoute><CreatePickupPage /></ProtectedRoute>} />
      <Route path="/parcels"   element={<ProtectedRoute><ParcelsPage /></ProtectedRoute>} />
      <Route path="/shipments" element={<ProtectedRoute><ShipmentManagement /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
