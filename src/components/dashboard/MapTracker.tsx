import { MapPin, Route, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { DashboardOutletContext } from '../../pages/dashboard/dashboardOutletContext';
import { formatCurrency, formatDeliveryArea, formatTimeAgo, getOrderEtaLabel } from '../../utils/helpers';
import { Badge } from '../ui/Badge';
import DeliveryLiveMap from './DeliveryLiveMap';

export default function MapTracker() {
  const { orders } = useOutletContext<DashboardOutletContext>();
  const deliveryOrders = useMemo(
    () =>
      orders
        .filter((order) => order.serviceType === 'delivery' && order.location)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );

  const [selectedOrderId, setSelectedOrderId] = useState(deliveryOrders[0]?.id ?? '');
  const selectedOrder = deliveryOrders.find((order) => order.id === selectedOrderId) ?? deliveryOrders[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        {selectedOrder ? (
          <DeliveryLiveMap order={selectedOrder} />
        ) : (
          <div className="rounded-[30px] border border-dashed border-gray-200 bg-white p-8 text-sm text-gray-400">
            Aucune commande geolocalisee.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="panel-3d rounded-[30px] border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary-500" />
            <h3 className="font-bold text-secondary-900">Commande suivie</h3>
          </div>

          {selectedOrder ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Livraison</Badge>
                <Badge status={selectedOrder.status} />
              </div>
              <div>
                <div className="font-semibold text-secondary-900">{selectedOrder.id}</div>
                <div className="text-sm text-gray-500">
                  {selectedOrder.customerName} · {formatDeliveryArea(selectedOrder)}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400">Livreur</div>
                  <div className="mt-1 text-sm font-semibold text-secondary-900">{selectedOrder.courierName || 'Non assigne'}</div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-gray-400">Valeur</div>
                  <div className="mt-1 text-sm font-semibold text-secondary-900">{formatCurrency(selectedOrder.totalAmount)}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary-900">
                  <Route className="h-4 w-4 text-primary-500" />
                  Timeline terrain
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Creation</span>
                    <span>{formatTimeAgo(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Preparation</span>
                    <span>{selectedOrder.assignedChefName || 'A assigner'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ETA</span>
                    <span>{getOrderEtaLabel(selectedOrder)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Frais secteur</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-gray-400">Aucune commande de livraison active.</div>
          )}
        </div>

        <div className="panel-3d rounded-[30px] border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-500" />
            <h3 className="font-bold text-secondary-900">Courses actives</h3>
          </div>
          <div className="mt-4 space-y-3">
            {deliveryOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedOrder?.id === order.id ? 'border-primary-200 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-secondary-900">{order.id}</div>
                    <div className="mt-1 text-sm text-gray-500">{formatDeliveryArea(order)}</div>
                  </div>
                  <Badge status={order.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{order.courierName || 'Sans livreur'}</span>
                  <span>{getOrderEtaLabel(order)}</span>
                </div>
              </button>
            ))}

            {deliveryOrders.length === 0 && <div className="text-sm text-gray-400">Aucune course geolocalisee.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
