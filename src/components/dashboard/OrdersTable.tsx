import { Trash2 } from 'lucide-react';
import type { Order, OrderStatus, Staff } from '../../types';
import { formatCurrency, formatDeliveryArea, formatServiceType, formatTimeAgo } from '../../utils/helpers';
import { Badge } from '../ui/Badge';

interface OrdersTableProps {
  orders: Order[];
  statusOptions: { value: OrderStatus; label: string }[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  chefs?: Staff[];
  couriers?: Staff[];
  onAssignChef?: (orderId: string, staffId: string) => void;
  onAssignCourier?: (orderId: string, staffId: string) => void;
}

function AssignmentSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value?: string;
  placeholder: string;
  options: Staff[];
  onChange?: (staffId: string) => void;
}) {
  if (!onChange || options.length === 0) return null;

  return (
    <select
      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

export default function OrdersTable({
  orders,
  statusOptions,
  onUpdateStatus,
  onDeleteOrder,
  chefs = [],
  couriers = [],
  onAssignChef,
  onAssignCourier,
}: OrdersTableProps) {
  return (
    <div>
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1080px]">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Produits</th>
              <th className="px-5 py-3">Equipe</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Heure</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => {
              const productsFull = order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
              const customerLine =
                order.serviceType === 'delivery'
                  ? order.deliveryAddress || order.customerName || 'Livraison'
                  : `Table ${order.tableNumber ?? '-'}`;

              return (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-4 align-top font-mono text-sm font-semibold text-secondary-900">{order.id}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-2">
                      <Badge variant="secondary">{formatServiceType(order.serviceType)}</Badge>
                      {order.serviceType === 'dine_in' ? (
                        <div className="text-xs text-gray-500">Table {order.tableNumber ?? '-'}</div>
                      ) : (
                        <div className="max-w-[220px] text-xs text-gray-500">
                          {formatDeliveryArea(order)}
                          <div>{formatCurrency(order.deliveryFee ?? 0)}</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-secondary-900">{order.customerName || order.userName || 'Client'}</div>
                    <div className="max-w-[240px] text-xs text-gray-500">{customerLine}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-gray-600">
                    <span className="block max-w-[220px] truncate" title={productsFull}>
                      {productsFull}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">
                        Chef: <span className="font-medium text-secondary-900">{order.assignedChefName || 'Non assigne'}</span>
                      </div>
                      {order.serviceType === 'delivery' ? (
                        <div className="text-xs text-gray-500">
                          Livreur: <span className="font-medium text-secondary-900">{order.courierName || 'Non assigne'}</span>
                        </div>
                      ) : null}
                      <AssignmentSelect
                        value={order.assignedChefId}
                        placeholder="Assigner chef"
                        options={chefs}
                        onChange={onAssignChef ? (staffId) => onAssignChef(order.id, staffId) : undefined}
                      />
                      {order.serviceType === 'delivery' ? (
                        <AssignmentSelect
                          value={order.courierId}
                          placeholder="Assigner livreur"
                          options={couriers}
                          onChange={onAssignCourier ? (staffId) => onAssignCourier(order.id, staffId) : undefined}
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Badge status={order.status} />
                  </td>
                  <td className="px-5 py-4 align-top text-xs text-gray-500">{formatTimeAgo(order.createdAt)}</td>
                  <td className="px-5 py-4 align-top text-right text-sm font-bold text-secondary-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-2">
                      {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                        <select
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
                          value={order.status}
                          onChange={(event) => onUpdateStatus(order.id, event.target.value as OrderStatus)}
                        >
                          {statusOptions.map((statusOption) => (
                            <option key={statusOption.value} value={statusOption.value}>
                              {statusOption.label}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      {onDeleteOrder ? (
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => {
                            if (window.confirm(`Supprimer la commande ${order.id} ?`)) onDeleteOrder(order.id);
                          }}
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 xl:hidden">
        {orders.map((order) => {
          const productsFull = order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');

          return (
            <article key={order.id} className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-sm font-semibold text-secondary-900">{order.id}</div>
                  <div className="mt-1 text-xs text-gray-500">{formatTimeAgo(order.createdAt)}</div>
                </div>
                <Badge status={order.status} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{formatServiceType(order.serviceType)}</Badge>
                <span className="text-xs text-gray-500">
                  {order.serviceType === 'delivery' ? formatDeliveryArea(order) : `Table ${order.tableNumber ?? '-'}`}
                </span>
              </div>

              <div className="mt-4 text-sm">
                <div className="font-medium text-secondary-900">{order.customerName || order.userName || 'Client'}</div>
                <div className="mt-1 text-gray-500">{productsFull}</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-3 text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Equipe</div>
                  <div className="mt-1 text-secondary-900">Chef: {order.assignedChefName || 'Non assigne'}</div>
                  {order.serviceType === 'delivery' ? <div className="mt-1 text-secondary-900">Livreur: {order.courierName || 'Non assigne'}</div> : null}
                </div>
                <div className="rounded-2xl bg-gray-50 p-3 text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Montant</div>
                  <div className="mt-1 font-semibold text-secondary-900">{formatCurrency(order.totalAmount)}</div>
                  {order.serviceType === 'delivery' ? <div className="mt-1 text-gray-500">Livraison: {formatCurrency(order.deliveryFee ?? 0)}</div> : null}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <AssignmentSelect
                  value={order.assignedChefId}
                  placeholder="Assigner chef"
                  options={chefs}
                  onChange={onAssignChef ? (staffId) => onAssignChef(order.id, staffId) : undefined}
                />
                {order.serviceType === 'delivery' ? (
                  <AssignmentSelect
                    value={order.courierId}
                    placeholder="Assigner livreur"
                    options={couriers}
                    onChange={onAssignCourier ? (staffId) => onAssignCourier(order.id, staffId) : undefined}
                  />
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                  <select
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={order.status}
                    onChange={(event) => onUpdateStatus(order.id, event.target.value as OrderStatus)}
                  >
                    {statusOptions.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </option>
                    ))}
                  </select>
                ) : null}
                {onDeleteOrder ? (
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      if (window.confirm(`Supprimer la commande ${order.id} ?`)) onDeleteOrder(order.id);
                    }}
                    aria-label="Supprimer"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {orders.length === 0 ? <div className="py-12 text-center text-gray-400">Aucune commande</div> : null}
    </div>
  );
}
