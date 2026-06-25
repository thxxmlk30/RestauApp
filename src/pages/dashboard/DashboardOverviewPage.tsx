import { CookingPot } from 'lucide-react';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import OrdersTable from '../../components/dashboard/OrdersTable';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import type { DashboardOutletContext } from './dashboardOutletContext';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { orders, stats, preparingCount, statusOptions, updateOrderStatus, deleteOrder, assignChef, assignCourier, staff } =
    useOutletContext<DashboardOutletContext>();

  const visibleOrders = useMemo(() => {
    const base = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (user?.role === 'chef') return base.filter((order) => order.status === 'pending' || order.status === 'preparing').slice(0, 8);
    if (user?.role === 'waiter') return base.filter((order) => order.serviceType === 'dine_in').slice(0, 8);
    if (user?.role === 'delivery') return base.filter((order) => order.serviceType === 'delivery').slice(0, 8);
    return base.slice(0, 8);
  }, [orders, user?.role]);

  const chefs = staff.filter((member) => member.role === 'chef');
  const couriers = staff.filter((member) => member.role === 'delivery');
  const activeStaffCount = staff.filter((member) => member.status === 'active').length;
  const deliveryFees = orders.filter((order) => order.serviceType === 'delivery').reduce((sum, order) => sum + (order.deliveryFee ?? 0), 0);

  const welcomeLine =
    user?.role === 'chef'
      ? 'Charge cuisine, priorites et preparations en cours.'
      : user?.role === 'waiter'
        ? 'Vision salle et commandes sur place.'
        : user?.role === 'delivery'
          ? 'Courses actives et secteurs Dakar.'
          : 'Pilotage direct du restaurant: ventes, equipe, carte, stock et livraison.';

  const indicators = [
    ['Commandes du jour', stats.todayOrders],
    ['CA du jour', formatCurrency(stats.todayRevenue)],
    ['En attente', stats.pendingOrders],
    ['En cuisine', preparingCount],
    ['Sur place', stats.dineInOrders],
    ['Livraison', stats.deliveryOrders],
    ['Stocks bas', stats.ingredientsLow],
    ['Staff actif', activeStaffCount],
    ['Livreurs actifs', stats.activeCouriers],
    ['Frais de livraison', formatCurrency(deliveryFees)],
  ];

  return (
    <div className="space-y-8">
      <section className="border-b border-gray-200 pb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">Apercu operationnel</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl">Vue d ensemble du service</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">{welcomeLine}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-secondary-900">Indicateurs rapides</h2>
          <span className="text-xs text-gray-500">Lecture admin simplifiee</span>
        </div>
        <div className="divide-y divide-gray-100 border-y border-gray-200">
          {indicators.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[1fr_auto] gap-4 py-3">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-secondary-900">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-secondary-900">Flux prioritaire</h2>
            <p className="text-xs text-gray-500">Commandes les plus utiles pour votre role.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <CookingPot className="h-4 w-4 text-primary-500" />
            {visibleOrders.length} affichees
          </div>
        </div>

        <OrdersTable
          orders={visibleOrders}
          statusOptions={statusOptions}
          onUpdateStatus={updateOrderStatus}
          onDeleteOrder={user?.role === 'admin' ? deleteOrder : undefined}
          chefs={user?.role === 'admin' ? chefs : []}
          couriers={user?.role === 'admin' || user?.role === 'delivery' ? couriers : []}
          onAssignChef={user?.role === 'admin' ? assignChef : undefined}
          onAssignCourier={user?.role === 'admin' ? assignCourier : undefined}
        />
      </section>
    </div>
  );
}
