import StaffManagement from '../../components/dashboard/StaffManagement';

export default function DashboardStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-secondary-900">Gestion du personnel</h1>
        <p className="text-sm text-gray-500 mt-1">CRUD employés, salaires, planning.</p>
      </div>
      <StaffManagement />
    </div>
  );
}

