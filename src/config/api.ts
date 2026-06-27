const apiUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000/api';
const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export const apiConfig = {
  baseUrl: apiUrl.replace(/\/$/, ''),
  useMocks,
};

export const apiRoutes = {
  auth: '/auth',
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  authMe: '/auth/me',
  users: '/users',
  menuItems: '/menu-items',
  orders: '/orders',
  myOrders: '/orders/my-orders',
  ingredients: '/ingredients',
  staff: '/staff',
  deliveryZones: '/delivery-zones',
  reportsDashboard: '/reports/dashboard',
  reportsTopItems: '/reports/top-items',
};
