import { useMutation, useQueryClient } from '@tanstack/react-query'
import { validerKyc, rejeterKyc } from '@/lib/api/kyc.api'

export const useValiderKyc = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => validerKyc(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commercants'] })
      qc.invalidateQueries({ queryKey: ['commercant'] })
    },
  })
}

export const useRejeterKyc = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => rejeterKyc(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commercants'] })
      qc.invalidateQueries({ queryKey: ['commercant'] })
    },
  })
}
