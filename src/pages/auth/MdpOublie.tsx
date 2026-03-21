import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { ChefHat, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotForm {
    email: string;
}

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>();

    const onSubmit = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-secondary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
                        <ChefHat size={32} className="text-white" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white">La Belle Assiette</h1>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    {!submitted ? (
                        <>
                            <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition">
                                <ArrowLeft size={16} /> Retour à la connexion
                            </Link>

                            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Mot de passe oublié ?</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Entrez votre email pour recevoir un lien de réinitialisation.
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Adresse email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary-500 transition`}
                                        {...register('email', {
                                            required: 'L\'email est requis',
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' }
                                        })}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>

                                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                                    Envoyer le lien
                                </Button>
                            </form>
                        </>
                    ) : (
                        // Écran de confirmation
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-2">Email envoyé !</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
                            </p>
                            <Link to="/login">
                                <Button variant="outline" size="md" className="w-full">
                                    Retour à la connexion
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}