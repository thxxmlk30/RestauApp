import { ArrowLeft, ArrowRight, Bike, CheckCircle2, Minus, Plus, Store, Trash2, UserRound } from 'lucide-react';
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

const checkoutSteps = [
  { title: 'Panier' },
  { title: 'Livraison ou salle' },
  { title: 'Confirmation' },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {checkoutSteps.map((step, index) => {
        const active = currentStep === index;
        const done = currentStep > index;
        return (
          <div
            key={step.title}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              done
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : active
                  ? 'border-primary-200 bg-primary-50 text-primary-800'
                  : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm">{index + 1}</span>
            {step.title}
          </div>
        );
      })}
    </div>
  );
}

export default function CartModal() {
  const { cart, increment, decrement, removeItem, clearCart, isCartOpen, closeCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(0);
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
    setCurrentStep(0);
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

  const validateStep = (step: number) => {
    setFormError('');

    if (cartLines.length === 0) {
      setFormError('Votre panier est vide.');
      return false;
    }

    if (step >= 1) {
      if (serviceType === 'dine_in' && (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 99)) {
        setFormError('Numero de table invalide (1-99).');
        return false;
      }

      if (serviceType === 'delivery') {
        if (!selectedZone) {
          setFormError('Choisissez un secteur de livraison.');
          return false;
        }
        if (!streetLine.trim()) {
          setFormError('Ajoutez la rue ou l immeuble de livraison.');
          return false;
        }
      }
    }

    if (step >= 2) {
      if (!isAuthenticated || !user) {
        setFormError('Connectez-vous pour confirmer la commande.');
        return false;
      }
      if (grandTotal <= 0) {
        setFormError('Le total de la commande est invalide.');
        return false;
      }
      if (serviceType === 'delivery' && !phone.trim()) {
        setFormError('Ajoutez un numero de telephone pour la livraison.');
        return false;
      }
    }

    return true;
  };

  const submitOrder = () => {
    if (!validateStep(2) || !user) return;

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

    const ingredients = loadIngredients(mockIngredients);
    saveIngredients(deductIngredientsForOrder(ingredients, order));

    clearCart();
    setAssignedCourierName(assignedCourier?.name || '');
    setSuccessOrderId(orderId);
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, checkoutSteps.length - 1));
  };

  const redirectToAuth = (target: 'login' | 'register') => {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    handleClose();
    navigate(`/${target}?redirect=${redirect}`);
  };

  return (
    <Modal open={isCartOpen} title="Votre commande" onClose={handleClose} layout="drawer" maxWidthClassName="max-w-[1040px]">
      {successOrderId ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={34} className="text-emerald-600" />
            </div>
            <h4 className="text-xl font-semibold text-secondary-900">Commande confirmee</h4>
            <p className="mt-2 text-sm text-gray-500">Reference {successOrderId}. Votre commande a bien ete transmise.</p>
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
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{serviceType === 'delivery' ? 'Livreur' : 'Table'}</div>
              <div className="mt-1 font-semibold text-secondary-900">{serviceType === 'delivery' ? assignedCourierName || 'Affectation en cours' : tableNumber}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                handleClose();
                navigate('/mes-commandes');
              }}
            >
              Suivre ma commande
            </Button>
            <Button type="button" className="rounded-2xl" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {cartLines.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">Votre panier est vide.</p>
              <Button type="button" variant="outline" className="mt-4 w-full rounded-2xl" onClick={handleClose}>
                Continuer
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <StepIndicator currentStep={currentStep} />

                {currentStep === 0 ? (
                  <section className="rounded-[28px] border border-gray-100 bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">Verifier votre panier</h3>
                        <p className="mt-1 text-sm text-gray-500">Gardez seulement l essentiel avant de continuer.</p>
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
                            <p className="shrink-0 text-sm font-semibold text-secondary-900">{formatCurrency(line.lineTotal)}</p>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-white"
                              onClick={() => decrement(line.item.id)}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-secondary-900">{line.quantity}</span>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white transition hover:bg-primary-600"
                              onClick={() => increment(line.item.id)}
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              type="button"
                              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => removeItem(line.item.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {currentStep === 1 ? (
                  <section className="space-y-4 rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">Choisir le lieu de service</h3>
                      <p className="mt-1 text-sm text-gray-500">Un seul choix de parcours, puis uniquement les champs necessaires.</p>
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
                        <div className={`mt-1 text-sm ${serviceType === 'dine_in' ? 'text-white/75' : 'text-gray-500'}`}>Simple numero de table.</div>
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
                        <div className={`mt-1 text-sm ${serviceType === 'delivery' ? 'text-primary-700' : 'text-gray-500'}`}>Secteur, frais et ETA clairs.</div>
                      </button>
                    </div>

                    {serviceType === 'dine_in' ? (
                      <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                        <Input
                          label="Numero de table"
                          type="number"
                          min={1}
                          max={99}
                          value={tableNumber}
                          onChange={(event) => setTableNumber(Number(event.target.value))}
                          className="rounded-2xl bg-white"
                        />
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
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
                      </div>
                    )}
                  </section>
                ) : null}

                {currentStep === 2 ? (
                  <section className="space-y-4 rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">Confirmer la commande</h3>
                      <p className="mt-1 text-sm text-gray-500">Seulement les informations utiles pour finaliser et suivre la commande.</p>
                    </div>

                    {isAuthenticated ? (
                      <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-secondary-900">
                          <UserRound size={16} className="text-primary-500" />
                          Coordonnees client
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Nom d affichage"
                            value={customerName}
                            onChange={(event) => setCustomerName(event.target.value)}
                            placeholder={user?.name}
                            className="rounded-2xl bg-white"
                          />
                          <Input
                            label="Telephone"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder={serviceType === 'delivery' ? '+221...' : 'Optionnel'}
                            className="rounded-2xl bg-white"
                          />
                        </div>
                        {serviceType === 'delivery' ? (
                          <div className="mt-4">
                            <Input
                              label="Instruction pour le livreur"
                              value={deliveryNotes}
                              onChange={(event) => setDeliveryNotes(event.target.value)}
                              placeholder="Portail, etage, interphone..."
                              className="rounded-2xl bg-white"
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                        <div className="text-sm font-semibold text-amber-800">Connexion requise</div>
                        <p className="mt-2 text-sm text-amber-700">Connectez-vous ou creez un compte pour confirmer et suivre votre commande.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <Button type="button" className="rounded-2xl" onClick={() => redirectToAuth('login')}>
                            Se connecter
                          </Button>
                          <Button type="button" variant="outline" className="rounded-2xl" onClick={() => redirectToAuth('register')}>
                            Creer un compte
                          </Button>
                        </div>
                      </div>
                    )}
                  </section>
                ) : null}

                {formError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div> : null}
              </div>

              <aside className="space-y-4">
                <div className="rounded-[30px] border border-gray-100 bg-secondary-900 p-5 text-white lg:sticky lg:top-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">Recap</div>
                  <div className="mt-4 space-y-3 text-sm">
                    {cartLines.map((line) => (
                      <div key={line.item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white/8 p-3">
                        <div className="min-w-0">
                          <div className="font-medium text-white">{line.item.name}</div>
                          <div className="mt-1 text-xs text-white/60">
                            {line.quantity} x {formatCurrency(line.item.price)}
                          </div>
                        </div>
                        <div className="shrink-0 font-semibold">{formatCurrency(line.lineTotal)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Sous-total</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Livraison</span>
                      <span>{serviceType === 'delivery' ? formatCurrency(deliveryFee) : 'Service salle'}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-white/8 p-4 text-sm">
                    {serviceType === 'delivery' ? (
                      <>
                        <div className="text-white/65">Livraison</div>
                        <div className="mt-1 font-semibold">{selectedZone?.sector || 'Secteur a choisir'}</div>
                        <div className="mt-1 text-white/70">
                          {selectedZone ? `${selectedZone.commune}, ${selectedZone.department}` : 'Choisissez votre secteur pour calculer les frais.'}
                        </div>
                        {selectedZone ? <div className="mt-2 text-white/80">ETA estimee: {selectedZone.etaMinutes} min</div> : null}
                      </>
                    ) : (
                      <>
                        <div className="text-white/65">Sur place</div>
                        <div className="mt-1 font-semibold">Table {tableNumber || '-'}</div>
                        <div className="mt-1 text-white/70">Commande envoyee directement a la salle et a la cuisine.</div>
                      </>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3">
                    {currentStep > 0 ? (
                      <Button type="button" variant="outline" className="w-full rounded-2xl border-white/20 text-white hover:bg-white/10" onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}>
                        <ArrowLeft size={16} className="mr-2" />
                        Retour
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" className="w-full rounded-2xl border-white/20 text-white hover:bg-white/10" onClick={handleClose}>
                        Continuer mes choix
                      </Button>
                    )}

                    {currentStep < checkoutSteps.length - 1 ? (
                      <Button type="button" className="w-full rounded-2xl bg-primary-500 hover:bg-primary-600" onClick={goToNextStep}>
                        Continuer
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    ) : isAuthenticated ? (
                      <Button type="button" className="w-full rounded-2xl bg-primary-500 hover:bg-primary-600" onClick={submitOrder}>
                        Commander maintenant
                      </Button>
                    ) : (
                      <Button type="button" className="w-full rounded-2xl bg-primary-500 hover:bg-primary-600" onClick={() => redirectToAuth('login')}>
                        Se connecter pour commander
                      </Button>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
