import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { User } from './types';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/loginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForotPasswordPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import DashboardOrdersPage from './pages/dashboard/DashboardOrdersPage';
import DashboardStatsPage from './pages/dashboard/DashboardStatsPage';
import DashboardMenuPage from './pages/dashboard/DashboardMenuPage';
import MyOrdersPage from './pages/orders/MyOrdersPage';
import CartModal from './components/ordering/Cartmodal';
import ScrollToHash from './components/layout/ScrollToHash';

// Composant qui protège les routes privées
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: User['role'][] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="stats" element={<DashboardStatsPage />} />
          <Route path="orders" element={<DashboardOrdersPage />} />
          <Route path="menu" element={<DashboardMenuPage />} />
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
  )
}
