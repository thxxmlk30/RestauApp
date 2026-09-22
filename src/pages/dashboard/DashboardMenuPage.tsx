import MenuManager from '../../components/dashboard/MenuManager';
import { PageHeader } from '../../components/ui/PageHeader';

export default function DashboardMenuPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Carte" title="Menu" description="Ajoute, modifie et gere la disponibilite et la composition des plats." />
      <MenuManager />
    </div>
  );
}
