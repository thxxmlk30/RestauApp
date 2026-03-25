import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import StatsCards from '../../components/dashboard/StatsCards';
import OrdersTable from '../../components/dashboard/OrdersTable';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import type { DashboardOutletContext } from './dashboardOutletContext';

export default function DashboardOverviewPage() {
  const { orders, stats, preparingCount, statusOptions, updateOrderStatus, deleteOrder } =
    useOutletContext<DashboardOutletContext>();

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Aperçu</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d’ensemble des commandes et des tendances.</p>
      </div>

      <StatsCards stats={stats} preparingCount={preparingCount} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-secondary-900">Dernières commandes</h2>
            <p className="text-xs text-gray-500 mt-1">Les 8 commandes les plus récentes.</p>
          </div>
          <OrdersTable
            orders={recentOrders}
            statusOptions={statusOptions}
            onUpdateStatus={updateOrderStatus}
            onDeleteOrder={deleteOrder}
          />
        </div>
        <div className="space-y-6">
          <RevenueChart orders={orders} />
          <OrdersStatusChart orders={orders} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-secondary-900 mb-4">Top plats</h2>
        <TopItemsChart orders={orders} />
      </div>
    </div>
  );
}

