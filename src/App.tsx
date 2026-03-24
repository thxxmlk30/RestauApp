import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Connexion from './pages/auth/loginPage';
import Inscription from './pages/auth/RegisterPage';
import MdpOublie from './pages/auth/ForotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Composant qui protège les routes privées
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/connexion' element={<Connexion />} />
      <Route path='/inscription' element={<Inscription />} />
      <Route path='/mdp-oublie' element={<MdpOublie />} />
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
