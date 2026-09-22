import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantApi, type MenuItemInput } from '../services/restaurantApi';

const MENU_KEY = ['menu-items'] as const;

export function useMenuItems() {
  return useQuery({ queryKey: MENU_KEY, queryFn: () => restaurantApi.menuItems() });
}

function useInvalidateMenu() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: MENU_KEY });
}

export function useCreateMenuItem() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: (payload: MenuItemInput) => restaurantApi.createMenuItem(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateMenuItem() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MenuItemInput> }) =>
      restaurantApi.updateMenuItem(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteMenuItem() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: (id: string) => restaurantApi.deleteMenuItem(id),
    onSuccess: invalidate,
  });
}
