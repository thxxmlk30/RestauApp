import type { Order, OrderStatus, User } from '../types';

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function getNextStatusOptions(current: OrderStatus): OrderStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[current];
}

/**
 * Miroir côté frontend de orders.service.ts#assertCanTransition (backend) :
 * sert uniquement à masquer/désactiver les actions impossibles dans l'UI.
 * Le backend reste la seule source de vérité pour l'autorisation réelle.
 */
export function canTransitionStatus(order: Order, targetStatus: OrderStatus, user: User | null): boolean {
  if (!user) return false;
  if (!ALLOWED_STATUS_TRANSITIONS[order.status].includes(targetStatus)) return false;
  if (user.role === 'admin') return true;

  if (user.role === 'chef') {
    const isChefTransition =
      (order.status === 'pending' && targetStatus === 'preparing') ||
      (order.status === 'preparing' && targetStatus === 'ready');
    return isChefTransition && !!user.staffId && order.assignedChefId === user.staffId;
  }

  const isServingTransition = order.status === 'ready' && targetStatus === 'delivered';

  if (user.role === 'waiter') {
    return isServingTransition && order.serviceType === 'dine_in';
  }

  if (user.role === 'delivery') {
    return isServingTransition && order.serviceType === 'delivery' && !!user.staffId && order.courierId === user.staffId;
  }

  return false;
}

export function getAvailableTransitions(order: Order, user: User | null): OrderStatus[] {
  return getNextStatusOptions(order.status).filter((status) => canTransitionStatus(order, status, user));
}

export function canCancelOrder(order: Order, user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return order.status === 'pending' || order.status === 'preparing';
  if (user.id === order.userId) return order.status === 'pending';
  return false;
}

export function canDeleteOrder(order: Order, user: User | null): boolean {
  return user?.role === 'admin' && order.paymentStatus !== 'paid' && order.status !== 'delivered';
}

export function isStaffRole(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'chef' || user?.role === 'waiter' || user?.role === 'delivery';
}
