import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setFormError('');
    await new Promise((resolve) => setTimeout(resolve, 350));
    const result = registerUser({ name: data.name, email: data.email, password: data.password });
    if (!result.ok) {
      setFormError(result.error ?? 'Impossible de creer le compte.');
      setLoading(false);
      return;
    }
    const redirect = new URLSearchParams(location.search).get('redirect');
    navigate(redirect || '/', { replace: true });
    setLoading(false);
  };

  return (
    <AuthShell
      title="Inscription"
      description="Creez votre compte client pour commander plus vite, suivre vos livraisons et retrouver vos favoris."
      asideLabel="Nouveau compte"
      asideTitle="Un acces plus simple a la commande."
      asideDescription="Le parcours reste dans la meme charte, mais l ecran entier travaille pour guider l inscription et la prochaine commande."
      footer={
        <p className="text-sm text-gray-500">
          Deja inscrit ?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Se connecter
          </Link>
        </p>
      }
    >
      {formError ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{formError}</div> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nom complet"
          placeholder="Ex: Aissatou Diop"
          error={errors.name?.message}
          className="rounded-2xl"
          {...register('name', { required: 'Le nom est requis' })}
        />
        <Input
          label="Adresse email"
          type="email"
          placeholder="client@linguere.sn"
          error={errors.email?.message}
          className="rounded-2xl"
          {...register('email', {
            required: "L'email est requis",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
          })}
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="Minimum 6 caracteres"
          error={errors.password?.message}
          className="rounded-2xl"
          {...register('password', {
            required: 'Le mot de passe est requis',
            minLength: { value: 6, message: 'Minimum 6 caracteres' },
          })}
        />
        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Retapez votre mot de passe"
          error={errors.confirmPassword?.message}
          className="rounded-2xl"
          {...register('confirmPassword', {
            required: 'La confirmation est requise',
            validate: (value) => value === password || 'Les mots de passe ne correspondent pas',
          })}
        />

        <Button className="mt-2 w-full rounded-2xl" size="lg" loading={loading} type="submit">
          Creer un compte
        </Button>
      </form>
    </AuthShell>
  );
}
