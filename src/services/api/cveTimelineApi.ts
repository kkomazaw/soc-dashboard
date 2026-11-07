import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface TimelineEvent {
  date: string
  type: 'published' | 'added_to_kev' | 'advisory' | 'updated' | 'patch_available'
  source: 'nvd' | 'cisa' | 'jvn' | 'redhat'
  title: string
  description?: string
  severity?: string
  cvssScore?: number
  url?: string
  advisoryId?: string
}

export interface CveInfo {
  cveId: string
  foundInSources: {
    nvd: boolean
    cisa: boolean
    jvn: boolean
    redhat: boolean
  }
  summary: string
  severity: string
  cvssScore: number | null
}

export interface CveTimelineResponse {
  cveInfo: CveInfo
  timeline: TimelineEvent[]
  totalEvents: number
}

export interface CveSearchResult {
  cveId: string
  description: string
  publishedDate: string
  severity?: string
  cvssScore?: number | null
  sources: string[]
}

export interface CveSearchResponse {
  query: string
  results: CveSearchResult[]
  total: number
}

/**
 * Get timeline data for a specific CVE
 */
export const getCveTimeline = async (cveId: string): Promise<CveTimelineResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/cve/${cveId}/timeline`)
  return response.data
}

/**
 * Search for CVEs across all sources
 */
export const searchCves = async (query: string): Promise<CveSearchResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/cve/search`, {
    params: { query },
  })
  return response.data
}
