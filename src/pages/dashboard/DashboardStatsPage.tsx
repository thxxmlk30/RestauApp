import { useOutletContext } from 'react-router-dom';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import RevenueChart from '../../components/dashboard/RevenueChart';
import StatsCards from '../../components/dashboard/StatsCards';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import type { DashboardOutletContext } from './dashboardOutletContext';

export default function DashboardStatsPage() {
  const { orders, stats, preparingCount, topItems } = useOutletContext<DashboardOutletContext>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Statistiques</h1>
        <p className="mt-1 text-sm text-gray-500">KPIs consolidés pour ventes, pression cuisine et volume des livraisons.</p>
      </div>

      <StatsCards stats={stats} preparingCount={preparingCount} />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <RevenueChart orders={orders} />
          <TopItemsChart orders={orders} items={topItems} />
        </div>
        <div className="space-y-6">
          <OrdersStatusChart orders={orders} />
        </div>
      </div>
    </div>
  );
}
