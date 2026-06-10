import { api } from './axios'
import type { User, CommercantDetail, PaginatedResponse } from '@/lib/types/user.types'

export interface CommercantsFilters {
  page?: number
  search?: string
  kyc_status?: 'pending' | 'verified' | 'failed'
}

export async function getCommercants(
  filters: CommercantsFilters = {}
): Promise<PaginatedResponse<User>> {
  const { data } = await api.get<PaginatedResponse<User>>('/auth/users/', {
    params: filters,
  })
  return data
}

export async function getCommercantDetail(id: number): Promise<CommercantDetail> {
  try {
    const { data } = await api.get<CommercantDetail>(`/auth/users/${id}/detail/`)
    return data
  } catch {
    // Fallback si l'endpoint /detail/ n'est pas encore implémenté
    const { data } = await api.get<CommercantDetail>(`/auth/users/${id}/`)
    return data
  }
}

export async function updateCommercant(
  id: number,
  payload: Partial<Pick<User, 'nom' | 'telephone' | 'adresse' | 'is_active'>>
): Promise<User> {
  const { data } = await api.patch<User>(`/auth/users/${id}/`, payload)
  return data
}

export async function suspendreCommercant(id: number): Promise<void> {
  await api.post(`/auth/users/${id}/suspendre/`)
}

export async function activerCommercant(id: number): Promise<void> {
  await api.post(`/auth/users/${id}/activer/`)
}

export async function deleteCommercant(id: number): Promise<void> {
  await api.delete(`/auth/users/${id}/`)
}
