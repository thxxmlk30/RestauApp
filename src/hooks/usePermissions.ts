import { useAuth } from '../context/AuthContext';

/**
 * Point d'entrée unique pour les vérifications de rôle côté dashboard.
 * Remplace les `user?.role === 'admin'` dispersés dans layout/sidebar/pages.
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isChef: role === 'chef',
    isWaiter: role === 'waiter',
    isDelivery: role === 'delivery',
    isStaff: role === 'admin' || role === 'chef' || role === 'waiter' || role === 'delivery',
    canManageMenu: role === 'admin',
    canManageStock: role === 'admin',
    canManageStaff: role === 'admin',
    canManageZones: role === 'admin',
    canViewReports: role === 'admin',
    canViewStats: role === 'admin',
    canAssignStaff: role === 'admin',
    canDeleteOrders: role === 'admin',
  };
}
