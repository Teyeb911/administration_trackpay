import type { TransactionStatut, TransactionType } from '@/lib/types/transaction.types'
import { cn } from '@/lib/utils/cn'

const statutConfig: Record<TransactionStatut, { label: string; dot: string; className: string }> = {
  success:   { label: 'Succès',     dot: 'bg-emerald-500', className: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  pending:   { label: 'En attente', dot: 'bg-amber-400',   className: 'border-amber-100 bg-amber-50 text-amber-700' },
  failed:    { label: 'Échoué',     dot: 'bg-red-500',     className: 'border-red-100 bg-red-50 text-red-600' },
  cancelled: { label: 'Annulé',     dot: 'bg-slate-400',   className: 'border-slate-200 bg-slate-100 text-slate-600' },
}

const typeConfig: Record<TransactionType, { label: string; className: string }> = {
  interne:    { label: 'Interne',    className: 'border-blue-100 bg-blue-50 text-blue-700' },
  externe:    { label: 'Externe',    className: 'border-purple-100 bg-purple-50 text-purple-700' },
  chargement: { label: 'Chargement', className: 'border-teal-100 bg-teal-50 text-teal-700' },
}

const defaultStatut = { label: '—', dot: 'bg-slate-300', className: 'border-slate-200 bg-slate-100 text-slate-500' }
const defaultType   = { label: '—', className: 'border-slate-200 bg-slate-100 text-slate-500' }

export function StatutBadge({ statut }: { statut: TransactionStatut }) {
  const c = statutConfig[statut] ?? defaultStatut
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', c.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}

export function TypeBadge({ type }: { type: TransactionType }) {
  const c = typeConfig[type] ?? defaultType
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', c.className)}>
      {c.label}
    </span>
  )
}
