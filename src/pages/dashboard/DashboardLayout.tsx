import { useCallback, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, Menu } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/helpers';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(location.pathname);

  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setIsMobileSidebarOpen(false);
  }

  const toggleSidebar = useCallback(() => {
    setIsMobileSidebarOpen((open) => !open);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-10 w-10 rounded-2xl p-0 lg:hidden" onClick={toggleSidebar}>
              <Menu size={18} />
            </Button>
            <div className="soft-3d flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-white">
              <ChefHat size={18} />
            </div>
            <div>
              <div className="font-display text-base font-bold text-secondary-900">Linguere Ops</div>
              <div className="text-xs text-gray-500">{user ? formatRole(user.role) : 'Equipe'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-gray-100 bg-white px-4 py-2 text-right shadow-sm md:block">
              <div className="text-xs text-gray-500">Connecte</div>
              <div className="text-sm font-semibold text-secondary-900">{user?.name}</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={handleLogout}>
              <LogOut size={14} className="mr-1.5" />
              Deconnexion
            </Button>
          </div>
        </div>
      </header>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
