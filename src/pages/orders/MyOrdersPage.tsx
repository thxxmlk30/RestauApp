import { Heart, RotateCcw, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DeliveryLiveMap from '../../components/dashboard/DeliveryLiveMap';
import { NavBar } from '../../components/layout/NavBar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { menuItems as defaultMenuItems } from '../../data/menuItems';
import { mockOrders } from '../../data/orders';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDeliveryArea, formatServiceType, formatTimeAgo } from '../../utils/helpers';
import { loadFavorites, loadMenuItems, loadOrders, saveOrders } from '../../utils/storage';

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  preparing: { label: 'En preparation', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready: { label: 'Prete', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  delivered: { label: 'Livree', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { label: 'Annulee', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { increment, openCart } = useCart();
  const [orders, setOrders] = useState<Order[]>(() => loadOrders(mockOrders));
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, number>>({});

  const menuItems = useMemo(() => loadMenuItems(defaultMenuItems), []);
  const favorites = useMemo(() => loadFavorites(), []);
  const favoriteItems = useMemo(
    () => menuItems.filter((item) => favorites.some((favorite) => favorite.menuItemId === item.id)),
    [favorites, menuItems],
  );

  const myOrders = useMemo(
    () =>
      orders
        .filter((order) => order.userId && order.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, user?.id],
  );

  const activeDelivery = myOrders.find((order) => order.serviceType === 'delivery' && order.status !== 'delivered' && order.status !== 'cancelled');

  const cancelOrder = (id: string) => {
    setOrders((prev) => {
      const next = prev.map((order) => (order.id === id && order.status === 'pending' ? { ...order, status: 'cancelled' as const } : order));
      saveOrders(next);
      return next;
    });
  };

  const rateOrder = (orderId: string) => {
    const rating = ratingDrafts[orderId];
    if (!rating) return;
    setOrders((prev) => {
      const next = prev.map((order) => (order.id === orderId ? { ...order, rating, ratedAt: new Date().toISOString() } : order));
      saveOrders(next);
      return next;
    });
  };

  const reorder = (order: Order) => {
    order.items.forEach((item) => {
      for (let index = 0; index < item.quantity; index += 1) increment(item.menuItemId);
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfbfa_0%,#f7f4f0_100%)]">
      <NavBar />

      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-secondary-900">Mes commandes</h1>
              {user && <p className="mt-1 text-sm text-gray-500">Connecte en tant que {user.name}</p>}
            </div>
            <Link to="/#menu" className="text-sm font-medium text-primary-600 hover:underline">
              Retour au menu
            </Link>
          </div>

          {activeDelivery && (
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-secondary-900">Suivi en temps reel</h2>
                <p className="mt-1 text-sm text-gray-500">Votre course en cours est suivie comme une app de VTC, avec progression et ETA.</p>
              </div>
              <DeliveryLiveMap order={activeDelivery} />
            </section>
          )}

          {favoriteItems.length > 0 && (
            <section className="panel-3d rounded-[30px] border border-gray-100 bg-white p-6">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary-500" />
                <h2 className="font-bold text-secondary-900">Favoris rapides</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {favoriteItems.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      increment(item.id);
                      openCart();
                    }}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                  >
                    <div className="font-semibold text-secondary-900">{item.name}</div>
                    <div className="mt-2 text-sm text-gray-500">{formatCurrency(item.price)}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {myOrders.length === 0 ? (
            <div className="rounded-[30px] border border-gray-100 bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-secondary-900">Aucune commande pour le moment</h2>
              <p className="mt-2 text-sm text-gray-500">Ajoutez des plats au panier puis validez votre commande. Elle apparaitra ici.</p>
              <div className="mt-6 flex justify-center">
                <Link to="/#menu">
                  <Button>Commander maintenant</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {myOrders.map((order) => {
                const meta = statusMeta[order.status];
                const canRate = order.status === 'delivered' && !order.rating;

                return (
                  <article key={order.id} className="panel-3d rounded-[30px] border border-gray-100 bg-white p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Reference</p>
                        <p className="font-mono font-semibold text-secondary-900">{order.id}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          {formatServiceType(order.serviceType)} · {formatTimeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                        {order.serviceType === 'dine_in' ? (
                          <span className="text-xs text-gray-500">Table {order.tableNumber}</span>
                        ) : (
                          <span className="text-xs text-gray-500">{formatDeliveryArea(order)}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_360px]">
                      <div className="rounded-[24px] border border-gray-100">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.menuItemId}`} className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-secondary-900">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} x {formatCurrency(item.price)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-secondary-900">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                        <div className="space-y-2 px-4 py-3 text-sm">
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Sous-total</span>
                            <span>{formatCurrency(order.subtotalAmount ?? order.totalAmount)}</span>
                          </div>
                          {order.discountAmount ? (
                            <div className="flex items-center justify-between text-emerald-700">
                              <span>Remise</span>
                              <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                          ) : null}
                          {order.serviceType === 'delivery' ? (
                            <div className="flex items-center justify-between text-gray-600">
                              <span>Livraison</span>
                              <span>{formatCurrency(order.deliveryFee ?? 0)}</span>
                            </div>
                          ) : null}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-sm font-bold text-secondary-900">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {order.serviceType === 'delivery' && order.location ? (
                          <DeliveryLiveMap order={order} compact />
                        ) : null}

                        <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                          <div>Chef: {order.assignedChefName || 'Affectation en cours'}</div>
                          {order.serviceType === 'delivery' && <div className="mt-1">Livreur: {order.courierName || 'Affectation en cours'}</div>}
                          {order.serviceType === 'delivery' && <div className="mt-1">Adresse: {order.deliveryAddress}</div>}
                          {order.rating && (
                            <div className="mt-2 flex items-center gap-1 text-amber-500">
                              {Array.from({ length: order.rating }).map((_, index) => (
                                <Star key={index} size={14} className="fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => reorder(order)}>
                        <RotateCcw size={14} className="mr-2" />
                        Recommander
                      </Button>
                      {order.status === 'pending' && (
                        <Button type="button" variant="danger" size="sm" onClick={() => cancelOrder(order.id)}>
                          Annuler
                        </Button>
                      )}
                    </div>

                    {canRate && (
                      <div className="mt-5 rounded-[24px] border border-primary-100 bg-primary-50 p-4">
                        <div className="text-sm font-medium text-secondary-900">Evaluer cette commande</div>
                        <div className="mt-3 flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button key={value} type="button" onClick={() => setRatingDrafts((prev) => ({ ...prev, [order.id]: value }))}>
                              <Star
                                size={18}
                                className={`${(ratingDrafts[order.id] ?? 0) >= value ? 'fill-current text-amber-500' : 'text-gray-300'}`}
                              />
                            </button>
                          ))}
                          <Button type="button" size="sm" onClick={() => rateOrder(order.id)} disabled={!ratingDrafts[order.id]}>
                            Envoyer
                          </Button>
                        </div>
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
