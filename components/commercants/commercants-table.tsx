'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useCommercants } from '@/lib/hooks/use-commercants'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { formatDateShort } from '@/lib/utils/format'
import { Eye, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { resolveKycStatus } from '@/lib/types/user.types'

const kycConfig = {
  verified: { label: 'Vérifié',    className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  pending:  { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  failed:   { label: 'Échoué',     className: 'bg-red-50 text-red-600 border-red-100' },
}

const KYC_FILTERS = ['all', 'pending', 'verified', 'failed'] as const

export function CommercantsTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<typeof KYC_FILTERS[number]>('all')

  const { data, isLoading, isError, refetch } = useCommercants({
    page,
    search: search || undefined,
    kyc_status: kycFilter === 'all' ? undefined : kycFilter,
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleKyc = (v: typeof KYC_FILTERS[number]) => { setKycFilter(v); setPage(1) }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative w-full sm:flex-1 sm:min-w-52">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 overflow-x-auto">
          <SlidersHorizontal className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
          {KYC_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleKyc(f)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                kycFilter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'verified' ? 'Vérifiés' : 'Échoués'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <TableSkeleton />}
      {isError && <ErrorState message="Impossible de charger les marchands." onRetry={refetch} />}

      {data && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">Marchand</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Téléphone</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-5">KYC</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 table-cell sm:px-5">Statut</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Inscrit</th>
                  <th className="px-4 py-3.5 sm:px-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.results.filter((c) =>
                  kycFilter === 'all' || resolveKycStatus(c) === kycFilter
                ).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                      Aucun marchand trouvé
                    </td>
                  </tr>
                ) : (
                  data.results
                  .filter((c) => kycFilter === 'all' || resolveKycStatus(c) === kycFilter)
                  .map((c) => {
                    const kyc = kycConfig[resolveKycStatus(c)]
                    return (
                      <tr key={c.id} className="group hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                              {(c.nom || c.email)[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 truncate max-w-[90px] sm:max-w-none">{c.nom || '—'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell max-w-[160px]">
                          <span className="block truncate">{c.email}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell">{c.telephone || '—'}</td>
                        <td className="px-4 py-3.5 sm:px-5">
                          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', kyc.className)}>
                            {kyc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 table-cell sm:px-5">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            c.is_active
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                              : 'border-red-100 bg-red-50 text-red-600'
                          )}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', c.is_active ? 'bg-emerald-500' : 'bg-red-500')} />
                            {c.is_active ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">
                          {formatDateShort(c.created_at)}
                        </td>
                        <td className="px-4 py-3.5 text-right sm:px-5">
                          <Link
                            href={`/commercants/${c.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
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
  )
}
