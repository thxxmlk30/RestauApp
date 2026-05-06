import { AlertCircle, Bot, CheckCircle2, Mail, MessageCircle, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Ingredient, StockAuditRecord, StockBotSettings } from '../../types';
import type { DashboardOutletContext } from '../../pages/dashboard/dashboardOutletContext';
import {
  buildCriticalReorderMessage,
  buildStockAuditLines,
  buildStockAuditRecord,
  buildStockBotLaunchLink,
  defaultStockBotSettings,
  formatCurrency,
  formatNumber,
  isIngredientBelowReorder,
  isIngredientCritical,
} from '../../utils/helpers';
import { loadStockAudits, loadStockBotSettings, saveStockAudits, saveStockBotSettings } from '../../utils/storage';
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
  const { ingredients, upsertIngredient, replaceIngredients, deleteIngredient, adjustIngredientStock } = useOutletContext<DashboardOutletContext>();

  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<IngredientFormState>(emptyForm);

  const [auditValues, setAuditValues] = useState<Record<string, string>>({});
  const [auditError, setAuditError] = useState('');
  const [auditFeedback, setAuditFeedback] = useState('');
  const [generatedBotLink, setGeneratedBotLink] = useState('');
  const [stockAudits, setStockAudits] = useState<StockAuditRecord[]>(() => loadStockAudits());
  const [botSettings, setBotSettings] = useState<StockBotSettings>(() => loadStockBotSettings(defaultStockBotSettings));

  useEffect(() => {
    setAuditValues((prev) => {
      const next: Record<string, string> = {};
      for (const item of ingredients) {
        next[item.id] = prev[item.id] ?? String(item.currentStock);
      }
      return next;
    });
  }, [ingredients]);

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
  const latestAudit = stockAudits[0];

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

    upsertIngredient({
      id: form.id ?? `ingredient-${Date.now()}`,
      name: form.name.trim(),
      currentStock: Number(currentStock.toFixed(1)),
      unit: form.unit,
      minStock: Number(minStock.toFixed(1)),
      reorderThreshold: Number(reorderThreshold.toFixed(1)),
      criticalStock: Number(criticalStock.toFixed(1)),
      supplier: form.supplier.trim() || undefined,
      costPerUnit: costPerUnit || undefined,
      lastRestockedAt: form.id ? undefined : new Date().toISOString(),
      lastCountedAt: new Date().toISOString(),
    });
    closeModal();
  };

  const resetAuditValues = () => {
    setAuditValues(Object.fromEntries(ingredients.map((item) => [item.id, String(item.currentStock)])));
    setAuditError('');
    setAuditFeedback('');
    setGeneratedBotLink('');
  };

  const runEndOfDayAudit = () => {
    setAuditError('');
    setAuditFeedback('');
    setGeneratedBotLink('');

    const now = new Date().toISOString();
    const nextIngredients: Ingredient[] = [];

    for (const item of ingredients) {
      const rawValue = auditValues[item.id];
      const countedStock = Number(rawValue);
      if (!Number.isFinite(countedStock) || countedStock < 0) {
        setAuditError(`Le restant saisi pour ${item.name} est invalide.`);
        return;
      }
      nextIngredients.push({
        ...item,
        currentStock: Number(countedStock.toFixed(1)),
        lastCountedAt: now,
      });
    }

    replaceIngredients(nextIngredients);

    const lines = buildStockAuditLines(ingredients, nextIngredients);
    const auditRecord = buildStockAuditRecord(lines, botSettings.preferredChannel);
    const nextAudits = [auditRecord, ...stockAudits].slice(0, 20);
    saveStockAudits(nextAudits);
    setStockAudits(nextAudits);

    const criticalAfterAudit = nextIngredients.filter((item) => isIngredientCritical(item));
    if (criticalAfterAudit.length === 0) {
      setAuditFeedback('Cloture enregistree. Aucun produit critique, aucun lancement de commande necessaire.');
      return;
    }

    const link = buildStockBotLaunchLink(botSettings.preferredChannel, botSettings, criticalAfterAudit);
    setGeneratedBotLink(link);
    setAuditFeedback(
      `Cloture enregistree. ${criticalAfterAudit.length} produit(s) critique(s) detecte(s), commande bot lancee via ${botSettings.preferredChannel}.`,
    );
    openBotLink(link, botSettings.preferredChannel);
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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-secondary-900">Cloture de journee</h2>
              <p className="text-sm text-gray-500">Saisissez le restant de chaque ingredient. Si un seuil critique est atteint, le bot d approvisionnement est lance instantanement.</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-2xl" onClick={resetAuditValues}>
                Reinitialiser
              </Button>
              <Button type="button" className="rounded-2xl" onClick={runEndOfDayAudit}>
                <Save size={16} className="mr-2" />
                Valider la cloture
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {ingredients.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-[24px] border border-gray-100 bg-gray-50 p-4 lg:grid-cols-[1.2fr_0.55fr_0.55fr_0.55fr_0.7fr] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-secondary-900">{item.name}</span>
                    {isIngredientCritical(item) ? <Badge variant="destructive">Critique</Badge> : null}
                    {!isIngredientCritical(item) && item.currentStock <= item.minStock ? <Badge variant="outline">Sous minimum</Badge> : null}
                    {!isIngredientCritical(item) && isIngredientBelowReorder(item) ? <Badge variant="secondary">Reappro</Badge> : null}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Fournisseur: {item.supplier || 'Non renseigne'} - Dernier comptage:{' '}
                    {item.lastCountedAt ? new Date(item.lastCountedAt).toLocaleDateString('fr-FR') : 'n/a'}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Actuel</div>
                  <div className="mt-1 font-semibold text-secondary-900">
                    {formatNumber(item.currentStock)} {unitLabels[item.unit]}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Mini</div>
                  <div className="mt-1 font-semibold text-secondary-900">
                    {formatNumber(item.minStock)} {unitLabels[item.unit]}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Critique</div>
                  <div className="mt-1 font-semibold text-rose-700">
                    {formatNumber(item.criticalStock)} {unitLabels[item.unit]}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-gray-400">Restant saisi</label>
                  <input
                    type="number"
                    step="0.1"
                    value={auditValues[item.id] ?? ''}
                    onChange={(event) => setAuditValues((prev) => ({ ...prev, [item.id]: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {auditError ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{auditError}</div> : null}
          {auditFeedback ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {auditFeedback}
              {generatedBotLink ? (
                <div className="mt-3">
                  <Button type="button" size="sm" className="rounded-2xl" onClick={() => openBotLink(generatedBotLink, botSettings.preferredChannel)}>
                    Relancer le bot
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <div className="space-y-6">
          <section className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-bold text-secondary-900">Bot d approvisionnement</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">Choisissez le canal de declenchement automatique a la cloture si des produits passent en critique.</p>

            <div className="mt-4 space-y-4">
              <Input
                label="Email du bot"
                value={botSettings.email}
                onChange={(event) => setBotSettings((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-2xl"
              />
              <Input
                label="Numero WhatsApp du bot"
                value={botSettings.whatsapp}
                onChange={(event) => setBotSettings((prev) => ({ ...prev, whatsapp: event.target.value }))}
                className="rounded-2xl"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Canal prefere</label>
                <select
                  value={botSettings.preferredChannel}
                  onChange={(event) =>
                    setBotSettings((prev) => ({ ...prev, preferredChannel: event.target.value as StockBotSettings['preferredChannel'] }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            {criticalItems.length > 0 ? (
              <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 p-4">
                <div className="text-sm font-semibold text-rose-800">{criticalItems.length} produit(s) critique(s) a envoyer au bot</div>
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

          <section className="panel-3d rounded-[28px] border border-gray-100 bg-white p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-secondary-900">Derniere cloture</h2>
            </div>
            {latestAudit ? (
              <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-600">
                  Date: <span className="font-medium text-secondary-900">{new Date(latestAudit.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Canal: <span className="font-medium text-secondary-900">{latestAudit.channel}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Produits saisis: <span className="font-medium text-secondary-900">{latestAudit.totalItems}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Produits critiques: <span className="font-medium text-rose-700">{latestAudit.criticalItems}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-500">Aucune cloture de journee enregistree pour le moment.</div>
            )}
          </section>
        </div>
      </div>

      <div className="panel-3d overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900">Ingredients</h2>
            <p className="text-sm text-gray-500">Suivi des seuils, fournisseurs, ajustements rapides et seuil critique par produit.</p>
          </div>
          <Button type="button" className="rounded-2xl" onClick={openCreate}>
            <Plus size={16} className="mr-2" />
            Ajouter un ingredient
          </Button>
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
                <div className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => adjustIngredientStock(item.id, -1)}>
                    -
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => adjustIngredientStock(item.id, 1)}>
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
