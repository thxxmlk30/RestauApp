import { Menu, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-linguere.svg';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, openCart } = useCart();

  const isClient = user?.role === 'customer' || user?.role === 'client';
  const accountPath = isClient ? '/mes-commandes' : '/dashboard';
  const accountLabel = isClient ? 'Mes commandes' : 'Dashboard';

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-white/50 bg-white/88 shadow-lg backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Accueil">
            <div className="soft-3d flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white">
              <img src={logo} alt="Linguere" className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-display text-xl font-bold text-primary-600 sm:text-2xl">Linguere</span>
              <div className="truncate text-[10px] uppercase tracking-[0.24em] text-gray-400 sm:text-[11px]">dakar food delivery</div>
            </div>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/#menu" className="rounded-full px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-primary-600">
              Menu
            </Link>
            <Link to="/#about" className="rounded-full px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-primary-600">
              A propos
            </Link>
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={openCart}>
              <ShoppingCart size={16} className="mr-2" />
              Panier
              {itemCount > 0 ? (
                <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Button>

            {isAuthenticated ? (
              <>
                <Link to={accountPath}>
                  <Button variant="outline" size="sm" className="rounded-full">
                    {accountLabel}
                  </Button>
                </Link>
                <Button variant="primary" size="sm" className="rounded-full" onClick={logout}>
                  Deconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="rounded-full">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
              onClick={openCart}
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart size={18} />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 justify-center rounded-full bg-primary-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:border-primary-200 hover:text-primary-600"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="pb-4 lg:hidden">
            <div className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-lg">
              <div className="grid gap-3">
                <Link to="/#menu" className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>
                  Menu
                </Link>
                <Link to="/#about" className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700" onClick={() => setIsOpen(false)}>
                  A propos
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to={accountPath} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full rounded-2xl">
                        {accountLabel}
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full rounded-2xl"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      Deconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full rounded-2xl">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full rounded-2xl">
                        Inscription
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
