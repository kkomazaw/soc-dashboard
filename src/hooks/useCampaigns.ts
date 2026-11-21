import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCampaigns,
  fetchCampaign,
  fetchCampaignGraph,
  fetchCampaignStats,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '@/services/api/campaignsApi'
import type { Campaign } from '@/types/campaign'

export const useCampaigns = (params?: {
  status?: string
  objective?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => fetchCampaigns(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => fetchCampaign(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export const useCampaignGraph = (id: string) => {
  return useQuery({
    queryKey: ['campaignGraph', id],
    queryFn: () => fetchCampaignGraph(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export const useCampaignStats = () => {
  return useQuery({
    queryKey: ['campaignStats'],
    queryFn: fetchCampaignStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useCreateCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) =>
      createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaignStats'] })
    },
  })
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Campaign> }) =>
      updateCampaign(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['campaignStats'] })
    },
  })
}

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaignStats'] })
    },
  })
}
