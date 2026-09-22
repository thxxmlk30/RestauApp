import { AlertTriangle, Bike, Clock, CookingPot, DollarSign, PackageCheck, ShoppingBag, Star, Users, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import OrdersTable from '../../components/dashboard/OrdersTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useLowStockIngredients } from '../../hooks/useIngredients';
import { useAssignChef, useAssignCourier, useDeleteOrder, useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useDashboardReport } from '../../hooks/useReports';
import { useStaff } from '../../hooks/useStaff';
import type { Order } from '../../types';
import { formatCurrency, formatStatus, formatTimeAgo } from '../../utils/helpers';
import { getAvailableTransitions } from '../../utils/orderPermissions';

function WorkQueueOrderCard({ order }: { order: Order }) {
  const { user } = useAuth();
  const updateStatus = useUpdateOrderStatus();
  const transitions = getAvailableTransitions(order, user);
  const productsFull = order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');

  return (
    <div className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-sm font-semibold text-secondary-900">{order.id}</div>
          <div className="mt-1 text-xs text-gray-500">{formatTimeAgo(order.createdAt)}</div>
        </div>
        <Badge status={order.status} />
      </div>
      <div className="mt-3 text-sm text-gray-600">{productsFull}</div>
      <div className="mt-2 text-xs text-gray-500">
        {order.serviceType === 'dine_in' ? `Table ${order.tableNumber ?? '-'}` : order.deliveryAddress || 'Livraison'}
      </div>
      {transitions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {transitions.map((status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              className="rounded-xl"
              loading={updateStatus.isPending && updateStatus.variables?.orderId === order.id && updateStatus.variables?.status === status}
              onClick={() => updateStatus.mutate({ orderId: order.id, status })}
            >
              {formatStatus(status)}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StaffWorkQueue() {
  const { user } = useAuth();
  const { data: orders } = useOrders({ pollingMs: 20_000 });
  const { data: lowStock } = useLowStockIngredients({ enabled: user?.role === 'chef' });

  const activeOrders = useMemo(
    () => (orders ?? []).filter((order) => order.status !== 'delivered' && order.status !== 'cancelled'),
    [orders],
  );

  const welcomeLine =
    user?.role === 'chef'
      ? 'Charge cuisine, priorites et preparations en cours.'
      : user?.role === 'waiter'
        ? 'Vision salle et commandes sur place.'
        : 'Courses actives assignees.';

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Apercu operationnel" title="Ma file de travail" description={welcomeLine} />

      {user?.role === 'chef' && lowStock && lowStock.length > 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={18} />
          {lowStock.length} ingredient(s) sous le seuil de reapprovisionnement.
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-secondary-900">Commandes actives</h2>
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <CookingPot className="h-4 w-4 text-primary-500" />
            {activeOrders.length} en cours
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState icon={CookingPot} title="Aucune commande active" description="Revenez plus tard, votre file est vide pour le moment." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => (
              <WorkQueueOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminOverview() {
  const { user } = useAuth();
  const { data: report } = useDashboardReport();
  const { data: orders } = useOrders({ pollingMs: 30_000 });
  const { data: staff } = useStaff();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const assignChef = useAssignChef();
  const assignCourier = useAssignCourier();

  const preparingCount = useMemo(() => (orders ?? []).filter((order) => order.status === 'preparing').length, [orders]);
  const recentOrders = useMemo(
    () => [...(orders ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [orders],
  );
  const chefs = useMemo(() => (staff ?? []).filter((member) => member.role === 'chef'), [staff]);
  const couriers = useMemo(() => (staff ?? []).filter((member) => member.role === 'delivery'), [staff]);
  const activeStaffCount = useMemo(() => (staff ?? []).filter((member) => member.status === 'active').length, [staff]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Apercu operationnel"
        title="Vue d ensemble du service"
        description="Pilotage direct du restaurant: ventes, equipe, carte, stock et livraison."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Commandes du jour" value={report?.todayOrders ?? 0} icon={ShoppingBag} tone="bg-blue-50 text-blue-600" />
        <StatCard label="CA du jour" value={formatCurrency(report?.todayRevenue ?? 0)} icon={DollarSign} tone="bg-emerald-50 text-emerald-600" />
        <StatCard label="En attente / cuisine" value={`${report?.pendingOrders ?? 0} / ${preparingCount}`} icon={Clock} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Sur place / livraison" value={`${report?.dineInOrders ?? 0} / ${report?.deliveryOrders ?? 0}`} icon={Bike} tone="bg-primary-50 text-primary-600" />
        <StatCard label="Stocks bas" value={report?.ingredientsLow ?? 0} icon={PackageCheck} tone="bg-orange-50 text-orange-600" />
        <StatCard label="Annulees aujourd'hui" value={report?.cancelledOrdersToday ?? 0} icon={XCircle} tone="bg-rose-50 text-rose-600" />
        <StatCard label="Note moyenne" value={report?.averageRating != null ? `${report.averageRating.toFixed(1)} / 5` : 'N/A'} icon={Star} tone="bg-yellow-50 text-yellow-600" />
        <StatCard label="Staff actif" value={activeStaffCount} icon={Users} tone="bg-secondary-50 text-secondary-700" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <h2 className="font-bold text-secondary-900">Flux prioritaire</h2>
            <p className="text-xs text-gray-500">Dernieres commandes recues, tous services confondus.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <CookingPot className="h-4 w-4 text-primary-500" />
            {recentOrders.length} affichees
          </span>
        </div>

        <div className="panel-3d overflow-hidden rounded-[30px] border border-gray-100 bg-white">
          <OrdersTable
            orders={recentOrders}
            user={user}
            onUpdateStatus={(orderId, status) => updateStatus.mutate({ orderId, status })}
            onDeleteOrder={(orderId) => deleteOrder.mutate(orderId)}
            chefs={chefs}
            couriers={couriers}
            onAssignChef={(orderId, staffId) => {
              const chef = chefs.find((member) => member.id === staffId);
              assignChef.mutate({ orderId, staffId, staffName: chef?.name });
            }}
            onAssignCourier={(orderId, staffId) => {
              const courier = couriers.find((member) => member.id === staffId);
              assignCourier.mutate({ orderId, staffId, staffName: courier?.name });
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { isAdmin } = usePermissions();
  return isAdmin ? <AdminOverview /> : <StaffWorkQueue />;
}
