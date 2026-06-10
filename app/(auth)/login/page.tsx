'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { login, getMe } from '@/lib/api/auth.api'
import { useAuthStore } from '@/lib/store/auth.store'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { access, refresh } = await login({ email, password })
      const user = await getMe(access)

      if (user.role !== 'admin') {
        toast.error('Accès refusé — compte admin requis.')
        return
      }

      setAuth(user, access, refresh)
      document.cookie = `access_token=${access}; path=/; max-age=3600; SameSite=Strict`
      router.push('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Email ou mot de passe incorrect.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TrackPay</span>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 border border-indigo-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Plateforme d&apos;administration
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Gérez votre<br />
            <span className="text-indigo-400">plateforme</span><br />
            en toute sécurité
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Supervise marchands, transactions, KYC et abonnements depuis un seul panneau de contrôle.
          </p>
        </div>
        <div className="flex items-center gap-6 text-slate-500 text-sm">
          <span>© 2026 TrackPay</span>
          <span>·</span>
          <span>Administration</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TrackPay</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
            <p className="mt-1 text-sm text-slate-500">Accédez à votre espace administrateur</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@trackpay.mr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion…
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
