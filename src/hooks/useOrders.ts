import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurantApi';
import type { OrderStatus } from '../types';

const ORDERS_KEY = ['orders'] as const;

export function useOrders(options?: { pollingMs?: number }) {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: () => restaurantApi.orders(),
    refetchInterval: options?.pollingMs,
  });
}

export function useOrdersPaginated(page: number, limit: number) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'page', page, limit],
    queryFn: async () => {
      const { data, total } = await restaurantApi.ordersPaginated(page, limit);
      return { items: data, total };
    },
    placeholderData: (previous) => previous,
  });
}

function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
    void queryClient.invalidateQueries({ queryKey: ['ingredients'] });
  };
}

export function useUpdateOrderStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      restaurantApi.updateOrderStatus(orderId, status),
    onSuccess: invalidate,
  });
}

export function useCancelOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (orderId: string) => restaurantApi.cancelOrder(orderId),
    onSuccess: invalidate,
  });
}

export function useDeleteOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (orderId: string) => restaurantApi.deleteOrder(orderId),
    onSuccess: invalidate,
  });
}

export function useAssignChef() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, staffId, staffName }: { orderId: string; staffId?: string; staffName?: string }) =>
      restaurantApi.assignOrderChef(orderId, staffId, staffName),
    onSuccess: invalidate,
  });
}

export function useAssignCourier() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, staffId, staffName }: { orderId: string; staffId?: string; staffName?: string }) =>
      restaurantApi.assignOrderCourier(orderId, staffId, staffName),
    onSuccess: invalidate,
  });
}
