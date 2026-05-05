import { motion } from 'framer-motion';
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  PackageCheck,
  Route,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const navByRole = {
  admin: [
    {
      title: 'Pilotage',
      items: [
        { to: '/dashboard', label: 'Apercu', description: 'Vue globale du service', icon: LayoutDashboard },
        { to: '/dashboard/stats', label: 'Statistiques', description: 'KPIs et tendances', icon: BarChart3 },
        { to: '/dashboard/orders', label: 'Commandes', description: 'Flux complet du restaurant', icon: ClipboardList },
      ],
    },
    {
      title: 'Execution',
      items: [
        { to: '/dashboard/menu', label: 'Produits', description: 'Carte et disponibilite', icon: UtensilsCrossed },
        { to: '/dashboard/stock', label: 'Stocks', description: 'Ingredients et reapro', icon: PackageCheck },
        { to: '/dashboard/staff', label: 'Personnel', description: 'Chefs, salle, livreurs', icon: Users },
        { to: '/dashboard/map', label: 'Tracking', description: 'Carte des courses actives', icon: MapPin },
        { to: '/dashboard/zones', label: 'Zones', description: 'Secteurs Dakar et dispatch', icon: Route },
      ],
    },
    {
      title: 'Business',
      items: [{ to: '/dashboard/reports', label: 'Rapports', description: 'Exports et syntheses', icon: FileText }],
    },
  ],
  chef: [
    {
      title: 'Cuisine',
      items: [
        { to: '/dashboard', label: 'Passe', description: 'Charge et priorites cuisine', icon: LayoutDashboard },
        { to: '/dashboard/orders', label: 'File cuisine', description: 'En attente, preparation, pret', icon: ClipboardList },
        { to: '/dashboard/stock', label: 'Ingredients', description: 'Ruptures et niveaux critiques', icon: PackageCheck },
      ],
    },
  ],
  waiter: [
    {
      title: 'Salle',
      items: [
        { to: '/dashboard', label: 'Service', description: 'Tables et commandes du moment', icon: LayoutDashboard },
        { to: '/dashboard/orders', label: 'Commandes salle', description: 'Sur place et retraits', icon: ClipboardList },
        { to: '/dashboard/menu', label: 'Carte', description: 'Disponibilites en temps reel', icon: UtensilsCrossed },
      ],
    },
  ],
  delivery: [
    {
      title: 'Livraison',
      items: [
        { to: '/dashboard', label: 'Courses', description: 'Departs et retards', icon: LayoutDashboard },
        { to: '/dashboard/orders', label: 'A livrer', description: 'Affectation et statut', icon: ClipboardList },
        { to: '/dashboard/map', label: 'Carte', description: 'Suivi geolocalise', icon: MapPin },
        { to: '/dashboard/zones', label: 'Zones', description: 'Tarifs, secteurs, priorites', icon: Route },
      ],
    },
  ],
} as const;

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const groups = navByRole[user?.role === 'customer' || !user ? 'admin' : user.role];

  return (
    <motion.aside
      className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col gap-5 border-r border-gray-100 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition-transform lg:static lg:w-auto lg:translate-x-0 lg:rounded-[32px] lg:border lg:shadow-lg ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      initial={false}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-secondary-900">Linguere</h2>
          <p className="text-xs text-gray-500">Dashboard operations</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose} className="h-9 w-9 p-0 lg:hidden">
          <X size={18} />
        </Button>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.title}>
            <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{group.title}</h3>
            <div className="space-y-1.5">
              {group.items.map(({ to, label, description, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <motion.div key={to} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      to={to}
                      onClick={onClose}
                      className={`block rounded-2xl border px-3 py-3 transition-all ${
                        active
                          ? 'border-secondary-900 bg-secondary-900 text-white shadow-lg'
                          : 'border-transparent bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                            active ? 'bg-white/10 text-white' : 'bg-white text-primary-500 shadow-sm'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold">{label}</div>
                          <div className={`mt-1 text-xs ${active ? 'text-white/75' : 'text-gray-500'}`}>{description}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Retour</h3>
          <Link
            to="/"
            onClick={onClose}
            className="block rounded-2xl border border-transparent bg-gray-50 px-3 py-3 text-gray-700 transition-all hover:border-gray-200 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm">
                <Home size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">Retour au site</div>
                <div className="text-xs text-gray-500">Accueil, menu et commande client</div>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </motion.aside>
  );
}
