import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RevenueTrendPoint } from '../../types';
import { formatCurrency } from '../../utils/helpers';

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

interface RevenueChartProps {
  data: RevenueTrendPoint[];
  days: number;
}

export default function RevenueChart({ data, days }: RevenueChartProps) {
  const chartData = data.map((point) => ({ day: formatDayLabel(point.date), ca: point.revenue, orders: point.orders }));

  return (
    <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
      <h2 className="mb-4 font-bold text-secondary-900">CA sur {days} jours</h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e8593c" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#e8593c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip formatter={(value, name) => [name === 'ca' ? formatCurrency(Number(value ?? 0)) : value, name === 'ca' ? 'CA' : 'Commandes']} />
          <Area type="monotone" dataKey="ca" stroke="#e8593c" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
