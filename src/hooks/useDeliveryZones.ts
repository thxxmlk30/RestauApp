import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurantApi';

const ZONES_KEY = ['delivery-zones'] as const;

export function useDeliveryZones() {
  return useQuery({ queryKey: ZONES_KEY, queryFn: () => restaurantApi.deliveryZones() });
}
