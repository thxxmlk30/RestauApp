interface BadgeProps {
  status: 'en_attente' | 'en_traitement' | 'prete' | 'livree' | 'annulee';
}

const config = {
  en_attente:   { label: 'En attente',  class: 'bg-yellow-100 text-yellow-800' },
  en_traitement : { label: 'En cuisine',  class: 'bg-blue-100 text-blue-800' },
  prete:     { label: 'Prêt',        class: 'bg-green-100 text-green-800' },
  livree: { label: 'Livré',       class: 'bg-gray-100 text-gray-600' },
  annulee: { label: 'Annulé',      class: 'bg-red-100 text-red-700' },
};

export function Badge({ status }: BadgeProps) {
  const { label, class: cls } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}