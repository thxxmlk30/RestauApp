import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: string;
  hint?: string;
  trend?: { value: number; label?: string };
}

export function StatCard({ label, value, icon: Icon, tone = 'bg-primary-50 text-primary-600', hint, trend }: StatCardProps) {
  const trendPositive = trend !== undefined && trend.value >= 0;

  return (
    <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon size={18} />
        </div>
        {trend ? (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trendPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}
            {trend.label ?? '%'}
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-2xl font-bold text-secondary-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}
