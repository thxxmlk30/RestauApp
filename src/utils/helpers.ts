export function formatCurrency(value: number) {
  const amount = Math.round(value);
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} FCFA`;
}

export function formatTimeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `il y a ${hours} h`;
}
