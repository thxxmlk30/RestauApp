import { useOutletContext } from 'react-router-dom';
import StatsCards from '../../components/dashboard/StatsCards';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import type { DashboardOutletContext } from './dashboardOutletContext';

export default function DashboardStatsPage() {
  const { orders, stats, preparingCount } = useOutletContext<DashboardOutletContext>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Statistiques</h1>
        <p className="text-sm text-gray-500 mt-1">KPIs, revenus, statuts et top plats.</p>
      </div>

      <StatsCards stats={stats} preparingCount={preparingCount} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart orders={orders} />
          <TopItemsChart orders={orders} />
        </div>
        <div className="space-y-6">
          <OrdersStatusChart orders={orders} />
        </div>
      </div>
    </div>
  );
}

