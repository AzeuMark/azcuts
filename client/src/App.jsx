import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardShell from './components/layout/DashboardShell';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Maintenance from './pages/public/Maintenance';
import NotFound from './pages/public/NotFound';

// User pages
import BookWizard from './pages/user/BookWizard';
import UserHistory from './pages/user/History';
import UserSettings from './pages/user/Settings';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffHistory from './pages/staff/History';
import StaffSettings from './pages/staff/Settings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStaffHistory from './pages/admin/StaffHistory';
import AdminUserHistory from './pages/admin/UserHistory';
import AdminAnalytics from './pages/admin/Analytics';
import UserManager from './pages/admin/UserManager';
import AdminInventory from './pages/admin/Inventory';
import SystemSettings from './pages/admin/SystemSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/maintenance" element={<Maintenance />} />

        {/* User portal */}
        <Route
          path="/app"
          element={
            <ProtectedRoute role="user">
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/book" replace />} />
          <Route path="book" element={<BookWizard />} />
          <Route path="history" element={<UserHistory />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* Staff portal */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="history" element={<StaffHistory />} />
          <Route path="settings" element={<StaffSettings />} />
        </Route>

        {/* Admin portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManager />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="history/staff" element={<AdminStaffHistory />} />
          <Route path="history/users" element={<AdminUserHistory />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
