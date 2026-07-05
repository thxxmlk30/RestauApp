import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { restaurantApi } from '../../services/restaurantApi';

interface VerifyForm {
  email: string;
  code: string;
}

function getWrapClass(hasError: boolean) {
  return `auth-input-wrap ${hasError ? '!border-rose-300 !bg-rose-50' : ''}`;
}

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string>(location.state?.devOtpCode ?? '');
  const presetEmail = new URLSearchParams(location.search).get('email') ?? '';
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyForm>({
    defaultValues: {
      email: presetEmail,
    },
  });

  const onSubmit = async (data: VerifyForm) => {
    setLoading(true);
    setFormError('');
    setInfoMessage('');
    try {
      await restaurantApi.verifyOtp(data.email.trim().toLowerCase(), data.code.trim());
      setSuccess(true);
      setTimeout(() => navigate('/login?verified=1', { replace: true }), 1200);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Verification impossible.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    const email = (watch('email') ?? presetEmail).trim().toLowerCase();
    if (!email) {
      setFormError("Renseignez l'email avant de renvoyer un code.");
      return;
    }

    setResendLoading(true);
    setFormError('');
    setInfoMessage('');

    try {
      const response = await restaurantApi.requestOtp(email);
      setInfoMessage(response.message);
      if (response.devOtpCode) {
        setDevOtpCode(response.devOtpCode);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Impossible de renvoyer le code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Verification"
      headerIcon={
        <div className="inline-flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[#fff1e6] text-primary-600 shadow-[0_16px_34px_rgba(244,139,74,0.18)]">
          {success ? <CheckCircle2 size={28} /> : <ShieldCheck size={28} />}
        </div>
      }
      title={success ? 'Compte active' : 'Verifier le code'}
      description={success ? 'Votre email est confirme. Vous pouvez maintenant vous connecter.' : 'Entrez le code recu par email pour activer votre compte.'}
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          <ArrowLeft size={16} />
          Retour a la connexion
        </Link>
      }
    >
      {formError ? <div className="mb-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
      {infoMessage ? <div className="mb-5 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div> : null}

      {devOtpCode ? (
        <div className="mb-5 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Mode développement: votre code OTP est <span className="font-bold">{devOtpCode}</span>
        </div>
      ) : null}

      {!success ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary-900">Adresse email</label>
            <div className={getWrapClass(!!errors.email)}>
              <span className="auth-icon-badge">
                <ShieldCheck size={16} />
              </span>
              <input
                type="email"
                autoComplete="email"
                placeholder="votre@email.sn"
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
            <label className="mb-2 block text-sm font-medium text-secondary-900">Code OTP</label>
            <div className={getWrapClass(!!errors.code)}>
              <span className="auth-icon-badge">
                <ShieldCheck size={16} />
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full gap-2 rounded-2xl !py-3.5 text-[15px] shadow-[0_18px_45px_rgba(244,139,74,0.34)]"
          >
            <span>Verifier le code</span>
            {!loading ? <ArrowRight size={17} /> : null}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            loading={resendLoading}
            className="w-full gap-2 rounded-2xl !py-3.5 text-[15px]"
            onClick={resendCode}
          >
            <RefreshCw size={17} />
            Renvoyer un code
          </Button>
        </form>
      ) : (
        <div className="auth-appear rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <CheckCircle2 size={30} className="text-emerald-500" />
          </div>
          <h2 className="font-auth mt-4 text-2xl font-semibold text-secondary-900">Compte active</h2>
          <p className="mt-3 text-sm leading-7 text-[#6b7280]">Nous vous redirigeons vers la connexion...</p>
        </div>
      )}
    </AuthShell>
  );
}
