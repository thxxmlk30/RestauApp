import { Bike, CookingPot, PackageCheck, Route, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import OrdersTable from '../../components/dashboard/OrdersTable';
import RevenueChart from '../../components/dashboard/RevenueChart';
import StatsCards from '../../components/dashboard/StatsCards';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import type { DashboardOutletContext } from './dashboardOutletContext';

function QuickCard({
  icon: Icon,
  title,
  value,
  subtitle,
  to,
  tone,
}: {
  icon: typeof PackageCheck;
  title: string;
  value: string | number;
  subtitle: string;
  to: string;
  tone: string;
}) {
  return (
    <Link to={to} className="panel-3d block rounded-[28px] border border-gray-100 bg-white p-5 transition hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-secondary-900">{value}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500">{subtitle}</div>
    </Link>
  );
}

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

  const welcomeLine =
    user?.role === 'chef'
      ? 'Charge cuisine, priorites de mise en place et preparation en cours.'
      : user?.role === 'waiter'
        ? 'Vision salle, tables occupees et commandes sur place.'
        : user?.role === 'delivery'
          ? 'Courses actives, secteurs Dakar et suivi terrain.'
          : 'Pilotage complet du restaurant: ventes, equipe, carte, stock et logistique de livraison.';

  const focusCards = [
    {
      label: 'En attente',
      value: stats.pendingOrders,
      detail: 'commandes a lancer',
    },
    {
      label: 'En cuisine',
      value: preparingCount,
      detail: 'tickets en preparation',
    },
    {
      label: 'Sur place',
      value: stats.dineInOrders,
      detail: 'commandes salle actives',
    },
    {
      label: 'Livraison',
      value: stats.deliveryOrders,
      detail: `${stats.activeCouriers} livreur(s) actif(s)`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="panel-3d overflow-hidden rounded-[32px] border border-gray-100 bg-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">Apercu operationnel</div>
            <h1 className="mt-3 font-display text-3xl font-bold text-secondary-900 sm:text-4xl">Vue d ensemble du service</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">{welcomeLine}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {focusCards.map((card) => (
              <div key={card.label} className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{card.label}</div>
                <div className="mt-2 text-2xl font-bold text-secondary-900">{card.value}</div>
                <div className="mt-1 text-sm text-gray-500">{card.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickCard
          icon={PackageCheck}
          title="Stocks bas"
          value={stats.ingredientsLow}
          subtitle="ingredients sous le seuil minimum"
          to="/dashboard/stock"
          tone="bg-amber-50 text-amber-600"
        />
        <QuickCard
          icon={Users}
          title="Staff actif"
          value={staff.filter((member) => member.status === 'active').length}
          subtitle="equipe mobilisable maintenant"
          to="/dashboard/staff"
          tone="bg-emerald-50 text-emerald-600"
        />
        <QuickCard
          icon={Bike}
          title="Livraisons"
          value={stats.deliveryOrders}
          subtitle={`${stats.activeCouriers} livreur(s) actif(s)`}
          to="/dashboard/map"
          tone="bg-primary-50 text-primary-600"
        />
        <QuickCard
          icon={Route}
          title="Dispatch Dakar"
          value={formatCurrency(orders.filter((order) => order.serviceType === 'delivery').reduce((sum, order) => sum + (order.deliveryFee ?? 0), 0))}
          subtitle="frais de livraison consolides"
          to="/dashboard/zones"
          tone="bg-secondary-50 text-secondary-700"
        />
      </div>

      <StatsCards stats={stats} preparingCount={preparingCount} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="panel-3d overflow-hidden rounded-[30px] border border-gray-100 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-secondary-900">Flux prioritaire</h2>
              <p className="text-xs text-gray-500">Commandes les plus utiles pour votre role, avec une presentation adaptee aux petits ecrans.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
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
        </div>

        <div className="grid gap-6">
          <RevenueChart orders={orders} />
          <OrdersStatusChart orders={orders} />
        </div>
      </div>

      <TopItemsChart orders={orders} />
    </div>
  );
}
