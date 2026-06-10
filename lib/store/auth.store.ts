'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types/user.types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, access: string, refresh: string) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken && get().user?.role === 'admin',
    }),
    { name: 'trackpay-admin-auth' }
  )
)
