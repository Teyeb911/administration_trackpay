import axios from 'axios'
import { api } from './axios'
import type { User } from '@/lib/types/user.types'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://config-ap28-1mhk.onrender.com/api/v1'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user?: User
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login/', payload)
  return data
}

interface ApiResponse<T> { success: boolean; data: T }

export async function getMe(token?: string): Promise<User> {
  if (token) {
    const { data } = await axios.get<ApiResponse<User>>(`${BASE_URL}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.data
  }
  const { data } = await api.get<User>('/auth/me/')
  return data
}

export async function logout(refresh: string): Promise<void> {
  await api.post('/auth/logout/', { refresh })
}
