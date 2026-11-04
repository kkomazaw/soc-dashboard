import axios from 'axios'

const API_BASE = 'http://localhost:3001/api/mapping'

export interface CveTechniqueMapping {
  id: number
  cveId: string
  techniqueId: string
  source: string
  confidence: string
  matchType: string
  matchDetails: {
    matchedKeywords?: string[]
    matchedTactics?: string[]
  } | null
  technique: {
    id: string
    name: string
    description: string | null
    tactics: string[]
    url: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export interface MappingStats {
  total: number
  uniqueCves: number
  uniqueTechniques: number
  bySource: Record<string, number>
  byConfidence: Record<string, number>
}

/**
 * Get ATT&CK technique mappings for a specific CVE
 */
export const getCveMappings = async (cveId: string) => {
  const response = await axios.get(`${API_BASE}/cve/${cveId}`)
  return response.data
}

/**
 * Get CVEs mapped to a specific ATT&CK technique
 */
export const getTechniqueCves = async (techniqueId: string) => {
  const response = await axios.get(`${API_BASE}/technique/${techniqueId}`)
  return response.data
}

/**
 * Get all CVE-to-ATT&CK mappings
 */
export const getAllMappings = async (): Promise<CveTechniqueMapping[]> => {
  const response = await axios.get(`${API_BASE}/all`)
  return response.data
}

/**
 * Get mapping statistics
 */
export const getMappingStats = async (): Promise<MappingStats> => {
  const response = await axios.get(`${API_BASE}/stats`)
  return response.data
}

/**
 * Trigger mapping for all vulnerabilities
 */
export const triggerMappingAll = async () => {
  const response = await axios.post(`${API_BASE}/trigger/all`)
  return response.data
}

/**
 * Trigger mapping for CISA KEV only
 */
export const triggerMappingCisa = async () => {
  const response = await axios.post(`${API_BASE}/trigger/cisa`)
  return response.data
}

/**
 * Trigger mapping for JVN only
 */
export const triggerMappingJvn = async () => {
  const response = await axios.post(`${API_BASE}/trigger/jvn`)
  return response.data
}

/**
 * Trigger mapping for NVD only
 */
export const triggerMappingNvd = async () => {
  const response = await axios.post(`${API_BASE}/trigger/nvd`)
  return response.data
}
