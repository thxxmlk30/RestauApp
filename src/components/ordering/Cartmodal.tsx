import { CheckCircle2, Minus, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuItem, Order } from '../../types';
import { menuItems as defaultMenuItems } from '../../data/menuItems';
import { mockOrders } from '../../data/orders';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { loadMenuItems, loadOrders, saveOrders } from '../../utils/storage';
import { formatCurrency } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export default function CartModal() {
  const { cart, itemCount, increment, decrement, removeItem, clearCart, isCartOpen, closeCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [customerName, setCustomerName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [formError, setFormError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');

  const items = useMemo(() => loadMenuItems(defaultMenuItems), []);

  const cartLines = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const item = byId.get(id);
        if (!item) return null;
        return { item, quantity, lineTotal: item.price * quantity };
      })
      .filter(Boolean) as Array<{ item: MenuItem; quantity: number; lineTotal: number }>;
  }, [cart, items]);

  const cartTotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.lineTotal, 0), [cartLines]);

  const handleClose = () => {
    setCustomerName('');
    setNameTouched(false);
    setTableNumber(1);
    setFormError('');
    setSuccessOrderId('');
    closeCart();
  };

  const displayCustomerName = isAuthenticated && !nameTouched ? user?.name ?? '' : customerName;

  const submitOrder = () => {
    setFormError('');

    if (!isAuthenticated || !user) {
      setFormError('Connectez-vous pour commander.');
      return;
    }
    if (cartLines.length === 0) {
      setFormError('Votre panier est vide.');
      return;
    }
    if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 99) {
      setFormError('Numéro de table invalide (1–99).');
      return;
    }

    const orderId = `CMD-${Date.now().toString().slice(-6)}`;
    const order: Order = {
      id: orderId,
      tableNumber,
      customerName: customerName.trim() ? customerName.trim() : undefined,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalAmount: cartTotal,
      items: cartLines.map((l) => ({
        menuItemId: l.item.id,
        name: l.item.name,
        quantity: l.quantity,
        price: l.item.price,
      })),
    };

    const existing = loadOrders(mockOrders);
    const next = [order, ...existing];
    saveOrders(next);
    clearCart();
    setSuccessOrderId(orderId);
  };

  return (
    <Modal open={isCartOpen} title="Panier" onClose={handleClose}>
      {successOrderId ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={34} className="text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-secondary-900">Commande confirmée</h4>
          <p className="text-sm text-gray-500 mt-1">Votre commande a bien été envoyée en cuisine.</p>
          <div className="mt-4 text-sm bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-gray-600">
              Référence : <span className="font-mono text-secondary-900">{successOrderId}</span>
            </p>
          </div>
          <div className="mt-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {isAuthenticated && user?.role !== 'admin' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleClose();
                    navigate('/mes-commandes');
                  }}
                >
                  Voir mes commandes
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleClose}>
                  Continuer
                </Button>
              )}
              <Button type="button" className="w-full" onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {cartLines.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Votre panier est vide.</p>
              <div className="mt-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleClose}>
                  Continuer
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!isAuthenticated && (
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                  Vous devez être connecté pour commander.
                </div>
              )}
              <div className="space-y-3">
                {cartLines.map((l) => (
                  <div key={l.item.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{l.item.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(l.item.price)} / unité</p>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition inline-flex items-center justify-center"
                          onClick={() => decrement(l.item.id)}
                          aria-label="Retirer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-secondary-900">{l.quantity}</span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition inline-flex items-center justify-center"
                          onClick={() => increment(l.item.id)}
                          aria-label="Ajouter"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          className="ml-1 w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition inline-flex items-center justify-center"
                          onClick={() => removeItem(l.item.id)}
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-secondary-900 whitespace-nowrap">{formatCurrency(l.lineTotal)}</p>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-sm font-bold text-secondary-900">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Table"
                    type="number"
                    min={1}
                    max={99}
                    value={tableNumber}
                    onChange={(e) => setTableNumber(Number(e.target.value))}
                  />
                  <Input
                    label="Nom (optionnel)"
                    placeholder="Ex: Famille Ndiaye"
                    value={displayCustomerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setNameTouched(true);
                    }}
                  />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
                      handleClose();
                      navigate(`/login?redirect=${redirect}`);
                    }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
                      handleClose();
                      navigate(`/register?redirect=${redirect}`);
                    }}
                  >
                    Créer un compte
                  </Button>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {formError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="button" className="w-full" onClick={submitOrder} disabled={!isAuthenticated}>
                  Commander ({itemCount})
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}


