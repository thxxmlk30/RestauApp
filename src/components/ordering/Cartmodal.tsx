import { Bike, CheckCircle2, Minus, Plus, Store, Trash2 } from 'lucide-react';
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
  calculateCartSubtotal,
  calculateOrderAmount,
  deductIngredientsForOrder,
  formatCurrency,
  getBestCourierForNextOrder,
} from '../../utils/helpers';
import { loadIngredients, loadMenuItems, loadOrders, loadStaff, saveIngredients, saveOrders } from '../../utils/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export default function CartModal() {
  const { cart, increment, decrement, removeItem, clearCart, isCartOpen, closeCart } = useCart();
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
  const [formError, setFormError] = useState('');
  const [successOrderId, setSuccessOrderId] = useState('');
  const [assignedCourierName, setAssignedCourierName] = useState('');

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

  const subtotal = useMemo(() => calculateCartSubtotal(cartLines), [cartLines]);
  const deliveryFee = serviceType === 'delivery' ? selectedZone?.fee ?? 0 : 0;
  const grandTotal = useMemo(() => calculateOrderAmount(subtotal, deliveryFee), [subtotal, deliveryFee]);

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
    setFormError('');
    setSuccessOrderId('');
    setAssignedCourierName('');
    setServiceType('dine_in');
  };

  const handleClose = () => {
    resetState();
    closeCart();
  };

  const redirectToAuth = (target: 'login' | 'register') => {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    handleClose();
    navigate(`/${target}?redirect=${redirect}`);
  };

  const validateOrder = () => {
    setFormError('');

    if (cartLines.length === 0) return 'Votre panier est vide.';
    if (!isAuthenticated || !user) return 'Connectez-vous pour confirmer la commande.';
    if (grandTotal <= 0) return 'Le total de la commande est invalide.';

    if (serviceType === 'dine_in' && (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 99)) {
      return 'Numero de table invalide (1-99).';
    }

    if (serviceType === 'delivery') {
      if (!selectedZone) return 'Choisissez un secteur de livraison.';
      if (!streetLine.trim()) return 'Ajoutez la rue ou l immeuble de livraison.';
      if (!phone.trim()) return 'Ajoutez un numero de telephone pour la livraison.';
    }

    return '';
  };

  const submitOrder = () => {
    const error = validateOrder();
    if (error) {
      setFormError(error);
      return;
    }
    if (!user) return;

    const staff = loadStaff(mockStaff);
    const currentOrders = loadOrders(mockOrders);
    const assignedChef = staff.find((member) => member.role === 'chef' && member.status === 'active');
    const assignedCourier = serviceType === 'delivery' ? getBestCourierForNextOrder(staff, currentOrders) : undefined;

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
      subtotalAmount: subtotal,
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

    saveOrders([order, ...currentOrders]);
    saveIngredients(deductIngredientsForOrder(loadIngredients(mockIngredients), order));

    clearCart();
    setAssignedCourierName(assignedCourier?.name || '');
    setSuccessOrderId(orderId);
  };

  return (
    <Modal open={isCartOpen} title="Votre commande" onClose={handleClose} layout="drawer" maxWidthClassName="max-w-[920px]">
      {successOrderId ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-secondary-900">Commande confirmee</h4>
            <p className="mt-2 text-sm text-gray-500">
              Reference {successOrderId}. {serviceType === 'delivery' ? assignedCourierName || 'Affectation livreur en cours.' : `Table ${tableNumber}.`}
            </p>
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
      ) : cartLines.length === 0 ? (
        <div className="border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <p className="text-sm text-gray-500">Votre panier est vide.</p>
          <Button type="button" variant="outline" className="mt-4 w-full" onClick={handleClose}>
            Continuer
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Panier</h3>
                  <p className="text-sm text-gray-500">{cartLines.length} produit(s)</p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  onClick={clearCart}
                  aria-label="Vider le panier"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-100">
                {cartLines.map((line) => (
                  <div key={line.item.id} className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-secondary-900">{line.item.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {line.quantity} x {formatCurrency(line.item.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <p className="text-sm font-semibold text-secondary-900">{formatCurrency(line.lineTotal)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-700"
                          onClick={() => decrement(line.item.id)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-secondary-900">{line.quantity}</span>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center bg-primary-500 text-white"
                          onClick={() => increment(line.item.id)}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center border border-gray-200 text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => removeItem(line.item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900">Service</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setServiceType('dine_in')}
                  className={`border p-4 text-left transition ${
                    serviceType === 'dine_in' ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <Store className="mb-2 h-5 w-5" />
                  <div className="font-semibold">Sur place</div>
                  <div className={`mt-1 text-sm ${serviceType === 'dine_in' ? 'text-white/75' : 'text-gray-500'}`}>Numero de table.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('delivery')}
                  className={`border p-4 text-left transition ${
                    serviceType === 'delivery' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <Bike className="mb-2 h-5 w-5" />
                  <div className="font-semibold">Livraison</div>
                  <div className={`mt-1 text-sm ${serviceType === 'delivery' ? 'text-primary-700' : 'text-gray-500'}`}>Adresse Dakar.</div>
                </button>
              </div>

              {serviceType === 'dine_in' ? (
                <Input
                  label="Numero de table"
                  type="number"
                  min={1}
                  max={99}
                  value={tableNumber}
                  onChange={(event) => setTableNumber(Number(event.target.value))}
                />
              ) : (
                <div className="space-y-4">
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
                  <Input label="Telephone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+221..." />
                  <textarea
                    value={deliveryNotes}
                    onChange={(event) => setDeliveryNotes(event.target.value)}
                    placeholder="Note de livraison optionnelle"
                    className="min-h-20 w-full border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                  />
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4 border border-gray-100 p-5 lg:sticky lg:top-4 lg:self-start">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Recapitulatif</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium text-secondary-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-medium text-secondary-900">{serviceType === 'delivery' ? formatCurrency(deliveryFee) : 'Service salle'}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-secondary-900">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Input label="Nom" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder={user?.name || 'Votre nom'} />

            {serviceType === 'delivery' ? (
              <div className="border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                {selectedZone ? `${selectedZone.sector} - ${selectedZone.commune}, ${selectedZone.department} - ${selectedZone.etaMinutes} min` : 'Choisissez un secteur.'}
              </div>
            ) : (
              <div className="border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">Commande envoyee a la salle et a la cuisine.</div>
            )}

            {formError ? <div className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div> : null}

            {isAuthenticated ? (
              <Button type="button" className="w-full" onClick={submitOrder}>
                Commander maintenant
              </Button>
            ) : (
              <div className="grid gap-3">
                <Button type="button" className="w-full" onClick={() => redirectToAuth('login')}>
                  Se connecter pour commander
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => redirectToAuth('register')}>
                  Creer un compte
                </Button>
              </div>
            )}
          </aside>
        </div>
      )}
    </Modal>
  );
}
