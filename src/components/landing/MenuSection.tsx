import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Meal, MenuItem } from '../../types';
import { menuItems as defaultMenuItems } from '../../data/menuItems';
import { useCart } from '../../context/CartContext';
import { loadMenuItems } from '../../utils/storage';
import { formatCurrency } from '../../utils/helpers';
import { Button } from '../ui/Button';
import menuBannerImage from '../../assets/thieb.webp';

function getSuggestedMeal(): Meal {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 17) return 'lunch';
  return 'dinner';
}

const meals: { value: Meal; label: string; subtitle: string }[] = [
  { value: 'breakfast', label: 'Petit-déjeuner', subtitle: 'Café Touba, beignets et énergie' },
  { value: 'lunch', label: 'Déjeuner', subtitle: 'Thiéboudienne, yassa et plats du jour' },
  { value: 'dinner', label: 'Dîner', subtitle: 'Grillades, poissons et recettes traditionnelles' },
];

export default function MenuSection() {
  const [activeMeal, setActiveMeal] = useState<Meal>(() => getSuggestedMeal());
  const [items] = useState<MenuItem[]>(() => loadMenuItems(defaultMenuItems));
  const { cart, itemCount, increment, decrement, openCart } = useCart();

  const visibleItems = useMemo(() => {
    const matching = items.filter((i) => i.meal === 'any' || i.meal === activeMeal);
    return matching.sort((a, b) => Number(b.available) - Number(a.available));
  }, [activeMeal, items]);

  const activeMealMeta = meals.find((m) => m.value === activeMeal) ?? meals[0];

  const cartTotal = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    return Object.entries(cart).reduce((sum, [id, quantity]) => {
      const item = byId.get(id);
      if (!item) return sum;
      return sum + item.price * quantity;
    }, 0);
  }, [cart, items]);

  return (
    <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-secondary-900 mb-10">
          <img
            src={menuBannerImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            loading="lazy"
            decoding="async"
          />
          <div className="relative p-8 md:p-10">
            <h2 className="font-display text-4xl font-bold text-white">La carte Linguere</h2>
            <p className="text-white/80 text-lg mt-2 max-w-2xl">
              Des incontournables sénégalais (thiéboudienne, yassa, mafé…) et des “World Specials” selon la saison.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-500">Menu sélectionné</p>
            <p className="font-semibold text-secondary-900">{activeMealMeta.label}</p>
            <p className="text-sm text-gray-500">{activeMealMeta.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            {meals.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setActiveMeal(m.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeMeal === m.value ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-secondary-900">Panier</span> : {itemCount} article{itemCount > 1 ? 's' : ''} ·{' '}
            <span className="font-semibold text-secondary-900">{formatCurrency(cartTotal)}</span>
          </div>
          <Button type="button" variant={itemCount > 0 ? 'primary' : 'outline'} size="sm" onClick={openCart}>
            <ShoppingCart size={16} className="mr-2" />
            Voir le panier
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => {
            const quantity = cart[item.id] ?? 0;
            return (
              <article key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-secondary-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <p className="font-bold text-secondary-900 whitespace-nowrap">{formatCurrency(item.price)}</p>
                </div>

                {item.available ? (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => decrement(item.id)}
                        disabled={quantity === 0}
                        aria-label="Retirer"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-secondary-900">{quantity}</span>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition inline-flex items-center justify-center"
                        onClick={() => increment(item.id)}
                        aria-label="Ajouter"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">Ajouter au panier</span>
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Indisponible
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

