import { Building2, CheckCircle2, MapPin, Navigation, Route } from 'lucide-react';
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
  const [mode, setMode] = useState<'guided' | 'map'>('guided');

  const communes = useMemo(() => (department ? getCommunesByDepartment(department) : []), [department]);
  const zones = useMemo(() => (commune ? getZonesByCommune(commune) : []), [commune]);
  const selectedZone = useMemo(() => getZoneById(zoneId), [zoneId]);
  const highlightedZones = useMemo(() => {
    if (zones.length > 0) return zones;
    if (department) return dakarZones.filter((zone) => zone.department === department).slice(0, 6);
    return dakarZones.slice(0, 6);
  }, [department, zones]);

  const selectionStep = selectedZone ? 3 : commune ? 2 : department ? 1 : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
              <Route size={14} />
              Livraison guidee a Dakar
            </div>
            <h4 className="mt-3 text-lg font-semibold text-secondary-900">Choisissez votre zone sans friction</h4>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Commencez par le departement, continuez avec la commune, puis choisissez le secteur. Vous pouvez aussi passer par la carte
              simplifiee.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:w-[320px]">
            {['Departement', 'Commune', 'Secteur'].map((label, index) => {
              const done = selectionStep > index;
              const active = selectionStep === index;
              return (
                <div
                  key={label}
                  className={`rounded-2xl border px-3 py-3 text-sm ${
                    done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : active
                        ? 'border-primary-200 bg-white text-secondary-900'
                        : 'border-white/70 bg-white/70 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        done ? 'bg-emerald-500 text-white' : active ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {done ? <CheckCircle2 size={12} /> : index + 1}
                    </span>
                    <span className="font-medium">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedZone ? (
        <div className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Zone retenue</div>
              <div className="mt-1 text-lg font-semibold text-secondary-900">{selectedZone.sector}</div>
              <div className="mt-1 text-sm text-gray-500">
                {selectedZone.commune}, {selectedZone.department}
              </div>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-gray-500">Livraison</div>
                <div className="mt-1 font-semibold text-secondary-900">{formatCurrency(selectedZone.fee)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-gray-500">ETA</div>
                <div className="mt-1 font-semibold text-secondary-900">{selectedZone.etaMinutes} min</div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">{buildDeliveryAddressLabel(selectedZone, streetLine, landmark)}</p>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('guided')}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            mode === 'guided' ? 'border-secondary-900 bg-secondary-900 text-white' : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Building2 size={16} />
            Parcours guide
          </div>
          <div className={`mt-1 text-sm ${mode === 'guided' ? 'text-white/75' : 'text-gray-500'}`}>Le plus simple pour choisir votre zone.</div>
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
            Carte simplifiee
          </div>
          <div className={`mt-1 text-sm ${mode === 'map' ? 'text-primary-700' : 'text-gray-500'}`}>Pour selectionner directement un secteur sur la carte.</div>
        </button>
      </div>

      {mode === 'guided' ? (
        <div className="space-y-4 rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">1. Departement</div>
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
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">2. Commune</div>
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
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">3. Secteur</div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {highlightedZones.length > 0 ? (
                highlightedZones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => onZoneChange(zone)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      zoneId === zone.id ? 'border-primary-300 bg-primary-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-secondary-900">{zone.sector}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {zone.commune}, {zone.department}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">{zone.landmarks.join(' · ')}</div>
                      </div>
                      <div className="shrink-0 text-right text-sm">
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
          <div className="relative overflow-hidden rounded-[28px] border border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(244,139,74,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(28,25,23,0.08),transparent_30%),linear-gradient(135deg,#fffaf5,#ffffff)] p-4 sm:p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Carte simplifiee de Dakar</div>
            <div className="relative mt-4 h-[320px] rounded-[24px] border border-dashed border-primary-200 bg-white/80 sm:h-[360px]">
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
                    Apercu de livraison
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{buildDeliveryAddressLabel(selectedZone, streetLine, landmark)}</p>
                </div>
                <iframe
                  title={`Carte ${selectedZone.sector}`}
                  src={buildEmbedUrl(selectedZone.lat, selectedZone.lng)}
                  className="h-[280px] w-full border-0 sm:h-[320px]"
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
          className="rounded-2xl"
        />
        <Input
          label="Point de repere"
          value={landmark}
          onChange={(event) => onLandmarkChange(event.target.value)}
          placeholder="Ex: pres du rond-point, face pharmacie"
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}
