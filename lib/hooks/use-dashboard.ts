import { useQuery } from '@tanstack/react-query'
import { getCommercants } from '@/lib/api/commercants.api'
import { getAllTransactions } from '@/lib/api/transactions.api'

export function useDashboard() {
  const commercants = useQuery({
    queryKey: ['dashboard-commercants'],
    queryFn: () => getCommercants({ page: 1 }),
    refetchInterval: 60_000,
  })

  const transactions = useQuery({
    queryKey: ['dashboard-transactions'],
    queryFn: () => getAllTransactions({ page: 1 }),
    refetchInterval: 60_000,
  })

  const isLoading = commercants.isLoading || transactions.isLoading
  const isError = commercants.isError || transactions.isError

  const data =
    commercants.data && transactions.data
      ? {
          total_commercants: commercants.data.count,
          total_transactions: transactions.data.count,
          recent_transactions: transactions.data.results.slice(0, 8),
        }
      : undefined

  const refetch = () => {
    commercants.refetch()
    transactions.refetch()
  }

  return { data, isLoading, isError, refetch }
}
