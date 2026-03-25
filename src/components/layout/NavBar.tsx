import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import logo from '../../assets/logo-linguere.svg';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user;
  const logout = auth?.logout ?? (() => {});
  const { itemCount, openCart } = useCart();

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2" aria-label="Accueil">
            <img src={logo} alt="Linguere" className="h-9 w-9" />
            <span className="text-2xl font-bold text-primary-600">Linguere</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#menu" className="text-gray-700 hover:text-orange-600 transition-colors">
              Menu
            </Link>
            <Link to="/#about" className="text-gray-700 hover:text-orange-600 transition-colors">
              À propos
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCart}
            >
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
                {user?.role === 'admin' ? (
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                ) : (
                  <Link to="/mes-commandes">
                    <Button variant="outline" size="sm">Mes commandes</Button>
                  </Link>
                )}
                <Button variant="primary" size="sm" onClick={logout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="sm">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">Inscription</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/#menu"
                className="text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/#about"
                className="text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                À propos
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
                {itemCount > 0 && (
                  <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-primary-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </Button>

              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                    </Link>
                  ) : (
                    <Link to="/mes-commandes" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Mes commandes</Button>
                    </Link>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">Connexion</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Inscription</Button>
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
