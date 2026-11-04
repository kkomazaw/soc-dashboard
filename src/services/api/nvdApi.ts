import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface NvdCve {
  id: number
  cveId: string
  sourceIdentifier: string | null
  published: string
  lastModified: string
  vulnStatus: string | null
  description: string | null
  cvssScore: number | null
  cvssSeverity: string | null
  cvssVector: string | null
  cvssVersion: string | null
  weaknesses: string | null // JSON string
  references: string | null // JSON string
  createdAt: string
  updatedAt: string
}

export interface NvdStats {
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

export interface NvdResponse {
  success: boolean
  data: NvdCve[]
  stats: NvdStats
  timestamp: string
}

export interface NvdRecentResponse {
  success: boolean
  data: NvdCve[]
  count: number
  days: number
  timestamp: string
}

export interface NvdStatusResponse {
  success: boolean
  configured: boolean
  stats: NvdStats
  message: string
  timestamp: string
}

export const getNvdCves = async (): Promise<NvdResponse> => {
  const response = await axios.get<NvdResponse>(`${API_BASE_URL}/api/nvd`)
  return response.data
}

export const getRecentNvdCves = async (days: number = 30): Promise<NvdRecentResponse> => {
  const response = await axios.get<NvdRecentResponse>(`${API_BASE_URL}/api/nvd/recent`, {
    params: { days },
  })
  return response.data
}

export const searchNvdCve = async (cveId: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/api/nvd/search/${cveId}`)
  return response.data
}

export const refreshNvdData = async (days: number = 7): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/nvd/refresh`, null, {
    params: { days },
  })
  return response.data
}

export const getNvdApiStatus = async (): Promise<NvdStatusResponse> => {
  const response = await axios.get<NvdStatusResponse>(`${API_BASE_URL}/api/nvd/status`)
  return response.data
}
