import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import OrdersTable from '../../components/dashboard/OrdersTable';
import { useAuth } from '../../context/AuthContext';
import type { OrderStatus, ServiceType } from '../../types';
import type { DashboardOutletContext } from './dashboardOutletContext';

export default function DashboardOrdersPage() {
  const { user } = useAuth();
  const { orders, staff, statusOptions, updateOrderStatus, deleteOrder, assignChef, assignCourier } =
    useOutletContext<DashboardOutletContext>();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'all'>('all');

  const filteredOrders = useMemo(() => {
    let base = [...orders];

    if (user?.role === 'chef') {
      base = base.filter((order) => order.status === 'pending' || order.status === 'preparing' || order.status === 'ready');
    } else if (user?.role === 'waiter') {
      base = base.filter((order) => order.serviceType === 'dine_in');
    } else if (user?.role === 'delivery') {
      base = base.filter((order) => order.serviceType === 'delivery');
    }

    if (activeFilter !== 'all') base = base.filter((order) => order.status === activeFilter);
    if (serviceFilter !== 'all') base = base.filter((order) => order.serviceType === serviceFilter);

    return base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeFilter, orders, serviceFilter, user?.role]);

  const chefs = staff.filter((member) => member.role === 'chef');
  const couriers = staff.filter((member) => member.role === 'delivery');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Gestion des commandes</h1>
        <p className="mt-1 text-sm text-gray-500">Filtre par statut, par type de service et affectation de l’équipe.</p>
      </div>

      <div className="panel-3d overflow-hidden rounded-[30px] border border-gray-100 bg-white">
        <div className="space-y-4 border-b border-gray-100 p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`rounded-full px-3 py-1 text-xs ${activeFilter === 'all' ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tous statuts
            </button>
            {statusOptions.map((statusOption) => (
              <button
                key={statusOption.value}
                type="button"
                onClick={() => setActiveFilter(statusOption.value)}
                className={`rounded-full px-3 py-1 text-xs ${
                  activeFilter === statusOption.value ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'dine_in', 'delivery'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setServiceFilter(value)}
                className={`rounded-full px-3 py-1 text-xs ${
                  serviceFilter === value ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                {value === 'all' ? 'Tous services' : value === 'delivery' ? 'Livraison' : 'Sur place'}
              </button>
            ))}
          </div>
        </div>

        <OrdersTable
          orders={filteredOrders}
          statusOptions={statusOptions}
          onUpdateStatus={updateOrderStatus}
          onDeleteOrder={user?.role === 'admin' ? deleteOrder : undefined}
          chefs={chefs}
          couriers={couriers}
          onAssignChef={user?.role === 'admin' || user?.role === 'chef' ? assignChef : undefined}
          onAssignCourier={user?.role === 'admin' || user?.role === 'delivery' ? assignCourier : undefined}
        />
      </div>
    </div>
  );
}
