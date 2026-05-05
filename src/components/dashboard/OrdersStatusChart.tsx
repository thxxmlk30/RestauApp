import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Order, OrderStatus } from '../../types';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#f59e0b' },
  preparing: { label: 'En cuisine', color: '#3b82f6' },
  ready: { label: 'Pret', color: '#22c55e' },
  delivered: { label: 'Livre', color: '#9ca3af' },
  cancelled: { label: 'Annule', color: '#ef4444' },
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
    .filter((entry) => entry.value > 0);
}

export default function OrdersStatusChart({ orders }: { orders: Order[] }) {
  const data = buildStatusData(orders);

  return (
    <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-secondary-900">Statuts des commandes</h2>
        <span className="text-xs text-gray-400">{orders.length} total</span>
      </div>

      {data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">Aucune donnee</div>
      ) : (
        <>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip formatter={(value) => [`${value}`, 'Commandes']} labelFormatter={(label) => String(label)} />
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.map((entry) => (
              <div key={entry.status} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-gray-600">{entry.label}</span>
                </div>
                <span className="font-semibold text-secondary-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
