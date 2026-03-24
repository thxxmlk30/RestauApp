import { Badge } from '../ui/Badge';
import { Trash2 } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';

interface OrdersTableProps {
  orders: Order[];
  statusOptions: { value: OrderStatus; label: string }[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export default function OrdersTable({ orders, statusOptions, onUpdateStatus, onDeleteOrder }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left px-5 py-3">ID</th>
            <th className="text-left px-5 py-3">Table</th>
            <th className="text-left px-5 py-3">Statut</th>
            <th className="text-left px-5 py-3">Heure</th>
            <th className="text-right px-5 py-3">Total</th>
            <th className="text-left px-5 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4 font-mono text-sm text-secondary-900">{order.id}</td>
              <td className="px-5 py-4 text-sm text-gray-600">Table {order.tableNumber}</td>
              <td className="px-5 py-4"><Badge status={order.status} /></td>
              <td className="px-5 py-4 text-xs text-gray-500">{formatTimeAgo(order.createdAt)}</td>
              <td className="px-5 py-4 text-right text-sm font-bold text-secondary-900">{formatCurrency(order.totalAmount)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {onDeleteOrder && (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                      onClick={() => {
                        if (window.confirm(`Supprimer la commande ${order.id} ?`)) onDeleteOrder(order.id);
                      }}
                      aria-label="Supprimer"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <div className="text-center py-12 text-gray-400">Aucune commande</div>}
    </div>
  );
}
