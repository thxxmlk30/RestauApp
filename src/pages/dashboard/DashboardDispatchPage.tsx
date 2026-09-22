import { Bike, Building2, Route } from 'lucide-react';
import { useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePermissions } from '../../hooks/usePermissions';
import { useDeliveryZones } from '../../hooks/useDeliveryZones';
import { useOrders } from '../../hooks/useOrders';
import { useStaff } from '../../hooks/useStaff';
import type { DeliveryZone, Order } from '../../types';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';

function buildZoneMetrics(orders: Order[], zones: DeliveryZone[]) {
  const zoneById = new Map(zones.map((zone) => [zone.id, zone]));
  const metrics = new Map<string, { zone: DeliveryZone; orders: number; revenue: number; active: number }>();

  for (const order of orders) {
    const zone = order.deliveryZoneId ? zoneById.get(order.deliveryZoneId) : undefined;
    if (!zone) continue;
    const current = metrics.get(zone.id) ?? { zone, orders: 0, revenue: 0, active: 0 };
    current.orders += 1;
    current.revenue += order.totalAmount;
    if (order.status !== 'delivered' && order.status !== 'cancelled') current.active += 1;
    metrics.set(zone.id, current);
  }

  return Array.from(metrics.values()).sort((a, b) => b.orders - a.orders);
}

export default function DashboardDispatchPage() {
  const { isAdmin } = usePermissions();
  const { data: zones = [] } = useDeliveryZones();
  const { data: orders = [] } = useOrders({ pollingMs: 30_000 });
  const { data: staff } = useStaff({ enabled: isAdmin });

  const deliveryOrders = useMemo(
    () =>
      orders
        .filter((order) => order.serviceType === 'delivery')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );

  const activeDeliveries = deliveryOrders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled');
  const zoneMetrics = useMemo(() => buildZoneMetrics(deliveryOrders, zones).slice(0, 6), [deliveryOrders, zones]);
  const activeCouriers = (staff ?? []).filter((member) => member.role === 'delivery' && member.status === 'active');

  const departmentSummary = useMemo(() => {
    const departments = new Map<string, { department: string; orders: number; revenue: number }>();
    for (const metric of buildZoneMetrics(deliveryOrders, zones)) {
      const current = departments.get(metric.zone.department) ?? { department: metric.zone.department, orders: 0, revenue: 0 };
      current.orders += metric.orders;
      current.revenue += metric.revenue;
      departments.set(metric.zone.department, current);
    }
    return Array.from(departments.values()).sort((a, b) => b.orders - a.orders);
  }, [deliveryOrders, zones]);

  const averageBasket = deliveryOrders.length
    ? deliveryOrders.reduce((sum, order) => sum + order.totalAmount, 0) / deliveryOrders.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Livraison"
        title="Zones et dispatch"
        description="Pilotage des livraisons par departement et par secteur, a partir des zones reellement configurees."
        actions={
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Courses actives</div>
              <div className="mt-1 text-2xl font-semibold text-secondary-900">{activeDeliveries.length}</div>
            </div>
            {isAdmin ? (
              <div className="rounded-[24px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Livreurs actifs</div>
                <div className="mt-1 text-2xl font-semibold text-secondary-900">{activeCouriers.length}</div>
              </div>
            ) : null}
            <div className="rounded-[24px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Panier livraison</div>
              <div className="mt-1 text-2xl font-semibold text-secondary-900">{formatCurrency(averageBasket)}</div>
            </div>
          </div>
        }
      />

      {departmentSummary.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-5">
          {departmentSummary.map((item) => (
            <div key={item.department} className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{item.department}</div>
                  <div className="text-xl font-bold text-secondary-900">{item.orders}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">{formatCurrency(item.revenue)} de CA livraison</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel-3d rounded-[30px] border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary-500" />
            <h2 className="font-bold text-secondary-900">Secteurs les plus actifs</h2>
          </div>
          <div className="mt-4 space-y-3">
            {zoneMetrics.map(({ zone, orders: zoneOrders, revenue, active }) => (
              <div key={zone.id} className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-secondary-900">{zone.sector}</div>
                    <div className="mt-1 text-sm text-gray-500">
                      {zone.commune}, {zone.department}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-secondary-900">{zoneOrders} cmd</div>
                    <div className="text-gray-500">{active} active(s)</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">CA livre</span>
                  <span className="font-semibold text-secondary-900">{formatCurrency(revenue)}</span>
                </div>
              </div>
            ))}
            {zoneMetrics.length === 0 && <div className="text-sm text-gray-400">Pas encore de donnees de secteur.</div>}
          </div>
        </div>

        <div className="panel-3d rounded-[30px] border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-primary-500" />
            <h2 className="font-bold text-secondary-900">Livraisons en cours</h2>
          </div>
          <div className="mt-4 space-y-3">
            {activeDeliveries.slice(0, 6).map((order) => {
              const zone = zones.find((item) => item.id === order.deliveryZoneId);
              return (
                <div key={order.id} className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-secondary-900">{order.id}</div>
                      <div className="mt-1 text-sm text-gray-500">{zone?.sector || order.deliveryAddress || 'Secteur non identifie'}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold text-secondary-900">{order.courierName || 'A assigner'}</div>
                      <div className="text-gray-500">{formatTimeAgo(order.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeDeliveries.length === 0 ? (
              <EmptyState icon={Bike} title="Aucune livraison en cours" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
