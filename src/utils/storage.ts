import type { Meal, MenuItem, Order, OrderStatus } from '../types';

const MENU_ITEMS_KEY = 'restauapp.menuItems.v1';
const ORDERS_KEY = 'restauapp.orders.v1';

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

const validMeals = new Set<Meal>(['breakfast', 'lunch', 'dinner', 'any']);
const validCategories = new Set<MenuItem['category']>(['entree', 'plat', 'dessert', 'boisson']);
const validOrderStatuses = new Set<OrderStatus>(['pending', 'preparing', 'ready', 'delivered', 'cancelled']);

function asString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function normalizeMenuItem(value: unknown): MenuItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;

  const id = asString(item.id);
  const name = asString(item.name);
  const description = asString(item.description);
  const price = asNumber(item.price);
  const category = asString(item.category);
  const meal = asString(item.meal);
  const image = asString(item.image);
  const available = asBoolean(item.available);

  if (!id || !name || !description || price === null || !category || !validCategories.has(category as MenuItem['category'])) return null;

  const normalizedMeal: Meal = validMeals.has(meal as Meal) ? (meal as Meal) : 'any';

  return {
    id,
    name,
    description,
    price,
    category: category as MenuItem['category'],
    meal: normalizedMeal,
    image: image ?? '',
    available: available ?? true,
  };
}

function normalizeOrder(value: unknown): Order | null {
  if (!value || typeof value !== 'object') return null;
  const order = value as Record<string, unknown>;

  const id = asString(order.id);
  const tableNumber = asNumber(order.tableNumber);
  const status = asString(order.status);
  const totalAmount = asNumber(order.totalAmount);
  const createdAt = asString(order.createdAt);
  const customerName = asString(order.customerName);
  const userId = asString(order.userId);
  const userName = asString(order.userName);
  const userEmail = asString(order.userEmail);
  const ratingRaw = asNumber(order.rating);
  const review = asString(order.review);
  const ratedAt = asString(order.ratedAt);

  const items = Array.isArray(order.items) ? order.items : null;

  if (!id || tableNumber === null || !status || !validOrderStatuses.has(status as OrderStatus) || totalAmount === null || !createdAt || !items) return null;

  const normalizedItems = items
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const menuItemId = asString(item.menuItemId);
      const name = asString(item.name);
      const quantity = asNumber(item.quantity);
      const price = asNumber(item.price);
      if (!menuItemId || !name || quantity === null || price === null) return null;
      if (!Number.isInteger(quantity) || quantity <= 0) return null;
      return { menuItemId, name, quantity, price };
    })
    .filter(Boolean) as Order['items'];

  if (normalizedItems.length === 0) return null;

  const rating =
    ratingRaw !== null && Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;

  return {
    id,
    tableNumber,
    items: normalizedItems,
    status: status as OrderStatus,
    totalAmount,
    createdAt,
    customerName: customerName ?? undefined,
    userId: userId ?? undefined,
    userName: userName ?? undefined,
    userEmail: userEmail ?? undefined,
    rating: rating ?? undefined,
    review: review ?? undefined,
    ratedAt: ratedAt ?? undefined,
  };
}

export function loadMenuItems(fallback: MenuItem[]) {
  if (!isBrowserStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(MENU_ITEMS_KEY);
    if (!raw) return fallback;
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const normalized = parsed.map(normalizeMenuItem).filter(Boolean) as MenuItem[];
    return normalized.length > 0 ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export function saveMenuItems(items: MenuItem[]) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // ignore write errors
  }
}

export function loadOrders(fallback: Order[]) {
  if (!isBrowserStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return fallback;
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const normalized = parsed.map(normalizeOrder).filter(Boolean) as Order[];
    return normalized.length > 0 ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export function saveOrders(orders: Order[]) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore write errors
  }
}
