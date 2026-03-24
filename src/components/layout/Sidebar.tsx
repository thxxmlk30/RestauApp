import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Home } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard', label: 'Menu', icon: UtensilsCrossed },
  { to: '/', label: 'Accueil', icon: Home },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:gap-2 lg:p-4 lg:bg-white lg:border-r lg:border-gray-100">
      <h2 className="px-3 pt-2 pb-4 font-display text-xl font-bold text-secondary-900">Navigation</h2>
      {links.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={label}
            to={to}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
              active ? 'bg-secondary-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
