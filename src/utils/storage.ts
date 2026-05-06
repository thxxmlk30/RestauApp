import type {
  FavoriteItem,
  Ingredient,
  IngredientUnit,
  Meal,
  MenuItem,
  Order,
  OrderLocation,
  OrderStatus,
  ServiceType,
  Staff,
  StaffStatus,
  StockAuditLine,
  StockAuditRecord,
  StockBotChannel,
  StockBotSettings,
  User,
  UserRole,
} from '../types';

const MENU_ITEMS_KEY = 'restauapp.menuItems.v2';
const ORDERS_KEY = 'restauapp.orders.v3';
const INGREDIENTS_KEY = 'restauapp.ingredients.v2';
const STAFF_KEY = 'restauapp.staff.v2';
const FAVORITES_KEY = 'restauapp.favorites.v1';
const STOCK_AUDITS_KEY = 'restauapp.stockAudits.v1';
const STOCK_BOT_SETTINGS_KEY = 'restauapp.stockBotSettings.v1';

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
const validUnits = new Set<IngredientUnit>(['kg', 'l', 'unit', 'g']);
const validRoles = new Set<UserRole>(['admin', 'waiter', 'chef', 'delivery', 'customer']);
const validOrderStatuses = new Set<OrderStatus>(['pending', 'preparing', 'ready', 'delivered', 'cancelled']);
const validServiceTypes = new Set<ServiceType>(['dine_in', 'delivery']);
const validStaffStatuses = new Set<StaffStatus>(['active', 'break', 'off']);
const validBotChannels = new Set<StockBotChannel>(['email', 'whatsapp']);

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
  const prepTimeMinutes = asNumber(item.prepTimeMinutes);

  if (!id || !name || !description || price === null || !category || !validCategories.has(category as MenuItem['category'])) {
    return null;
  }

  return {
    id,
    name,
    description,
    price,
    category: category as MenuItem['category'],
    meal: validMeals.has(meal as Meal) ? (meal as Meal) : 'any',
    image: image ?? '',
    available: available ?? true,
    prepTimeMinutes: prepTimeMinutes ?? 20,
  };
}

function normalizeLocation(value: unknown): OrderLocation | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const location = value as Record<string, unknown>;
  const lat = asNumber(location.lat);
  const lng = asNumber(location.lng);
  if (lat === null || lng === null) return undefined;
  return { lat, lng };
}

function normalizeOrder(value: unknown): Order | null {
  if (!value || typeof value !== 'object') return null;
  const order = value as Record<string, unknown>;

  const id = asString(order.id);
  const status = asString(order.status);
  const totalAmount = asNumber(order.totalAmount);
  const createdAt = asString(order.createdAt);
  const serviceType = asString(order.serviceType) ?? (asNumber(order.tableNumber) !== null ? 'dine_in' : 'delivery');
  const tableNumber = asNumber(order.tableNumber);
  const subtotalAmount = asNumber(order.subtotalAmount);
  const discountAmount = asNumber(order.discountAmount);
  const customerName = asString(order.customerName);
  const userId = asString(order.userId);
  const userName = asString(order.userName);
  const userEmail = asString(order.userEmail);
  const promoCode = asString(order.promoCode);
  const ratingRaw = asNumber(order.rating);
  const review = asString(order.review);
  const ratedAt = asString(order.ratedAt);
  const deliveryAddress = asString(order.deliveryAddress);
  const deliveryZoneId = asString(order.deliveryZoneId);
  const deliveryDepartment = asString(order.deliveryDepartment);
  const deliveryCommune = asString(order.deliveryCommune);
  const deliverySector = asString(order.deliverySector);
  const deliveryFee = asNumber(order.deliveryFee);
  const deliveryNotes = asString(order.deliveryNotes);
  const customerPhone = asString(order.customerPhone);
  const assignedChefId = asString(order.assignedChefId);
  const assignedChefName = asString(order.assignedChefName);
  const courierId = asString(order.courierId);
  const courierName = asString(order.courierName);
  const estimatedReadyAt = asString(order.estimatedReadyAt);
  const estimatedDeliveryAt = asString(order.estimatedDeliveryAt);

  const items = Array.isArray(order.items) ? order.items : null;

  if (!id || !status || !validOrderStatuses.has(status as OrderStatus) || totalAmount === null || !createdAt || !items) {
    return null;
  }

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

  const rating = ratingRaw !== null && Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;

  return {
    id,
    serviceType: validServiceTypes.has(serviceType as ServiceType) ? (serviceType as ServiceType) : 'dine_in',
    tableNumber: tableNumber ?? undefined,
    deliveryAddress: deliveryAddress ?? undefined,
    deliveryZoneId: deliveryZoneId ?? undefined,
    deliveryDepartment: deliveryDepartment ?? undefined,
    deliveryCommune: deliveryCommune ?? undefined,
    deliverySector: deliverySector ?? undefined,
    deliveryFee: deliveryFee ?? undefined,
    deliveryNotes: deliveryNotes ?? undefined,
    customerPhone: customerPhone ?? undefined,
    items: normalizedItems,
    status: status as OrderStatus,
    totalAmount,
    subtotalAmount: subtotalAmount ?? undefined,
    discountAmount: discountAmount ?? undefined,
    createdAt,
    customerName: customerName ?? undefined,
    userId: userId ?? undefined,
    userName: userName ?? undefined,
    userEmail: userEmail ?? undefined,
    promoCode: promoCode ?? undefined,
    rating,
    location: normalizeLocation(order.location),
    review: review ?? undefined,
    ratedAt: ratedAt ?? undefined,
    assignedChefId: assignedChefId ?? undefined,
    assignedChefName: assignedChefName ?? undefined,
    courierId: courierId ?? undefined,
    courierName: courierName ?? undefined,
    estimatedReadyAt: estimatedReadyAt ?? undefined,
    estimatedDeliveryAt: estimatedDeliveryAt ?? undefined,
  };
}

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;
  const user = value as Record<string, unknown>;

  const id = asString(user.id);
  const name = asString(user.name);
  const email = asString(user.email);
  const role = asString(user.role);

  if (!id || !name || !email || !role || !validRoles.has(role as UserRole)) return null;

  return { id, name, email, role: role as UserRole };
}

