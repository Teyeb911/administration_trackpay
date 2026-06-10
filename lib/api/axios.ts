import axios from 'axios'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://config-ap28-1mhk.onrender.com/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attache le token Bearer à chaque requête
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('trackpay-admin-auth')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`
      }
    }
  }
  return config
})

// Désenveloppe les réponses { success, message, data: T } → T
api.interceptors.response.use((res) => {
  if (res.data && typeof res.data === 'object' && 'data' in res.data && 'success' in res.data) {
    res.data = res.data.data
  }
  return res
})

// Refresh automatique sur 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const stored = localStorage.getItem('trackpay-admin-auth')
        if (!stored) throw new Error('No refresh token')
        const { state } = JSON.parse(stored)
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: state.refreshToken,
        })
        // Met à jour le store Zustand via localStorage
        const updated = { ...JSON.parse(stored), state: { ...state, accessToken: data.access } }
        localStorage.setItem('trackpay-admin-auth', JSON.stringify(updated))
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('trackpay-admin-auth')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
