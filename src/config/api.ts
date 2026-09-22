const apiUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? 'https://linguere-backend.onrender.com/api' : 'http://localhost:3000/api');
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const apiConfig = {
  baseUrl: apiUrl.replace(/\/$/, ''),
  useMocks,
};

export const apiRoutes = {
  auth: '/auth',
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  authRequestOtp: '/auth/otp/request',
  authVerifyOtp: '/auth/otp/verify',
  authForgotPassword: '/auth/forgot-password',
  authResetPassword: '/auth/reset-password',
  authMe: '/auth/me',
  authLogout: '/auth/logout',
  users: '/users',
  menuItems: '/menu-items',
  orders: '/orders',
  myOrders: '/orders/my-orders',
  ingredients: '/ingredients',
  ingredientsLowStock: '/ingredients/low-stock',
  staff: '/staff',
  staffProvisionAccount: (staffId: string) => `/staff/${staffId}/provision-account`,
  deliveryZones: '/delivery-zones',
  reportsDashboard: '/reports/dashboard',
  reportsTopItems: '/reports/top-items',
  reportsRevenueTrend: '/reports/revenue-trend',
  reportsCancellations: '/reports/cancellations',
  reportsProfitability: '/reports/profitability',
  paymentsStripeSession: (orderId: string) => `/payments/orders/${orderId}/stripe-session`,
  paymentsStripeConfirm: (orderId: string) => `/payments/orders/${orderId}/stripe-confirm`,
};
