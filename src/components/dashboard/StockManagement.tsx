import { AlertCircle, Bot, Mail, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Ingredient, StockBotSettings } from '../../types';
import {
  buildCriticalReorderMessage,
  buildStockBotLaunchLink,
  defaultStockBotSettings,
  formatCurrency,
  formatNumber,
  isIngredientBelowReorder,
  isIngredientCritical,
} from '../../utils/helpers';
import { loadStockBotSettings, saveStockBotSettings } from '../../utils/storage';
import { useCreateIngredient, useDeleteIngredient, useIngredients, useUpdateIngredient } from '../../hooks/useIngredients';
import { usePermissions } from '../../hooks/usePermissions';
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
  criticalStock: string;
  supplier: string;
  costPerUnit: string;
};

const emptyForm: IngredientFormState = {
  name: '',
  currentStock: '',
  unit: 'kg',
  minStock: '0',
  reorderThreshold: '0',
  criticalStock: '0',
  supplier: '',
  costPerUnit: '',
};

const unitLabels: Record<Ingredient['unit'], string> = {
  kg: 'kg',
  l: 'L',
  unit: 'unite',
  g: 'g',
};

function openBotLink(link: string, channel: StockBotSettings['preferredChannel']) {
  if (!link || typeof window === 'undefined') return;
  if (channel === 'email') {
    window.location.href = link;
    return;
  }
  window.open(link, '_blank', 'noopener,noreferrer');
}

