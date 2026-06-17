import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoticeBoard from './pages/NoticeBoard';
import CreateNotice from './pages/CreateNotice';
import Profile from './pages/Profile';
import Timetable from './pages/Timetable';
import Marks from './pages/Marks';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/notices" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="loader-spinner" /></div>;
  if (user) return <Navigate to={user.role === 'student' ? '/notices' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute roles={['admin', 'faculty']}><Dashboard /></PrivateRoute>} />
      <Route path="/notices" element={<PrivateRoute><NoticeBoard /></PrivateRoute>} />
      <Route path="/create-notice" element={<PrivateRoute roles={['admin', 'faculty']}><CreateNotice /></PrivateRoute>} />
      <Route path="/edit-notice/:id" element={<PrivateRoute roles={['admin', 'faculty']}><CreateNotice /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/timetable" element={<PrivateRoute><Timetable /></PrivateRoute>} />
      <Route path="/marks" element={<PrivateRoute><Marks /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="page-loader">
        <div className="loader-brand">
          <div className="sidebar-logo-icon" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>D</div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>DigiBoard</span>
        </div>
        <div className="loader-spinner" />
      </div>
    );
  }

  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
