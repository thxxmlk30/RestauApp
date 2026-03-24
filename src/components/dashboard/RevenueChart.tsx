import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-bold text-secondary-900 mb-4">CA sur 7 jours</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), 'CA']} />
          <Bar dataKey="ca" fill="#e8593c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
