import axios from 'axios'

const NVD_API_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0'
const NVD_API_KEY = process.env.NVD_API_KEY

// Rate limits: With API key: 50 requests in a rolling 30 second window
// Without API key: 5 requests in a rolling 30 second window
const RATE_LIMIT_DELAY = NVD_API_KEY ? 700 : 6500 // milliseconds between requests

export interface NvdCveItem {
  id: string // CVE ID
  sourceIdentifier: string
  published: string
  lastModified: string
  vulnStatus: string
  descriptions: Array<{
    lang: string
    value: string
  }>
  metrics?: {
    cvssMetricV31?: Array<{
      type: string
      cvssData: {
        version: string
        vectorString: string
        baseScore: number
        baseSeverity: string
      }
    }>
    cvssMetricV2?: Array<{
      type: string
      cvssData: {
        version: string
        vectorString: string
        baseScore: number
        baseSeverity: string
      }
    }>
  }
  weaknesses?: Array<{
    description: Array<{
      lang: string
      value: string
    }>
  }>
  configurations?: any[]
  references?: Array<{
    url: string
    source: string
    tags?: string[]
  }>
}

interface NvdApiResponse {
  resultsPerPage: number
  startIndex: number
  totalResults: number
  format: string
  version: string
  timestamp: string
  vulnerabilities: Array<{
    cve: NvdCveItem
  }>
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch recent CVEs from NVD API
 * @param daysBack Number of days to look back (default: 7)
 * @param maxResults Maximum number of results to fetch (default: 100)
 */
export const fetchRecentNvdCves = async (
  daysBack: number = 7,
  maxResults: number = 100
): Promise<NvdCveItem[]> => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const pubStartDate = startDate.toISOString()
    const pubEndDate = endDate.toISOString()

    console.log(`Fetching NVD CVEs published between ${pubStartDate} and ${pubEndDate}...`)

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (NVD_API_KEY) {
      headers['apiKey'] = NVD_API_KEY
    }

    const params = {
      pubStartDate,
      pubEndDate,
      resultsPerPage: Math.min(maxResults, 2000), // NVD max is 2000
      startIndex: 0,
    }

    const response = await axios.get<NvdApiResponse>(NVD_API_URL, {
      headers,
      params,
      timeout: 30000,
    })

    if (!response.data.vulnerabilities) {
      console.warn('No vulnerabilities found in NVD response')
      return []
    }

    const cves = response.data.vulnerabilities.map(v => v.cve)
    console.log(`Successfully fetched ${cves.length} CVEs from NVD (total available: ${response.data.totalResults})`)

    return cves
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.error('NVD API access forbidden. Check API key or rate limits.')
      } else if (error.response?.status === 503) {
        console.error('NVD API service unavailable. Try again later.')
      } else {
        console.error('Error fetching from NVD API:', error.message)
      }
    } else {
      console.error('Error fetching from NVD API:', error)
    }
    throw error
  }
}

/**
 * Search for a specific CVE by ID
 */
export const fetchCveById = async (cveId: string): Promise<NvdCveItem | null> => {
  try {
    console.log(`Fetching CVE ${cveId} from NVD...`)

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (NVD_API_KEY) {
      headers['apiKey'] = NVD_API_KEY
    }

    const params = {
      cveId,
    }

    const response = await axios.get<NvdApiResponse>(NVD_API_URL, {
      headers,
      params,
      timeout: 15000,
    })

    if (!response.data.vulnerabilities || response.data.vulnerabilities.length === 0) {
      console.warn(`CVE ${cveId} not found in NVD`)
      return null
    }

    console.log(`Successfully fetched CVE ${cveId} from NVD`)
    return response.data.vulnerabilities[0].cve
  } catch (error) {
    console.error(`Error fetching CVE ${cveId} from NVD:`, error)
    return null
  }
}

/**
 * Extract primary English description from CVE
 */
export const extractDescription = (cve: NvdCveItem): string => {
  const englishDesc = cve.descriptions?.find(d => d.lang === 'en')
  return englishDesc?.value || 'No description available'
}

/**
 * Extract CVSS score and severity
 */
export const extractCvssData = (cve: NvdCveItem): {
  score: number | null
  severity: string | null
  vector: string | null
  version: string | null
} => {
  // Prefer CVSS v3.1
  if (cve.metrics?.cvssMetricV31 && cve.metrics.cvssMetricV31.length > 0) {
    const metric = cve.metrics.cvssMetricV31[0]
    return {
      score: metric.cvssData.baseScore,
      severity: metric.cvssData.baseSeverity,
      vector: metric.cvssData.vectorString,
      version: 'v3.1',
    }
  }

  // Fallback to CVSS v2
  if (cve.metrics?.cvssMetricV2 && cve.metrics.cvssMetricV2.length > 0) {
    const metric = cve.metrics.cvssMetricV2[0]
    return {
      score: metric.cvssData.baseScore,
      severity: metric.cvssData.baseSeverity,
      vector: metric.cvssData.vectorString,
      version: 'v2.0',
    }
  }

  return {
    score: null,
    severity: null,
    vector: null,
    version: null,
  }
}

/**
 * Check if NVD API is configured
 */
export const isNvdConfigured = (): boolean => {
  return !!NVD_API_KEY
}
