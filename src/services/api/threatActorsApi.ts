import axios from 'axios'
import type { ThreatActor, ThreatActorStats, Campaign } from '@/types/campaign'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchThreatActors = async (params?: {
  type?: string
  origin?: string
  search?: string
}): Promise<ThreatActor[]> => {
  try {
    const response = await axios.get<ThreatActor[]>(
      `${API_BASE_URL}/api/threat-actors`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch threat actors:', error)
    throw error
  }
}

export const fetchThreatActor = async (id: string): Promise<ThreatActor> => {
  try {
    const response = await axios.get<ThreatActor>(
      `${API_BASE_URL}/api/threat-actors/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch threat actor ${id}:`, error)
    throw error
  }
}

export const fetchThreatActorCampaigns = async (id: string): Promise<Campaign[]> => {
  try {
    const response = await axios.get<Campaign[]>(
      `${API_BASE_URL}/api/threat-actors/${id}/campaigns`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch campaigns for threat actor ${id}:`, error)
    throw error
  }
}

export const fetchThreatActorStats = async (): Promise<ThreatActorStats> => {
  try {
    const response = await axios.get<ThreatActorStats>(
      `${API_BASE_URL}/api/threat-actors/stats`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch threat actor stats:', error)
    throw error
  }
}

export const createThreatActor = async (
  actor: Omit<ThreatActor, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; actor: ThreatActor }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/threat-actors`,
      actor
    )
    return response.data
  } catch (error) {
    console.error('Failed to create threat actor:', error)
    throw error
  }
}

export const deleteThreatActor = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/threat-actors/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to delete threat actor ${id}:`, error)
    throw error
  }
}
