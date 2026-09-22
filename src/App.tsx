import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CartModal from './components/ordering/Cartmodal';
import ScrollToHash from './components/layout/ScrollToHash';
import { useAuth } from './context/AuthContext';
import type { UserRole } from './types';
import LandingPage from './pages/LandingPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import StripeCancelPage from './pages/StripeCancelPage';
import StripeSuccessPage from './pages/StripeSuccessPage';
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
    return <Navigate to={user.role === 'customer' || user.role === 'client' ? '/mes-commandes' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

const staffRoles: UserRole[] = ['admin', 'waiter', 'chef', 'delivery'];
const adminOnly: UserRole[] = ['admin'];
const kitchenAndAdmin: UserRole[] = ['admin', 'chef', 'waiter', 'delivery'];

function DashboardChildRoute({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/payment/stripe/success" element={<StripeSuccessPage />} />
        <Route path="/payment/stripe/cancel" element={<StripeCancelPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={staffRoles}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route
            path="stats"
            element={
              <DashboardChildRoute allowedRoles={adminOnly}>
                <DashboardStatsPage />
              </DashboardChildRoute>
            }
          />
          <Route path="orders" element={<DashboardOrdersPage />} />
          <Route
            path="menu"
            element={
              <DashboardChildRoute allowedRoles={kitchenAndAdmin}>
                <DashboardMenuPage />
              </DashboardChildRoute>
            }
          />
          <Route
            path="stock"
            element={
              <DashboardChildRoute allowedRoles={kitchenAndAdmin}>
                <DashboardStockPage />
              </DashboardChildRoute>
            }
          />
          <Route
            path="staff"
            element={
              <DashboardChildRoute allowedRoles={adminOnly}>
                <DashboardStaffPage />
              </DashboardChildRoute>
            }
          />
          <Route
            path="reports"
            element={
              <DashboardChildRoute allowedRoles={adminOnly}>
                <DashboardReportsPage />
              </DashboardChildRoute>
            }
          />
          <Route
            path="zones"
            element={
              <DashboardChildRoute allowedRoles={['admin', 'delivery']}>
                <DashboardDispatchPage />
              </DashboardChildRoute>
            }
          />
        </Route>

        <Route
          path="/mes-commandes"
          element={
            <ProtectedRoute allowedRoles={['customer', 'client']}>
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
