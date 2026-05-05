import MapTracker from '../../components/dashboard/MapTracker';

export default function DashboardMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Carte et tracking</h1>
        <p className="mt-1 text-sm text-gray-500">Suivi des commandes en livraison, lecture secteur par secteur et progression de course.</p>
      </div>
      <MapTracker />
    </div>
  );
}
