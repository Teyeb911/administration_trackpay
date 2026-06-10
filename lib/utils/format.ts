const CURRENCY_SYMBOLS: Record<string, string> = {
  MRU: 'MRU',
  DZD: 'DA',
}

export function formatMontant(montant: number, currency = 'MRU'): string {
  const n = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(montant)
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${n} ${symbol}`
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}
