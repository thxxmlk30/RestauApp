import { RESTAURANT_HUB, dakarZones, getZoneById } from '../data/dakarZones';
import type {
  DashboardStats,
  DeliveryZone,
  FavoriteItem,
  Ingredient,
  Meal,
  MenuItem,
  Order,
  OrderLocation,
  OrderStatus,
  PromoCode,
  ServiceType,
  Staff,
  UserRole,
} from '../types';

export function formatCurrency(value: number) {
  const amount = Math.round(value);
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} FCFA`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}

export function formatTimeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function formatRole(role: UserRole) {
  return {
    admin: 'Admin',
    waiter: 'Serveur',
    chef: 'Chef',
    delivery: 'Livreur',
    customer: 'Client',
  }[role];
}

export function formatServiceType(type: ServiceType) {
  return type === 'delivery' ? 'Livraison' : 'Sur place';
}

export function formatStatus(status: OrderStatus) {
  return {
    pending: 'En attente',
    preparing: 'En cuisine',
    ready: 'Prete',
    delivered: 'Livree',
    cancelled: 'Annulee',
  }[status];
}

export function getStatusTone(status: OrderStatus) {
  return {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    preparing: 'bg-blue-50 text-blue-700 border-blue-200',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    delivered: 'bg-stone-100 text-stone-700 border-stone-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  }[status];
}

export function getServiceTone(type: ServiceType) {
  return type === 'delivery'
    ? 'bg-primary-50 text-primary-700 border-primary-200'
    : 'bg-secondary-50 text-secondary-700 border-secondary-200';
}

export const promoCodes: PromoCode[] = [
  { code: 'LINGUERE10', discount: 10, expiresAt: '2027-12-31' },
  { code: 'WELCOME20', discount: 20, expiresAt: '2027-12-31' },
  { code: 'CHEF5', discount: 5, expiresAt: '2027-06-30' },
];

export const isValidPromo = (code: string): number => {
  const promo = promoCodes.find((item) => item.code === code.trim().toUpperCase());
  if (!promo) return 0;
  if (new Date(promo.expiresAt).getTime() < Date.now()) return 0;
  return promo.discount;
};

interface CartLineTotal {
  subtotal: number;
  discountAmount: number;
  total: number;
  discountPercent: number | null;
}

export function calculateCartTotalWithPromo(cartLines: Array<{ lineTotal: number }>, promoCode?: string): CartLineTotal {
  const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
  if (!promoCode) {
    return { subtotal, discountAmount: 0, total: subtotal, discountPercent: null };
  }

  const discountPercent = isValidPromo(promoCode);
  if (discountPercent === 0) {
    return { subtotal, discountAmount: 0, total: subtotal, discountPercent: null };
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
    discountPercent,
  };
}

export function applyDiscount(amount: number, discountPercent: number): number {
  return Math.round(amount - (amount * discountPercent) / 100);
}

export function calculateOrderAmount(subtotal: number, discountAmount: number, deliveryFee = 0) {
  return Math.max(0, subtotal - discountAmount) + deliveryFee;
}

export function buildDeliveryAddressLabel(zone: DeliveryZone, streetLine?: string, landmark?: string) {
  const details = [streetLine?.trim(), landmark?.trim()].filter(Boolean);
  return [zone.sector, zone.commune, zone.department, details.join(' - ')].filter(Boolean).join(', ');
}

export function formatDeliveryArea(order: Order) {
  if (order.deliverySector && order.deliveryCommune) {
    return `${order.deliverySector}, ${order.deliveryCommune}`;
  }

  if (order.deliveryCommune) {
    return order.deliveryCommune;
  }

  return order.deliveryAddress ?? 'Adresse a confirmer';
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getOrderLiveProgress(order: Order) {
  if (order.status === 'cancelled') return 0;
  if (order.serviceType !== 'delivery') {
    return order.status === 'delivered' ? 1 : order.status === 'ready' ? 0.85 : order.status === 'preparing' ? 0.55 : 0.2;
  }

  const statusFloor = {
    pending: 0.15,
    preparing: 0.45,
    ready: 0.72,
    delivered: 1,
    cancelled: 0,
  }[order.status];

  if (!order.estimatedDeliveryAt || order.status === 'delivered') return statusFloor;

  const createdAt = new Date(order.createdAt).getTime();
  const etaAt = new Date(order.estimatedDeliveryAt).getTime();
  const ratio = clamp((Date.now() - createdAt) / Math.max(1, etaAt - createdAt));
  return Math.max(statusFloor, ratio);
}

export function getRoutePosition(destination: OrderLocation, progress: number, origin: OrderLocation = RESTAURANT_HUB): OrderLocation {
  return {
    lat: origin.lat + (destination.lat - origin.lat) * clamp(progress),
    lng: origin.lng + (destination.lng - origin.lng) * clamp(progress),
  };
}

export function getOrderTrackingLocation(order: Order) {
  if (!order.location) return undefined;
  return getRoutePosition(order.location, getOrderLiveProgress(order));
}

export function getOrderEtaLabel(order: Order) {
  if (order.status === 'delivered') return 'Livree';
  if (order.status === 'cancelled') return 'Annulee';
  if (!order.estimatedDeliveryAt) return 'ETA en cours';

  const diffMinutes = Math.round((new Date(order.estimatedDeliveryAt).getTime() - Date.now()) / 60000);
  if (diffMinutes <= 0) return 'Arrivee imminente';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  return `${Math.ceil(diffMinutes / 60)} h`;
}

export function getTrackingStages(order: Order) {
  const progress = getOrderLiveProgress(order);
  const stages = [
    { key: 'pending', label: 'Validation', threshold: 0.15 },
    { key: 'preparing', label: 'Preparation', threshold: 0.45 },
    { key: 'ready', label: 'Depart coursier', threshold: 0.72 },
    { key: 'delivered', label: 'Livraison', threshold: 1 },
  ];

  return stages.map((stage) => ({
    ...stage,
    done: progress >= stage.threshold,
    active: progress < stage.threshold && progress >= stage.threshold - 0.2,
  }));
}

export function getZoneMetrics(orders: Order[]) {
  const deliveries = orders.filter((order) => order.serviceType === 'delivery');
  const metrics = new Map<string, { zone: DeliveryZone; orders: number; revenue: number; active: number }>();

  deliveries.forEach((order) => {
    const zone = getZoneById(order.deliveryZoneId) ?? dakarZones.find((item) => item.sector === order.deliverySector);
    if (!zone) return;
    const current = metrics.get(zone.id) ?? { zone, orders: 0, revenue: 0, active: 0 };
    current.orders += 1;
    current.revenue += order.totalAmount;
    if (order.status !== 'delivered' && order.status !== 'cancelled') current.active += 1;
    metrics.set(zone.id, current);
  });

  return Array.from(metrics.values()).sort((a, b) => b.orders - a.orders);
}

const ingredientUsageByMenuItem: Record<string, Record<string, number>> = {
  '1': { 'ing-1': 1, 'ing-2': 1, 'ing-4': 0.2, 'ing-5': 0.3 },
  '2': { 'ing-1': 1, 'ing-3': 1, 'ing-4': 0.2 },
  '3': { 'ing-1': 1, 'ing-7': 0.4, 'ing-5': 0.2 },
  '7': { 'ing-1': 1.1, 'ing-3': 0.8, 'ing-4': 0.2 },
  '201': { 'ing-2': 1.2, 'ing-4': 0.2, 'ing-5': 0.3 },
  '202': { 'ing-4': 0.1, 'ing-6': 0.1 },
  '203': { 'ing-2': 0.9, 'ing-5': 0.4 },
  '206': { 'ing-3': 1, 'ing-5': 0.3, 'ing-6': 0.1 },
  '207': { 'ing-3': 1, 'ing-4': 0.1 },
  '208': { 'ing-1': 1.2, 'ing-2': 0.8, 'ing-5': 0.2 },
};

export function deductIngredientsForOrder(ingredients: Ingredient[], order: Order) {
  return ingredients.map((ingredient) => {
    const deduction = order.items.reduce((sum, item) => {
      const menuUsage = ingredientUsageByMenuItem[item.menuItemId];
      if (!menuUsage) return sum;
      return sum + (menuUsage[ingredient.id] ?? 0) * item.quantity;
    }, 0);

    if (deduction <= 0) return ingredient;
    return {
      ...ingredient,
      currentStock: Math.max(0, Number((ingredient.currentStock - deduction).toFixed(1))),
    };
  });
}

export function buildDashboardStats(orders: Order[], ingredients: Ingredient[], staff: Staff[]): DashboardStats {
  return {
    todayOrders: orders.length,
    todayRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    occupiedTables: new Set(orders.filter((order) => order.tableNumber).map((order) => order.tableNumber)).size,
    totalTables: 20,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    ingredientsLow: ingredients.filter((item) => item.currentStock <= item.minStock).length,
    deliveryOrders: orders.filter((order) => order.serviceType === 'delivery').length,
    dineInOrders: orders.filter((order) => order.serviceType === 'dine_in').length,
    activeCouriers: staff.filter((member) => member.role === 'delivery' && member.status === 'active').length,
  };
}

export function getSuggestedMeal(): Meal {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 17) return 'lunch';
  return 'dinner';
}

export function normalizeFavoriteMap(items: FavoriteItem[]) {
  return new Set(items.map((item) => item.menuItemId));
}

export function getFavoriteItems(menuItems: MenuItem[], favorites: FavoriteItem[]) {
  const favoriteIds = normalizeFavoriteMap(favorites);
  return menuItems.filter((item) => favoriteIds.has(item.id));
}
