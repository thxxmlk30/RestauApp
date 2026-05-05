import { AlertCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Ingredient } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import type { DashboardOutletContext } from '../../pages/dashboard/dashboardOutletContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

type IngredientFormState = {
  id?: string;
  name: string;
  currentStock: string;
  unit: Ingredient['unit'];
  minStock: string;
  reorderThreshold: string;
  supplier: string;
  costPerUnit: string;
};

const emptyForm: IngredientFormState = {
  name: '',
  currentStock: '',
  unit: 'kg',
  minStock: '0',
  reorderThreshold: '0',
  supplier: '',
  costPerUnit: '',
};

const unitLabels: Record<Ingredient['unit'], string> = {
  kg: 'kg',
  l: 'L',
  unit: 'unité',
  g: 'g',
};

export default function StockManagement() {
  const { ingredients, upsertIngredient, deleteIngredient, adjustIngredientStock } = useOutletContext<DashboardOutletContext>();
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<IngredientFormState>(emptyForm);

  const lowStockItems = useMemo(() => ingredients.filter((item) => item.currentStock <= item.minStock), [ingredients]);
  const reorderItems = useMemo(() => ingredients.filter((item) => item.currentStock <= item.reorderThreshold), [ingredients]);
  const estimatedStockValue = useMemo(
    () => ingredients.reduce((sum, item) => sum + item.currentStock * (item.costPerUnit ?? 0), 0),
    [ingredients],
  );

  const openCreate = () => {
    setFormError('');
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Ingredient) => {
    setFormError('');
    setForm({
      id: item.id,
      name: item.name,
      currentStock: String(item.currentStock),
      unit: item.unit,
      minStock: String(item.minStock),
      reorderThreshold: String(item.reorderThreshold),
      supplier: item.supplier ?? '',
      costPerUnit: item.costPerUnit ? String(item.costPerUnit) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
    setForm(emptyForm);
  };

  const submitForm = () => {
    const currentStock = Number(form.currentStock);
    const minStock = Number(form.minStock);
    const reorderThreshold = Number(form.reorderThreshold);
    const costPerUnit = Number(form.costPerUnit || 0);

    if (!form.name.trim()) return setFormError("Le nom de l'ingrédient est requis.");
    if (!Number.isFinite(currentStock) || currentStock < 0) return setFormError('Le stock actuel doit être positif.');
    if (!Number.isFinite(minStock) || minStock < 0) return setFormError('Le stock minimum doit être positif.');
    if (!Number.isFinite(reorderThreshold) || reorderThreshold < 0) return setFormError('Le seuil de réappro doit être positif.');
    if (!Number.isFinite(costPerUnit) || costPerUnit < 0) return setFormError("Le coût unitaire n'est pas valide.");

    upsertIngredient({
      id: form.id ?? `ingredient-${Date.now()}`,
      name: form.name.trim(),
      currentStock: Number(currentStock.toFixed(1)),
      unit: form.unit,
      minStock: Number(minStock.toFixed(1)),
      reorderThreshold: Number(reorderThreshold.toFixed(1)),
      supplier: form.supplier.trim() || undefined,
      costPerUnit: costPerUnit || undefined,
      lastRestockedAt: new Date().toISOString(),
    });
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel-3d rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5 text-amber-600" />
            <div>
              <div className="text-lg font-bold text-secondary-900">{lowStockItems.length}</div>
              <div className="text-sm text-gray-500">stocks sous minimum</div>
            </div>
          </div>
        </div>
        <div className="panel-3d rounded-[28px] border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
          <div className="text-lg font-bold text-secondary-900">{reorderItems.length}</div>
          <div className="text-sm text-gray-500">réappros à lancer</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{formatCurrency(estimatedStockValue)}</div>
          <div className="text-sm text-gray-500">valeur théorique du stock</div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Réappro conseillé: {lowStockItems.map((item) => item.name).join(', ')}.
        </div>
      )}

      <div className="panel-3d overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900">Ingrédients</h2>
            <p className="text-sm text-gray-500">Suivi des seuils, fournisseurs et ajustements rapides.</p>
          </div>
          <Button type="button" onClick={openCreate}>
            <Plus size={16} className="mr-2" />
            Ajouter un ingrédient
          </Button>
        </div>

        <div className="divide-y divide-gray-50">
          {ingredients.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-secondary-900">{item.name}</span>
                  <Badge variant="outline">{unitLabels[item.unit]}</Badge>
                  {item.currentStock <= item.minStock && <Badge variant="destructive">Sous minimum</Badge>}
                  {item.currentStock <= item.reorderThreshold && <Badge variant="secondary">Réappro</Badge>}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Fournisseur: {item.supplier || 'Non renseigné'} · Dernier réassort:{' '}
                  {item.lastRestockedAt ? new Date(item.lastRestockedAt).toLocaleDateString('fr-FR') : 'n/a'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-secondary-900">
                    {formatNumber(item.currentStock)} {unitLabels[item.unit]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Min {formatNumber(item.minStock)} · Coût {item.costPerUnit ? formatCurrency(item.costPerUnit) : 'n/a'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => adjustIngredientStock(item.id, -1)}>
                    -
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => adjustIngredientStock(item.id, 1)}>
                    +
                  </Button>
                </div>
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
                    if (window.confirm(`Supprimer "${item.name}" ?`)) deleteIngredient(item.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} title={form.id ? 'Modifier un ingrédient' : 'Ajouter un ingrédient'} onClose={closeModal}>
        <div className="space-y-4">
          <Input label="Nom" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Stock actuel"
              type="number"
              step="0.1"
              value={form.currentStock}
              onChange={(event) => setForm((prev) => ({ ...prev, currentStock: event.target.value }))}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Unité</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
                value={form.unit}
                onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value as Ingredient['unit'] }))}
              >
                {Object.entries(unitLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Stock minimum"
              type="number"
              step="0.1"
              value={form.minStock}
              onChange={(event) => setForm((prev) => ({ ...prev, minStock: event.target.value }))}
            />
            <Input
              label="Seuil réappro"
              type="number"
              step="0.1"
              value={form.reorderThreshold}
              onChange={(event) => setForm((prev) => ({ ...prev, reorderThreshold: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Fournisseur"
              value={form.supplier}
              onChange={(event) => setForm((prev) => ({ ...prev, supplier: event.target.value }))}
            />
            <Input
              label="Coût unitaire"
              type="number"
              value={form.costPerUnit}
              onChange={(event) => setForm((prev) => ({ ...prev, costPerUnit: event.target.value }))}
            />
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
    </div>
  );
}
