'use client'

import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const qc = useQueryClient()
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = () => {
    setSpinning(true)
    qc.invalidateQueries()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={handleRefresh}
        title="Rafraîchir"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <RefreshCw className={cn('h-4 w-4 transition-transform duration-700', spinning && 'animate-spin')} />
      </button>
    </header>
  )
}
