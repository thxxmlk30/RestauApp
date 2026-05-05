import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Meal, MenuItem } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import type { DashboardOutletContext } from '../../pages/dashboard/dashboardOutletContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const categoryLabels: Record<MenuItem['category'], string> = {
  entree: 'Entrées',
  plat: 'Plats',
  dessert: 'Desserts',
  boisson: 'Boissons',
};

const mealLabels: Record<Meal, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  any: 'Toute la journée',
};

type MenuItemFormState = {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: MenuItem['category'];
  meal: Meal;
  available: boolean;
  prepTimeMinutes: string;
};

const emptyForm: MenuItemFormState = {
  name: '',
  description: '',
  price: '',
  category: 'plat',
  meal: 'lunch',
  available: true,
  prepTimeMinutes: '20',
};

export default function MenuCrud() {
  const { menuItems, upsertMenuItem, deleteMenuItem, toggleMenuItemAvailability } = useOutletContext<DashboardOutletContext>();
  const [activeMeal, setActiveMeal] = useState<Meal | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<MenuItem['category'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<MenuItemFormState>(emptyForm);

  const filtered = useMemo(() => {
    return [...menuItems]
      .filter((item) => (activeMeal === 'all' ? true : item.meal === activeMeal))
      .filter((item) => (activeCategory === 'all' ? true : item.category === activeCategory))
      .filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, 'fr'));
  }, [activeCategory, activeMeal, menuItems, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      meal: item.meal,
      available: item.available,
      prepTimeMinutes: String(item.prepTimeMinutes ?? 20),
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
    setForm(emptyForm);
  };

  const submitForm = () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const prepTimeMinutes = Number(form.prepTimeMinutes);

    if (!name) return setFormError('Le nom est requis.');
    if (!description) return setFormError('La description est requise.');
    if (!Number.isFinite(price) || price <= 0) return setFormError('Le prix doit être positif.');
    if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes <= 0) return setFormError('Le temps de préparation doit être positif.');

    upsertMenuItem({
      id: form.id ?? `menu-${Date.now()}`,
      name,
      description,
      price: Math.round(price),
      category: form.category,
      meal: form.meal,
      image: '',
      available: form.available,
      prepTimeMinutes: Math.round(prepTimeMinutes),
    });
    closeModal();
  };

  return (
    <div className="space-y-5">
      <div className="panel-3d overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900">Catalogue produits</h2>
            <p className="text-sm text-gray-500">CRUD complet, recherche, disponibilité et temps de préparation.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un produit..." className="pl-9" />
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus size={16} className="mr-2" />
              Ajouter un produit
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-b border-gray-100 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'breakfast', 'lunch', 'dinner', 'any'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveMeal(value)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  activeMeal === value ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {value === 'all' ? 'Tous les services' : mealLabels[value]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'entree', 'plat', 'dessert', 'boisson'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveCategory(value)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  activeCategory === value ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                {value === 'all' ? 'Toutes catégories' : categoryLabels[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((item) => (
            <div key={item.id} className={`flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center ${!item.available ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-secondary-900">{item.name}</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{categoryLabels[item.category]}</span>
                  <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700">{mealLabels[item.meal]}</span>
                  <span className="rounded-full bg-secondary-50 px-2.5 py-1 text-xs text-secondary-700">
                    {item.prepTimeMinutes ?? 20} min
                  </span>
                  {!item.available && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700">Indisponible</span>}
                </div>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">{item.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-secondary-900">{formatCurrency(item.price)}</div>
                  <div className="text-xs text-gray-500">{item.id}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMenuItemAvailability(item.id)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${item.available ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <span className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow transition ${item.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-secondary-900"
                  onClick={() => openEdit(item)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => {
                    if (window.confirm(`Supprimer "${item.name}" ?`)) deleteMenuItem(item.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <div className="py-12 text-center text-gray-400">Aucun produit trouvé.</div>}
        </div>
      </div>

      <Modal open={modalOpen} title={form.id ? 'Modifier un produit' : 'Ajouter un produit'} onClose={closeModal}>
        <div className="space-y-4">
          <Input label="Nom" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input
            label="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Prix (FCFA)"
              type="number"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            />
            <Input
              label="Préparation (min)"
              type="number"
              value={form.prepTimeMinutes}
              onChange={(event) => setForm((prev) => ({ ...prev, prepTimeMinutes: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Catégorie</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as MenuItem['category'] }))}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Service</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                value={form.meal}
                onChange={(event) => setForm((prev) => ({ ...prev, meal: event.target.value as Meal }))}
              >
                {Object.entries(mealLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(event) => setForm((prev) => ({ ...prev, available: event.target.checked }))}
            />
            Disponible à la commande
          </label>
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
    </div>
  );
}
