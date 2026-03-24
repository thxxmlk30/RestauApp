import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import OrdersTable from '../../components/dashboard/OrdersTable';
import type { OrderStatus } from '../../types';
import type { DashboardOutletContext } from './dashboardOutletContext';

export default function DashboardOrdersPage() {
  const { orders, statusOptions, updateOrderStatus, deleteOrder } = useOutletContext<DashboardOutletContext>();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    const base = activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter);
    return [...base].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeFilter, orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Commandes</h1>
        <p className="text-sm text-gray-500 mt-1">Gère les statuts et supprime les commandes si besoin.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-secondary-900">Liste</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-xs ${
                  activeFilter === 'all' ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setActiveFilter(s.value)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    activeFilter === s.value
                      ? 'bg-secondary-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <OrdersTable
          orders={filteredOrders}
          statusOptions={statusOptions}
          onUpdateStatus={updateOrderStatus}
          onDeleteOrder={deleteOrder}
        />
      </div>
    </div>
  );
}

