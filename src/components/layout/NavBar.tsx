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

  const accountPath = user?.role === 'customer' ? '/mes-commandes' : '/dashboard';
  const accountLabel = user?.role === 'customer' ? 'Mes commandes' : 'Dashboard';

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-white/40 bg-white/82 shadow-lg backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Accueil">
            <div className="soft-3d flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
              <img src={logo} alt="Linguere" className="h-8 w-8" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-primary-600">Linguere</span>
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">dakar food delivery</div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/#menu" className="text-gray-700 transition-colors hover:text-primary-600">
              Menu
            </Link>
            <Link to="/#about" className="text-gray-700 transition-colors hover:text-primary-600">
              A propos
            </Link>
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={openCart}>
              <ShoppingCart size={16} className="mr-2" />
              Panier
              {itemCount > 0 && (
                <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <>
                <Link to={accountPath}>
                  <Button variant="outline" size="sm">
                    {accountLabel}
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={logout}>
                  Deconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100 hover:text-primary-600 md:hidden"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="pb-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link to="/#menu" className="text-gray-700 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                Menu
              </Link>
              <Link to="/#about" className="text-gray-700 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                A propos
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  openCart();
                  setIsOpen(false);
                }}
              >
                <ShoppingCart size={16} className="mr-2" />
                Panier
                {itemCount > 0 && <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">{itemCount}</span>}
              </Button>
              {isAuthenticated ? (
                <>
                  <Link to={accountPath} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      {accountLabel}
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
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
                    <Button variant="primary" size="sm" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
