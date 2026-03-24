import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import authImage from '../../assets/login_register.webp';

interface LoginForm {
    email: string;
    password: string;
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
        if (isAuthenticated && redirectTarget) {
            navigate(redirectTarget, { replace: true });
        } else if (isAuthenticated && user) {
            navigate(user.role === 'admin' ? '/dashboard' : '/mes-commandes', { replace: true });
        }
    }, [isAuthenticated, navigate, redirectTarget, user]);

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError('');
        await new Promise((r) => setTimeout(r, 800));
        const success = login(data.email, data.password);
        if (success) {
            // Navigation will be handled by the useEffect
        } else {
            setError('Email ou mot de passe incorrect');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-secondary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl">
                <div className="grid md:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl bg-white">
                    <div className="relative min-h-44 md:min-h-[560px]">
                        <img src={authImage} alt="THE Mbaxxal" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/85 via-secondary-900/35 to-transparent" />
                        <div className="relative h-full p-8 md:p-10 flex flex-col justify-between">
                            <div className="inline-flex items-center gap-2 text-white/90">
                                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                                    <ChefHat size={20} className="text-white" />
                                </div>
                                <span className="font-display text-2xl font-bold">THE Mbaxxal</span>
                            </div>
                            <div className="max-w-sm">
                                <p className="text-white/90 text-sm font-medium">Espace de gestion</p>
                                <h2 className="text-white font-display text-4xl font-bold mt-2">Commandes & menu</h2>
                                <p className="text-white/80 mt-3 text-sm leading-relaxed">
                                    Connecte-toi pour gérer les commandes en temps réel et mettre à jour le menu.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <h1 className="text-2xl font-bold text-secondary-900">Connexion</h1>
                        <p className="text-gray-500 text-sm mt-1">Bienvenue sur THE Mbaxxal.</p>

                        {error && (
                            <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                                <input
                                    type="email"
                                    placeholder="admin@thembaxxal.sn"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
                                    {...register('email', {
                                        required: "L'email est requis",
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                                    })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.password ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`}
                                        {...register('password', {
                                            required: 'Le mot de passe est requis',
                                            minLength: { value: 6, message: 'Minimum 6 caractères' },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <div className="text-right">
                                <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                                Se connecter
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-primary-500 font-medium hover:underline">
                                S'inscrire
                            </Link>
                        </p>

                        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                            <p className="font-semibold text-gray-600">Démo</p>
                            <p className="mt-1">Admin : <span className="font-mono">admin@restaurant.com</span> / <span className="font-mono">Resataurant1234</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
