import axios from 'axios'
import type { Indicator, IndicatorStats } from '@/types/campaign'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchIndicators = async (params?: {
  type?: string
  threatType?: string
  severity?: string
  active?: boolean
  search?: string
}): Promise<Indicator[]> => {
  try {
    const response = await axios.get<Indicator[]>(
      `${API_BASE_URL}/api/indicators`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch indicators:', error)
    throw error
  }
}

export const fetchIndicator = async (id: string): Promise<Indicator> => {
  try {
    const response = await axios.get<Indicator>(
      `${API_BASE_URL}/api/indicators/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch indicator ${id}:`, error)
    throw error
  }
}

export const fetchIndicatorStats = async (): Promise<IndicatorStats> => {
  try {
    const response = await axios.get<IndicatorStats>(
      `${API_BASE_URL}/api/indicators/stats`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch indicator stats:', error)
    throw error
  }
}

export const createIndicator = async (
  indicator: Omit<Indicator, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string; indicator: Indicator }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/indicators`,
      indicator
    )
    return response.data
  } catch (error) {
    console.error('Failed to create indicator:', error)
    throw error
  }
}

export const createIndicatorsBulk = async (indicators: Omit<Indicator, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{
  message: string
  count: number
}> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/indicators/bulk`,
      { indicators }
    )
    return response.data
  } catch (error) {
    console.error('Failed to bulk create indicators:', error)
    throw error
  }
}

export const deleteIndicator = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/indicators/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to delete indicator ${id}:`, error)
    throw error
  }
}
