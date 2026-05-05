import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

function getPostLoginPath(role?: string) {
  return role === 'customer' ? '/mes-commandes' : '/dashboard';
}

export default function LoginPage() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const redirectTarget = useMemo(() => {
    const redirect = new URLSearchParams(location.search).get('redirect');
    if (redirect && redirect.startsWith('/')) return redirect;
    return null;
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate(redirectTarget || getPostLoginPath(user.role), { replace: true });
  }, [isAuthenticated, navigate, redirectTarget, user]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const success = login(data.email, data.password);
    if (!success) setError('Email ou mot de passe incorrect.');
    setLoading(false);
  };

  return (
    <AuthShell
      title="Connexion"
      description="Connectez-vous pour suivre vos commandes ou acceder a l espace operationnel selon votre role."
      asideLabel="Acces securise"
      asideTitle="Pilotez le service ou commandez sans friction."
      asideDescription="Le meme univers visuel, avec un parcours d acces plein ecran, plus net sur mobile comme sur desktop."
      footer={
        <div className="space-y-3 text-sm text-gray-500">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:underline">
              Creer un compte
            </Link>
          </p>
          <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Compte demo</p>
            <p className="mt-1">
              Admin: <span className="font-mono">admin@linguere.sn</span> / <span className="font-mono">Linguere1234</span>
            </p>
          </div>
        </div>
      }
    >
      {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Adresse email</label>
          <input
            type="email"
            placeholder="admin@linguere.sn"
            className={`w-full rounded-2xl border px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-rose-400' : 'border-gray-200'
            }`}
            {...register('email', {
              required: "L'email est requis",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
            })}
          />
          {errors.email ? <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p> : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
              Mot de passe oublie ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre mot de passe"
              className={`w-full rounded-2xl border px-4 py-3 pr-12 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? 'border-rose-400' : 'border-gray-200'
              }`}
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: { value: 6, message: 'Minimum 6 caracteres' },
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p> : null}
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-2xl">
          Se connecter
        </Button>
      </form>
    </AuthShell>
  );
}
