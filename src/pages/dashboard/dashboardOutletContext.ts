import type { DashboardStats, Ingredient, MenuItem, Order, OrderStatus, Staff, StaffStatus } from '../../types';

export type DashboardStatusOption = { value: OrderStatus; label: string };

export type DashboardOutletContext = {
  orders: Order[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  staff: Staff[];
  stats: DashboardStats;
  preparingCount: number;
  statusOptions: DashboardStatusOption[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  assignCourier: (orderId: string, staffId: string) => void;
  assignChef: (orderId: string, staffId: string) => void;
  upsertMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleMenuItemAvailability: (itemId: string) => void;
  upsertIngredient: (item: Ingredient) => void;
  replaceIngredients: (items: Ingredient[]) => void;
  deleteIngredient: (itemId: string) => void;
  adjustIngredientStock: (itemId: string, delta: number) => void;
  upsertStaff: (member: Staff) => void;
  deleteStaff: (staffId: string) => void;
  updateStaffStatus: (staffId: string, status: StaffStatus) => void;
};
