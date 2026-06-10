'use client'

import { Menu, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from '@/lib/context/sidebar-context'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const qc = useQueryClient()
  const { toggle } = useSidebar()
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = () => {
    setSpinning(true)
    qc.invalidateQueries()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h1>
          {subtitle && <p className="hidden sm:block text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
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
