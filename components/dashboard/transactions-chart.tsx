'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Transaction } from '@/lib/types/transaction.types'
import { formatMontant } from '@/lib/utils/format'

interface Props {
  transactions: Transaction[]
}

export function TransactionsChart({ transactions }: Props) {
  const grouped = transactions.reduce<Record<string, { success: number; failed: number; pending: number }>>(
    (acc, tx) => {
      const date = new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      if (!acc[date]) acc[date] = { success: 0, failed: 0, pending: 0 }
      const val = Number(tx.montant_total ?? tx.montant ?? 0)
      if (tx.statut === 'success') acc[date].success += val
      else if (tx.statut === 'failed') acc[date].failed += val
      else if (tx.statut === 'pending') acc[date].pending += val
      return acc
    },
    {}
  )

  const chartData = Object.entries(grouped).map(([date, vals]) => ({ date, ...vals }))

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Volume des transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Répartition par statut</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Succès</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />En attente</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Échoué</span>
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          Pas encore de données
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="success" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
              formatter={(v) => formatMontant(Number(v))}
            />
            <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fill="url(#success)" />
            <Area type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} fill="url(#pending)" />
            <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="none" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
