import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LinkAccount from './pages/LinkAccount';
import AgentDashboard from './pages/AgentDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return null;

  switch (profile.role) {
    case 'agent':
      return <AgentDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    default:
      return <div>Invalid role</div>;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/link-account" element={<LinkAccount />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
