import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIndicators,
  fetchIndicator,
  fetchIndicatorStats,
  createIndicator,
  createIndicatorsBulk,
  deleteIndicator,
} from '@/services/api/indicatorsApi'
import type { Indicator } from '@/types/campaign'

export const useIndicators = (params?: {
  type?: string
  threatType?: string
  severity?: string
  active?: boolean
  search?: string
}) => {
  return useQuery({
    queryKey: ['indicators', params],
    queryFn: () => fetchIndicators(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useIndicator = (id: string) => {
  return useQuery({
    queryKey: ['indicator', id],
    queryFn: () => fetchIndicator(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export const useIndicatorStats = () => {
  return useQuery({
    queryKey: ['indicatorStats'],
    queryFn: fetchIndicatorStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useCreateIndicator = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (indicator: Omit<Indicator, 'id' | 'createdAt' | 'updatedAt'>) =>
      createIndicator(indicator),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] })
      queryClient.invalidateQueries({ queryKey: ['indicatorStats'] })
    },
  })
}

export const useCreateIndicatorsBulk = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (indicators: Omit<Indicator, 'id' | 'createdAt' | 'updatedAt'>[]) =>
      createIndicatorsBulk(indicators),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] })
      queryClient.invalidateQueries({ queryKey: ['indicatorStats'] })
    },
  })
}

export const useDeleteIndicator = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicators'] })
      queryClient.invalidateQueries({ queryKey: ['indicatorStats'] })
    },
  })
}
