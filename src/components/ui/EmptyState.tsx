import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
        <Icon size={22} />
      </div>
      <div className="text-sm font-semibold text-secondary-900">{title}</div>
      {description ? <p className="max-w-sm text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}
