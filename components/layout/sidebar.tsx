'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ArrowLeftRight,
  CreditCard, ShieldCheck, LogOut, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/auth.store'
import { logout } from '@/lib/api/auth.api'

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/commercants',  label: 'Marchands',      icon: Users },
  { href: '/transactions', label: 'Transactions',   icon: ArrowLeftRight },
  { href: '/abonnements',  label: 'Abonnements',    icon: CreditCard },
  { href: '/kyc',          label: 'KYC',            icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, refreshToken, logout: clearAuth } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try { if (refreshToken) await logout(refreshToken) } finally {
      clearAuth()
      document.cookie = 'access_token=; path=/; max-age=0'
      router.push('/login')
    }
  }

  const initials = user?.nom
    ? user.nom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  return (
    <aside className="flex h-screen w-60 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight">TrackPay</span>
          <span className="ml-2 rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-transform', active ? '' : 'group-hover:scale-110')} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.nom || 'Admin'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
