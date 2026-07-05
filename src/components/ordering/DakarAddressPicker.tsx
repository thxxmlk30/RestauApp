import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import type { DeliveryZone } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { Input } from '../ui/Input';

interface DakarAddressPickerProps {
  zones: DeliveryZone[];
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
  zones,
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
  const departments = useMemo(() => Array.from(new Set(zones.map((zone) => zone.department))), [zones]);
  const communes = useMemo(() => (department ? Array.from(new Set(zones.filter((zone) => zone.department === department).map((zone) => zone.commune))) : []), [department, zones]);
  const communeZones = useMemo(() => (commune ? zones.filter((zone) => zone.commune === commune) : []), [commune, zones]);
  const selectedZone = useMemo(() => zones.find((zone) => zone.id === zoneId), [zoneId, zones]);

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
          <MapPin size={14} />
          Livraison guidee
        </div>
        <h4 className="mt-3 text-lg font-semibold text-secondary-900">Choisissez votre secteur en 3 champs</h4>
        <p className="mt-1 text-sm text-gray-500">Le choix par liste permet de calculer les frais et le delai sans afficher de carte.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Departement</span>
          <select
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Choisir un departement</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Commune</span>
          <select
            value={commune}
            onChange={(event) => onCommuneChange(event.target.value)}
            disabled={!department}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="">{department ? 'Choisir une commune' : 'Choisissez un departement'}</option>
            {communes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Secteur</span>
          <select
            value={zoneId}
            onChange={(event) => {
              const zone = zones.find((item) => item.id === event.target.value);
              if (zone) onZoneChange(zone);
            }}
            disabled={!commune}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="">{commune ? 'Choisir un secteur' : 'Choisissez une commune'}</option>
            {communeZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.sector}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedZone ? (
        <div className="rounded-[28px] border border-gray-100 bg-white p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Secteur choisi</div>
          <div className="mt-2 text-lg font-semibold text-secondary-900">{selectedZone.sector}</div>
          <div className="mt-1 text-sm text-gray-500">
            {selectedZone.commune}, {selectedZone.department}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Livraison</div>
              <div className="mt-1 font-semibold text-secondary-900">{formatCurrency(selectedZone.fee)}</div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-gray-400">ETA</div>
              <div className="mt-1 font-semibold text-secondary-900">{selectedZone.etaMinutes} min</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-3">
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Points de repere utiles</div>
            <div className="mt-2 text-sm text-gray-600">{selectedZone.landmarks.join(' - ')}</div>
          </div>
        </div>
      ) : null}

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
