import { Bike, Building2, Clock3, Route } from 'lucide-react';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { dakarDepartments } from '../../data/dakarZones';
import type { DashboardOutletContext } from './dashboardOutletContext';
import { formatCurrency, getOrderEtaLabel, getZoneMetrics } from '../../utils/helpers';

export default function DashboardDispatchPage() {
  const { orders, staff } = useOutletContext<DashboardOutletContext>();

  const deliveryOrders = useMemo(
    () =>
      orders
        .filter((order) => order.serviceType === 'delivery')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );

  const activeDeliveries = deliveryOrders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled');
  const zoneMetrics = useMemo(() => getZoneMetrics(orders).slice(0, 6), [orders]);
  const activeCouriers = staff.filter((member) => member.role === 'delivery' && member.status === 'active');
  const averageEta = useMemo(() => {
    if (activeDeliveries.length === 0) return 0;
    return Math.round(
      activeDeliveries.reduce((sum, order) => {
        if (!order.estimatedDeliveryAt) return sum;
        const remaining = Math.max(0, Math.round((new Date(order.estimatedDeliveryAt).getTime() - Date.now()) / 60000));
        return sum + remaining;
      }, 0) / activeDeliveries.length,
    );
  }, [activeDeliveries]);

  const departmentSummary = dakarDepartments.map((department) => {
    const departmentOrders = deliveryOrders.filter((order) => order.deliveryDepartment === department);
    return {
      department,
      orders: departmentOrders.length,
      revenue: departmentOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary-900">Zones et dispatch</h1>
          <p className="mt-1 text-sm text-gray-500">Pilotage des livraisons par departement, commune, secteur et course en temps reel.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Courses actives</div>
            <div className="mt-1 text-2xl font-semibold text-secondary-900">{activeDeliveries.length}</div>
          </div>
          <div className="rounded-[24px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Livreurs actifs</div>
            <div className="mt-1 text-2xl font-semibold text-secondary-900">{activeCouriers.length}</div>
          </div>
          <div className="rounded-[24px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Panier livraison</div>
            <div className="mt-1 text-2xl font-semibold text-secondary-900">
              {formatCurrency(
                deliveryOrders.length ? deliveryOrders.reduce((sum, order) => sum + order.totalAmount, 0) / deliveryOrders.length : 0,
              )}
            </div>
          </div>
        </div>
      </div>

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

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
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
        </div>

        <div className="space-y-6">
          <div className="panel-3d rounded-[30px] border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary-500" />
              <h2 className="font-bold text-secondary-900">Dispatch live</h2>
            </div>
            <div className="mt-4 space-y-3">
              {activeDeliveries.slice(0, 5).map((order) => (
                <div key={order.id} className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-secondary-900">{order.id}</div>
                      <div className="mt-1 text-sm text-gray-500">{order.deliverySector || order.deliveryAddress}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold text-secondary-900">{order.courierName || 'A assigner'}</div>
                      <div className="text-gray-500">{getOrderEtaLabel(order)}</div>
                    </div>
                  </div>
                </div>
              ))}
              {activeDeliveries.length === 0 && <div className="text-sm text-gray-400">Aucune livraison en cours.</div>}
            </div>
          </div>

          <div className="panel-3d rounded-[30px] border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary-500" />
              <h2 className="font-bold text-secondary-900">Cadence terrain</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Secteurs ouverts</div>
                <div className="mt-1 text-lg font-semibold text-secondary-900">{zoneMetrics.length}</div>
              </div>
              <div className="rounded-[22px] bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">ETA moyenne</div>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-secondary-900">
                  <Clock3 size={16} className="text-primary-500" />
                  {averageEta} min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
