import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../../types';
import { NavBar } from '../../components/layout/NavBar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { mockOrders } from '../../data/orders';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';
import { loadOrders, saveOrders } from '../../utils/storage';

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-orange-50 text-orange-700 border-orange-100' },
  preparing: { label: 'En préparation', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  ready: { label: 'Prête', className: 'bg-purple-50 text-purple-700 border-purple-100' },
  delivered: { label: 'Livrée', className: 'bg-green-50 text-green-700 border-green-100' },
  cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => loadOrders(mockOrders));

  const myOrders = useMemo(() => orders.filter((o) => o.userId && o.userId === user?.id), [orders, user?.id]);

  const cancelOrder = (id: string) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id && o.status === 'pending' ? { ...o, status: 'cancelled' as const } : o));
      saveOrders(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-secondary-900">Mes commandes</h1>
              {user && <p className="text-sm text-gray-500 mt-1">Connecté en tant que {user.name}</p>}
            </div>
            <Link to="/#menu" className="text-sm font-medium text-primary-600 hover:underline">
              Retour au menu
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-secondary-900">Aucune commande pour le moment</h2>
              <p className="text-sm text-gray-500 mt-2">
                Ajoutez des plats au panier puis validez votre commande. Elle apparaîtra ici.
              </p>
              <div className="mt-6 flex justify-center">
                <Link to="/#menu">
                  <Button variant="primary">Commander maintenant</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {myOrders.map((order) => {
                const meta = statusMeta[order.status];
                return (
                  <article key={order.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">Référence</p>
                        <p className="font-mono font-semibold text-secondary-900 truncate">{order.id}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          Table {order.tableNumber} · {formatTimeAgo(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
                      {order.items.map((item) => (
                        <div key={item.menuItemId} className="flex items-start justify-between gap-4 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-secondary-900 whitespace-nowrap">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-gray-600">Total</span>
                        <span className="text-sm font-bold text-secondary-900">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="danger" size="sm" onClick={() => cancelOrder(order.id)}>
                          Annuler la commande
                        </Button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

