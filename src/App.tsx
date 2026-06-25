import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CartModal from './components/ordering/Cartmodal';
import ScrollToHash from './components/layout/ScrollToHash';
import { useAuth } from './context/AuthContext';
import type { UserRole } from './types';
import LandingPage from './pages/LandingPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardDispatchPage from './pages/dashboard/DashboardDispatchPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardMenuPage from './pages/dashboard/DashboardMenuPage';
import DashboardOrdersPage from './pages/dashboard/DashboardOrdersPage';
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import DashboardReportsPage from './pages/dashboard/DashboardReportsPage';
import DashboardStaffPage from './pages/dashboard/DashboardStaffPage';
import DashboardStatsPage from './pages/dashboard/DashboardStatsPage';
import DashboardStockPage from './pages/dashboard/DashboardStockPage';
import MyOrdersPage from './pages/orders/MyOrdersPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'customer' ? '/mes-commandes' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

const staffRoles: UserRole[] = ['admin', 'waiter', 'chef', 'delivery'];

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="stats" element={<DashboardStatsPage />} />
          <Route path="orders" element={<DashboardOrdersPage />} />
          <Route path="menu" element={<DashboardMenuPage />} />
          <Route path="stock" element={<DashboardStockPage />} />
          <Route path="staff" element={<DashboardStaffPage />} />
          <Route path="reports" element={<DashboardReportsPage />} />
          <Route path="zones" element={<DashboardDispatchPage />} />
        </Route>

        <Route
          path="/mes-commandes"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route path="/connexion" element={<Navigate to="/login" replace />} />
        <Route path="/inscription" element={<Navigate to="/register" replace />} />
        <Route path="/mdp-oublie" element={<Navigate to="/forgot-password" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CartModal />
    </>
  );
}
