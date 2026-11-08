import axios from 'axios'
import * as csv from 'csv-parse/sync'

const EPSS_API_BASE = 'https://api.first.org/data/v1'

export interface EpssScore {
  cve: string
  epss: number // 0.0 - 1.0 (probability of exploitation)
  percentile: number // 0.0 - 1.0
  date: string // YYYY-MM-DD
  model_version: string
}

interface EpssApiResponse {
  status: string
  'status-code': number
  version: string
  access: string
  total: number
  offset: number
  limit: number
  data: Array<{
    cve: string
    epss: string
    percentile: string
    date: string
    model_version?: string
  }>
}

/**
 * Fetch EPSS scores for specific CVEs
 * @param cveIds Array of CVE IDs (e.g., ['CVE-2021-44228', 'CVE-2021-45046'])
 */
export const fetchEpssScoresByCves = async (cveIds: string[]): Promise<EpssScore[]> => {
  try {
    if (cveIds.length === 0) {
      return []
    }

    console.log(`Fetching EPSS scores for ${cveIds.length} CVEs...`)

    // EPSS API accepts comma-separated CVE list
    const cveParam = cveIds.join(',')

    const response = await axios.get<EpssApiResponse>(`${EPSS_API_BASE}/epss`, {
      params: {
        cve: cveParam,
      },
      timeout: 30000,
    })

    if (response.data.status !== 'OK') {
      throw new Error(`EPSS API returned status: ${response.data.status}`)
    }

    const scores: EpssScore[] = response.data.data.map((item) => ({
      cve: item.cve,
      epss: parseFloat(item.epss),
      percentile: parseFloat(item.percentile),
      date: item.date,
      model_version: item.model_version || 'v2023.03.01',
    }))

    console.log(`Successfully fetched ${scores.length} EPSS scores`)
    return scores
  } catch (error: any) {
    console.error('Error fetching EPSS scores:', error.message)
    throw error
  }
}

/**
 * Fetch all EPSS scores for the latest date (bulk download)
 * This downloads all CVE scores in CSV format for efficiency
 */
export const fetchAllEpssScores = async (): Promise<EpssScore[]> => {
  try {
    console.log('Fetching all EPSS scores (bulk download)...')

    const response = await axios.get(`${EPSS_API_BASE}/epss`, {
      params: {
        scope: 'time-series',
        date: 'latest',
      },
      timeout: 60000,
    })

    if (response.data.status !== 'OK') {
      throw new Error(`EPSS API returned status: ${response.data.status}`)
    }

    const scores: EpssScore[] = response.data.data.map((item: any) => ({
      cve: item.cve,
      epss: parseFloat(item.epss),
      percentile: parseFloat(item.percentile),
      date: item.date,
      model_version: item.model_version || 'v2023.03.01',
    }))

    console.log(`Successfully fetched ${scores.length} EPSS scores (bulk)`)
    return scores
  } catch (error: any) {
    console.error('Error fetching all EPSS scores:', error.message)
    throw error
  }
}

/**
 * Fetch EPSS scores for a specific date
 * @param date Date string in YYYY-MM-DD format
 */
export const fetchEpssScoresByDate = async (date: string): Promise<EpssScore[]> => {
  try {
    console.log(`Fetching EPSS scores for date: ${date}...`)

    const response = await axios.get<EpssApiResponse>(`${EPSS_API_BASE}/epss`, {
      params: {
        scope: 'time-series',
        date,
      },
      timeout: 60000,
    })

    if (response.data.status !== 'OK') {
      throw new Error(`EPSS API returned status: ${response.data.status}`)
    }

    const scores: EpssScore[] = response.data.data.map((item) => ({
      cve: item.cve,
      epss: parseFloat(item.epss),
      percentile: parseFloat(item.percentile),
      date: item.date,
      model_version: item.model_version || 'v2023.03.01',
    }))

    console.log(`Successfully fetched ${scores.length} EPSS scores for ${date}`)
    return scores
  } catch (error: any) {
    console.error(`Error fetching EPSS scores for ${date}:`, error.message)
    throw error
  }
}

/**
 * Get the latest EPSS score date available
 */
export const getLatestEpssDate = async (): Promise<string> => {
  try {
    const response = await axios.get<EpssApiResponse>(`${EPSS_API_BASE}/epss`, {
      params: {
        limit: 1,
      },
      timeout: 10000,
    })

    if (response.data.status !== 'OK' || response.data.data.length === 0) {
      throw new Error('Failed to get latest EPSS date')
    }

    return response.data.data[0].date
  } catch (error: any) {
    console.error('Error getting latest EPSS date:', error.message)
    throw error
  }
}

/**
 * Interpret EPSS score into risk level
 */
export const interpretEpssScore = (epss: number): string => {
  if (epss >= 0.8) return 'Critical'
  if (epss >= 0.5) return 'High'
  if (epss >= 0.2) return 'Medium'
  return 'Low'
}

/**
 * Calculate combined risk score from CVSS and EPSS
 * @param cvss CVSS base score (0-10)
 * @param epss EPSS score (0-1)
 * @returns Combined risk score (0-100)
 */
export const calculateCombinedRiskScore = (cvss: number, epss: number): number => {
  // Weight: CVSS 60%, EPSS 40%
  return cvss * 10 * 0.6 + epss * 100 * 0.4
}

/**
 * Get risk level from combined score
 */
export const getRiskLevel = (score: number): string => {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}
