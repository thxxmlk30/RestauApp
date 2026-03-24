import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import aboutBgImage from '../../assets/image restau.webp';

const schedule = [
  { day: 'Lundi – Vendredi', hours: '12h00 – 15h00 · 19h00 – 23h00' },
  { day: 'Samedi', hours: '12h00 – 16h00 · 19h00 – 00h00' },
  { day: 'Dimanche', hours: '12h00 – 16h00 (déjeuner uniquement)' },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-4xl font-bold mb-6">Notre histoire</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Linguere est un restaurant sénégalais à Dakar, né d'une envie simple : partager la Teranga
              à travers des plats généreux et authentiques. Ici, on cuisine comme à la maison, avec des
              produits frais, des épices bien dosées et beaucoup d'amour.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Du thiéboudienne au yassa, en passant par le mafé, le dibi et les desserts traditionnels,
              chaque assiette raconte une histoire : celle des familles, des marchés, et des souvenirs de la côte.
              Et parce que Dakar est un carrefour, Linguere propose aussi des “World Specials” inspirés
              d'autres pays (Italie, Maroc, Japon, Mexique…) — toujours revisités à notre sauce.
            </p>
            <div className="space-y-3">
              {[
                { icon: MapPin, text: 'Corniche Ouest, Fann Résidence, Dakar, Sénégal' },
                { icon: Phone, text: '+221 77 123 45 67' },
                { icon: Mail, text: 'contact@linguere.sn' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-400">
                  <Icon size={16} className="text-primary-500 flex-shrink-0" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden bg-secondary-700 rounded-3xl p-8">
            <img
              src={aboutBgImage}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
              loading="lazy"
              decoding="async"
            />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">Horaires d'ouverture</h3>
            </div>
            <div className="space-y-4">
              {schedule.map((s) => (
                <div key={s.day} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-secondary-900/50 last:border-0">
                  <span className="font-medium text-white">{s.day}</span>
                  <span className="text-gray-400 text-sm mt-1 sm:mt-0">{s.hours}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <p className="text-primary-400 text-sm text-center">
                Réservation recommandée · Appeler ou envoyer un email
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
