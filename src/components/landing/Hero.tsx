import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Texte gauche */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star size={14} className="fill-current" />
              Restaurant étoilé depuis 2019
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-secondary-900 leading-tight">
              Une cuisine
              <br />
              <span className="text-primary-500">authentique</span>
              <br />
              qui vous surprend
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
              Découvrez des saveurs uniques élaborées avec des produits locaux et frais. 
              Une expérience gastronomique inoubliable au cœur de la ville.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#menu">
                <Button size="lg" variant="primary">
                  Voir notre menu
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </a>
              <Link to="/login">
                <Button size="lg" variant="outline">Espace gestion</Button>
              </Link>
            </div>
          </div>

          {/* Image droite */}
          <div className="relative">
            <div className="w-full h-96 lg:h-[500px] rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop"
                alt="Plat gastronomique"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Badge flottant */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                <Star size={20} className="text-white fill-current" />
              </div>
              <div>
                <p className="font-bold text-secondary-900">4.9 / 5</p>
                <p className="text-sm text-gray-500">+200 avis clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}