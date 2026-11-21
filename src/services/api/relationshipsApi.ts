import axios from 'axios'
import type { Relationship, RelationshipStats } from '@/types/campaign'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchRelationships = async (params?: {
  sourceType?: string
  sourceId?: string
  targetType?: string
  targetId?: string
  relationshipType?: string
}): Promise<Relationship[]> => {
  try {
    const response = await axios.get<Relationship[]>(
      `${API_BASE_URL}/api/relationships`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch relationships:', error)
    throw error
  }
}

export const fetchRelationshipStats = async (): Promise<RelationshipStats> => {
  try {
    const response = await axios.get<RelationshipStats>(
      `${API_BASE_URL}/api/relationships/stats`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch relationship stats:', error)
    throw error
  }
}

export const createRelationship = async (
  relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/relationships`,
      relationship
    )
    return response.data
  } catch (error) {
    console.error('Failed to create relationship:', error)
    throw error
  }
}

export const deleteRelationship = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/relationships/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to delete relationship ${id}:`, error)
    throw error
  }
}
