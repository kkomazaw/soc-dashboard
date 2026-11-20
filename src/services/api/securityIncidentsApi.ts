import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface SecurityIncident {
  id: string
  name: string
  alternateName?: string
  discoveryDate: string
  publicDisclosure?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'vulnerability' | 'malware' | 'apt' | 'supply-chain' | 'zero-day' | 'ransomware'
  description: string
  affectedSystems: string[]
  relatedCVEs: string[]
  threatActors?: string[]
  mitigations: string[]
  references: Array<{ title: string; url: string }>
  impact?: string
  status: 'active' | 'contained' | 'mitigated'
}

export interface SecurityIncidentStats {
  total: number
  active: number
  critical: number
}

/**
 * Fetch all security incidents
 */
export const fetchSecurityIncidents = async (): Promise<SecurityIncident[]> => {
  try {
    const response = await axios.get<SecurityIncident[]>(
      `${API_BASE_URL}/api/security-incidents`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch security incidents:', error)
    throw error
  }
}

/**
 * Fetch security incidents with filters
 */
export const fetchSecurityIncidentsWithFilters = async (params: {
  severity?: string
  category?: string
  status?: string
  days?: number
}): Promise<SecurityIncident[]> => {
  try {
    const response = await axios.get<SecurityIncident[]>(
      `${API_BASE_URL}/api/security-incidents`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch security incidents with filters:', error)
    throw error
  }
}

/**
 * Fetch a single security incident by ID
 */
export const fetchSecurityIncidentById = async (id: string): Promise<SecurityIncident> => {
  try {
    const response = await axios.get<SecurityIncident>(
      `${API_BASE_URL}/api/security-incidents/${id}`
    )
    return response.data
  } catch (error) {
    console.error(`Failed to fetch security incident ${id}:`, error)
    throw error
  }
}

/**
 * Refresh security incidents from threat intelligence feeds
 */
export const refreshSecurityIncidents = async (): Promise<{ message: string; count: number }> => {
  try {
    const response = await axios.post<{ message: string; count: number }>(
      `${API_BASE_URL}/api/security-incidents/refresh`
    )
    return response.data
  } catch (error) {
    console.error('Failed to refresh security incidents:', error)
    throw error
  }
}

/**
 * Initialize security incidents database
 */
export const initializeSecurityIncidents = async (): Promise<{ message: string; count: number }> => {
  try {
    const response = await axios.post<{ message: string; count: number }>(
      `${API_BASE_URL}/api/security-incidents/initialize`
    )
    return response.data
  } catch (error) {
    console.error('Failed to initialize security incidents:', error)
    throw error
  }
}

/**
 * Update security incident status
 */
export const updateSecurityIncidentStatus = async (
  id: string,
  status: 'active' | 'contained' | 'mitigated'
): Promise<{ message: string; incident: { id: string; status: string } }> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/security-incidents/${id}/status`,
      { status }
    )
    return response.data
  } catch (error) {
    console.error(`Failed to update incident ${id} status:`, error)
    throw error
  }
}

/**
 * Fetch security incident statistics
 */
export const fetchSecurityIncidentStats = async (): Promise<SecurityIncidentStats> => {
  try {
    const response = await axios.get<SecurityIncidentStats>(
      `${API_BASE_URL}/api/security-incidents/stats`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch security incident stats:', error)
    throw error
  }
}
