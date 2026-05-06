import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
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

function getWrapClass(hasError: boolean) {
  return `auth-input-wrap ${hasError ? '!border-rose-300 !bg-rose-50' : ''}`;
}

export default function LoginPage() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);
  const [error, setError] = useState('');
  const [providerNotice, setProviderNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: 'admin@linguere.sn',
      password: 'Linguere1234',
    },
  });

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
    setProviderNotice('');
    await new Promise((resolve) => setTimeout(resolve, 450));
    const success = login(data.email, data.password, rememberUser);
    if (!success) setError('Email ou mot de passe incorrect.');
    setLoading(false);
  };

  return (
    <AuthShell
      eyebrow="Connexion"
      title="Bon retour !"
      description="Connectez-vous a votre espace de gestion pour suivre vos commandes, piloter l activite et retrouver vos donnees."
      footer={
        <div className="space-y-4">
          <p className="text-center text-sm text-[#6b7280]">
            Pas de compte ?{' '}
            <Link to="/register" className="font-semibold text-primary-600 transition hover:text-primary-700">
              S&apos;inscrire &rarr;
            </Link>
          </p>
          <div className="rounded-[24px] border border-[#efe5da] bg-[#fcfaf7] p-4 text-sm text-[#6b7280]">
            <p className="font-auth text-sm font-semibold text-secondary-900">Compte demo</p>
            <p className="mt-1">
              Admin : <span className="font-mono text-secondary-900">admin@linguere.sn</span> /{' '}
              <span className="font-mono text-secondary-900">Linguere1234</span>
            </p>
          </div>
        </div>
      }
    >
      {error ? <div className="mb-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-secondary-900">Adresse email</label>
          <div className={getWrapClass(!!errors.email)}>
            <span className="auth-icon-badge">
              <Mail size={16} />
            </span>
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@linguere.sn"
              className="auth-input-inner"
              {...register('email', {
                required: "L'email est requis",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
              })}
            />
          </div>
          {errors.email ? <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p> : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-secondary-900">Mot de passe</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 transition hover:text-primary-700">
              Oublie ?
            </Link>
          </div>
          <div className={getWrapClass(!!errors.password)}>
            <span className="auth-icon-badge">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Votre mot de passe"
              className="auth-input-inner"
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: { value: 6, message: 'Minimum 6 caracteres' },
              })}
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#8b8177] transition hover:bg-white hover:text-secondary-900"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p> : null}
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#6b7280]">
          <input
            type="checkbox"
            checked={rememberUser}
            onChange={(event) => setRememberUser(event.target.checked)}
            className="h-4 w-4 rounded border-[#d7ccbf] text-primary-500 focus:ring-primary-500"
          />
          <span>Se souvenir de moi</span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full gap-2 rounded-2xl !py-3.5 text-[15px] shadow-[0_18px_45px_rgba(244,139,74,0.34)]"
        >
          <span>Se connecter</span>
          {!loading ? <ArrowRight size={17} /> : null}
        </Button>
      </form>

      <div className="auth-divider">ou</div>

      <div>
        <button
          type="button"
          className="auth-social-button w-full"
          onClick={() => setProviderNotice('La connexion Google sera disponible dans une prochaine iteration.')}
        >
          <span className="text-lg font-bold text-[#4285F4]">G</span>
          <span>Google</span>
        </button>
      </div>

      {providerNotice ? (
        <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{providerNotice}</div>
      ) : null}
    </AuthShell>
  );
}
