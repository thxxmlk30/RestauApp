export type UserRole = 'admin' | 'waiter' | 'chef' | 'delivery' | 'customer';

export type StaffStatus = 'active' | 'break' | 'off';

export type IngredientUnit = 'kg' | 'l' | 'unit' | 'g';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'any';

export type ServiceType = 'dine_in' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Staff extends User {
  phone: string;
  salary: number;
  hireDate: string;
  shift: string;
  zone?: string;
  status: StaffStatus;
}

export interface Ingredient {
  id: string;
  name: string;
  currentStock: number;
  unit: IngredientUnit;
  minStock: number;
  reorderThreshold: number;
  supplier?: string;
  costPerUnit?: number;
  lastRestockedAt?: string;
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

export interface PromoCode {
  code: string;
  discount: number;
  expiresAt: string;
}

export interface FavoriteItem {
  menuItemId: string;
  addedAt: string;
}
