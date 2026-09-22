import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurantApi';

export function useDashboardReport(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => restaurantApi.dashboardReport(),
    enabled: options?.enabled ?? true,
    refetchInterval: 60_000,
  });
}

export function useTopItems(limit = 6, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'top-items', limit],
    queryFn: () => restaurantApi.topItems(limit),
    enabled: options?.enabled ?? true,
  });
}

export function useRevenueTrend(days = 7, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'revenue-trend', days],
    queryFn: () => restaurantApi.revenueTrend(days),
    enabled: options?.enabled ?? true,
  });
}

export function useCancellationStats(days = 30, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'cancellations', days],
    queryFn: () => restaurantApi.cancellationStats(days),
    enabled: options?.enabled ?? true,
  });
}

export function useProfitability(limit = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reports', 'profitability', limit],
    queryFn: () => restaurantApi.profitability(limit),
    enabled: options?.enabled ?? true,
  });
}
