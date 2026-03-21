/ Données des avis — modifie-les librement
const testimonials = [
  {
    id: 1,
    name: 'Sophie Martin',
    role: 'Fidèle cliente',
    rating: 5,
    comment: 'Une cuisine exceptionnelle ! Le magret de canard était à la perfection. L\'accueil chaleureux et le cadre élégant ont rendu cette soirée mémorable.',
    avatar: 'SM',
  },
  {
    id: 2,
    name: 'Pierre Dubois',
    role: 'Critique gastronomique',
    rating: 5,
    comment: 'Un rapport qualité-prix imbattable. Chaque plat est une œuvre d\'art. Je recommande vivement la tarte Tatin maison, un délice absolu.',
    avatar: 'PD',
  },
  {
    id: 3,
    name: 'Marie Chen',
    role: 'Gastronome',
    rating: 5,
    comment: 'J\'ai fêté mon anniversaire ici et c\'était parfait. Le personnel attentionné et la carte des vins sont au top. À refaire absolument !',
    avatar: 'MC',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="avis" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Titre de la section */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-secondary-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-gray-500 text-lg">
            Plus de 200 avis vérifiés sur Google et TripAdvisor
          </p>
        </div>

        {/* Grille d'avis */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Étoiles */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Commentaire */}
              <p className="text-gray-600 leading-relaxed mb-6 italic">
                "{t.comment}"
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}