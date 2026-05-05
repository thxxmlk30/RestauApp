import { ArrowRight, Bike, MapPin, Star, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/first.webp';
import { Button } from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(244,139,74,0.18),transparent_28%),linear-gradient(135deg,#fff8ef_0%,#ffffff_44%,#f7f3ee_100%)] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-8">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Star size={14} className="fill-current" />
              Dakar, livraison pilotee par secteur
            </motion.div>

            <motion.h1
              className="font-display text-5xl font-bold leading-tight text-secondary-900 lg:text-7xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              La teranga
              <br />
              en salle
              <br />
              et en livraison
            </motion.h1>

            <motion.p
              className="max-w-xl text-xl leading-relaxed text-gray-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              Commande en drawer, choix de commune ou carte de Dakar, frais calcules par secteur et suivi live de votre course.
            </motion.p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a href="#menu">
                <Button size="lg">
                  Voir notre menu
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </a>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Ouvrir le dashboard
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="panel-3d rounded-[24px] border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-2 text-secondary-900">
                  <Store className="h-5 w-5 text-primary-500" />
                  <span className="font-semibold">Sur place</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Tables, cuisine et service en un seul flux.</p>
              </div>
              <div className="panel-3d rounded-[24px] border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-2 text-secondary-900">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <span className="font-semibold">Adresse Dakar</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Departement, commune, secteur ou choix direct sur carte.</p>
              </div>
              <div className="panel-3d rounded-[24px] border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-2 text-secondary-900">
                  <Bike className="h-5 w-5 text-primary-500" />
                  <span className="font-semibold">Tracking live</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Progression de course visible en temps reel.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <motion.div
              className="panel-3d overflow-hidden rounded-[38px] border border-white/60 bg-gradient-to-br from-primary-100 to-primary-200 p-3"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ rotateX: 3, rotateY: -3, y: -6 }}
            >
              <img src={heroImage} alt="Plat senegalais" className="h-[520px] w-full rounded-[32px] object-cover" loading="lazy" decoding="async" />
            </motion.div>

            <motion.div className="absolute -bottom-5 -left-5 rounded-[24px] border border-gray-100 bg-white p-4 shadow-2xl" whileHover={{ y: -8 }}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
                  <Star size={20} className="fill-current" />
                </div>
                <div>
                  <p className="font-bold text-secondary-900">4.9 / 5</p>
                  <p className="text-sm text-gray-500">+200 avis clients</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
