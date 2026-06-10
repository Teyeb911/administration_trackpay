import { api } from './axios'
import type { Transaction, TransactionType, TransactionStatut } from '@/lib/types/transaction.types'
import type { PaginatedResponse } from '@/lib/types/user.types'

export interface TransactionFilters {
  type?: TransactionType
  statut?: TransactionStatut
  page?: number
}

export interface DashboardStats {
  total_transactions: number
  total_commercants: number
  total_montant: number
  transactions_today: number
  recent_transactions: Transaction[]
}

export async function getAllTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions/admin/all/', {
    params: { ...filters },
  })
  return data
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/transactions/dashboard/')
  return data
}
