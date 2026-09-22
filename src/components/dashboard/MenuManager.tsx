import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Meal, MenuItem, MenuItemRecipeLine } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { menuImageOptions } from '../../utils/menuImages';
import { usePermissions } from '../../hooks/usePermissions';
import { useIngredients } from '../../hooks/useIngredients';
import { useCreateMenuItem, useDeleteMenuItem, useMenuItems, useUpdateMenuItem } from '../../hooks/useMenuItems';
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
  image: string;
  recipe: MenuItemRecipeLine[];
};

const emptyForm: MenuItemFormState = {
  name: '',
  description: '',
  price: '',
  category: 'plat',
  meal: 'lunch',
  available: true,
  prepTimeMinutes: '20',
  image: '',
  recipe: [],
};

export default function MenuManager() {
  const { canManageMenu } = usePermissions();
  const { data: menuItems = [] } = useMenuItems();
  const { data: ingredients = [] } = useIngredients({ enabled: canManageMenu });
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

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
      image: item.image ?? '',
      recipe: item.recipe ?? [],
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
    setForm(emptyForm);
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMenuItem.mutate({ id: item.id, payload: { available: !item.available } });
  };

  const addRecipeLine = () => {
    const unused = ingredients.find((ingredient) => !form.recipe.some((line) => line.ingredientId === ingredient.id));
    if (!unused) return;
    setForm((prev) => ({ ...prev, recipe: [...prev.recipe, { ingredientId: unused.id, quantityRequired: 1 }] }));
  };

  const updateRecipeLine = (index: number, patch: Partial<MenuItemRecipeLine>) => {
    setForm((prev) => ({
      ...prev,
      recipe: prev.recipe.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)),
    }));
  };

  const removeRecipeLine = (index: number) => {
    setForm((prev) => ({ ...prev, recipe: prev.recipe.filter((_, lineIndex) => lineIndex !== index) }));
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
    if (form.recipe.some((line) => !line.ingredientId || !Number.isFinite(line.quantityRequired) || line.quantityRequired <= 0)) {
      return setFormError('Chaque ligne de recette doit avoir un ingredient et une quantite positive.');
    }

    const payload = {
      name,
      description,
      price: Math.round(price),
      category: form.category,
      meal: form.meal,
      image: form.image,
      available: form.available,
      prepTimeMinutes: Math.round(prepTimeMinutes),
      recipe: form.recipe,
    };

    if (form.id) {
      updateMenuItem.mutate({ id: form.id, payload });
    } else {
      createMenuItem.mutate(payload);
    }
    closeModal();
  };

  return (
    <div className="space-y-5">
      <div className="panel-3d overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900">Catalogue produits</h2>
            <p className="text-sm text-gray-500">Recherche, disponibilité, composition et temps de préparation.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un produit..." className="pl-9" />
            </div>
            {canManageMenu ? (
              <Button type="button" onClick={openCreate}>
                <Plus size={16} className="mr-2" />
                Ajouter un produit
              </Button>
            ) : null}
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
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
              </div>
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

              {canManageMenu ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-secondary-900">{formatCurrency(item.price)}</div>
                    <div className="text-xs text-gray-500">{item.id}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item)}
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
                      if (window.confirm(`Supprimer "${item.name}" ?`)) deleteMenuItem.mutate(item.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-right text-sm font-bold text-secondary-900">{formatCurrency(item.price)}</div>
              )}
            </div>
          ))}

          {filtered.length === 0 && <div className="py-12 text-center text-gray-400">Aucun produit trouvé.</div>}
        </div>
      </div>

      <Modal open={modalOpen} title={form.id ? 'Modifier un produit' : 'Ajouter un produit'} onClose={closeModal} maxWidthClassName="max-w-2xl">
        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
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

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Photo</label>
              {form.image ? (
                <button type="button" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600" onClick={() => setForm((prev) => ({ ...prev, image: '' }))}>
                  <X size={12} /> retirer
                </button>
              ) : null}
            </div>
            {form.image ? (
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-2xl border border-gray-200">
                <img src={form.image} alt="Apercu" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div className="grid max-h-40 grid-cols-5 gap-2 overflow-y-auto rounded-2xl border border-gray-100 p-2 sm:grid-cols-7">
              {menuImageOptions.map((option) => (
                <button
                  key={option.url}
                  type="button"
                  title={option.label}
                  onClick={() => setForm((prev) => ({ ...prev, image: option.url }))}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                    form.image === option.url ? 'border-primary-500' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={option.url} alt={option.label} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Composition (ingredients)</label>
              <Button type="button" variant="outline" size="sm" onClick={addRecipeLine} disabled={ingredients.length === 0}>
                <Plus size={14} className="mr-1" /> Ajouter
              </Button>
            </div>
            {form.recipe.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune composition renseignee (optionnel).</p>
            ) : (
              <div className="space-y-2">
                {form.recipe.map((line, index) => (
                  <div key={`${line.ingredientId}-${index}`} className="flex items-center gap-2">
                    <select
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={line.ingredientId}
                      onChange={(event) => updateRecipeLine(index, { ingredientId: event.target.value })}
                    >
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={line.quantityRequired}
                      onChange={(event) => updateRecipeLine(index, { quantityRequired: Number(event.target.value) })}
                    />
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => removeRecipeLine(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
