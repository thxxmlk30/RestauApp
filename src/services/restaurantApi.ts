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

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function normalizeMenuItem(item: MenuItem): MenuItem {
  return {
    ...item,
    price: asNumber(item.price),
  };
}

function normalizeIngredient(item: Ingredient): Ingredient {
  return {
    ...item,
    currentStock: asNumber(item.currentStock),
    minStock: asNumber(item.minStock),
    reorderThreshold: asNumber(item.reorderThreshold),
    criticalStock: asNumber(item.criticalStock),
    costPerUnit: item.costPerUnit == null ? item.costPerUnit : asNumber(item.costPerUnit),
  };
}

function normalizeStaff(member: Staff): Staff {
  return {
    ...member,
    salary: asNumber(member.salary),
  };
}

function normalizeZone(zone: DeliveryZone): DeliveryZone {
  return {
    ...zone,
    fee: asNumber(zone.fee),
    etaMinutes: asNumber(zone.etaMinutes),
    lat: asNumber(zone.lat),
    lng: asNumber(zone.lng),
    mapX: asNumber(zone.mapX),
    mapY: asNumber(zone.mapY),
  };
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    totalAmount: asNumber(order.totalAmount),
    subtotalAmount: order.subtotalAmount == null ? order.subtotalAmount : asNumber(order.subtotalAmount),
    discountAmount: order.discountAmount == null ? order.discountAmount : asNumber(order.discountAmount),
    deliveryFee: order.deliveryFee == null ? order.deliveryFee : asNumber(order.deliveryFee),
    rating: order.rating == null ? order.rating : asNumber(order.rating),
    items: order.items.map((item) => ({
      ...item,
      quantity: asNumber(item.quantity),
      price: asNumber(item.price),
    })),
  };
}

function normalizeTopItem(item: TopItemSummary): TopItemSummary {
  return {
    ...item,
    totalQuantity: asNumber(item.totalQuantity),
    totalRevenue: asNumber(item.totalRevenue),
  };
}

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
    return apiRequest<MenuItem[]>(apiRoutes.menuItems, { auth: false }).then((items) => items.map(normalizeMenuItem));
  },

  createMenuItem(payload: MenuItemInput) {
    return apiRequest<MenuItem>(apiRoutes.menuItems, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(normalizeMenuItem);
  },

  updateMenuItem(itemId: string, payload: Partial<MenuItemInput>) {
    return apiRequest<MenuItem>(`${apiRoutes.menuItems}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then(normalizeMenuItem);
  },

  deleteMenuItem(itemId: string) {
    return apiRequest<void>(`${apiRoutes.menuItems}/${itemId}`, {
      method: 'DELETE',
    });
  },

  deliveryZones() {
    return apiRequest<DeliveryZone[]>(apiRoutes.deliveryZones, { auth: false }).then((zones) => zones.map(normalizeZone));
  },

  createOrder(payload: CreateOrderPayload) {
    return apiRequest<Order>(apiRoutes.orders, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  myOrders() {
    return apiRequest<Order[]>(apiRoutes.myOrders).then((orders) => orders.map(normalizeOrder));
  },

  orders() {
    return apiRequest<Order[]>(apiRoutes.orders).then((orders) => orders.map(normalizeOrder));
  },

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then(normalizeOrder);
  },

  assignOrderChef(orderId: string, staffId?: string, staffName?: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/assign-chef`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId, staffName }),
    }).then(normalizeOrder);
  },

  assignOrderCourier(orderId: string, staffId?: string, staffName?: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/assign-courier`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId, staffName }),
    }).then(normalizeOrder);
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
    }).then(normalizeOrder);
  },

  rateOrder(orderId: string, rating: number, review?: string) {
    return apiRequest<Order>(`${apiRoutes.orders}/${orderId}/rate`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, review }),
    }).then(normalizeOrder);
  },

  ingredients() {
    return apiRequest<Ingredient[]>(apiRoutes.ingredients).then((items) => items.map(normalizeIngredient));
  },

  createIngredient(payload: IngredientInput) {
    return apiRequest<Ingredient>(apiRoutes.ingredients, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(normalizeIngredient);
  },

  updateIngredient(itemId: string, payload: Partial<IngredientInput>) {
    return apiRequest<Ingredient>(`${apiRoutes.ingredients}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then(normalizeIngredient);
  },

  deleteIngredient(itemId: string) {
    return apiRequest<void>(`${apiRoutes.ingredients}/${itemId}`, {
      method: 'DELETE',
    });
  },

  staff() {
    return apiRequest<Staff[]>(apiRoutes.staff).then((items) => items.map(normalizeStaff));
  },

  createStaff(payload: StaffInput) {
    return apiRequest<Staff>(apiRoutes.staff, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(normalizeStaff);
  },

  updateStaff(staffId: string, payload: Partial<StaffInput>) {
    return apiRequest<Staff>(`${apiRoutes.staff}/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then(normalizeStaff);
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
    return apiRequest<TopItemSummary[]>(`${apiRoutes.reportsTopItems}?limit=${limit}`).then((items) => items.map(normalizeTopItem));
  },
};
