import StockManagement from '../../components/dashboard/StockManagement';

export default function DashboardStockPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Stocks d ingredients</h1>
        <p className="mt-1 text-sm text-gray-500">Gestion complete des niveaux, cloture de journee et declenchement instantane du bot d approvisionnement.</p>
      </div>
      <StockManagement />
    </div>
  );
}
