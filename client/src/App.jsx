import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout           from "./components/Layout/Layout";
import AuthPage         from "./pages/AuthPage";
import Dashboard        from "./pages/Dashboard";
import CreatePickupPage from "./pages/CreatePickupPage";
import ParcelsPage      from "./pages/ParcelsPage";
import ShipmentManagement from "./pages/ShipmentManagement";
import CustomerDashboard  from "./pages/CustomerDashboard";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/auth" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth"   element={<AuthPage />} />
      <Route path="/login"  element={<Navigate to="/auth" replace />} />
      <Route path="/signup" element={<Navigate to="/auth" replace />} />
      <Route path="/"       element={<Navigate to="/dashboard" replace />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pickups"   element={<ProtectedRoute><CreatePickupPage /></ProtectedRoute>} />
      <Route path="/parcels"   element={<ProtectedRoute><ParcelsPage /></ProtectedRoute>} />
      <Route path="/shipments" element={<ProtectedRoute><ShipmentManagement /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
