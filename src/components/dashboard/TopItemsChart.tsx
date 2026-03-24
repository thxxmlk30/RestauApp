import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Order } from '../../types';

function shortenLabel(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

function buildTopItems(orders: Order[], limit: number) {
  const counts = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      counts.set(item.name, (counts.get(item.name) ?? 0) + item.quantity);
    }
  }

  return Array.from(counts.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name, 'fr'))
    .slice(0, limit);
}

export default function TopItemsChart({ orders }: { orders: Order[] }) {
  const data = buildTopItems(orders, 6);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-secondary-900">Top plats</h2>
        <span className="text-xs text-gray-400">Quantités</span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Aucune donnée</div>
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(v) => shortenLabel(String(v), 16)}
              />
              <Tooltip
                formatter={(v) => [`${v ?? 0}`, 'Portions']}
                labelFormatter={(label) => String(label)}
              />
              <Bar dataKey="qty" fill="#e8593c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

