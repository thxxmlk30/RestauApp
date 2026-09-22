import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import OrdersTable from '../../components/dashboard/OrdersTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useAssignChef, useAssignCourier, useDeleteOrder, useOrdersPaginated, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useStaff } from '../../hooks/useStaff';
import { ALLOWED_STATUS_TRANSITIONS } from '../../utils/orderPermissions';
import type { OrderStatus, ServiceType } from '../../types';
import { formatStatus } from '../../utils/helpers';

const statusFilters: OrderStatus[] = Object.keys(ALLOWED_STATUS_TRANSITIONS) as OrderStatus[];
const PAGE_SIZE = 20;

export default function DashboardOrdersPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data } = useOrdersPaginated(page, PAGE_SIZE);
  const { data: staff } = useStaff({ enabled: isAdmin });
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const assignChef = useAssignChef();
  const assignCourier = useAssignCourier();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.items ?? []).filter((order) => {
      if (activeFilter !== 'all' && order.status !== activeFilter) return false;
      if (serviceFilter !== 'all' && order.serviceType !== serviceFilter) return false;
      if (!term) return true;
      return (
        order.id.toLowerCase().includes(term) ||
        (order.customerName ?? '').toLowerCase().includes(term) ||
        (order.userName ?? '').toLowerCase().includes(term) ||
        order.items.some((line) => line.name.toLowerCase().includes(term))
      );
    });
  }, [activeFilter, data, search, serviceFilter]);

  const chefs = (staff ?? []).filter((member) => member.role === 'chef');
  const couriers = (staff ?? []).filter((member) => member.role === 'delivery');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Gestion des commandes"
        description="Filtre par statut, par type de service, recherche et affectation de l'equipe."
      />

      <div className="panel-3d overflow-hidden rounded-[30px] border border-gray-100 bg-white">
        <div className="space-y-4 border-b border-gray-100 p-5">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher (ID, client, produit)..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`rounded-full px-3 py-1 text-xs ${activeFilter === 'all' ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tous statuts
            </button>
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveFilter(status)}
                className={`rounded-full px-3 py-1 text-xs ${
                  activeFilter === status ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'dine_in', 'delivery'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setServiceFilter(value)}
                className={`rounded-full px-3 py-1 text-xs ${
                  serviceFilter === value ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                {value === 'all' ? 'Tous services' : value === 'delivery' ? 'Livraison' : 'Sur place'}
              </button>
            ))}
          </div>
        </div>

        <OrdersTable
          orders={filteredOrders}
          user={user}
          onUpdateStatus={(orderId, status) => updateStatus.mutate({ orderId, status })}
          onDeleteOrder={isAdmin ? (orderId) => deleteOrder.mutate(orderId) : undefined}
          chefs={chefs}
          couriers={couriers}
          onAssignChef={
            isAdmin
              ? (orderId, staffId) => {
                  const chef = chefs.find((member) => member.id === staffId);
                  assignChef.mutate({ orderId, staffId, staffName: chef?.name });
                }
              : undefined
          }
          onAssignCourier={
            isAdmin
              ? (orderId, staffId) => {
                  const courier = couriers.find((member) => member.id === staffId);
                  assignCourier.mutate({ orderId, staffId, staffName: courier?.name });
                }
              : undefined
          }
        />

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4">
          <span className="text-xs text-gray-500">
            Page {page} / {totalPages} · {total} commande(s) au total
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Precedent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
