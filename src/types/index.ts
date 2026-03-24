export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'waiter' | 'chef' | 'customer';
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'any';

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  rating?: number;
  review?: string;
  ratedAt?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
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
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  occupiedTables: number;
  totalTables: number;
  pendingOrders: number;
}
