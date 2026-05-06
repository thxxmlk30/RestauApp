import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthShellProps {
  title: string;
  description: string;
  eyebrow?: string;
  headerIcon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

const platformHighlights = [
  'Gestion commandes temps reel',
  'Suivi livraison sur carte',
  'IA Chef - recommandations intelligentes',
  'Rapports automatises PDF/Excel',
  'Gestion stock avec alertes',
];

export default function AuthShell({
  title,
  description,
  eyebrow,
  headerIcon,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="auth-shell min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative overflow-hidden bg-[linear-gradient(180deg,#111827_0%,#172033_100%)] px-5 py-6 sm:px-8 sm:py-8 lg:min-h-screen lg:px-10 lg:py-10 xl:px-14 xl:py-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,139,74,0.24),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(74,222,128,0.14),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]"
          />
          <div className="relative z-10 flex h-full min-h-[46vh] flex-col gap-10 lg:min-h-0">
            <Link to="/" className="inline-flex w-fit items-center gap-3 text-white" aria-label="Retour au site">
              <div className="font-auth flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-lg font-extrabold text-white shadow-[0_18px_38px_rgba(244,139,74,0.36)]">
                L
              </div>
              <div>
                <div className="font-auth text-lg font-bold text-white">Linguere</div>
                <div className="text-[11px] font-medium text-primary-400">&larr; Retour au site</div>
              </div>
            </Link>

            <div className="relative z-10 flex flex-1 items-center">
              <div className="max-w-[420px]">
                <h2 className="font-auth text-[2.35rem] font-extrabold leading-[1.08] text-white sm:text-[2.85rem] xl:text-[3.2rem]">
                  Bienvenue
                  <br />
                  dans l&apos;ere de la
                  <br />
                  <span className="text-primary-500">gestion intelligente</span>
                </h2>
                <p className="mt-5 max-w-[320px] text-sm leading-7 text-[#9ca3af]">
                  Dashboard, commandes, stock, personnel et IA - tout en un pour gerer votre restaurant comme un pro.
                </p>
                <div className="mt-8 space-y-3">
                  {platformHighlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3 text-sm text-[#d1d5db]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/16 text-emerald-400">
                        <Check size={14} />
                      </span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-[320px] rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="text-[11px] text-[#6b7280]">Utilise par</div>
              <div className="font-auth mt-1 text-[1.65rem] font-bold text-white">200+ restaurants</div>
              <div className="text-sm text-[#9ca3af]">en Afrique de l&apos;Ouest</div>
            </div>
          </div>
        </aside>

        <main className="relative flex items-center justify-center overflow-hidden bg-[#f4efe7] px-5 py-8 sm:px-6 lg:min-h-screen lg:border-l lg:border-[#decebc] lg:px-10 xl:px-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.72),transparent_16%),radial-gradient(circle_at_86%_22%,rgba(244,139,74,0.16),transparent_18%)]"
          />
          <div className="auth-appear relative z-10 w-full max-w-[520px]">
            <div className="mb-8">
              {eyebrow ? (
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600">{eyebrow}</div>
              ) : null}
              {headerIcon ? <div className="mb-5">{headerIcon}</div> : null}
              <h1 className="font-auth text-[2rem] font-semibold leading-tight text-secondary-900 sm:text-[2.4rem]">{title}</h1>
              <p className="mt-3 text-sm leading-7 text-[#6b7280] sm:text-[15px]">{description}</p>
            </div>

            {children}

            {footer ? <div className="mt-7 border-t border-[#dfd1c2] pt-6">{footer}</div> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
