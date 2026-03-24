import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockOrders } from '../../data/orders';
import type { Order, OrderStatus } from '../../types';
import { loadOrders, saveOrders } from '../../utils/storage';
import { Button } from '../../components/ui/Button';
import MenuList from '../../components/dashboard/MenuList';
import Sidebar from '../../components/layout/Sidebar';
import StatsCards from '../../components/dashboard/StatsCards';
import OrdersTable from '../../components/dashboard/OrdersTable';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import TopItemsChart from '../../components/dashboard/TopItemsChart';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(() => loadOrders(mockOrders));
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      saveOrders(next);
      return next;
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      saveOrders(next);
      return next;
    });
  };

  const filteredOrders = activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter);
  const stats = {
    todayOrders: orders.length,
    todayRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
    occupiedTables: new Set(orders.map((o) => o.tableNumber)).size,
    totalTables: 20,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
  };
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'En attente' },
    { value: 'preparing', label: 'En cuisine' },
    { value: 'ready', label: 'Prêt' },
    { value: 'delivered', label: 'Livré' },
    { value: 'cancelled', label: 'Annulé' },
  ];

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
            <span className="text-sm text-gray-600 hidden sm:block">Bonjour, <strong>{user?.name}</strong></span>
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
            <StatsCards stats={stats} preparingCount={preparingCount} />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-secondary-900">Commandes</h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => setActiveFilter('all')} className={`px-3 py-1 rounded-full text-xs ${activeFilter === 'all' ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Toutes</button>
                    {statusOptions.map((s) => (
                      <button key={s.value} onClick={() => setActiveFilter(s.value)} className={`px-3 py-1 rounded-full text-xs ${activeFilter === s.value ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <OrdersTable
                  orders={filteredOrders}
                  statusOptions={statusOptions}
                  onUpdateStatus={updateOrderStatus}
                  onDeleteOrder={user?.role === 'admin' ? deleteOrder : undefined}
                />
              </div>
              <div className="space-y-6">
                <RevenueChart orders={orders} />
                <OrdersStatusChart orders={orders} />
                <TopItemsChart orders={orders} />
              </div>
            </div>
            <div className="mt-6">
              <MenuList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