function normalizeIngredient(value: unknown): Ingredient | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;

  const id = asString(item.id);
  const name = asString(item.name);
  const currentStock = asNumber(item.currentStock);
  const unit = asString(item.unit);
  const minStock = asNumber(item.minStock);
  const reorderThreshold = asNumber(item.reorderThreshold);
  const criticalStock = asNumber(item.criticalStock);
  const supplier = asString(item.supplier);
  const costPerUnit = asNumber(item.costPerUnit);
  const lastRestockedAt = asString(item.lastRestockedAt);
  const lastCountedAt = asString(item.lastCountedAt);

  if (
    !id ||
    !name ||
    currentStock === null ||
    !unit ||
    !validUnits.has(unit as IngredientUnit) ||
    minStock === null ||
    reorderThreshold === null
  ) {
    return null;
  }

  return {
    id,
    name,
    currentStock,
    unit: unit as IngredientUnit,
    minStock,
    reorderThreshold,
    criticalStock: criticalStock ?? minStock,
    supplier: supplier ?? undefined,
    costPerUnit: costPerUnit ?? undefined,
    lastRestockedAt: lastRestockedAt ?? undefined,
    lastCountedAt: lastCountedAt ?? undefined,
  };
}

function normalizeStaff(value: unknown): Staff | null {
  if (!value || typeof value !== 'object') return null;
  const staff = value as Record<string, unknown>;

  const userPart = normalizeUser(value);
  if (!userPart) return null;

  const phone = asString(staff.phone);
  const salary = asNumber(staff.salary);
  const hireDate = asString(staff.hireDate);
  const shift = asString(staff.shift);
  const zone = asString(staff.zone);
  const status = asString(staff.status);

  if (!phone || salary === null || !hireDate || !shift || !status || !validStaffStatuses.has(status as StaffStatus)) {
    return null;
  }

  return {
    ...userPart,
    phone,
    salary,
    hireDate,
    shift,
    zone: zone ?? undefined,
    status: status as StaffStatus,
  };
}

function normalizeFavorite(value: unknown): FavoriteItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const menuItemId = asString(item.menuItemId);
  const addedAt = asString(item.addedAt);
  if (!menuItemId || !addedAt) return null;
  return { menuItemId, addedAt };
}

