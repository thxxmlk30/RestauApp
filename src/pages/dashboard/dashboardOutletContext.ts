import type { DashboardStats, Order, OrderStatus } from '../../types';

export type DashboardStatusOption = { value: OrderStatus; label: string };

export type DashboardOutletContext = {
  orders: Order[];
  stats: DashboardStats;
  preparingCount: number;
  statusOptions: DashboardStatusOption[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
};

