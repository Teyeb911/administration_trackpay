'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TransactionsChart } from '@/components/dashboard/transactions-chart'
import { StatutBadge, TypeBadge } from '@/components/transactions/transaction-badge'
import { StatCardSkeleton, TableSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import { formatMontant, formatDate } from '@/lib/utils/format'
import { ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard()

  return (
    <div className="flex flex-col min-h-0">
      <Header title="Dashboard" subtitle="Vue d'ensemble de la plateforme TrackPay" />

      <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6 overflow-y-auto">
        {/* Stats */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        )}
        {isError && <ErrorState message="Impossible de charger le dashboard." onRetry={refetch} />}
        {data && <StatsCards stats={data} />}

        {data && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* Chart - 3/5 */}
            <div className="xl:col-span-3">
              <TransactionsChart transactions={data.recent_transactions} />
            </div>

            {/* Recent transactions - 2/5 */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-700">Dernières transactions</h3>
                <Link
                  href="/transactions"
                  className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Tout voir <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {data.recent_transactions.slice(0, 7).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-700">
                        {tx.expediteur_email ?? tx.reference ?? '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-semibold text-slate-800">
                        {formatMontant(Number(tx.montant_total ?? tx.montant ?? 0))}
                      </span>
                      <StatutBadge statut={tx.statut} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
