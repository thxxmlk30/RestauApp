import type { ProfitabilityItem } from '../../types';
import { formatCurrency } from '../../utils/helpers';

export default function ProfitabilityList({ items }: { items: ProfitabilityItem[] }) {
  return (
    <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-secondary-900">Plats les plus rentables</h2>
        <span className="text-xs text-gray-400">Marge nette</span>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Pas assez de recettes chiffrees (cout ingredient manquant) pour calculer la rentabilite.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-secondary-900">{item.name}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.quantitySold} vendus · CA {formatCurrency(item.revenue)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{formatCurrency(item.margin)}</div>
                  <div className="text-xs text-gray-500">{item.marginPercent.toFixed(1)}% marge</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
