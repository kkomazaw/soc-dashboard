import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface JvnVulnerability {
  id: number
  jvnId: string
  cveId: string | null
  title: string
  summary: string | null
  severity: string | null
  cvssScore: number | null
  cvssVector: string | null
  publishedDate: string | null
  lastModifiedDate: string | null
  affectedProducts: string | null
  references: string | null
  createdAt: string
  updatedAt: string
}

export interface JvnStats {
  total: number
  recent24h: number
  recent7days: number
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export interface JvnResponse {
  success: boolean
  data: JvnVulnerability[]
  stats: JvnStats
  timestamp: string
}

export interface JvnRecentResponse {
  success: boolean
  data: JvnVulnerability[]
  count: number
  days: number
  timestamp: string
}

export const getJvnVulnerabilities = async (): Promise<JvnResponse> => {
  const response = await axios.get<JvnResponse>(`${API_BASE_URL}/api/jvn`)
  return response.data
}

export const getRecentJvnVulnerabilities = async (days: number = 30): Promise<JvnRecentResponse> => {
  const response = await axios.get<JvnRecentResponse>(`${API_BASE_URL}/api/jvn/recent`, {
    params: { days },
  })
  return response.data
}

export const refreshJvnData = async (): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/jvn/refresh`)
  return response.data
}
