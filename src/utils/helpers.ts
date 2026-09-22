import type {
  DeliveryZone,
  FavoriteItem,
  Ingredient,
  Meal,
  MenuItem,
  Order,
  OrderStatus,
  ServiceType,
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
