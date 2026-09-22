import StaffManagement from '../../components/dashboard/StaffManagement';
import { PageHeader } from '../../components/ui/PageHeader';

export default function DashboardStaffPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Equipe" title="Gestion du personnel" description="CRUD employes, salaires, planning et acces au dashboard." />
      <StaffManagement />
    </div>
  );
}
