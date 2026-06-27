import type { Ingredient, MenuItem, Order, OrderStatus, Staff } from '../types';
import { apiRoutes } from '../config/api';
import { apiRequest, setApiToken } from './apiClient';

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type CreateOrderPayload = {
  serviceType: 'dine_in' | 'delivery';
  tableNumber?: number;
  deliveryZoneId?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  customerPhone?: string;
  customerName?: string;
  items: Array<{ menuItemId: string; quantity: number }>;
};

export const restaurantApi = {
  async login(email: string, password: string) {
    const response = await apiRequest<AuthResponse>(apiRoutes.authLogin, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    setApiToken(response.accessToken);
    return response;
  },

  async register(name: string, email: string, password: string) {
    const response = await apiRequest<AuthResponse>(apiRoutes.authRegister, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ name, email, password }),
    });
    setApiToken(response.accessToken);
    return response;
  },

  me() {
    return apiRequest<AuthResponse['user']>(apiRoutes.authMe);
  },

  menuItems() {
    return apiRequest<MenuItem[]>(apiRoutes.menuItems, { auth: false });
  },

  deliveryZones() {
    return apiRequest(apiRoutes.deliveryZones, { auth: false });
  },

  createOrder(payload: CreateOrderPayload) {
    return apiRequest<Order>(apiRoutes.orders, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  myOrders() {
    return apiRequest<Order[]>(apiRoutes.myOrders);
  },

  orders() {
    return apiRequest<Order[]>(apiRoutes.orders);
  },

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  ingredients() {
    return apiRequest<Ingredient[]>(apiRoutes.ingredients);
  },

  staff() {
    return apiRequest<Staff[]>(apiRoutes.staff);
  },

  dashboardReport() {
    return apiRequest(apiRoutes.reportsDashboard);
  },
};
