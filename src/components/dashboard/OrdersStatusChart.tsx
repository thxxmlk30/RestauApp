import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Order, OrderStatus } from '../../types';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#f59e0b' },
  preparing: { label: 'En cuisine', color: '#3b82f6' },
  ready: { label: 'Prêt', color: '#22c55e' },
  delivered: { label: 'Livré', color: '#9ca3af' },
  cancelled: { label: 'Annulé', color: '#ef4444' },
};

function buildStatusData(orders: Order[]) {
  const counts: Record<OrderStatus, number> = {
    pending: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    counts[order.status] += 1;
  }

  return (Object.keys(counts) as OrderStatus[])
    .map((status) => ({
      status,
      label: statusConfig[status].label,
      value: counts[status],
      color: statusConfig[status].color,
    }))
    .filter((d) => d.value > 0);
}

export default function OrdersStatusChart({ orders }: { orders: Order[] }) {
  const data = buildStatusData(orders);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-secondary-900">Statuts des commandes</h2>
        <span className="text-xs text-gray-400">{orders.length} total</span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Aucune donnée</div>
      ) : (
        <>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip
                  formatter={(value) => [`${value}`, 'Commandes']}
                  labelFormatter={(label) => String(label)}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {data.map((d) => (
              <div key={d.status} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600 truncate">{d.label}</span>
                </div>
                <span className="font-semibold text-secondary-900">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

