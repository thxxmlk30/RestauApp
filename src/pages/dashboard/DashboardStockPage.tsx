import StockManagement from '../../components/dashboard/StockManagement';
import { PageHeader } from '../../components/ui/PageHeader';

export default function DashboardStockPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Cuisine" title="Stocks d'ingredients" description="Niveaux, seuils critiques et contact fournisseur." />
      <StockManagement />
    </div>
  );
}
