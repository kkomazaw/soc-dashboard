import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchThreatActors,
  fetchThreatActor,
  fetchThreatActorCampaigns,
  fetchThreatActorStats,
  createThreatActor,
  deleteThreatActor,
} from '@/services/api/threatActorsApi'
import type { ThreatActor } from '@/types/campaign'

export const useThreatActors = (params?: {
  type?: string
  origin?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['threatActors', params],
    queryFn: () => fetchThreatActors(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useThreatActor = (id: string) => {
  return useQuery({
    queryKey: ['threatActor', id],
    queryFn: () => fetchThreatActor(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export const useThreatActorCampaigns = (id: string) => {
  return useQuery({
    queryKey: ['threatActorCampaigns', id],
    queryFn: () => fetchThreatActorCampaigns(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export const useThreatActorStats = () => {
  return useQuery({
    queryKey: ['threatActorStats'],
    queryFn: fetchThreatActorStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useCreateThreatActor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (actor: Omit<ThreatActor, 'id' | 'createdAt' | 'updatedAt'>) =>
      createThreatActor(actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threatActors'] })
      queryClient.invalidateQueries({ queryKey: ['threatActorStats'] })
    },
  })
}

export const useDeleteThreatActor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteThreatActor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threatActors'] })
      queryClient.invalidateQueries({ queryKey: ['threatActorStats'] })
    },
  })
}
