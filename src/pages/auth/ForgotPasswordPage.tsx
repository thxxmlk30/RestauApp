import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, CheckCircle2, Key, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';

interface ForgotForm {
  email: string;
}

function getWrapClass(hasError: boolean) {
  return `auth-input-wrap ${hasError ? '!border-rose-300 !bg-rose-50' : ''}`;
}

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>();

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AuthShell
      eyebrow="Recuperation"
      headerIcon={
        <div className="inline-flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[#fff1e6] text-primary-600 shadow-[0_16px_34px_rgba(244,139,74,0.18)]">
          {submitted ? <CheckCircle2 size={28} /> : <Key size={28} />}
        </div>
      }
      title={submitted ? 'Lien envoye' : 'Reinitialiser'}
      description={
        submitted
          ? 'Verifiez votre boite mail et suivez les instructions pour reinitialiser votre mot de passe en toute securite.'
          : 'Entrez votre email pour recevoir un lien de reinitialisation securise et reprendre votre parcours rapidement.'
      }
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700">
          <ArrowLeft size={16} />
          Retour a la connexion
        </Link>
      }
    >
      {!submitted ? (
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
                  required: "L'email est requis",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                })}
              />
            </div>
            {errors.email ? <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p> : null}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full gap-2 rounded-2xl !py-3.5 text-[15px] shadow-[0_18px_45px_rgba(244,139,74,0.34)]"
          >
            <span>Envoyer le lien</span>
            {!loading ? <ArrowRight size={17} /> : null}
          </Button>
        </form>
      ) : (
        <div className="auth-appear rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <CheckCircle2 size={30} className="text-emerald-500" />
          </div>
          <h2 className="font-auth mt-4 text-2xl font-semibold text-secondary-900">Email envoye</h2>
          <p className="mt-3 text-sm leading-7 text-[#6b7280]">
            Ouvrez votre messagerie puis suivez le lien pour definir un nouveau mot de passe.
          </p>
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
