import { api } from './axios'
import type { Abonnement, PlanDisponible } from '@/lib/types/abonnement.types'
import type { PaginatedResponse } from '@/lib/types/user.types'

export async function getAllAbonnements(page = 1): Promise<PaginatedResponse<Abonnement>> {
  const { data } = await api.get<PaginatedResponse<Abonnement>>('/abonnements/all/', {
    params: { page },
  })
  return data
}

export async function getPlans(): Promise<PlanDisponible[]> {
  const { data } = await api.get<PlanDisponible[]>('/abonnements/plans/')
  return data
}
