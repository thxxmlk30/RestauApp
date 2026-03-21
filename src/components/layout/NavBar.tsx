import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-bold text-primary-500">
            La Belle Assiette
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-gray-600 hover:text-primary-500 transition-colors text-sm font-medium">Menu</a>
            <a href="#avis" className="text-gray-600 hover:text-primary-500 transition-colors text-sm font-medium">Avis</a>
            <a href="#about" className="text-gray-600 hover:text-primary-500 transition-colors text-sm font-medium">À propos</a>
          </div>

          {/* Bouton accès dashboard */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
          </div>

          {/* Menu hamburger mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#menu" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Menu</a>
              <a href="#avis" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Avis</a>
              <a href="#about" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>À propos</a>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Connexion</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}