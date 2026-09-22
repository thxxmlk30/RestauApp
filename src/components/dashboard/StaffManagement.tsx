import { Copy, KeyRound, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Staff, StaffStatus, UserRole } from '../../types';
import { formatCurrency, formatRole } from '../../utils/helpers';
import { useCreateStaff, useDeleteStaff, useProvisionStaffAccount, useStaff, useUpdateStaff } from '../../hooks/useStaff';
import type { ProvisionAccountResponse } from '../../services/restaurantApi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

type StaffFormState = {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  salary: string;
  hireDate: string;
  shift: string;
  zone: string;
  status: StaffStatus;
};

const emptyForm: StaffFormState = {
  name: '',
  email: '',
  role: 'waiter',
  phone: '',
  salary: '',
  hireDate: new Date().toISOString().split('T')[0],
  shift: '11:00 - 20:00',
  zone: '',
  status: 'active',
};

const statusLabels: Record<StaffStatus, string> = {
  active: 'Actif',
  break: 'Pause',
  off: 'Off',
};

export default function StaffManagement() {
  const { data: staff = [] } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const provisionAccount = useProvisionStaffAccount();

  const [activeRole, setActiveRole] = useState<UserRole | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [credentials, setCredentials] = useState<(ProvisionAccountResponse & { staffName: string }) | null>(null);

  const filtered = useMemo(() => {
    return [...staff]
      .filter((member) => (activeRole === 'all' ? true : member.role === activeRole))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [activeRole, staff]);

  const counts = useMemo(() => {
    return {
      chefs: staff.filter((member) => member.role === 'chef').length,
      waiters: staff.filter((member) => member.role === 'waiter').length,
      couriers: staff.filter((member) => member.role === 'delivery').length,
    };
  }, [staff]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (member: Staff) => {
    setForm({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone,
      salary: String(member.salary),
      hireDate: member.hireDate,
      shift: member.shift,
      zone: member.zone ?? '',
      status: member.status,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setFormError('');
  };

  const submitForm = () => {
    const salary = Number(form.salary);
    if (!form.name.trim()) return setFormError('Le nom est requis.');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setFormError('Email invalide.');
    if (!form.phone.trim()) return setFormError('Téléphone requis.');
    if (!Number.isFinite(salary) || salary <= 0) return setFormError('Salaire invalide.');
    if (!form.hireDate) return setFormError("Date d'embauche requise.");
    if (!form.shift.trim()) return setFormError('Créneau requis.');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      phone: form.phone.trim(),
      salary: Math.round(salary),
      hireDate: form.hireDate,
      shift: form.shift.trim(),
      zone: form.zone.trim() || undefined,
      status: form.status,
    };

    if (form.id) {
      updateStaff.mutate({ id: form.id, payload });
    } else {
      createStaff.mutate(payload);
    }
    closeModal();
  };

  const handleProvision = (member: Staff) => {
    if (!window.confirm(`Creer un acces de connexion pour ${member.name} (${formatRole(member.role)}) ?`)) return;
    provisionAccount.mutate(
      { staffId: member.id },
      {
        onSuccess: (response) => setCredentials({ ...response, staffName: member.name }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-secondary-900">{staff.length} collaborateurs</div>
              <div className="text-sm text-gray-500">
                {counts.chefs} chefs · {counts.waiters} serveurs · {counts.couriers} livreurs
              </div>
            </div>
          </div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{staff.filter((member) => member.status === 'active').length}</div>
          <div className="text-sm text-gray-500">personnes actives</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <Button type="button" className="w-full" onClick={openCreate}>
            <Plus size={16} className="mr-2" />
            Ajouter du personnel
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'admin', 'chef', 'waiter', 'delivery'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setActiveRole(role)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeRole === role ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {role === 'all' ? 'Tous' : formatRole(role)}
          </button>
        ))}
      </div>

      <div className="panel-3d overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        <div className="divide-y divide-gray-50">
          {filtered.map((member) => (
            <div key={member.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
              <div className="flex flex-1 items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-700 text-sm font-bold text-white shadow-lg">
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-secondary-900">{member.name}</span>
                    <Badge variant="secondary">{formatRole(member.role)}</Badge>
                    <Badge variant={member.status === 'active' ? 'outline' : member.status === 'break' ? 'secondary' : 'destructive'}>
                      {statusLabels[member.status]}
                    </Badge>
                    {member.userId ? (
                      <Badge variant="outline">Acces actif</Badge>
                    ) : (
                      <Badge variant="destructive">Sans acces</Badge>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {member.email} · {member.phone}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Shift {member.shift} · Zone {member.zone || 'Non attribuée'} · Entrée {new Date(member.hireDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-secondary-900">{formatCurrency(member.salary)}</div>
                  <div className="text-xs text-gray-500">mensuel</div>
                </div>
                <select
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs"
                  value={member.status}
                  onChange={(event) => updateStaff.mutate({ id: member.id, payload: { status: event.target.value as StaffStatus } })}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {!member.userId ? (
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                    onClick={() => handleProvision(member)}
                    title="Creer un acces de connexion"
                  >
                    <KeyRound size={16} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-secondary-900"
                  onClick={() => openEdit(member)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => {
                    if (window.confirm(`Supprimer ${member.name} ?`)) deleteStaff.mutate(member.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div className="py-12 text-center text-gray-400">Aucun collaborateur trouve.</div>}
        </div>
      </div>

      <Modal open={modalOpen} title={form.id ? 'Modifier un profil' : 'Ajouter un profil'} onClose={closeModal}>
        <div className="space-y-4">
          <Input label="Nom complet" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          <Input label="Téléphone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Rôle</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              >
                <option value="admin">Admin</option>
                <option value="chef">Chef</option>
                <option value="waiter">Serveur</option>
                <option value="delivery">Livreur</option>
              </select>
            </div>
            <Input label="Salaire mensuel" type="number" value={form.salary} onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Date d'embauche" type="date" value={form.hireDate} onChange={(event) => setForm((prev) => ({ ...prev, hireDate: event.target.value }))} />
            <Input label="Shift" value={form.shift} onChange={(event) => setForm((prev) => ({ ...prev, shift: event.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Zone / station" value={form.zone} onChange={(event) => setForm((prev) => ({ ...prev, zone: event.target.value }))} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Statut</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as StaffStatus }))}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="button" className="flex-1" onClick={submitForm}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!credentials} title="Acces cree" onClose={() => setCredentials(null)}>
        {credentials ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Un email avec les identifiants de connexion a ete envoye a <strong>{credentials.staffName}</strong>.
            </p>
            <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500">Email</span>
                <span className="font-mono font-semibold text-secondary-900">{credentials.email}</span>
              </div>
              {credentials.devPassword ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Mot de passe (dev)</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-mono font-semibold text-secondary-900"
                    onClick={() => credentials.devPassword && navigator.clipboard?.writeText(credentials.devPassword)}
                    title="Copier"
                  >
                    {credentials.devPassword}
                    <Copy size={12} />
                  </button>
                </div>
              ) : null}
            </div>
            <Button type="button" className="w-full" onClick={() => setCredentials(null)}>
              Fermer
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
