import { useQuery } from '@tanstack/react-query'
import { getAllTransactions, type TransactionFilters } from '@/lib/api/transactions.api'

export const useTransactions = (filters: TransactionFilters = {}) =>
  useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getAllTransactions(filters),
  })
