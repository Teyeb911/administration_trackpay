import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCommercants,
  getCommercantDetail,
  updateCommercant,
  suspendreCommercant,
  activerCommercant,
  deleteCommercant,
} from '@/lib/api/commercants.api'
import type { CommercantsFilters } from '@/lib/api/commercants.api'

export const useCommercants = (filters: CommercantsFilters = {}) =>
  useQuery({
    queryKey: ['commercants', filters],
    queryFn: () => getCommercants(filters),
  })

export const useCommercantDetail = (id: number) =>
  useQuery({
    queryKey: ['commercant', id],
    queryFn: () => getCommercantDetail(id),
    enabled: !!id,
  })

export const useUpdateCommercant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateCommercant>[1] }) =>
      updateCommercant(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['commercants'] })
      qc.invalidateQueries({ queryKey: ['commercant', id] })
    },
  })
}

export const useSuspendreCommercant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suspendreCommercant(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['commercants'] })
      qc.invalidateQueries({ queryKey: ['commercant', id] })
    },
  })
}

export const useActiverCommercant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => activerCommercant(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['commercants'] })
      qc.invalidateQueries({ queryKey: ['commercant', id] })
    },
  })
}

export const useDeleteCommercant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCommercant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commercants'] }),
  })
}

export const useToggleCommercant = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      isActive ? activerCommercant(id) : suspendreCommercant(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['commercants'] })
      qc.invalidateQueries({ queryKey: ['commercant', id] })
    },
  })
}
