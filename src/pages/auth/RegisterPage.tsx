import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChefHat } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import authImage from '../../assets/login_register.webp';
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
        await new Promise((r) => setTimeout(r, 400));
        const result = registerUser({ name: data.name, email: data.email, password: data.password });
        if (!result.ok) {
            setFormError(result.error ?? "Impossible de créer le compte.");
            setLoading(false);
            return;
        }
        const redirect = new URLSearchParams(location.search).get('redirect');
        navigate(redirect || '/', { replace: true });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-secondary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl">
                <div className="grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl bg-white">
                    <div className="relative min-h-44 md:min-h-[640px]">
                        <img src={authImage} alt="Linguere" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/85 via-secondary-900/35 to-transparent" />
                        <div className="relative h-full p-8 md:p-10 flex flex-col justify-between">
                            <div className="inline-flex items-center gap-2 text-white/90">
                                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                                    <ChefHat size={20} className="text-white" />
                                </div>
                                <span className="font-display text-2xl font-bold">Linguere</span>
                            </div>
                            <div className="max-w-sm">
                                <p className="text-white/90 text-sm font-medium">Créer un accès</p>
                                <h2 className="text-white font-display text-4xl font-bold mt-2">Espace gestion</h2>
                                <p className="text-white/80 mt-3 text-sm leading-relaxed">
                                    Inscris-toi pour commander et suivre tes commandes. (Le dashboard est réservé à l'admin.)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <h1 className="text-2xl font-bold text-secondary-900">Inscription</h1>
                        <p className="text-gray-500 text-sm mt-1">Créer un compte de gestion.</p>

                        {formError && (
                            <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                            <Input
                                label="Nom complet"
                                placeholder="Ex: Aïssatou Diop"
                                error={errors.name?.message}
                                {...register('name', { required: 'Le nom est requis' })}
                            />
                            <Input
                                label="Adresse email"
                                type="email"
                                placeholder="client@linguere.sn"
                                error={errors.email?.message}
                                {...register('email', {
                                    required: "L'email est requis",
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                                })}
                            />
                            <Input
                                label="Mot de passe"
                                type="password"
                                placeholder="Minimum 6 caractères"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Le mot de passe est requis',
                                    minLength: { value: 6, message: 'Minimum 6 caractères' },
                                })}
                            />
                            <Input
                                label="Confirmer le mot de passe"
                                type="password"
                                placeholder="Confirme ton mot de passe"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    required: 'La confirmation est requise',
                                    validate: (v) => v === password || 'Les mots de passe ne correspondent pas',
                                })}
                            />
                            <Button className="w-full" size="lg" loading={loading} type="submit">
                                Créer un compte
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Déjà inscrit ?{' '}
                            <Link to="/login" className="text-primary-500 hover:underline">
                                Connexion
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
