import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import
<ProtectedRoute>
<DashboardPage /></ProtectedRoute>om './pages/LandingPage';
import Connexion from './pages/auth/Connexion';
import Inscription from './pages/auth/inscription';
import MdpOublie from './pages/auth/MdpOublie';
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
