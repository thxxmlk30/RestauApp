import { useCallback, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockOrders } from '../../data/orders';
import type { Order, OrderStatus } from '../../types';
import { loadOrders, saveOrders } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import Sidebar from '../../components/layout/Sidebar';
import type { DashboardOutletContext, DashboardStatusOption } from './dashboardOutletContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(() => loadOrders(mockOrders));

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      saveOrders(next);
      return next;
    });
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      saveOrders(next);
      return next;
    });
  }, []);

  const stats = useMemo(
    () => ({
      todayOrders: orders.length,
      todayRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      occupiedTables: new Set(orders.map((o) => o.tableNumber)).size,
      totalTables: 20,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
    }),
    [orders],
  );

  const preparingCount = useMemo(() => orders.filter((o) => o.status === 'preparing').length, [orders]);

  const statusOptions: DashboardStatusOption[] = useMemo(
    () => [
      { value: 'pending', label: 'En attente' },
      { value: 'preparing', label: 'En cuisine' },
      { value: 'ready', label: 'Prêt' },
      { value: 'delivered', label: 'Livré' },
      { value: 'cancelled', label: 'Annulé' },
    ],
    [],
  );

  const outletContext: DashboardOutletContext = useMemo(
    () => ({
      orders,
      stats,
      preparingCount,
      statusOptions,
      updateOrderStatus,
      deleteOrder,
    }),
    [deleteOrder, orders, preparingCount, stats, statusOptions, updateOrderStatus],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <ChefHat size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-secondary-900">Linguere</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Bonjour, <strong>{user?.name}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={14} className="mr-1.5" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8">
        <div className="grid lg:grid-cols-[16rem_1fr] gap-6">
          <Sidebar />
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet context={outletContext} />
          </div>
        </div>
      </main>
    </div>
  );
}
