import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantApi, type IngredientInput } from '../services/restaurantApi';

const INGREDIENTS_KEY = ['ingredients'] as const;
const LOW_STOCK_KEY = ['ingredients', 'low-stock'] as const;

export function useIngredients(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: INGREDIENTS_KEY,
    queryFn: () => restaurantApi.ingredients(),
    enabled: options?.enabled ?? true,
  });
}

export function useLowStockIngredients(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LOW_STOCK_KEY,
    queryFn: () => restaurantApi.lowStockIngredients(),
    enabled: options?.enabled ?? true,
  });
}

function useInvalidateIngredients() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: INGREDIENTS_KEY });
    void queryClient.invalidateQueries({ queryKey: LOW_STOCK_KEY });
    void queryClient.invalidateQueries({ queryKey: ['reports'] });
  };
}

export function useCreateIngredient() {
  const invalidate = useInvalidateIngredients();
  return useMutation({
    mutationFn: (payload: IngredientInput) => restaurantApi.createIngredient(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateIngredient() {
  const invalidate = useInvalidateIngredients();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<IngredientInput> }) =>
      restaurantApi.updateIngredient(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteIngredient() {
  const invalidate = useInvalidateIngredients();
  return useMutation({
    mutationFn: (id: string) => restaurantApi.deleteIngredient(id),
    onSuccess: invalidate,
  });
}
