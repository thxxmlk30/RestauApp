import { MapPin, Navigation } from 'lucide-react';
import { useMemo } from 'react';
import { dakarDepartments, getCommunesByDepartment, getZoneById, getZonesByCommune } from '../../data/dakarZones';
import type { DeliveryZone } from '../../types';
import { buildDeliveryAddressLabel, formatCurrency } from '../../utils/helpers';
import { Input } from '../ui/Input';

function buildEmbedUrl(lat: number, lng: number) {
  const delta = 0.024;
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
  const communes = useMemo(() => (department ? getCommunesByDepartment(department) : []), [department]);
  const zones = useMemo(() => (commune ? getZonesByCommune(commune) : []), [commune]);
  const selectedZone = useMemo(() => getZoneById(zoneId), [zoneId]);

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
          <MapPin size={14} />
          Livraison guidee
        </div>
        <h4 className="mt-3 text-lg font-semibold text-secondary-900">Choisissez votre secteur en 3 champs</h4>
        <p className="mt-1 text-sm text-gray-500">Le choix par liste est prioritaire. La carte sert seulement d apercu une fois le secteur choisi.</p>
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
            {dakarDepartments.map((item) => (
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
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.sector}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedZone ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
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

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white">
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                <Navigation size={16} className="text-primary-500" />
                Apercu du point de livraison
              </div>
              <p className="mt-1 text-sm text-gray-500">{buildDeliveryAddressLabel(selectedZone, streetLine, landmark)}</p>
            </div>
            <iframe title={`Carte ${selectedZone.sector}`} src={buildEmbedUrl(selectedZone.lat, selectedZone.lng)} className="h-[280px] w-full border-0" loading="lazy" />
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
