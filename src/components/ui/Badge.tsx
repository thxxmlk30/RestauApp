import type { OrderStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus;
}

const config: Record<OrderStatus, { label: string; class: string }> = {
  pending:   { label: 'En attente',  class: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'En cuisine',  class: 'bg-blue-100 text-blue-800' },
  ready:     { label: 'Prêt',        class: 'bg-green-100 text-green-800' },
  delivered: { label: 'Livré',       class: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Annulé',      class: 'bg-red-100 text-red-700' },
};

export function Badge({ status }: BadgeProps) {
  const { label, class: cls } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}