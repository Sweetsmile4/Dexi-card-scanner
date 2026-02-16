import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// User pages
import UserDashboard from './pages/user/Dashboard';
import UploadCard from './pages/user/UploadCard';
import Contacts from './pages/user/Contacts';
import ContactDetail from './pages/user/ContactDetail';
import Tags from './pages/user/Tags';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CardModeration from './pages/admin/CardModeration';
import ActivityLogs from './pages/admin/ActivityLogs';

// Layouts
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="spinner"></div></div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="spinner"></div></div>;
  }
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UserLayout><UploadCard /></UserLayout></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><UserLayout><Contacts /></UserLayout></ProtectedRoute>} />
      <Route path="/contacts/:id" element={<ProtectedRoute><UserLayout><ContactDetail /></UserLayout></ProtectedRoute>} />
      <Route path="/tags" element={<ProtectedRoute><UserLayout><Tags /></UserLayout></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><UserManagement /></AdminLayout></AdminRoute>} />
      <Route path="/admin/cards" element={<AdminRoute><AdminLayout><CardModeration /></AdminLayout></AdminRoute>} />
      <Route path="/admin/logs" element={<AdminRoute><AdminLayout><ActivityLogs /></AdminLayout></AdminRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
