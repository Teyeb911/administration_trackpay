'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { useCommercants } from '@/lib/hooks/use-commercants'
import { useValiderKyc } from '@/lib/hooks/use-kyc'
import { resolveKycStatus } from '@/lib/types/user.types'
import { formatDateShort } from '@/lib/utils/format'
import { ShieldCheck, ShieldAlert, ShieldX, Eye, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

type KycFilter = 'all' | 'pending' | 'verified' | 'failed'

const FILTERS: { value: KycFilter; label: string; icon: React.ElementType; color: string; active: string }[] = [
  { value: 'pending',  label: 'En attente', icon: ShieldAlert,  color: 'text-amber-500',  active: 'border-amber-200 bg-amber-50 text-amber-700' },
  { value: 'verified', label: 'Vérifiés',   icon: ShieldCheck,  color: 'text-emerald-500', active: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { value: 'failed',   label: 'Échoués',    icon: ShieldX,      color: 'text-red-500',     active: 'border-red-200 bg-red-50 text-red-600' },
  { value: 'all',      label: 'Tous',       icon: ShieldCheck,  color: 'text-slate-400',   active: 'border-slate-300 bg-slate-100 text-slate-700' },
]

const kycBadge = {
  verified: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  pending:  'border-amber-100 bg-amber-50 text-amber-700',
  failed:   'border-red-100 bg-red-50 text-red-600',
}

export default function KycPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<KycFilter>('pending')

  const { data, isLoading, isError, refetch } = useCommercants({
    page,
    kyc_status: filter === 'all' ? undefined : filter,
  })
  const allData = useCommercants({})
  const { mutate: valider, isPending: validating } = useValiderKyc()

  const counts = {
    pending:  allData.data?.results.filter((c) => resolveKycStatus(c) === 'pending').length ?? 0,
    verified: allData.data?.results.filter((c) => resolveKycStatus(c) === 'verified').length ?? 0,
    failed:   allData.data?.results.filter((c) => resolveKycStatus(c) === 'failed').length ?? 0,
  }

  const handleValider = (userId: number, nom: string) => {
    valider(userId, {
      onSuccess: () => {
        toast.success(`KYC validé pour ${nom}.`)
        setFilter('verified')
        setPage(1)
      },
      onError: () => toast.error('Impossible de valider ce KYC.'),
    })
  }

  return (
    <div className="flex flex-col">
      <Header title="KYC" subtitle="Vérification d'identité des marchands" />
      <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {/* Filter cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FILTERS.map(({ value, label, icon: Icon, color, active }) => {
            const count = value === 'all'
              ? (counts.pending + counts.verified + counts.failed)
              : counts[value as keyof typeof counts] ?? 0
            const isActive = filter === value
            return (
              <button
                key={value}
                onClick={() => { setFilter(value); setPage(1) }}
                className={cn(
                  'flex items-center gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4 text-left transition-all',
                  isActive ? active : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                )}
              >
                <div className={cn('rounded-xl p-1.5 sm:p-2', isActive ? 'bg-white/60' : 'bg-slate-50')}>
                  <Icon className={cn('h-4 w-4', isActive ? '' : color)} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-current opacity-60 sm:text-[11px]">{label}</p>
                  <p className="text-lg font-bold sm:text-xl">{count}</p>
                </div>
              </button>
            )
          })}
        </div>

        {isLoading && <TableSkeleton />}
        {isError && <ErrorState message="Impossible de charger les statuts KYC." onRetry={refetch} />}

        {data && (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Marchand</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Email</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Inscrit le</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Statut KYC</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Compte</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.results.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">
                        Aucun résultat pour ce filtre
                      </td>
                    </tr>
                  ) : (
                    data.results.map((c) => (
                      <tr key={c.id} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                              {(c.nom || c.email)[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 truncate max-w-[100px] sm:max-w-none">{c.nom || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{c.email}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{formatDateShort(c.created_at)}</td>
                        <td className="px-4 py-3.5 sm:px-5">
                          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', kycBadge[resolveKycStatus(c)])}>
                            {resolveKycStatus(c) === 'verified' ? 'Vérifié' : resolveKycStatus(c) === 'failed' ? 'Échoué' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            c.is_active ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-600'
                          )}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', c.is_active ? 'bg-emerald-500' : 'bg-red-500')} />
                            {c.is_active ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {resolveKycStatus(c) === 'pending' && (
                              <button
                                onClick={() => handleValider(c.id, c.nom)}
                                disabled={validating}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:px-3"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Valider</span>
                              </button>
                            )}
                            <Link
                              href={`/commercants/${c.id}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
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
    </div>
  )
}
