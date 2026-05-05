import type { ReactNode } from 'react';
import { ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import authImage from '../../assets/login_register.webp';

interface AuthShellProps {
  title: string;
  description: string;
  asideLabel: string;
  asideTitle: string;
  asideDescription: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({
  title,
  description,
  asideLabel,
  asideTitle,
  asideDescription,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1c1917_0%,#292524_38%,#fcfbfa_38%,#fcfbfa_100%)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden lg:block">
          <img src={authImage} alt="Linguere" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,25,23,0.92),rgba(28,25,23,0.62),rgba(232,89,60,0.24))]" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="inline-flex items-center gap-3 text-white" aria-label="Retour a l accueil">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 shadow-lg">
                <ChefHat size={22} className="text-white" />
              </div>
              <div>
                <div className="font-display text-3xl font-bold">Linguere</div>
                <div className="text-xs uppercase tracking-[0.28em] text-white/65">restaurant operations</div>
              </div>
            </Link>

            <div className="max-w-xl">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                {asideLabel}
              </div>
              <h2 className="mt-6 font-display text-5xl font-bold leading-tight text-white xl:text-6xl">{asideTitle}</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/78 xl:text-lg">{asideDescription}</p>
            </div>

            <div className="grid max-w-xl gap-4 xl:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-white/55">Client</div>
                <div className="mt-2 text-sm font-semibold text-white">Commande simplifiee</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-white/55">Equipe</div>
                <div className="mt-2 text-sm font-semibold text-white">Dashboard responsive</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-white/55">Livraison</div>
                <div className="mt-2 text-sm font-semibold text-white">Secteurs Dakar guides</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col bg-[#fcfbfa]">
          <div className="border-b border-gray-100 px-5 py-4 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3 text-secondary-900" aria-label="Retour a l accueil">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 shadow-lg">
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">Linguere</div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-gray-400">dakar food delivery</div>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
            <div className="w-full max-w-xl">
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.08)] sm:p-8 lg:p-10">
                <div className="mb-8">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600">{asideLabel}</div>
                  <h1 className="mt-3 text-3xl font-bold text-secondary-900 sm:text-4xl">{title}</h1>
                  <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">{description}</p>
                </div>

                {children}

                {footer ? <div className="mt-8 border-t border-gray-100 pt-6">{footer}</div> : null}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
