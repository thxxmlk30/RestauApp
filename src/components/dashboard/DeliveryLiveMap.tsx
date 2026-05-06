import { Clock3, MapPin, Navigation, Truck } from 'lucide-react';
import type { Order } from '../../types';
import { formatDeliveryArea, formatStatus, getOrderEtaLabel, getOrderLiveProgress, getTrackingStages } from '../../utils/helpers';

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
    return <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-400">Position GPS indisponible pour cette commande.</div>;
  }

  const progress = getOrderLiveProgress(order);
  const stages = getTrackingStages(order);

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
      <div className={`grid ${compact ? '' : 'xl:grid-cols-[1fr_0.92fr]'}`}>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Suivi commande</div>
              <h3 className="mt-1 text-lg font-semibold text-secondary-900">{formatDeliveryArea(order)}</h3>
              <p className="mt-1 text-sm text-gray-500">{order.deliveryAddress}</p>
            </div>
            <div className="rounded-2xl bg-secondary-900 px-3 py-2 text-right text-white">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Statut</div>
              <div className="text-sm font-semibold">{formatStatus(order.status)}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="font-medium text-secondary-900">Progression</div>
              <div className="text-gray-500">{Math.round(progress * 100)}%</div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${Math.max(8, Math.round(progress * 100))}%` }} />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {stages.map((stage) => (
                <div
                  key={stage.key}
                  className={`rounded-2xl border px-3 py-3 text-xs ${
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

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gray-400">
                <Clock3 size={14} />
                ETA
              </div>
              <div className="mt-2 text-sm font-semibold text-secondary-900">{getOrderEtaLabel(order)}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gray-400">
                <Truck size={14} />
                Livreur
              </div>
              <div className="mt-2 text-sm font-semibold text-secondary-900">{order.courierName || 'Affectation en cours'}</div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gray-400">
                <MapPin size={14} />
                Arrivee
              </div>
              <div className="mt-2 text-sm font-semibold text-secondary-900">{order.deliverySector || 'Adresse client'}</div>
            </div>
          </div>
        </div>

        {!compact ? (
          <div className="border-t border-gray-100 xl:border-l xl:border-t-0">
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                <Navigation size={16} className="text-primary-500" />
                Carte de destination
              </div>
              <p className="mt-1 text-sm text-gray-500">Apercu simple du point de livraison.</p>
            </div>
            <iframe title={`Carte ${order.id}`} src={buildEmbedUrl(order.location.lat, order.location.lng)} className="min-h-[300px] w-full border-0" loading="lazy" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
