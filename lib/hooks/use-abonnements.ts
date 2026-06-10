import { useQuery } from '@tanstack/react-query'
import { getAllAbonnements } from '@/lib/api/abonnements.api'

export const useAbonnements = (page: number) =>
  useQuery({
    queryKey: ['abonnements', page],
    queryFn: () => getAllAbonnements(page),
  })
