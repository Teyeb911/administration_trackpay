'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PaginationProps {
  page: number
  count: number
  pageSize?: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, count, pageSize = 10, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-slate-400">
        <span className="font-medium text-slate-600">{count}</span> résultats — page{' '}
        <span className="font-medium text-slate-600">{page}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {p}
          </button>
        ))}

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
