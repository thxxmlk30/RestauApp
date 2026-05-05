import type { ReactNode } from 'react';
import type { OrderStatus } from '../../types';
import { formatStatus, getStatusTone } from '../../utils/helpers';

type BadgeVariant = 'default' | 'outline' | 'secondary' | 'destructive';

interface BadgeProps {
  status?: OrderStatus;
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border border-transparent bg-gray-100 text-gray-700',
  outline: 'border border-gray-200 bg-white text-gray-700',
  secondary: 'border border-primary-200 bg-primary-50 text-primary-700',
  destructive: 'border border-rose-200 bg-rose-50 text-rose-700',
};

export function Badge({ status, variant = 'default', className = '', children }: BadgeProps) {
  const content = status ? formatStatus(status) : children;
  const tone = status ? getStatusTone(status) : variantClasses[variant];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone} ${className}`}>
      {content}
    </span>
  );
}
