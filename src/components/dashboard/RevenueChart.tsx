import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Order } from '../../types';
import { formatCurrency } from '../../utils/helpers';

const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildRevenueData(orders: Order[], days: number) {
  const now = new Date();
  const totalsByDay = new Map<string, number>();

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const key = toLocalDateKey(date);
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + order.totalAmount);
  }

  return Array.from({ length: days }, (_, idx) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - idx));
    const key = toLocalDateKey(date);
    return {
      day: dayLabels[date.getDay()],
      ca: totalsByDay.get(key) ?? 0,
    };
  });
}

export default function RevenueChart({ orders }: { orders: Order[] }) {
  const revenueData = buildRevenueData(orders, 7);

  return (
    <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
      <h2 className="mb-4 font-bold text-secondary-900">CA sur 7 jours</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value ?? 0)), 'CA']} />
          <Bar dataKey="ca" fill="#e8593c" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
