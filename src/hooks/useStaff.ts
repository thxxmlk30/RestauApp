import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantApi, type StaffInput } from '../services/restaurantApi';

const STAFF_KEY = ['staff'] as const;

export function useStaff(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: () => restaurantApi.staff(),
    enabled: options?.enabled ?? true,
  });
}

function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
}

export function useCreateStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (payload: StaffInput) => restaurantApi.createStaff(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StaffInput> }) => restaurantApi.updateStaff(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteStaff() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (id: string) => restaurantApi.deleteStaff(id),
    onSuccess: invalidate,
  });
}

export function useProvisionStaffAccount() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: ({ staffId, password }: { staffId: string; password?: string }) =>
      restaurantApi.provisionStaffAccount(staffId, password),
    onSuccess: invalidate,
  });
}
