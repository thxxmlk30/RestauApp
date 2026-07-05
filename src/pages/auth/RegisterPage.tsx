import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

function getWrapClass(hasError: boolean) {
  return `auth-input-wrap ${hasError ? '!border-rose-300 !bg-rose-50' : ''}`;
}

function getPasswordScore(password: string) {
  if (!password) return 0;

  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;
  return Math.max(1, Math.min(score, 4));
}

function getPasswordFeedback(score: number) {
  if (score <= 0) return 'Entrez un mot de passe';
  if (score === 1) return 'Faible';
  if (score === 2) return 'Correct';
  if (score === 3) return 'Solide';
  return 'Tres solide';
}

function getStrengthTone(score: number) {
  if (score <= 1) return 'bg-rose-400';
  if (score === 2) return 'bg-amber-400';
  if (score === 3) return 'bg-lime-500';
  return 'bg-emerald-500';
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
  });

  const password = watch('password', '');
  const passwordScore = getPasswordScore(password);
  const passwordTone = getStrengthTone(passwordScore);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setFormError('');

    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.replace(/\s+/g, ' ').trim();
    const result = await registerUser({ name: fullName, email: data.email, password: data.password });
    if (!result.ok) {
      setFormError(result.error ?? 'Impossible de creer le compte.');
      setLoading(false);
      return;
    }

    navigate('/', {
      replace: true,
      state: {
        signupSuccess: true,
        pendingEmail: result.email || data.email,
        devOtpCode: result.devOtpCode,
      },
    });
    setLoading(false);
  };

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Creer un compte"
      description="Rejoignez Linguere pour commander plus vite, suivre vos livraisons et retrouver vos preferences en un seul espace."
      footer={
        <p className="text-center text-sm text-[#6b7280]">
          Deja un compte ?{' '}
          <Link to="/login" className="font-semibold text-primary-600 transition hover:text-primary-700">
            Se connecter
          </Link>
        </p>
      }
    >
      {formError ? <div className="mb-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary-900">Prenom</label>
            <div className={getWrapClass(!!errors.firstName)}>
              <span className="auth-icon-badge">
                <User size={16} />
              </span>
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Awa"
                className="auth-input-inner"
                {...register('firstName', {
                  required: 'Le prenom est requis',
                  minLength: { value: 2, message: 'Minimum 2 caracteres' },
                })}
              />
            </div>
            {errors.firstName ? <p className="mt-1.5 text-xs text-rose-500">{errors.firstName.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-secondary-900">Nom</label>
            <div className={getWrapClass(!!errors.lastName)}>
              <span className="auth-icon-badge">
                <User size={16} />
              </span>
              <input
                type="text"
                autoComplete="family-name"
                placeholder="Ndiaye"
                className="auth-input-inner"
                {...register('lastName', {
                  required: 'Le nom est requis',
                  minLength: { value: 2, message: 'Minimum 2 caracteres' },
                })}
              />
            </div>
            {errors.lastName ? <p className="mt-1.5 text-xs text-rose-500">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-secondary-900">Email</label>
          <div className={getWrapClass(!!errors.email)}>
            <span className="auth-icon-badge">
              <Mail size={16} />
            </span>
            <input
              type="email"
              autoComplete="email"
              placeholder="awa@exemple.sn"
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
          <label className="mb-2 block text-sm font-medium text-secondary-900">Telephone</label>
          <div className={getWrapClass(!!errors.phone)}>
            <span className="auth-icon-badge">
              <Phone size={16} />
            </span>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+221 77 000 00 00"
              className="auth-input-inner"
              {...register('phone', {
                required: 'Le telephone est requis',
                minLength: { value: 8, message: 'Numero trop court' },
              })}
            />
          </div>
          {errors.phone ? <p className="mt-1.5 text-xs text-rose-500">{errors.phone.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-secondary-900">Mot de passe</label>
          <div className={getWrapClass(!!errors.password)}>
            <span className="auth-icon-badge">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 caracteres"
              className="auth-input-inner"
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: { value: 8, message: 'Minimum 8 caracteres' },
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
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${index < passwordScore ? passwordTone : 'bg-[#ede5da]'}`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-[#8b8177]">{getPasswordFeedback(passwordScore)}</p>
          {errors.password ? <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p> : null}
        </div>

        <Button
          className="mt-2 w-full gap-2 rounded-2xl !py-3.5 text-[15px] shadow-[0_18px_45px_rgba(244,139,74,0.34)]"
          size="lg"
          loading={loading}
          type="submit"
        >
          <span>Creer mon compte</span>
          {!loading ? <ArrowRight size={17} /> : null}
        </Button>
      </form>
    </AuthShell>
  );
}
