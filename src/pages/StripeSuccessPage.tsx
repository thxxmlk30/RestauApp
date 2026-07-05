import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { restaurantApi } from '../services/restaurantApi';

export default function StripeSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confirmation du paiement en cours...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');

    if (!orderId || !sessionId) {
      setMessage('Paiement simulé confirmé.');
      setLoading(false);
      return;
    }

    restaurantApi
      .confirmStripePayment(orderId, sessionId)
      .then(() => setMessage('Paiement confirmé avec succès.'))
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Impossible de confirmer le paiement.'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fcfbfa_0%,#f7f4f0_100%)] px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          {loading ? <Loader2 className="h-8 w-8 animate-spin text-emerald-600" /> : <CheckCircle2 className="h-8 w-8 text-emerald-600" />}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-secondary-900">Paiement Stripe</h1>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={() => navigate('/mes-commandes')}>
            Voir mes commandes
          </Button>
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Retour accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
