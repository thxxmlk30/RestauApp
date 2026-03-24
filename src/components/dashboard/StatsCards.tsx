import { ShoppingBag, DollarSign, Clock, Users } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface StatsCardsProps {
  stats: DashboardStats;
  preparingCount: number;
}

export default function StatsCards({ stats, preparingCount }: StatsCardsProps) {
  const cards = [
    { label: 'Commandes du jour', value: stats.todayOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'CA du jour', value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'En attente', value: stats.pendingOrders, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'En cuisine', value: preparingCount, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
            <Icon size={18} className={color} />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
