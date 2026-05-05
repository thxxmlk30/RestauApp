import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';

interface ForgotForm {
  email: string;
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
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AuthShell
      title="Mot de passe oublie"
      description="Renseignez votre email pour recevoir un lien de reinitialisation et reprendre votre parcours sans friction."
      asideLabel="Recuperation"
      asideTitle="Recuperez votre acces rapidement."
      asideDescription="Le meme principe visuel, en plein ecran, avec un flux de recuperation plus respirant et plus lisible."
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline">
          <ArrowLeft size={16} />
          Retour a la connexion
        </Link>
      }
    >
      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              type="email"
              placeholder="votre@email.com"
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

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full rounded-2xl">
            Envoyer le lien
          </Button>
        </form>
      ) : (
        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <CheckCircle2 size={30} className="text-emerald-500" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-secondary-900">Email envoye</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Verifiez votre boite mail et suivez les instructions pour reinitialiser votre mot de passe.
          </p>
          <Link to="/login" className="mt-6 inline-flex">
            <Button variant="outline" className="rounded-2xl">
              Retour a la connexion
            </Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
