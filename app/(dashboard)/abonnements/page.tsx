'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { useAbonnements } from '@/lib/hooks/use-abonnements'
import { formatDateShort } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const planConfig: Record<string, { label: string; className: string }> = {
  gratuit:    { label: 'Gratuit',    className: 'border-slate-200 bg-slate-100 text-slate-600' },
  basic:      { label: 'Basic',      className: 'border-blue-100 bg-blue-50 text-blue-700' },
  pro:        { label: 'Pro',        className: 'border-purple-100 bg-purple-50 text-purple-700' },
  enterprise: { label: 'Enterprise', className: 'border-orange-100 bg-orange-50 text-orange-700' },
}

const statutConfig: Record<string, { label: string; dot: string; className: string }> = {
  'actif':   { label: 'Actif',    dot: 'bg-emerald-500', className: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  'expiré':  { label: 'Expiré',   dot: 'bg-amber-400',   className: 'border-amber-100 bg-amber-50 text-amber-700' },
  'résilié': { label: 'Résilié',  dot: 'bg-red-500',     className: 'border-red-100 bg-red-50 text-red-600' },
}

export default function AbonnementsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useAbonnements(page)

  return (
    <div className="flex flex-col">
      <Header title="Abonnements" subtitle="Plans actifs des marchands" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        {isLoading && <TableSkeleton />}
        {isError && <ErrorState message="Impossible de charger les abonnements." onRetry={refetch} />}

        {data && (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Marchand</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Email</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Plan</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Statut</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Début</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Expiration</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 hidden xl:table-cell">Auto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                        Aucun abonnement trouvé
                      </td>
                    </tr>
                  ) : (
                    data.results.map((ab) => {
                      const planKey = typeof ab.plan === 'object' ? ab.plan.type : ab.plan
                      const plan = planConfig[planKey] ?? { label: planKey, className: 'border-slate-200 bg-slate-100 text-slate-600' }
                      const statut = statutConfig[ab.statut] ?? { label: ab.statut, dot: 'bg-slate-400', className: 'border-slate-200 bg-slate-100 text-slate-600' }
                      return (
                        <tr key={ab.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 sm:px-5">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                                {(ab.commercant_nom ?? ab.commercant_email ?? '?')[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800 truncate max-w-[80px] sm:max-w-none">{ab.commercant_nom}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{ab.commercant_email}</td>
                          <td className="px-4 py-3.5 sm:px-5">
                            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', plan.className)}>
                              {plan.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 sm:px-5">
                            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', statut.className)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', statut.dot)} />
                              {statut.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                            {formatDateShort(ab.date_debut)}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                            {ab.date_expiration ? formatDateShort(ab.date_expiration) : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-center hidden xl:table-cell">
                            <span className={cn(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                              ab.auto_renouvellement
                                ? 'border-blue-100 bg-blue-50 text-blue-600'
                                : 'border-slate-200 bg-slate-50 text-slate-400'
                            )}>
                              {ab.auto_renouvellement ? 'Oui' : 'Non'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} count={data.count} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
