import { Bike, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface StatsCardsProps {
  stats: DashboardStats;
  preparingCount: number;
}

export default function StatsCards({ stats, preparingCount }: StatsCardsProps) {
  const cards = [
    { label: 'Commandes du jour', value: stats.todayOrders, icon: ShoppingBag, tone: 'bg-blue-50 text-blue-600' },
    { label: 'CA du jour', value: formatCurrency(stats.todayRevenue), icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'En attente / cuisine', value: `${stats.pendingOrders} / ${preparingCount}`, icon: Clock, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Sur place / livraison', value: `${stats.dineInOrders} / ${stats.deliveryOrders}`, icon: Bike, tone: 'bg-primary-50 text-primary-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
            <Icon size={18} />
          </div>
          <p className="mt-4 text-2xl font-bold text-secondary-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
