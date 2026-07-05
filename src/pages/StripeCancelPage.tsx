import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function StripeCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fcfbfa_0%,#f7f4f0_100%)] px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-gray-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-secondary-900">Paiement annulé</h1>
        <p className="mt-3 text-sm text-gray-600">Vous pouvez relancer le paiement quand vous voulez depuis vos commandes.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/mes-commandes" className="flex-1">
            <Button className="w-full">Mes commandes</Button>
          </Link>
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
