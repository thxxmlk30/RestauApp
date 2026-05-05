import StockManagement from '../../components/dashboard/StockManagement';

export default function DashboardStockPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Stocks d'ingrédients</h1>
        <p className="text-sm text-gray-500 mt-1">Gestion complète des stocks avec alertes automatiques.</p>
      </div>
      <StockManagement />
    </div>
  );
}

