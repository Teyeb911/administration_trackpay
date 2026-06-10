import { Users, ArrowLeftRight, TrendingUp, Activity } from 'lucide-react'

interface DashboardData {
  total_commercants: number
  total_transactions: number
  recent_transactions: unknown[]
}

interface CardConfig {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  iconColor: string
}

export function StatsCards({ stats }: { stats: DashboardData }) {
  const cards: CardConfig[] = [
    {
      label: 'Total marchands',
      value: stats.total_commercants.toLocaleString('fr-FR'),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total transactions',
      value: stats.total_transactions.toLocaleString('fr-FR'),
      icon: ArrowLeftRight,
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map(({ label, value, icon: Icon, bg, iconColor, color }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className={`absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full bg-gradient-to-br ${color} opacity-5`} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`rounded-xl ${bg} p-3`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