function normalizeStockAuditLine(value: unknown): StockAuditLine | null {
  if (!value || typeof value !== 'object') return null;
  const line = value as Record<string, unknown>;
  const ingredientId = asString(line.ingredientId);
  const ingredientName = asString(line.ingredientName);
  const previousStock = asNumber(line.previousStock);
  const countedStock = asNumber(line.countedStock);
  const unit = asString(line.unit);
  const critical = asBoolean(line.critical);
  if (!ingredientId || !ingredientName || previousStock === null || countedStock === null || !unit || !validUnits.has(unit as IngredientUnit)) {
    return null;
  }
  return {
    ingredientId,
    ingredientName,
    previousStock,
    countedStock,
    unit: unit as IngredientUnit,
    critical: critical ?? false,
  };
}

function normalizeStockAuditRecord(value: unknown): StockAuditRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const id = asString(record.id);
  const createdAt = asString(record.createdAt);
  const channel = asString(record.channel);
  const totalItems = asNumber(record.totalItems);
  const criticalItems = asNumber(record.criticalItems);
  const linesRaw = Array.isArray(record.lines) ? record.lines : null;

  if (!id || !createdAt || !channel || !validBotChannels.has(channel as StockBotChannel) || totalItems === null || criticalItems === null || !linesRaw) {
    return null;
  }

  const lines = linesRaw.map(normalizeStockAuditLine).filter(Boolean) as StockAuditLine[];
  if (lines.length === 0) return null;

  return {
    id,
    createdAt,
    channel: channel as StockBotChannel,
    totalItems,
    criticalItems,
    lines,
  };
}

function normalizeStockBotSettings(value: unknown): StockBotSettings | null {
  if (!value || typeof value !== 'object') return null;
  const settings = value as Record<string, unknown>;
  const email = asString(settings.email);
  const whatsapp = asString(settings.whatsapp);
  const preferredChannel = asString(settings.preferredChannel);

  if (!email || !whatsapp || !preferredChannel || !validBotChannels.has(preferredChannel as StockBotChannel)) return null;

  return {
    email,
    whatsapp,
    preferredChannel: preferredChannel as StockBotChannel,
  };
}

function loadList<T>(key: string, fallback: T[], normalize: (value: unknown) => T | null) {
  if (!isBrowserStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const normalized = parsed.map(normalize).filter(Boolean) as T[];
    return normalized.length > 0 ? normalized : fallback;
  } catch {
    return fallback;
  }
}

function saveList<T>(key: string, items: T[]) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore write errors
  }
}

function loadSingle<T>(key: string, fallback: T, normalize: (value: unknown) => T | null) {
  if (!isBrowserStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = safeJsonParse(raw);
    return normalize(parsed) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveSingle<T>(key: string, value: T) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}

export function loadMenuItems(fallback: MenuItem[]) {
  return loadList(MENU_ITEMS_KEY, fallback, normalizeMenuItem);
}

export function saveMenuItems(items: MenuItem[]) {
  saveList(MENU_ITEMS_KEY, items);
}

export function loadOrders(fallback: Order[]) {
  return loadList(ORDERS_KEY, fallback, normalizeOrder);
}

export function saveOrders(orders: Order[]) {
  saveList(ORDERS_KEY, orders);
}

export function loadIngredients(fallback: Ingredient[]) {
  return loadList(INGREDIENTS_KEY, fallback, normalizeIngredient);
}

export function saveIngredients(items: Ingredient[]) {
  saveList(INGREDIENTS_KEY, items);
}

export function loadStaff(fallback: Staff[]) {
  return loadList(STAFF_KEY, fallback, normalizeStaff);
}

export function saveStaff(items: Staff[]) {
  saveList(STAFF_KEY, items);
}

export function loadFavorites() {
  return loadList<FavoriteItem>(FAVORITES_KEY, [], normalizeFavorite);
}

export function saveFavorites(items: FavoriteItem[]) {
  saveList(FAVORITES_KEY, items);
}

export function loadStockAudits() {
  return loadList<StockAuditRecord>(STOCK_AUDITS_KEY, [], normalizeStockAuditRecord);
}

export function saveStockAudits(items: StockAuditRecord[]) {
  saveList(STOCK_AUDITS_KEY, items);
}

export function loadStockBotSettings(fallback: StockBotSettings) {
  return loadSingle(STOCK_BOT_SETTINGS_KEY, fallback, normalizeStockBotSettings);
}

export function saveStockBotSettings(settings: StockBotSettings) {
  saveSingle(STOCK_BOT_SETTINGS_KEY, settings);
}
