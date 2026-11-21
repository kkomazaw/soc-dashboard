import axios from 'axios'
import type {
  Campaign,
  CampaignStats,
  CampaignGraph,
} from '@/types/campaign'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchCampaigns = async (params?: {
  status?: string
  objective?: string
  search?: string
}): Promise<Campaign[]> => {
  try {
    const response = await axios.get<Campaign[]>(
      `${API_BASE_URL}/api/campaigns`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    throw error
  }
}

export const fetchCampaign = async (id: string): Promise<Campaign> => {
  try {
    const response = await axios.get<Campaign>(
      `${API_BASE_URL}/api/campaigns/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch campaign ${id}:`, error)
    throw error
  }
}

export const fetchCampaignGraph = async (id: string): Promise<CampaignGraph> => {
  try {
    const response = await axios.get<CampaignGraph>(
      `${API_BASE_URL}/api/campaigns/${id}/graph`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch campaign graph for ${id}:`, error)
    throw error
  }
}

export const fetchCampaignStats = async (): Promise<CampaignStats> => {
  try {
    const response = await axios.get<CampaignStats>(
      `${API_BASE_URL}/api/campaigns/stats`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch campaign stats:', error)
    throw error
  }
}

export const createCampaign = async (
  campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; campaign: Campaign }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/campaigns`,
      campaign
    )
    return response.data
  } catch (error) {
    console.error('Failed to create campaign:', error)
    throw error
  }
}

export const updateCampaign = async (
  id: string,
  updates: Partial<Campaign>
): Promise<{ message: string; campaign: Campaign }> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/campaigns/${id}`,
      updates
    )
    return response.data
  } catch (error) {
    console.error(`Failed to update campaign ${id}:`, error)
    throw error
  }
}

export const deleteCampaign = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/campaigns/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to delete campaign ${id}:`, error)
    throw error
  }
}
