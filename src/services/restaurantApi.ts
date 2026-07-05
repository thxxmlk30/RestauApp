import type { DeliveryZone, Ingredient, MenuItem, Order, OrderStatus, Staff } from '../types';
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

type AuthMutationResponse = {
  message: string;
  email?: string;
  devOtpCode?: string;
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

export type MenuItemInput = Omit<MenuItem, 'id'> & { id?: string };
export type IngredientInput = Omit<Ingredient, 'id'> & { id?: string };
export type StaffInput = Omit<Staff, 'id'> & { id?: string };
export type TopItemSummary = {
  menuItemId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type StripeCheckoutResponse = {
  provider: 'stripe' | 'simulation';
  sessionId: string;
  checkoutUrl: string | null;
  paymentStatus: string;
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
    return apiRequest<AuthMutationResponse>(apiRoutes.authRegister, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ name, email, password }),
    });
  },

  async requestOtp(email: string) {
    return apiRequest<AuthMutationResponse>(apiRoutes.authRequestOtp, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, code: string) {
    const response = await apiRequest<AuthResponse>(apiRoutes.authVerifyOtp, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, code }),
    });
    setApiToken(response.accessToken);
    return response;
  },

  async forgotPassword(email: string) {
    return apiRequest<AuthMutationResponse>(apiRoutes.authForgotPassword, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    return apiRequest<AuthMutationResponse>(apiRoutes.authResetPassword, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  me() {
    return apiRequest<AuthResponse['user']>(apiRoutes.authMe);
  },

  menuItems() {
    return apiRequest<MenuItem[]>(apiRoutes.menuItems, { auth: false });
  },

  createMenuItem(payload: MenuItemInput) {
    return apiRequest<MenuItem>(apiRoutes.menuItems, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateMenuItem(itemId: string, payload: Partial<MenuItemInput>) {
    return apiRequest<MenuItem>(`${apiRoutes.menuItems}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteMenuItem(itemId: string) {
    return apiRequest<void>(`${apiRoutes.menuItems}/${itemId}`, {
      method: 'DELETE',
    });
  },

  deliveryZones() {
    return apiRequest<DeliveryZone[]>(apiRoutes.deliveryZones, { auth: false });
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

  assignOrderChef(orderId: string, staffId?: string, staffName?: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/assign-chef`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId, staffName }),
    });
  },

  assignOrderCourier(orderId: string, staffId?: string, staffName?: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/assign-courier`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId, staffName }),
    });
  },

  deleteOrder(orderId: string) {
    return apiRequest<void>(`${apiRoutes.orders}/${orderId}`, {
      method: 'DELETE',
    });
  },

  createStripeCheckout(orderId: string) {
    return apiRequest<StripeCheckoutResponse>(apiRoutes.paymentsStripeSession(orderId), {
      method: 'POST',
    });
  },

  confirmStripePayment(orderId: string, sessionId: string) {
    return apiRequest<Order>(apiRoutes.paymentsStripeConfirm(orderId), {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  cancelOrder(orderId: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/cancel`, {
      method: 'PATCH',
    });
  },

  rateOrder(orderId: string, rating: number, review?: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/rate`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, review }),
    });
  },

  ingredients() {
    return apiRequest<Ingredient[]>(apiRoutes.ingredients);
  },

  createIngredient(payload: IngredientInput) {
    return apiRequest<Ingredient>(apiRoutes.ingredients, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateIngredient(itemId: string, payload: Partial<IngredientInput>) {
    return apiRequest<Ingredient>(`${apiRoutes.ingredients}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteIngredient(itemId: string) {
    return apiRequest<void>(`${apiRoutes.ingredients}/${itemId}`, {
      method: 'DELETE',
    });
  },

  staff() {
    return apiRequest<Staff[]>(apiRoutes.staff);
  },

  createStaff(payload: StaffInput) {
    return apiRequest<Staff>(apiRoutes.staff, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStaff(staffId: string, payload: Partial<StaffInput>) {
    return apiRequest<Staff>(`${apiRoutes.staff}/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteStaff(staffId: string) {
    return apiRequest<void>(`${apiRoutes.staff}/${staffId}`, {
      method: 'DELETE',
    });
  },

  dashboardReport() {
    return apiRequest(apiRoutes.reportsDashboard);
  },

  topItems(limit = 6) {
    return apiRequest<TopItemSummary[]>(`${apiRoutes.reportsTopItems}?limit=${limit}`);
  },
};
