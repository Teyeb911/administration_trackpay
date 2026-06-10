'use client'

import { useState } from 'react'
import { useTransactions } from '@/lib/hooks/use-transactions'
import { StatutBadge, TypeBadge } from './transaction-badge'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { formatMontant, formatDate } from '@/lib/utils/format'
import type { TransactionStatut, TransactionType } from '@/lib/types/transaction.types'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const TYPE_OPTS = [
  { value: 'all', label: 'Tous types' },
  { value: 'interne', label: 'Interne' },
  { value: 'externe', label: 'Externe' },
  { value: 'chargement', label: 'Chargement' },
]

const STATUT_OPTS = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'success', label: 'Succès' },
  { value: 'pending', label: 'En attente' },
  { value: 'failed', label: 'Échoué' },
  { value: 'cancelled', label: 'Annulé' },
]

export function TransactionsTable() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<TransactionType | 'all'>('all')
  const [statut, setStatut] = useState<TransactionStatut | 'all'>('all')

  const { data, isLoading, isError, refetch } = useTransactions({
    page,
    type: type === 'all' ? undefined : type,
    statut: statut === 'all' ? undefined : statut,
  })

  const changeType = (v: string) => { setType(v as TransactionType | 'all'); setPage(1) }
  const changeStatut = (v: string) => { setStatut(v as TransactionStatut | 'all'); setPage(1) }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 pr-2">
          <SlidersHorizontal className="ml-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={type}
            onChange={(e) => changeType(e.target.value)}
            className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer py-1"
          >
            {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 pr-2">
          <select
            value={statut}
            onChange={(e) => changeStatut(e.target.value)}
            className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer py-1 px-2"
          >
            {STATUT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState message="Impossible de charger les transactions." onRetry={refetch} />}

      {data && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Référence</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Expéditeur</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Récepteur</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Montant</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden xl:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                      Aucune transaction trouvée
                    </td>
                  </tr>
                ) : (
                  data.results.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
                          {tx.reference}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">
                        {tx.expediteur_email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">
                        {tx.recepteur_email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                        {formatMontant(Number(tx.montant_total ?? tx.montant ?? 0))}
                      </td>
                      <td className="px-5 py-3.5"><TypeBadge type={tx.type} /></td>
                      <td className="px-5 py-3.5"><StatutBadge statut={tx.statut} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 hidden xl:table-cell">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
