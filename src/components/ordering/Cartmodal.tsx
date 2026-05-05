import { Bike, CheckCircle2, Minus, Plus, Store, TicketPercent, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DakarAddressPicker from './DakarAddressPicker';
import type { MenuItem, Order, OrderItem, ServiceType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getZoneById } from '../../data/dakarZones';
import { mockIngredients } from '../../data/ingredients';
import { menuItems as defaultMenuItems } from '../../data/menuItems';
import { mockOrders } from '../../data/orders';
import { mockStaff } from '../../data/staff';
import {
  buildDeliveryAddressLabel,
  calculateCartTotalWithPromo,
  calculateOrderAmount,
  deductIngredientsForOrder,
  formatCurrency,
  isValidPromo,
} from '../../utils/helpers';
import { loadIngredients, loadMenuItems, loadOrders, loadStaff, saveIngredients, saveOrders } from '../../utils/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export default function CartModal() {
  const {
    cart,
    itemCount,
    increment,
    decrement,
    removeItem,
    clearCart,
    promoCode,
    setPromoCode,
    isCartOpen,
    closeCart,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [serviceType, setServiceType] = useState<ServiceType>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [department, setDepartment] = useState('');
  const [commune, setCommune] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [streetLine, setStreetLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [promoError, setPromoError] = useState('');
  const [formError, setFormError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');

  const items = useMemo(() => loadMenuItems(defaultMenuItems), []);
  const selectedZone = useMemo(() => getZoneById(zoneId), [zoneId]);

  const cartLines = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const item = byId.get(id);
        if (!item) return null;
        return { item, quantity, lineTotal: item.price * quantity };
      })
      .filter(Boolean) as Array<{ item: MenuItem; quantity: number; lineTotal: number }>;
  }, [cart, items]);

  const totals = useMemo(() => calculateCartTotalWithPromo(cartLines, promoCode || undefined), [cartLines, promoCode]);
  const deliveryFee = serviceType === 'delivery' ? selectedZone?.fee ?? 0 : 0;
  const grandTotal = useMemo(
    () => calculateOrderAmount(totals.subtotal, totals.discountAmount, deliveryFee),
    [deliveryFee, totals.discountAmount, totals.subtotal],
  );

  const validatePromo = () => {
    if (!promoCode) {
      setPromoError('');
      return;
    }
    setPromoError(isValidPromo(promoCode) === 0 ? 'Code promo invalide ou expire.' : '');
  };

  const resetState = () => {
    setCustomerName('');
    setTableNumber(1);
    setDepartment('');
    setCommune('');
    setZoneId('');
    setStreetLine('');
    setLandmark('');
    setDeliveryNotes('');
    setPhone('');
    setPromoError('');
    setFormError('');
    setSuccessOrderId('');
    setServiceType('dine_in');
  };

  const handleClose = () => {
    resetState();
    closeCart();
  };

  const submitOrder = () => {
    setFormError('');

    if (!isAuthenticated || !user) return setFormError('Connectez-vous pour valider la commande.');
    if (cartLines.length === 0) return setFormError('Votre panier est vide.');
    if (grandTotal <= 0) return setFormError('Le total de commande est invalide.');
    if (promoCode && isValidPromo(promoCode) === 0) return setFormError('Le code promo n est plus valide.');
    if (serviceType === 'dine_in' && (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 99)) {
      return setFormError('Numero de table invalide (1-99).');
    }
    if (serviceType === 'delivery' && !selectedZone) {
      return setFormError('Choisissez un secteur de livraison a Dakar.');
    }

    const staff = loadStaff(mockStaff);
    const assignedChef = staff.find((member) => member.role === 'chef' && member.status === 'active');
    const assignedCourier =
      serviceType === 'delivery' ? staff.find((member) => member.role === 'delivery' && member.status === 'active') : undefined;

    const orderId = `CMD-${Date.now().toString().slice(-6)}`;
    const order: Order = {
      id: orderId,
      serviceType,
      tableNumber: serviceType === 'dine_in' ? tableNumber : undefined,
      deliveryAddress: serviceType === 'delivery' && selectedZone ? buildDeliveryAddressLabel(selectedZone, streetLine, landmark) : undefined,
      deliveryZoneId: serviceType === 'delivery' ? selectedZone?.id : undefined,
      deliveryDepartment: serviceType === 'delivery' ? selectedZone?.department : undefined,
      deliveryCommune: serviceType === 'delivery' ? selectedZone?.commune : undefined,
      deliverySector: serviceType === 'delivery' ? selectedZone?.sector : undefined,
      deliveryFee: serviceType === 'delivery' ? deliveryFee : undefined,
      deliveryNotes: serviceType === 'delivery' ? deliveryNotes.trim() || undefined : undefined,
      customerPhone: phone.trim() || undefined,
      customerName: customerName.trim() || user.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalAmount: grandTotal,
      subtotalAmount: totals.subtotal,
      discountAmount: totals.discountAmount,
      promoCode: promoCode || undefined,
      assignedChefId: assignedChef?.id,
      assignedChefName: assignedChef?.name,
      courierId: assignedCourier?.id,
      courierName: assignedCourier?.name,
      estimatedReadyAt: new Date(Date.now() + 20 * 60000).toISOString(),
      estimatedDeliveryAt:
        serviceType === 'delivery' && selectedZone ? new Date(Date.now() + selectedZone.etaMinutes * 60000).toISOString() : undefined,
      location: serviceType === 'delivery' && selectedZone ? { lat: selectedZone.lat, lng: selectedZone.lng } : undefined,
      items: cartLines.map(
        (line) =>
          ({
            menuItemId: line.item.id,
            name: line.item.name,
            quantity: line.quantity,
            price: line.item.price,
          }) satisfies OrderItem,
      ),
    };

    const nextOrders = [order, ...loadOrders(mockOrders)];
    saveOrders(nextOrders);

    const ingredients = loadIngredients(mockIngredients);
    const nextIngredients = deductIngredientsForOrder(ingredients, order);
    saveIngredients(nextIngredients);

    clearCart();
    setSuccessOrderId(orderId);
  };

  return (
    <Modal open={isCartOpen} title="Panier et validation" onClose={handleClose} layout="drawer" maxWidthClassName="max-w-2xl">
      {successOrderId ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={34} className="text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-secondary-900">Commande confirmee</h4>
            <p className="mt-2 text-sm text-gray-500">Reference {successOrderId}. La brigade et le dispatch ont recu la commande.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Mode</div>
              <div className="mt-1 font-semibold text-secondary-900">{serviceType === 'delivery' ? 'Livraison' : 'Sur place'}</div>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Total</div>
              <div className="mt-1 font-semibold text-secondary-900">{formatCurrency(grandTotal)}</div>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Secteur</div>
              <div className="mt-1 font-semibold text-secondary-900">{selectedZone?.sector || 'Salle'}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleClose();
                navigate('/mes-commandes');
              }}
            >
              Suivre ma commande
            </Button>
            <Button type="button" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {cartLines.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">Votre panier est vide.</p>
              <Button type="button" variant="outline" className="mt-4 w-full" onClick={handleClose}>
                Continuer
              </Button>
            </div>
          ) : (
            <>
              {!isAuthenticated && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Connectez-vous pour finaliser la commande.
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <div className="rounded-[28px] border border-gray-100 bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Panier deroulant</div>
                        <div className="mt-1 text-lg font-semibold text-secondary-900">{itemCount} article(s)</div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        onClick={clearCart}
                        aria-label="Vider le panier"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3 p-4">
                      {cartLines.map((line) => (
                        <div key={line.item.id} className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-secondary-900">{line.item.name}</p>
                              <p className="mt-1 text-xs text-gray-500">{formatCurrency(line.item.price)} / unite</p>
                            </div>
                            <p className="text-sm font-semibold text-secondary-900">{formatCurrency(line.lineTotal)}</p>
                          </div>
                          <div className="mt-3 inline-flex items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-white"
                              onClick={() => decrement(line.item.id)}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-secondary-900">{line.quantity}</span>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white transition hover:bg-primary-600"
                              onClick={() => increment(line.item.id)}
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => removeItem(line.item.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setServiceType('dine_in')}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        serviceType === 'dine_in' ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <Store className="mb-2 h-5 w-5" />
                      <div className="font-semibold">Sur place</div>
                      <div className={`mt-1 text-sm ${serviceType === 'dine_in' ? 'text-white/75' : 'text-gray-500'}`}>Service en salle avec numero de table.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType('delivery')}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        serviceType === 'delivery' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <Bike className="mb-2 h-5 w-5" />
                      <div className="font-semibold">Livraison</div>
                      <div className={`mt-1 text-sm ${serviceType === 'delivery' ? 'text-primary-700' : 'text-gray-500'}`}>
                        Secteur Dakar, tarif auto et tracking carte.
                      </div>
                    </button>
                  </div>

                  {isAuthenticated ? (
                    <>
                      <div className="rounded-[28px] border border-gray-100 bg-white p-4">
                        <div className="mb-4 text-sm font-semibold text-secondary-900">Coordonnees client</div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Nom d affichage"
                            value={customerName}
                            onChange={(event) => setCustomerName(event.target.value)}
                            placeholder={user?.name}
                          />
                          <Input label="Telephone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221..." />
                        </div>
                      </div>

                      {serviceType === 'dine_in' ? (
                        <div className="rounded-[28px] border border-gray-100 bg-white p-4">
                          <Input
                            label="Numero de table"
                            type="number"
                            min={1}
                            max={99}
                            value={tableNumber}
                            onChange={(event) => setTableNumber(Number(event.target.value))}
                          />
                        </div>
                      ) : (
                        <div className="rounded-[28px] border border-gray-100 bg-white p-4">
                          <DakarAddressPicker
                            department={department}
                            commune={commune}
                            zoneId={zoneId}
                            streetLine={streetLine}
                            landmark={landmark}
                            onDepartmentChange={(value) => {
                              setDepartment(value);
                              setCommune('');
                              setZoneId('');
                            }}
                            onCommuneChange={(value) => {
                              setCommune(value);
                              setZoneId('');
                            }}
                            onZoneChange={(zone) => {
                              setDepartment(zone.department);
                              setCommune(zone.commune);
                              setZoneId(zone.id);
                            }}
                            onStreetLineChange={setStreetLine}
                            onLandmarkChange={setLandmark}
                          />
                          <div className="mt-4">
                            <Input
                              label="Instructions pour le livreur"
                              value={deliveryNotes}
                              onChange={(event) => setDeliveryNotes(event.target.value)}
                              placeholder="Etage, portail, couleur de la maison, interphone..."
                            />
                          </div>
                        </div>
                      )}

                      <div className="rounded-[28px] border border-gray-100 bg-white p-4">
                        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                          <Input
                            label="Code promo"
                            placeholder="LINGUERE10"
                            value={promoCode ?? ''}
                            onChange={(event) => {
                              setPromoCode(event.target.value.toUpperCase());
                              setPromoError('');
                            }}
                            onBlur={validatePromo}
                          />
                          <Button type="button" variant="outline" className="mt-7" onClick={validatePromo}>
                            <TicketPercent size={16} className="mr-2" />
                            Verifier
                          </Button>
                        </div>

                        {promoError && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{promoError}</div>}
                        {promoCode && !promoError && isValidPromo(promoCode) > 0 && (
                          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                            Code {promoCode} applique. Economie: {formatCurrency(totals.discountAmount)}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        type="button"
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
                        Creer un compte
                      </Button>
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="sticky top-4 rounded-[30px] border border-gray-100 bg-secondary-900 p-5 text-white">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">Recap commande</div>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Sous-total</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      {totals.discountPercent !== null && (
                        <div className="flex justify-between text-emerald-300">
                          <span>Remise {totals.discountPercent}%</span>
                          <span>-{formatCurrency(totals.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/70">Livraison</span>
                        <span>{serviceType === 'delivery' ? formatCurrency(deliveryFee) : 'Incluse salle'}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {serviceType === 'delivery' && (
                      <div className="mt-5 rounded-[24px] bg-white/8 p-4 text-sm">
                        <div className="text-white/65">Secteur choisi</div>
                        <div className="mt-1 font-semibold">{selectedZone?.sector || 'A selectionner'}</div>
                        <div className="mt-1 text-white/70">{selectedZone ? `${selectedZone.commune}, ${selectedZone.department}` : 'Choisissez un departement ou touchez la carte.'}</div>
                        {selectedZone && <div className="mt-3 text-white/80">ETA estimee: {selectedZone.etaMinutes} min</div>}
                      </div>
                    )}

                    <div className="mt-5 flex gap-3">
                      <Button type="button" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={handleClose}>
                        Annuler
                      </Button>
                      <Button type="button" className="w-full bg-primary-500 hover:bg-primary-600" onClick={submitOrder} disabled={!isAuthenticated}>
                        Commander
                      </Button>
                    </div>
                  </div>
                </aside>
              </div>

              {formError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
