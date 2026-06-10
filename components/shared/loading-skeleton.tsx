import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}
