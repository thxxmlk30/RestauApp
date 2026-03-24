À propos
              </a>

              <Button
                type="button"
                variant={itemCount > 0 ? 'primary' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  openCart();
                }}
              >
                <ShoppingCart size={16} className="mr-2" />
                Panier{itemCount > 0 ? ` (${itemCount})` : ''}
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

      <CartModal />
    </nav>
  );
}