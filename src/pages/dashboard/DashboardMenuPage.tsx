import MenuCrud from '../../components/dashboard/Commande';

export default function DashboardMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Menu (CRUD)</h1>
        <p className="text-sm text-gray-500 mt-1">Ajoute, modifie, supprime des plats et gère la disponibilité.</p>
      </div>

      <MenuCrud />
    </div>
  );
}

