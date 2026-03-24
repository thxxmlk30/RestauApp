import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { menuItems as defaultMenuItems } from '../../data/menuItems';
import { useAuth } from '../../context/AuthContext';
import type { Meal, MenuItem } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { loadMenuItems, saveMenuItems } from '../../utils/storage';
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
};

const emptyForm: MenuItemFormState = {
  name: '',
  description: '',
  price: '',
  category: 'plat',
  meal: 'lunch',
  available: true,
};

export default function MenuList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState<MenuItem[]>(() => loadMenuItems(defaultMenuItems));
  const [activeMeal, setActiveMeal] = useState<Meal | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<MenuItem['category'] | 'all'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<MenuItemFormState>(emptyForm);

  const mealFilters: Array<{ value: Meal | 'all'; label: string }> = [
    { value: 'all', label: 'Tous' },
    { value: 'breakfast', label: 'Petit-déj' },
    { value: 'lunch', label: 'Déjeuner' },
    { value: 'dinner', label: 'Dîner' },
    { value: 'any', label: 'Toute la journée' },
  ];

  const categoryFilters: Array<{ value: MenuItem['category'] | 'all'; label: string }> = [
    { value: 'all', label: 'Tous' },
    { value: 'entree', label: categoryLabels.entree },
    { value: 'plat', label: categoryLabels.plat },
    { value: 'dessert', label: categoryLabels.dessert },
    { value: 'boisson', label: categoryLabels.boisson },
  ];

  const filtered = useMemo(() => {
    const result = items.filter((i) => (activeMeal === 'all' ? true : i.meal === activeMeal));
    const byCategory = result.filter((i) => (activeCategory === 'all' ? true : i.category === activeCategory));
    return byCategory.sort((a, b) => Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, 'fr'));
  }, [activeCategory, activeMeal, items]);

  const persist = (next: MenuItem[]) => {
    setItems(next);
    saveMenuItems(next);
  };

  const toggleAvailability = (id: string) => {
    persist(items.map((item) => (item.id === id ? { ...item, available: !item.available } : item)));
  };

  const openCreate = () => {
    setFormError('');
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setFormError('');
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      meal: item.meal,
      available: item.available,
    });
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
    const priceNumber = Number(form.price);
    const priceInt = Math.round(priceNumber);

    if (!name) {
      setFormError('Le nom est requis.');
      return;
    }
    if (!description) {
      setFormError('La description est requise.');
      return;
    }
    if (!Number.isFinite(priceNumber) || priceInt <= 0) {
      setFormError('Le prix doit être un nombre positif.');
      return;
    }

    const nextItem: MenuItem = {
      id: form.id ?? `m-${Date.now().toString().slice(-6)}`,
      name,
      description,
      price: priceInt,
      category: form.category,
      meal: form.meal,
      image: '',
      available: form.available,
    };

    const next = form.id ? items.map((i) => (i.id === form.id ? nextItem : i)) : [nextItem, ...items];
    persist(next);
    closeModal();
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!window.confirm(`Supprimer "${item.name}" ?`)) return;
    persist(items.filter((i) => i.id !== id));
  };

  const availableCount = items.filter((i) => i.available).length;
  const unavailableCount = items.length - availableCount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-secondary-900">Gestion du menu</h2>
          <p className="text-xs text-gray-500 mt-1">Créer, modifier, supprimer et gérer les disponibilités.</p>
        </div>

        {isAdmin && (
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus size={16} className="mr-2" /> Ajouter un plat
          </Button>
        )}
      </div>

      <div className="px-5 py-4 border-b border-gray-50 space-y-3">
        <div className="flex flex-wrap gap-2">
          {mealFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveMeal(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                activeMeal === f.value ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveCategory(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                activeCategory === f.value ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition ${!item.available ? 'opacity-60' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-secondary-900">{item.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{categoryLabels[item.category]}</span>
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{mealLabels[item.meal]}</span>
                {!item.available && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Indisponible</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm font-bold text-secondary-900 whitespace-nowrap">{formatCurrency(item.price)}</span>

              <button
                type="button"
                onClick={() => toggleAvailability(item.id)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  item.available ? 'bg-green-500' : 'bg-gray-200'
                }`}
                title={item.available ? 'Marquer indisponible' : 'Marquer disponible'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${
                    item.available ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => openEdit(item)}
                    aria-label="Modifier"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                    onClick={() => deleteItem(item.id)}
                    aria-label="Supprimer"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Aucun produit</div>}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          {availableCount} disponibles · {unavailableCount} indisponibles
        </p>
        <p className="text-xs text-gray-400">Admin : CRUD activé</p>
      </div>

      <Modal open={modalOpen} title={form.id ? 'Modifier un produit' : 'Ajouter un produit'} onClose={closeModal}>
        <div className="space-y-4">
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Thiéboudienne"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Ex: Riz au poisson, légumes, sauce tomate maison"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Prix (FCFA)"
              type="number"
              min={100}
              step={100}
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Ex: 4500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as MenuItem['category'] }))}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Repas</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                value={form.meal}
                onChange={(e) => setForm((prev) => ({ ...prev, meal: e.target.value as Meal }))}
              >
                {Object.entries(mealLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={form.available}
                onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
              />
              Disponible
            </label>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="w-full" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="button" className="w-full" onClick={submitForm}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
