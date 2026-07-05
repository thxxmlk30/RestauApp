import { Download, FileText, Printer } from 'lucide-react';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import type { DashboardOutletContext } from './dashboardOutletContext';
import OrdersStatusChart from '../../components/dashboard/OrdersStatusChart';
import RevenueChart from '../../components/dashboard/RevenueChart';
import TopItemsChart from '../../components/dashboard/TopItemsChart';
import { formatCurrency } from '../../utils/helpers';

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
  const { orders, ingredients, staff, topItems } = useOutletContext<DashboardOutletContext>();

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.totalAmount, 0), [orders]);
  const averageTicket = useMemo(() => (orders.length ? Math.round(totalRevenue / orders.length) : 0), [orders, totalRevenue]);
  const stockAlerts = useMemo(() => ingredients.filter((item) => item.currentStock <= item.reorderThreshold).length, [ingredients]);
  const activeStaff = useMemo(() => staff.filter((member) => member.status === 'active').length, [staff]);

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

  const printSummary = () => {
    const reportWindow = window.open('', '_blank', 'width=900,height=700');
    if (!reportWindow) return;

    reportWindow.document.write(`
      <html>
        <head>
          <title>Rapport Linguere</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1c1917; }
            h1 { margin-bottom: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 24px 0; }
            .card { border: 1px solid #e7e5e4; border-radius: 16px; padding: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border-bottom: 1px solid #e7e5e4; text-align: left; padding: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Rapport opérationnel Linguere</h1>
          <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
          <div class="grid">
            <div class="card"><strong>CA total</strong><div>${formatCurrency(totalRevenue)}</div></div>
            <div class="card"><strong>Panier moyen</strong><div>${formatCurrency(averageTicket)}</div></div>
            <div class="card"><strong>Alertes stock</strong><div>${stockAlerts}</div></div>
            <div class="card"><strong>Staff actif</strong><div>${activeStaff}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders
                .map(
                  (order) => `
                    <tr>
                      <td>${order.id}</td>
                      <td>${order.customerName || order.userName || 'Client'}</td>
                      <td>${order.serviceType}</td>
                      <td>${order.status}</td>
                      <td>${formatCurrency(order.totalAmount)}</td>
                    </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary-900">Rapports & génération</h1>
          <p className="mt-1 text-sm text-gray-500">Exports utiles pour le pilotage business, les stocks et l’activité terrain.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportOrdersCsv}>
            <Download size={16} className="mr-2" />
            Commandes CSV
          </Button>
          <Button variant="outline" onClick={exportStockCsv}>
            <FileText size={16} className="mr-2" />
            Stock CSV
          </Button>
          <Button onClick={printSummary}>
            <Printer size={16} className="mr-2" />
            Rapport imprimable
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-gray-500">CA cumulé</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{formatCurrency(averageTicket)}</div>
          <div className="text-sm text-gray-500">Panier moyen</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{stockAlerts}</div>
          <div className="text-sm text-gray-500">Alertes stock</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{activeStaff}</div>
          <div className="text-sm text-gray-500">Staff actif</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart orders={orders} />
        <OrdersStatusChart orders={orders} />
      </div>

      <TopItemsChart orders={orders} items={topItems} />
    </div>
  );
}
