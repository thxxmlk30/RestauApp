import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, CheckCircle2, Key, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { restaurantApi } from '../../services/restaurantApi';

interface ForgotForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

function getWrapClass(hasError: boolean) {
  return `auth-input-wrap ${hasError ? '!border-rose-300 !bg-rose-50' : ''}`;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ForgotForm>();

  const newPassword = watch('newPassword', '');

  const title = useMemo(() => {
    if (step === 'done') return 'Mot de passe modifie';
    return step === 'reset' ? 'Reinitialiser' : 'Recuperation';
  }, [step]);

  const description = useMemo(() => {
    if (step === 'done') {
      return 'Votre mot de passe a ete mis a jour. Vous pouvez maintenant vous connecter.';
    }
    if (step === 'reset') {
      return 'Entrez le code recu par email et choisissez un nouveau mot de passe.';
    }
    return 'Entrez votre email pour recevoir un code de reinitialisation securise.';
  }, [step]);

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    setFormError('');

    try {
      if (step === 'request') {
        const result = await restaurantApi.forgotPassword(data.email);
        setEmail(data.email.trim().toLowerCase());
        reset({ email: data.email.trim().toLowerCase(), code: '', newPassword: '', confirmPassword: '' });
        setStep('reset');
        setFormError(result.message);
      } else if (data.newPassword !== data.confirmPassword) {
        setFormError('Les mots de passe ne correspondent pas.');
      } else {
        const result = await restaurantApi.resetPassword(email, data.code, data.newPassword);
        setStep('done');
        setFormError(result.message);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Operation impossible.');
    }

    setLoading(false);
  };

  return (
    <AuthShell
      eyebrow="Recuperation"
      headerIcon={
        <div className="inline-flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[#fff1e6] text-primary-600 shadow-[0_16px_34px_rgba(244,139,74,0.18)]">
          {step === 'done' ? <CheckCircle2 size={28} /> : <Key size={28} />}
        </div>
      }
      title={title}
      description={description}
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          <ArrowLeft size={16} />
          Retour a la connexion
        </Link>
      }
    >
      {formError ? <div className="mb-5 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{formError}</div> : null}

      {step !== 'done' ? (
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
                placeholder="votre@email.sn"
                className="auth-input-inner"
                {...register('email', {
                  required: step === 'request' ? "L'email est requis" : undefined,
                  pattern: step === 'request' ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } : undefined,
                })}
                disabled={step === 'reset'}
              />
            </div>
            {errors.email ? <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p> : null}
          </div>

          {step === 'reset' ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary-900">Code recu</label>
                <div className={getWrapClass(!!errors.code)}>
                  <span className="auth-icon-badge">
                    <Mail size={16} />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="auth-input-inner"
                    {...register('code', {
                      required: 'Le code est requis',
                      minLength: { value: 6, message: '6 chiffres requis' },
                    })}
                  />
                </div>
                {errors.code ? <p className="mt-1.5 text-xs text-rose-500">{errors.code.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary-900">Nouveau mot de passe</label>
                <div className={getWrapClass(!!errors.newPassword)}>
                  <span className="auth-icon-badge">
                    <Key size={16} />
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nouveau mot de passe"
                    className="auth-input-inner"
                    {...register('newPassword', {
                      required: 'Le mot de passe est requis',
                      minLength: { value: 6, message: 'Minimum 6 caracteres' },
                    })}
                  />
                </div>
                {errors.newPassword ? <p className="mt-1.5 text-xs text-rose-500">{errors.newPassword.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary-900">Confirmer le mot de passe</label>
                <div className={getWrapClass(!!errors.confirmPassword)}>
                  <span className="auth-icon-badge">
                    <Key size={16} />
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirmer le mot de passe"
                    className="auth-input-inner"
                    {...register('confirmPassword', {
                      required: 'Confirmation requise',
                      validate: (value) => value === newPassword || 'Les mots de passe ne correspondent pas',
                    })}
                  />
                </div>
                {errors.confirmPassword ? <p className="mt-1.5 text-xs text-rose-500">{errors.confirmPassword.message}</p> : null}
              </div>
            </>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full gap-2 rounded-2xl !py-3.5 text-[15px] shadow-[0_18px_45px_rgba(244,139,74,0.34)]"
          >
            <span>{step === 'reset' ? 'Reinitialiser le mot de passe' : 'Envoyer le code'}</span>
            {!loading ? <ArrowRight size={17} /> : null}
          </Button>
        </form>
      ) : (
        <div className="auth-appear rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <CheckCircle2 size={30} className="text-emerald-500" />
          </div>
          <h2 className="font-auth mt-4 text-2xl font-semibold text-secondary-900">Mot de passe mis a jour</h2>
          <p className="mt-3 text-sm leading-7 text-[#6b7280]">Vous pouvez maintenant revenir a la connexion avec votre nouveau mot de passe.</p>
          <Link to="/login" className="mt-6 inline-flex">
            <Button variant="outline" className="rounded-2xl border-[#f48b4a] px-6 text-primary-600">
              Retour a la connexion
            </Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
