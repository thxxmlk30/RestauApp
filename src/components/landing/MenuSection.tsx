import { Heart, MapPin, Minus, Plus, ShoppingCart, Sparkles, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { Meal, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { restaurantApi } from '../../services/restaurantApi';
import { formatCurrency, getSuggestedMeal } from '../../utils/helpers';
import { loadFavorites, saveFavorites } from '../../utils/storage';
import { Button } from '../ui/Button';

import menuBannerImage from '../../assets/cover.webp';
import menuBannerImage2 from '../../assets/pasta.jpg';

const meals: { value: Meal; label: string; subtitle: string }[] = [
  { value: 'breakfast', label: 'Petit-dejeuner', subtitle: 'Cafe Touba, beignets et energie' },
  { value: 'lunch', label: 'Dejeuner', subtitle: 'Thieb, yassa et plats du jour' },
  { value: 'dinner', label: 'Diner', subtitle: 'Grillades, poissons et recettes traditionnelles' },
];

export default function MenuSection() {
  const [activeMeal, setActiveMeal] = useState<Meal>(() => getSuggestedMeal());
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(loadFavorites().map((item) => item.menuItemId)));
  const { cart, itemCount, increment, decrement, openCart } = useCart();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError('');
    void restaurantApi
      .menuItems()
      .then((response) => {
        if (!cancelled && response.length > 0) {
          setItems(response);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setItems([]);
          setLoadError(error instanceof Error ? error.message : 'Impossible de charger le menu.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => item.meal === 'any' || item.meal === activeMeal).sort((a, b) => Number(b.available) - Number(a.available)),
    [activeMeal, items],
  );

  const activeMealMeta = meals.find((meal) => meal.value === activeMeal) ?? meals[0];

  const cartTotal = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return Object.entries(cart).reduce((sum, [id, quantity]) => {
      const item = byId.get(id);
      if (!item) return sum;
      return sum + item.price * quantity;
    }, 0);
  }, [cart, items]);

  const toggleFavorite = (itemId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      saveFavorites(Array.from(next).map((menuItemId) => ({ menuItemId, addedAt: new Date().toISOString() })));
      return next;
    });
  };

  return (
    <section id="menu" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="relative mb-8 overflow-hidden rounded-[30px] border border-gray-100 bg-secondary-900 sm:mb-10 sm:rounded-[34px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 grid grid-cols-2">
            <img src={menuBannerImage} alt="" aria-hidden="true" className="h-full w-full object-cover opacity-25" />
            <img src={menuBannerImage2} alt="" aria-hidden="true" className="h-full w-full object-cover opacity-25" />
          </div>
          <div className="relative grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/85">
                <Sparkles size={14} />
                Menu et livraison par secteur
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">La carte Linguere</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                Le menu reste au centre, avec un panier plus lisible, un choix du lieu simplifie et des frais de livraison visibles avant
                validation.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm sm:p-6">
              <div className="text-sm text-white/70">Selection active</div>
              <div className="mt-1 text-xl font-bold">{activeMealMeta.label}</div>
              <div className="mt-2 text-sm text-white/75">{activeMealMeta.subtitle}</div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/10 p-3">
                  <div className="text-white/65">Favoris</div>
                  <div className="mt-1 text-lg font-bold">{favoriteIds.size}</div>
                </div>
                <div className="rounded-2xl bg-black/10 p-3">
                  <div className="text-white/65">Panier</div>
                  <div className="mt-1 text-lg font-bold">{formatCurrency(cartTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Menu selectionne</p>
            <p className="font-semibold text-secondary-900">{activeMealMeta.label}</p>
            <p className="text-sm text-gray-500">{activeMealMeta.subtitle}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                <MapPin size={16} className="text-primary-500" />
                Adresse guidee
              </div>
              <p className="mt-2 text-sm text-gray-500">Parcours simple par departement, commune puis secteur.</p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                <Truck size={16} className="text-primary-500" />
                Frais lisibles
              </div>
              <p className="mt-2 text-sm text-gray-500">Le tarif de livraison apparait des la selection du secteur.</p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                <ShoppingCart size={16} className="text-primary-500" />
                Validation rapide
              </div>
              <p className="mt-2 text-sm text-gray-500">Le recap reste toujours accessible sans quitter le menu.</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {meals.map((meal) => (
            <motion.button
              key={meal.value}
              type="button"
              onClick={() => setActiveMeal(meal.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeMeal === meal.value ? 'bg-secondary-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ y: -2 }}
            >
              {meal.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          className="sticky top-[4.75rem] z-10 mb-6 flex flex-col gap-3 rounded-[24px] border border-gray-100 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-sm text-gray-500">
            <span className="font-medium text-secondary-900">Panier</span>: {itemCount} article{itemCount > 1 ? 's' : ''} ·{' '}
            <span className="font-semibold text-secondary-900">{formatCurrency(cartTotal)}</span>
          </div>
          <Button
            type="button"
            variant={itemCount > 0 ? 'primary' : 'outline'}
            size="sm"
            className="w-full rounded-2xl sm:w-auto"
            onClick={openCart}
          >
            <ShoppingCart size={16} className="mr-2" />
            Ouvrir le panier
          </Button>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Chargement du menu...
            </div>
          ) : loadError ? (
            <div className="col-span-full rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-900">
              <div>{loadError}</div>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          ) : (
            visibleItems.map((item, index) => {
            const quantity = cart[item.id] ?? 0;
            const isFavorite = favoriteIds.has(item.id);

            return (
              <motion.article
                key={item.id}
                className={`panel-3d group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-100 bg-white p-5 ${
                  quantity > 0 ? 'ring-2 ring-primary-100' : ''
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.03 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, rotateX: 2, rotateY: 2 }}
              >
                <button
                  type="button"
                  className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    isFavorite ? 'border-primary-200 bg-primary-50 text-primary-600' : 'border-gray-200 bg-white text-gray-400 hover:text-primary-500'
                  }`}
                  onClick={() => toggleFavorite(item.id)}
                  aria-label="Favori"
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                </button>

                {item.image ? (
                  <div className="relative mb-4 h-56 overflow-hidden rounded-[22px] bg-gray-100">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-secondary-900">{item.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-secondary-900">{formatCurrency(item.price)}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.prepTimeMinutes ?? 20} min</p>
                  </div>
                </div>

                {item.available ? (
                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => decrement(item.id)}
                          disabled={quantity === 0}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-secondary-900">{quantity}</span>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white transition hover:bg-primary-600"
                          onClick={() => increment(item.id)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="shrink-0 text-xs text-gray-500">Ajouter</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-6">
                    <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Indisponible</div>
                  </div>
                )}
              </motion.article>
            );
            })
          )}
        </div>
      </div>
    </section>
  );
}
