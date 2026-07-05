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
  ServiceType,
  Staff,
  StockAuditLine,
  StockAuditRecord,
  StockBotChannel,
  StockBotSettings,
  UserRole,
} from '../types';

export const defaultStockBotSettings: StockBotSettings = {
  email: 'appro-bot@linguere.sn',
  whatsapp: '221771112233',
  preferredChannel: 'email',
};

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
    client: 'Client',
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

export function calculateCartSubtotal(cartLines: Array<{ lineTotal: number }>) {
  return cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
}

export function calculateOrderAmount(subtotal: number, deliveryFee = 0) {
  return Math.max(0, subtotal) + deliveryFee;
}

export function buildDeliveryAddressLabel(zone: DeliveryZone, streetLine?: string, landmark?: string) {
  const details = [streetLine?.trim(), landmark?.trim()].filter(Boolean);
  return [zone.sector, zone.commune, zone.department, details.join(' - ')].filter(Boolean).join(', ');
}

export function formatDeliveryArea(order: Order) {
  if (order.deliverySector && order.deliveryCommune) return `${order.deliverySector}, ${order.deliveryCommune}`;
  if (order.deliveryCommune) return order.deliveryCommune;
  return order.deliveryAddress ?? 'Adresse a confirmer';
}

export function isIngredientCritical(ingredient: Ingredient) {
  return ingredient.currentStock <= ingredient.criticalStock;
}

export function isIngredientBelowReorder(ingredient: Ingredient) {
  return ingredient.currentStock <= ingredient.reorderThreshold;
}

export function getIngredientStatusLabel(ingredient: Ingredient) {
  if (isIngredientCritical(ingredient)) return 'Critique';
  if (ingredient.currentStock <= ingredient.minStock) return 'Sous minimum';
  if (isIngredientBelowReorder(ingredient)) return 'Reappro';
  return 'OK';
}

export function buildStockAuditLines(previousIngredients: Ingredient[], nextIngredients: Ingredient[]): StockAuditLine[] {
  const previousById = new Map(previousIngredients.map((item) => [item.id, item]));
  return nextIngredients.map((ingredient) => {
    const previous = previousById.get(ingredient.id);
    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      previousStock: previous?.currentStock ?? ingredient.currentStock,
      countedStock: ingredient.currentStock,
      unit: ingredient.unit,
      critical: isIngredientCritical(ingredient),
    };
  });
}

export function buildStockAuditRecord(lines: StockAuditLine[], channel: StockBotChannel): StockAuditRecord {
  const criticalItems = lines.filter((line) => line.critical).length;
  return {
    id: `audit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    channel,
    totalItems: lines.length,
    criticalItems,
    lines,
  };
}

export function buildCriticalReorderMessage(ingredients: Ingredient[]) {
  const criticalItems = ingredients.filter(isIngredientCritical);
  if (criticalItems.length === 0) return '';

  const header = [
    'Commande immediate de reapprovisionnement',
    `Date: ${new Date().toLocaleDateString('fr-FR')}`,
    '',
    'Produits critiques a commander:',
  ];

  const lines = criticalItems.map((ingredient) => {
    const suggestedQty = Math.max(ingredient.reorderThreshold * 2 - ingredient.currentStock, ingredient.reorderThreshold);
    return `- ${ingredient.name}: restant ${formatNumber(ingredient.currentStock)} ${ingredient.unit}, critique ${formatNumber(ingredient.criticalStock)} ${ingredient.unit}, commande suggeree ${formatNumber(suggestedQty)} ${ingredient.unit}, fournisseur ${ingredient.supplier || 'non renseigne'}`;
  });

  return [...header, ...lines, '', 'Merci de confirmer la commande fournisseur au plus vite.'].join('\n');
}

export function buildStockBotLaunchLink(channel: StockBotChannel, settings: StockBotSettings, ingredients: Ingredient[]) {
  const message = buildCriticalReorderMessage(ingredients);
  if (!message) return '';

  if (channel === 'email') {
    const subject = encodeURIComponent(`Alerte stock critique - ${new Date().toLocaleDateString('fr-FR')}`);
    return `mailto:${encodeURIComponent(settings.email)}?subject=${subject}&body=${encodeURIComponent(message)}`;
  }

  const cleanedPhone = settings.whatsapp.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameLocalDay(left: string | Date, right: string | Date = new Date()) {
  return toLocalDateKey(new Date(left)) === toLocalDateKey(new Date(right));
}

export function getCourierDeliveryCountForDay(orders: Order[], courierId: string, date: string | Date = new Date()) {
  return orders.filter(
    (order) =>
      order.serviceType === 'delivery' &&
      order.courierId === courierId &&
      order.status !== 'cancelled' &&
      isSameLocalDay(order.createdAt, date),
  ).length;
}

function getCourierActiveLoad(orders: Order[], courierId: string) {
  return orders.filter(
    (order) =>
      order.serviceType === 'delivery' &&
      order.courierId === courierId &&
      order.status !== 'delivered' &&
      order.status !== 'cancelled',
  ).length;
}

export function getBestCourierForNextOrder(staff: Staff[], orders: Order[]) {
  const activeCouriers = staff.filter((member) => member.role === 'delivery' && member.status === 'active');
  if (activeCouriers.length === 0) return undefined;

  return [...activeCouriers].sort((left, right) => {
    const todayDiff = getCourierDeliveryCountForDay(orders, left.id) - getCourierDeliveryCountForDay(orders, right.id);
    if (todayDiff !== 0) return todayDiff;

    const activeDiff = getCourierActiveLoad(orders, left.id) - getCourierActiveLoad(orders, right.id);
    if (activeDiff !== 0) return activeDiff;

    return left.name.localeCompare(right.name, 'fr');
  })[0];
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
    pending: 0.18,
    preparing: 0.48,
    ready: 0.76,
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
    { key: 'pending', label: 'Validation', threshold: 0.18 },
    { key: 'preparing', label: 'Preparation', threshold: 0.48 },
    { key: 'ready', label: 'Depart livreur', threshold: 0.76 },
    { key: 'delivered', label: 'Livraison', threshold: 1 },
  ];

  return stages.map((stage) => ({
    ...stage,
    done: progress >= stage.threshold,
    active: progress < stage.threshold && progress >= stage.threshold - 0.25,
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
