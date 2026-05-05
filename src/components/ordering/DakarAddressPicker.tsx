import { Building2, MapPin, Navigation, Route } from 'lucide-react';
import { useMemo, useState } from 'react';
import { dakarDepartments, dakarZones, getCommunesByDepartment, getZoneById, getZonesByCommune } from '../../data/dakarZones';
import type { DeliveryZone } from '../../types';
import { buildDeliveryAddressLabel, formatCurrency } from '../../utils/helpers';
import { Input } from '../ui/Input';

function buildEmbedUrl(lat: number, lng: number) {
  const delta = 0.025;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
}

interface DakarAddressPickerProps {
  department: string;
  commune: string;
  zoneId: string;
  streetLine: string;
  landmark: string;
  onDepartmentChange: (value: string) => void;
  onCommuneChange: (value: string) => void;
  onZoneChange: (zone: DeliveryZone) => void;
  onStreetLineChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
}

export default function DakarAddressPicker({
  department,
  commune,
  zoneId,
  streetLine,
  landmark,
  onDepartmentChange,
  onCommuneChange,
  onZoneChange,
  onStreetLineChange,
  onLandmarkChange,
}: DakarAddressPickerProps) {
  const [mode, setMode] = useState<'list' | 'map'>('list');

  const communes = useMemo(() => (department ? getCommunesByDepartment(department) : []), [department]);
  const zones = useMemo(() => (commune ? getZonesByCommune(commune) : []), [commune]);
  const selectedZone = useMemo(() => getZoneById(zoneId), [zoneId]);

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
              <Route size={14} />
              Livraison par secteur
            </div>
            <h4 className="mt-3 text-base font-semibold text-secondary-900">Choisissez votre zone a Dakar</h4>
            <p className="mt-1 text-sm text-gray-500">
              Parcours guide par departement puis commune, ou selection directe sur la carte pour calculer le tarif.
            </p>
          </div>
          {selectedZone && (
            <div className="min-w-[220px] rounded-2xl border border-white/70 bg-white/90 p-3 shadow-sm">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Zone retenue</div>
              <div className="mt-1 font-semibold text-secondary-900">{selectedZone.sector}</div>
              <div className="mt-1 text-sm text-gray-500">
                {selectedZone.commune}, {selectedZone.department}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Livraison</span>
                <span className="font-semibold text-secondary-900">{formatCurrency(selectedZone.fee)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">ETA</span>
                <span className="font-semibold text-secondary-900">{selectedZone.etaMinutes} min</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('list')}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            mode === 'list' ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Building2 size={16} />
            Parcours guide
          </div>
          <div className={`mt-1 text-sm ${mode === 'list' ? 'text-white/75' : 'text-gray-500'}`}>
            Departement, commune, puis secteur.
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('map')}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            mode === 'map' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <MapPin size={16} />
            Choix sur carte
          </div>
          <div className={`mt-1 text-sm ${mode === 'map' ? 'text-primary-700' : 'text-gray-500'}`}>
            Touchez directement le secteur de livraison.
          </div>
        </button>
      </div>

      {mode === 'list' ? (
        <div className="space-y-4 rounded-[28px] border border-gray-100 bg-white p-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Departements</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {dakarDepartments.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onDepartmentChange(item)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    department === item ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Communes</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {communes.length > 0 ? (
                communes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onCommuneChange(item)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      commune === item ? 'bg-secondary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {item}
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-400">Choisissez d abord un departement.</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Secteurs desservis</div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {zones.length > 0 ? (
                zones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => onZoneChange(zone)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      zoneId === zone.id ? 'border-primary-300 bg-primary-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-secondary-900">{zone.sector}</div>
                        <div className="mt-1 text-sm text-gray-500">{zone.landmarks.join(' · ')}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-secondary-900">{formatCurrency(zone.fee)}</div>
                        <div className="text-gray-500">{zone.etaMinutes} min</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-400">Choisissez une commune pour voir les secteurs.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(244,139,74,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(28,25,23,0.08),transparent_30%),linear-gradient(135deg,#fffaf5,#ffffff)] p-5">
            <div className="absolute left-6 top-6 text-xs uppercase tracking-[0.2em] text-gray-400">Carte simplifiee de Dakar</div>
            <div className="relative mt-10 h-[320px] rounded-[24px] border border-dashed border-primary-200 bg-white/80">
              <div className="absolute inset-6 rounded-[24px] bg-[radial-gradient(circle_at_18%_28%,rgba(244,139,74,0.2),transparent_0%,transparent_18%),radial-gradient(circle_at_72%_24%,rgba(244,139,74,0.12),transparent_0%,transparent_24%),radial-gradient(circle_at_84%_68%,rgba(28,25,23,0.12),transparent_0%,transparent_28%)]" />
              <div className="absolute left-5 top-8 text-xs font-medium text-gray-400">Corniche</div>
              <div className="absolute bottom-6 right-5 text-xs font-medium text-gray-400">Rufisque</div>
              {dakarZones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => onZoneChange(zone)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm transition ${
                    zoneId === zone.id ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-white bg-white/95 text-secondary-900 hover:border-primary-300 hover:text-primary-700'
                  }`}
                  style={{ left: `${zone.mapX}%`, top: `${zone.mapY}%` }}
                >
                  {zone.sector}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
            {selectedZone ? (
              <>
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                    <Navigation size={16} className="text-primary-500" />
                    Preview carte
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{buildDeliveryAddressLabel(selectedZone, streetLine, landmark)}</p>
                </div>
                <iframe
                  title={`Carte ${selectedZone.sector}`}
                  src={buildEmbedUrl(selectedZone.lat, selectedZone.lng)}
                  className="h-[280px] w-full border-0"
                  loading="lazy"
                />
              </>
            ) : (
              <div className="flex h-[344px] items-center justify-center p-6 text-center text-sm text-gray-400">
                Touchez un secteur sur la carte pour calculer la livraison et centrer le point d arrivee.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Rue, immeuble ou numero"
          value={streetLine}
          onChange={(event) => onStreetLineChange(event.target.value)}
          placeholder="Ex: VDN, immeuble C, porte 14"
        />
        <Input
          label="Point de repere"
          value={landmark}
          onChange={(event) => onLandmarkChange(event.target.value)}
          placeholder="Ex: pres du rond-point, face pharmacie"
        />
      </div>
    </div>
  );
}
