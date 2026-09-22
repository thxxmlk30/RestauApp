import { Download, FileText, Printer } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { useOrders } from '../../hooks/useOrders';
import { useIngredients } from '../../hooks/useIngredients';
import { useStaff } from '../../hooks/useStaff';
import { useTopItems } from '../../hooks/useReports';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import { formatCurrency, formatServiceType, formatStatus } from '../../utils/helpers';

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DashboardReportsPage() {
  const { data: orders = [] } = useOrders();
  const { data: ingredients = [] } = useIngredients();
  const { data: staff = [] } = useStaff();
  const { data: topItems = [] } = useTopItems(6);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.totalAmount, 0), [orders]);
  const averageTicket = useMemo(() => (orders.length ? Math.round(totalRevenue / orders.length) : 0), [orders, totalRevenue]);
  const stockAlerts = useMemo(() => ingredients.filter((item) => item.currentStock <= item.reorderThreshold).length, [ingredients]);
  const activeStaff = useMemo(() => staff.filter((member) => member.status === 'active').length, [staff]);
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 40),
    [orders],
  );

  const exportOrdersCsv = () => {
    const lines = [
      ['ID', 'Type', 'Client', 'Statut', 'Total', 'Créé le'].join(','),
      ...orders.map((order) =>
        [
          order.id,
          order.serviceType,
          `"${order.customerName || order.userName || 'Client'}"`,
          order.status,
          order.totalAmount,
          `"${new Date(order.createdAt).toLocaleString('fr-FR')}"`,
        ].join(','),
      ),
    ];

    downloadBlob('rapport-commandes.csv', lines.join('\n'), 'text/csv;charset=utf-8;');
  };

  const exportStockCsv = () => {
    const lines = [
      ['Ingrédient', 'Stock', 'Unité', 'Seuil', 'Fournisseur'].join(','),
      ...ingredients.map((item) => [item.name, item.currentStock, item.unit, item.reorderThreshold, `"${item.supplier || ''}"`].join(',')),
    ];

    downloadBlob('rapport-stock.csv', lines.join('\n'), 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      <div className="print-hidden">
        <PageHeader
          eyebrow="Business"
          title="Rapports & génération"
          description="Exports utiles pour le pilotage business, les stocks et l'activité terrain."
          actions={
            <>
              <Button variant="outline" onClick={exportOrdersCsv}>
                <Download size={16} className="mr-2" />
                Commandes CSV
              </Button>
              <Button variant="outline" onClick={exportStockCsv}>
                <FileText size={16} className="mr-2" />
                Stock CSV
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={16} className="mr-2" />
                Imprimer le rapport
              </Button>
            </>
          }
        />
      </div>

      <TopItemsChart items={topItems} />

      <div className="print-area panel-3d rounded-[28px] border border-gray-100 bg-white p-6">
        <h1 className="font-display text-xl font-bold text-secondary-900">Rapport opérationnel Linguere</h1>
        <p className="mt-1 text-xs text-gray-500">Généré le {new Date().toLocaleString('fr-FR')}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="text-lg font-bold text-secondary-900">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-500">CA cumulé</div>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="text-lg font-bold text-secondary-900">{formatCurrency(averageTicket)}</div>
            <div className="text-sm text-gray-500">Panier moyen</div>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="text-lg font-bold text-secondary-900">{stockAlerts}</div>
            <div className="text-sm text-gray-500">Alertes stock</div>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="text-lg font-bold text-secondary-900">{activeStaff}</div>
            <div className="text-sm text-gray-500">Staff actif</div>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2">Commande</th>
              <th className="py-2">Client</th>
              <th className="py-2">Type</th>
              <th className="py-2">Statut</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100">
                <td className="py-2 font-mono text-xs">{order.id}</td>
                <td className="py-2">{order.customerName || order.userName || 'Client'}</td>
                <td className="py-2">{formatServiceType(order.serviceType)}</td>
                <td className="py-2">{formatStatus(order.status)}</td>
                <td className="py-2 text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
