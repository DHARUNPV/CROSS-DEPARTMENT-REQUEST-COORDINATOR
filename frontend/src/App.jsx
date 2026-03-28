import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestDetail from './pages/RequestDetail';
import SubmitComplaint from './pages/SubmitComplaint';
import SubmitDocument from './pages/SubmitDocument';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) {
    if (user.role === 'citizen') return <Navigate to="/dashboard" replace />;
    if (user.role === 'officer') return <Navigate to="/officer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const getDefault = () => {
    if (!user) return '/login';
    if (user.role === 'citizen') return '/dashboard';
    if (user.role === 'officer') return '/officer';
    return '/admin';
  };

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<Navigate to={getDefault()} replace />} />
      <Route path="/dashboard" element={<PrivateRoute roles={['citizen']}><Layout><CitizenDashboard /></Layout></PrivateRoute>} />
      <Route path="/complaint" element={<PrivateRoute roles={['citizen']}><Layout><SubmitComplaint /></Layout></PrivateRoute>} />
      <Route path="/document" element={<PrivateRoute roles={['citizen']}><Layout><SubmitDocument /></Layout></PrivateRoute>} />
      <Route path="/request/:id" element={<PrivateRoute><Layout><RequestDetail /></Layout></PrivateRoute>} />
      <Route path="/officer" element={<PrivateRoute roles={['officer']}><Layout><OfficerDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
