export type UserRole = 'admin' | 'waiter' | 'chef' | 'delivery' | 'customer' | 'client';

export type StaffStatus = 'active' | 'break' | 'off';

export type IngredientUnit = 'kg' | 'l' | 'unit' | 'g';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'any';

export type ServiceType = 'dine_in' | 'delivery';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

export type StockBotChannel = 'email' | 'whatsapp';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Renseigne uniquement si ce compte est lie a une fiche Staff (RH) via
  // un provisionnement admin. null pour un client ou un admin non lie.
  staffId?: string | null;
}

export interface Staff extends User {
  phone: string;
  salary: number;
  hireDate: string;
  shift: string;
  zone?: string;
  status: StaffStatus;
  // Renseigne des que l'admin a "provisionne" un compte de connexion pour
  // cette fiche RH via POST /staff/:id/provision-account. null sinon.
  userId?: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  currentStock: number;
  unit: IngredientUnit;
  minStock: number;
  reorderThreshold: number;
  criticalStock: number;
  supplier?: string;
  costPerUnit?: number;
  lastRestockedAt?: string;
  lastCountedAt?: string;
}

export interface OrderLocation {
  lat: number;
  lng: number;
}

export interface DeliveryZone {
  id: string;
  department: string;
  commune: string;
  sector: string;
  fee: number;
  etaMinutes: number;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  landmarks: string[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  serviceType: ServiceType;
  tableNumber?: number;
  deliveryAddress?: string;
  deliveryZoneId?: string;
  deliveryDepartment?: string;
  deliveryCommune?: string;
  deliverySector?: string;
  deliveryFee?: number;
  deliveryNotes?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  createdAt: string;
  customerName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  promoCode?: string;
  paymentStatus?: PaymentStatus;
  paymentProvider?: string;
  paymentSessionId?: string;
  paymentIntentId?: string;
  paidAt?: string;
  rating?: number;
  location?: OrderLocation;
  review?: string;
  ratedAt?: string;
  assignedChefId?: string;
  assignedChefName?: string;
  courierId?: string;
  courierName?: string;
  estimatedReadyAt?: string;
  estimatedDeliveryAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entree' | 'plat' | 'dessert' | 'boisson';
  meal: Meal;
  image: string;
  available: boolean;
  prepTimeMinutes?: number;
  // Composition en ingredients (optionnelle). Renvoyee par le backend
  // seulement sur create/update (pas sur la liste/detail publics).
  recipe?: MenuItemRecipeLine[];
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  occupiedTables: number;
  totalTables: number;
  pendingOrders: number;
  ingredientsLow: number;
  deliveryOrders: number;
  dineInOrders: number;
  activeCouriers: number;
}

/** Forme exacte renvoyee par GET /reports/dashboard (backend). */
export interface DashboardReport {
  todayOrders: number;
  todayRevenue: number;
  deliveryOrders: number;
  dineInOrders: number;
  pendingOrders: number;
  ingredientsLow: number;
  cancelledOrdersToday: number;
  averageRating: number | null;
}

export interface RevenueTrendPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface CancellationStats {
  totalOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
}

export interface ProfitabilityItem {
  menuItemId: string;
  name: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
}

export interface MenuItemRecipeLine {
  ingredientId: string;
  quantityRequired: number;
  ingredient?: Ingredient;
}

export interface PromoCode {
  code: string;
  discount: number;
  expiresAt: string;
}

export interface FavoriteItem {
  menuItemId: string;
  addedAt: string;
}

export interface StockAuditLine {
  ingredientId: string;
  ingredientName: string;
  previousStock: number;
  countedStock: number;
  unit: IngredientUnit;
  critical: boolean;
}

export interface StockAuditRecord {
  id: string;
  createdAt: string;
  channel: StockBotChannel;
  totalItems: number;
  criticalItems: number;
  lines: StockAuditLine[];
}

export interface StockBotSettings {
  email: string;
  whatsapp: string;
  preferredChannel: StockBotChannel;
}
