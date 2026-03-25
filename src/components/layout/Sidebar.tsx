import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ClipboardList, Home, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

const groups = [
  {
    title: 'Dashboard',
    items: [
      { to: '/dashboard', label: 'Aperçu', description: 'KPIs + résumé', icon: LayoutDashboard },
      { to: '/dashboard/stats', label: 'Statistiques', description: 'Graphiques & tendances', icon: BarChart3 },
      { to: '/dashboard/orders', label: 'Commandes', description: 'Statuts & suppressions', icon: ClipboardList },
      { to: '/dashboard/menu', label: 'Menu (CRUD)', description: 'Produits par repas', icon: UtensilsCrossed },
    ],
  },
  {
    title: 'Site',
    items: [{ to: '/', label: 'Retour au site', description: 'Accueil Linguere', icon: Home }],
  },
] as const;

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:gap-4 lg:p-4 lg:bg-white lg:border-r lg:border-gray-100">
      <div className="px-3 pt-2">
        <h2 className="font-display text-xl font-bold text-secondary-900">Linguere</h2>
        <p className="text-xs text-gray-500 mt-1">Espace administration</p>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.title}</h3>
          <div className="space-y-1">
            {group.items.map(({ to, label, description, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-start gap-3 rounded-2xl px-3 py-2 transition ${
                    active ? 'bg-secondary-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} className={active ? 'mt-0.5 text-white' : 'mt-0.5 text-gray-500'} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{label}</div>
                    <div className={`text-xs truncate ${active ? 'text-white/80' : 'text-gray-500'}`}>{description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
