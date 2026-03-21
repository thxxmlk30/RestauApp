import { Clock, MapPin, Phone, Mail } from 'lucide-react';

const schedule = [
  { day: 'Lundi – Vendredi', hours: '12h00 – 14h30 · 19h00 – 22h30' },
  { day: 'Samedi', hours: '12h00 – 15h00 · 19h00 – 23h00' },
  { day: 'Dimanche', hours: '12h00 – 15h00 (déjeuner uniquement)' },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Texte */}
          <div>
            <h2 className="font-display text-4xl font-bold mb-6">
              Notre histoire
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Fondé en 2015 par le Chef Marc Beaumont, La Belle Assiette est né d'une passion 
              profonde pour la gastronomie française et les produits du terroir. Chaque assiette 
              raconte une histoire, celle de producteurs locaux que nous connaissons personnellement.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Notre cuisine évolue au fil des saisons, toujours en harmonie avec ce que la nature 
              nous offre de meilleur. Une étoile Michelin obtenue en 2019 est venue récompenser 
              cet engagement sans compromis pour la qualité.
            </p>

            {/* Contacts */}
            <div className="space-y-3">
              {[
                { icon: MapPin, text: '12 Rue de la Gastronomie, 75001 Paris' },
                { icon: Phone, text: '+33 1 23 45 67 89' },
                { icon: Mail, text: 'contact@labelleAssiette.fr' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-400">
                  <Icon size={16} className="text-primary-500 flex-shrink-0" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Horaires */}
          <div className="bg-secondary-700 rounded-3xl p-8">
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
    </section>
  );
}