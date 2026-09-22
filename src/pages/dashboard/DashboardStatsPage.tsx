import { Bike, Clock, DollarSign, ShoppingBag, Star, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import ProfitabilityList from '../../components/dashboard/ProfitabilityList';
import RevenueChart from '../../components/dashboard/RevenueChart';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { useOrders } from '../../hooks/useOrders';
import { useCancellationStats, useDashboardReport, useProfitability, useRevenueTrend, useTopItems } from '../../hooks/useReports';
import { formatCurrency } from '../../utils/helpers';

const rangeOptions = [7, 14, 30, 90] as const;

export default function DashboardStatsPage() {
  const [days, setDays] = useState<(typeof rangeOptions)[number]>(30);

  const { data: report } = useDashboardReport();
  const { data: revenueTrend } = useRevenueTrend(days);
  const { data: cancellationStats } = useCancellationStats(days);
  const { data: profitability } = useProfitability(8);
  const { data: topItems } = useTopItems(6);
  const { data: orders } = useOrders();

  const preparingCount = useMemo(() => orders?.filter((order) => order.status === 'preparing').length ?? 0, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analyse"
        title="Statistiques"
        description="KPIs consolides pour ventes, pression cuisine, annulations et rentabilite."
        actions={
          <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1">
            {rangeOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDays(value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  days === value ? 'bg-secondary-900 text-white' : 'text-gray-500 hover:text-secondary-900'
                }`}
              >
                {value}j
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Commandes du jour" value={report?.todayOrders ?? 0} icon={ShoppingBag} tone="bg-blue-50 text-blue-600" />
        <StatCard label="CA du jour" value={formatCurrency(report?.todayRevenue ?? 0)} icon={DollarSign} tone="bg-emerald-50 text-emerald-600" />
        <StatCard
          label="En attente / cuisine"
          value={`${report?.pendingOrders ?? 0} / ${preparingCount}`}
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Sur place / livraison"
          value={`${report?.dineInOrders ?? 0} / ${report?.deliveryOrders ?? 0}`}
          icon={Bike}
          tone="bg-primary-50 text-primary-600"
        />
        <StatCard
          label={`Annulations (${days}j)`}
          value={`${cancellationStats?.cancellationRate ?? 0}%`}
          hint={cancellationStats ? `${cancellationStats.cancelledOrders} / ${cancellationStats.totalOrders} commandes` : undefined}
          icon={XCircle}
          tone="bg-rose-50 text-rose-600"
        />
        <StatCard
          label="Note moyenne"
          value={report?.averageRating != null ? `${report.averageRating.toFixed(1)} / 5` : 'N/A'}
          icon={Star}
          tone="bg-yellow-50 text-yellow-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <RevenueChart data={revenueTrend ?? []} days={days} />
          <TopItemsChart items={topItems ?? []} />
        </div>
        <div className="space-y-6">
          <OrdersStatusChart orders={orders ?? []} />
        </div>
      </div>

      <ProfitabilityList items={profitability ?? []} />
    </div>
  );
}
