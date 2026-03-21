{ errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p> }
            </div >

    {/* Lien mot de passe oublié */ }
    < div className = "text-right" >
        <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">
            Mot de passe oublié ?
        </Link>
            </div >

    {/* Bouton submit */ }
    < Button type = "submit" variant = "primary" size = "lg" loading = { loading } className = "w-full" >
        Se connecter
            </Button >
          </form >

    <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary-500 font-medium hover:underline">
            S'inscrire
        </Link>
    </p>

{/* Hint pour les tests */ }
<div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
    <strong>Demo :</strong> admin@restaurant.com / admin123
</div>
        </div >
      </div >
    </div >
  );
}