export default function StockManagement() {
  const { canManageStock } = usePermissions();
  const { data: ingredients = [] } = useIngredients();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<IngredientFormState>(emptyForm);
  const [botSettings, setBotSettings] = useState<StockBotSettings>(() => loadStockBotSettings(defaultStockBotSettings));

  useEffect(() => {
    saveStockBotSettings(botSettings);
  }, [botSettings]);

  const lowStockItems = useMemo(() => ingredients.filter((item) => item.currentStock <= item.minStock), [ingredients]);
  const reorderItems = useMemo(() => ingredients.filter((item) => isIngredientBelowReorder(item)), [ingredients]);
  const criticalItems = useMemo(() => ingredients.filter((item) => isIngredientCritical(item)), [ingredients]);
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
      criticalStock: String(item.criticalStock),
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
    const criticalStock = Number(form.criticalStock);
    const costPerUnit = Number(form.costPerUnit || 0);

    if (!form.name.trim()) return setFormError("Le nom de l'ingredient est requis.");
    if (!Number.isFinite(currentStock) || currentStock < 0) return setFormError('Le stock actuel doit etre positif.');
    if (!Number.isFinite(minStock) || minStock < 0) return setFormError('Le stock minimum doit etre positif.');
    if (!Number.isFinite(reorderThreshold) || reorderThreshold < 0) return setFormError('Le seuil de reappro doit etre positif.');
    if (!Number.isFinite(criticalStock) || criticalStock < 0) return setFormError('Le seuil critique doit etre positif.');
    if (reorderThreshold < minStock) return setFormError('Le seuil de reappro doit etre superieur ou egal au stock minimum.');
    if (minStock < criticalStock) return setFormError('Le stock minimum doit etre superieur ou egal au seuil critique.');
    if (!Number.isFinite(costPerUnit) || costPerUnit < 0) return setFormError("Le cout unitaire n'est pas valide.");

    const payload = {
      name: form.name.trim(),
      currentStock: Number(currentStock.toFixed(1)),
      unit: form.unit,
      minStock: Number(minStock.toFixed(1)),
      reorderThreshold: Number(reorderThreshold.toFixed(1)),
      criticalStock: Number(criticalStock.toFixed(1)),
      supplier: form.supplier.trim() || undefined,
      costPerUnit: costPerUnit || undefined,
      lastCountedAt: new Date().toISOString(),
    };

    if (form.id) {
      updateIngredient.mutate({ id: form.id, payload });
    } else {
      createIngredient.mutate({ ...payload, lastRestockedAt: new Date().toISOString() });
    }
    closeModal();
  };

  const adjustStock = (item: Ingredient, delta: number) => {
    updateIngredient.mutate({
      id: item.id,
      payload: {
        currentStock: Math.max(0, Number((item.currentStock + delta).toFixed(1))),
        lastRestockedAt: delta > 0 ? new Date().toISOString() : item.lastRestockedAt,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="panel-3d rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5 text-rose-600" />
            <div>
              <div className="text-lg font-bold text-secondary-900">{criticalItems.length}</div>
              <div className="text-sm text-gray-500">produits critiques</div>
            </div>
          </div>
        </div>
        <div className="panel-3d rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
          <div className="text-lg font-bold text-secondary-900">{lowStockItems.length}</div>
          <div className="text-sm text-gray-500">stocks sous minimum</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
          <div className="text-lg font-bold text-secondary-900">{reorderItems.length}</div>
          <div className="text-sm text-gray-500">reappros a lancer</div>
        </div>
        <div className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="text-lg font-bold text-secondary-900">{formatCurrency(estimatedStockValue)}</div>
          <div className="text-sm text-gray-500">valeur theorique du stock</div>
        </div>
      </div>

      {canManageStock ? (
        <section className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-bold text-secondary-900">Contacter le fournisseur</h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Prepare un message pret a envoyer pour tous les produits critiques actuels (non enregistre, action instantanee).
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Email fournisseur"
              value={botSettings.email}
              onChange={(event) => setBotSettings((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-2xl"
            />
            <Input
              label="Numero WhatsApp"
              value={botSettings.whatsapp}
              onChange={(event) => setBotSettings((prev) => ({ ...prev, whatsapp: event.target.value }))}
              className="rounded-2xl"
            />
          </div>

          {criticalItems.length > 0 ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm font-semibold text-rose-800">{criticalItems.length} produit(s) critique(s) a commander</div>
              <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-rose-900">{buildCriticalReorderMessage(criticalItems)}</pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => openBotLink(buildStockBotLaunchLink('email', botSettings, criticalItems), 'email')}
                >
                  <Mail size={16} className="mr-2" />
                  Envoyer par email
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl"
                  onClick={() => openBotLink(buildStockBotLaunchLink('whatsapp', botSettings, criticalItems), 'whatsapp')}
                >
                  <MessageCircle size={16} className="mr-2" />
                  Envoyer par WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Aucun produit critique actuellement.
            </div>
          )}
        </section>
      ) : null}

      <div className="panel-3d overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900">Ingredients</h2>
            <p className="text-sm text-gray-500">Suivi des seuils, fournisseurs et ajustements rapides par produit.</p>
          </div>
          {canManageStock ? (
            <Button type="button" className="rounded-2xl" onClick={openCreate}>
              <Plus size={16} className="mr-2" />
              Ajouter un ingredient
            </Button>
          ) : null}
        </div>

        <div className="divide-y divide-gray-50">
          {ingredients.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-secondary-900">{item.name}</span>
                  <Badge variant="outline">{unitLabels[item.unit]}</Badge>
                  {isIngredientCritical(item) ? <Badge variant="destructive">Critique</Badge> : null}
                  {!isIngredientCritical(item) && item.currentStock <= item.minStock ? <Badge variant="outline">Sous minimum</Badge> : null}
                  {!isIngredientCritical(item) && isIngredientBelowReorder(item) ? <Badge variant="secondary">Reappro</Badge> : null}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Fournisseur: {item.supplier || 'Non renseigne'} - Dernier comptage:{' '}
                  {item.lastCountedAt ? new Date(item.lastCountedAt).toLocaleDateString('fr-FR') : 'n/a'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-secondary-900">
                    {formatNumber(item.currentStock)} {unitLabels[item.unit]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Min {formatNumber(item.minStock)} - Critique {formatNumber(item.criticalStock)} - Cout{' '}
                    {item.costPerUnit ? formatCurrency(item.costPerUnit) : 'n/a'}
                  </div>
                </div>
                {canManageStock ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => adjustStock(item, -1)}>
                        -
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => adjustStock(item, 1)}>
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
                        if (window.confirm(`Supprimer "${item.name}" ?`)) deleteIngredient.mutate(item.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}

          {ingredients.length === 0 && <div className="py-12 text-center text-gray-400">Aucun ingredient enregistre.</div>}
        </div>
      </div>

      <Modal open={modalOpen} title={form.id ? 'Modifier un ingredient' : 'Ajouter un ingredient'} onClose={closeModal}>
        <div className="space-y-4">
          <Input label="Nom" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Stock actuel"
              type="number"
              step="0.1"
              value={form.currentStock}
              onChange={(event) => setForm((prev) => ({ ...prev, currentStock: event.target.value }))}
              className="rounded-2xl"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Unite</label>
              <select
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Stock minimum"
              type="number"
              step="0.1"
              value={form.minStock}
              onChange={(event) => setForm((prev) => ({ ...prev, minStock: event.target.value }))}
              className="rounded-2xl"
            />
            <Input
              label="Seuil reappro"
              type="number"
              step="0.1"
              value={form.reorderThreshold}
              onChange={(event) => setForm((prev) => ({ ...prev, reorderThreshold: event.target.value }))}
              className="rounded-2xl"
            />
            <Input
              label="Seuil critique"
              type="number"
              step="0.1"
              value={form.criticalStock}
              onChange={(event) => setForm((prev) => ({ ...prev, criticalStock: event.target.value }))}
              className="rounded-2xl"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Fournisseur"
              value={form.supplier}
              onChange={(event) => setForm((prev) => ({ ...prev, supplier: event.target.value }))}
              className="rounded-2xl"
            />
            <Input
              label="Cout unitaire"
              type="number"
              value={form.costPerUnit}
              onChange={(event) => setForm((prev) => ({ ...prev, costPerUnit: event.target.value }))}
              className="rounded-2xl"
            />
          </div>
          {formError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div> : null}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="button" className="flex-1 rounded-2xl" onClick={submitForm}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
