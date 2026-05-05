import { Clock3, MapPin, Navigation, Store, Truck } from 'lucide-react';
import type { Order } from '../../types';
import {
  formatCurrency,
  formatDeliveryArea,
  formatStatus,
  getOrderEtaLabel,
  getOrderLiveProgress,
  getOrderTrackingLocation,
  getTrackingStages,
} from '../../utils/helpers';

function buildEmbedUrl(lat: number, lng: number) {
  const delta = 0.022;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
}

interface DeliveryLiveMapProps {
  order: Order;
  compact?: boolean;
}

export default function DeliveryLiveMap({ order, compact = false }: DeliveryLiveMapProps) {
  if (!order.location) {
    return (
      <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-400">
        Position GPS indisponible pour cette commande.
      </div>
    );
  }

  const progress = getOrderLiveProgress(order);
  const livePoint = getOrderTrackingLocation(order);
  const stages = getTrackingStages(order);
  const routeProgress = `${Math.round(progress * 100)}%`;

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
      <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-gray-100 p-5 xl:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Tracking live</div>
              <h3 className="mt-1 text-lg font-semibold text-secondary-900">{formatDeliveryArea(order)}</h3>
              <p className="mt-1 text-sm text-gray-500">{order.deliveryAddress}</p>
            </div>
            <div className="rounded-2xl bg-secondary-900 px-3 py-2 text-right text-white">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Course</div>
              <div className="text-sm font-semibold">{formatStatus(order.status)}</div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-primary-100 bg-[linear-gradient(135deg,#fff9f3,#ffffff)] p-5">
            <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gray-400">
              <span>Restaurant</span>
              <span>Client</span>
            </div>
            <div className="relative h-44 rounded-[22px] border border-dashed border-primary-200 bg-white/70">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M15,70 C32,40 56,38 85,28" stroke="#e7e5e4" strokeWidth="3" fill="none" strokeDasharray="5 5" />
                <path
                  d="M15,70 C32,40 56,38 85,28"
                  stroke="#f48b4a"
                  strokeWidth="4"
                  fill="none"
                  pathLength="100"
                  strokeDasharray={`${progress * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute left-[10%] top-[64%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-secondary-900 px-3 py-2 text-xs font-semibold text-white shadow-lg">
                <Store size={14} />
                Hub
              </div>
              <div className="absolute left-[85%] top-[26%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-secondary-900 shadow-lg">
                <MapPin size={14} className="text-primary-500" />
                Client
              </div>
              {livePoint && (
                <div
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-primary-500 px-3 py-2 text-xs font-semibold text-white shadow-xl ring-8 ring-primary-100"
                  style={{
                    left: `${15 + 70 * progress}%`,
                    top: `${70 - 42 * progress}%`,
                  }}
                >
                  <Truck size={14} />
                  {routeProgress}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">ETA</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-secondary-900">
                  <Clock3 size={14} className="text-primary-500" />
                  {getOrderEtaLabel(order)}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Frais</div>
                <div className="mt-1 text-sm font-semibold text-secondary-900">{formatCurrency(order.deliveryFee ?? 0)}</div>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Livreur</div>
                <div className="mt-1 text-sm font-semibold text-secondary-900">{order.courierName || 'A assigner'}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {stages.map((stage) => (
                <div
                  key={stage.key}
                  className={`rounded-2xl border px-3 py-2 text-xs ${
                    stage.done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : stage.active
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {stage.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!compact && (
          <div className="flex flex-col">
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                <Navigation size={16} className="text-primary-500" />
                Carte OpenStreetMap
              </div>
              <p className="mt-1 text-sm text-gray-500">Vue de destination et du secteur de livraison.</p>
            </div>
            <iframe title={`Carte ${order.id}`} src={buildEmbedUrl(order.location.lat, order.location.lng)} className="min-h-[300px] flex-1 border-0" loading="lazy" />
          </div>
        )}
      </div>
    </div>
  );
}
