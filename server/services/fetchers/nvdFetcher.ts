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
 * Fetch recent CVEs from NVD API with pagination and chunking support
 * NVD API has a 120-day maximum date range limit, so we split requests into chunks
 * @param daysBack Number of days to look back (default: 7)
 * @param maxResults Maximum number of results to fetch per request (default: 2000, max: 2000)
 * @param fetchAll If true, fetches all available CVEs in the date range (default: true)
 */
export const fetchRecentNvdCves = async (
  daysBack: number = 7,
  maxResults: number = 2000,
  fetchAll: boolean = true
): Promise<NvdCveItem[]> => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    console.log(`Fetching NVD CVEs for last ${daysBack} days...`)

    // NVD API has a 120-day maximum date range limit
    const MAX_CHUNK_DAYS = 120
    const chunks: Array<{ start: Date; end: Date }> = []

    // Split into 120-day chunks if necessary
    if (daysBack <= MAX_CHUNK_DAYS) {
      chunks.push({ start: startDate, end: endDate })
    } else {
      let chunkStart = new Date(startDate)
      while (chunkStart < endDate) {
        const chunkEnd = new Date(chunkStart)
        chunkEnd.setDate(chunkEnd.getDate() + MAX_CHUNK_DAYS)

        if (chunkEnd > endDate) {
          chunks.push({ start: new Date(chunkStart), end: new Date(endDate) })
          break
        } else {
          chunks.push({ start: new Date(chunkStart), end: new Date(chunkEnd) })
          chunkStart = new Date(chunkEnd)
        }
      }
      console.log(`Split into ${chunks.length} chunks of ${MAX_CHUNK_DAYS} days each`)
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (NVD_API_KEY) {
      headers['apiKey'] = NVD_API_KEY
    }

    const resultsPerPage = Math.min(maxResults, 2000) // NVD max is 2000
    let allCves: NvdCveItem[] = []

    // Process each chunk
    for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
      const chunk = chunks[chunkIdx]
      const pubStartDate = chunk.start.toISOString()
      const pubEndDate = chunk.end.toISOString()

      console.log(`\nChunk ${chunkIdx + 1}/${chunks.length}: ${pubStartDate} to ${pubEndDate}`)

      let startIndex = 0
      let totalResults = 0
      let chunkCves: NvdCveItem[] = []

      // Rate limiting between chunks
      if (chunkIdx > 0) {
        await sleep(RATE_LIMIT_DELAY)
      }

      // First request to get total count for this chunk
      const firstResponse = await axios.get<NvdApiResponse>(NVD_API_URL, {
        headers,
        params: {
          pubStartDate,
          pubEndDate,
          resultsPerPage,
          startIndex: 0,
        },
        timeout: 30000,
      })

      if (!firstResponse.data.vulnerabilities) {
        console.warn(`No vulnerabilities found in chunk ${chunkIdx + 1}`)
        continue
      }

      totalResults = firstResponse.data.totalResults
      chunkCves = firstResponse.data.vulnerabilities.map(v => v.cve)
      console.log(`  Fetched ${chunkCves.length}/${totalResults} CVEs...`)

      // If fetching all, paginate through remaining results in this chunk
      if (fetchAll && chunkCves.length < totalResults) {
        startIndex = resultsPerPage

        while (startIndex < totalResults) {
          await sleep(RATE_LIMIT_DELAY) // Rate limiting

          const response = await axios.get<NvdApiResponse>(NVD_API_URL, {
            headers,
            params: {
              pubStartDate,
              pubEndDate,
              resultsPerPage,
              startIndex,
            },
            timeout: 30000,
          })

          if (response.data.vulnerabilities && response.data.vulnerabilities.length > 0) {
            const batch = response.data.vulnerabilities.map(v => v.cve)
            chunkCves.push(...batch)
            console.log(`  Fetched ${chunkCves.length}/${totalResults} CVEs...`)
          }

          startIndex += resultsPerPage
        }
      }

      allCves.push(...chunkCves)
      console.log(`Chunk ${chunkIdx + 1} complete: ${chunkCves.length} CVEs fetched`)
    }

    console.log(`✅ Successfully fetched ${allCves.length} total CVEs from NVD`)
    return allCves
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.error('NVD API access forbidden. Check API key or rate limits.')
      } else if (error.response?.status === 404 && error.response.headers?.message) {
        console.error(`NVD API error: ${error.response.headers.message}`)
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
 * Get total count of CVEs for a specific year from NVD API
 * @param year Year to query (e.g., 2026)
 * @returns Total count of CVEs published in that year
 */
export const fetchNvdYearTotal = async (year: number): Promise<number> => {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()

    // NVD API has a 120-day maximum date range limit
    // We need to break the year into 120-day chunks and sum the results
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
    const yearEnd = year === currentYear
      ? now
      : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

    const CHUNK_DAYS = 120
    const chunks: Array<{ start: Date; end: Date }> = []

    let chunkStart = new Date(yearStart)
    while (chunkStart < yearEnd) {
      const chunkEnd = new Date(chunkStart)
      chunkEnd.setDate(chunkEnd.getDate() + CHUNK_DAYS)

      // Don't go past the year end
      if (chunkEnd > yearEnd) {
        chunks.push({ start: new Date(chunkStart), end: new Date(yearEnd) })
        break
      } else {
        chunks.push({ start: new Date(chunkStart), end: new Date(chunkEnd) })
        chunkStart = new Date(chunkEnd)
      }
    }

    console.log(`Fetching NVD CVE count for year ${year} in ${chunks.length} chunks...`)

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (NVD_API_KEY) {
      headers['apiKey'] = NVD_API_KEY
    }

    let totalCount = 0

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      await sleep(RATE_LIMIT_DELAY) // Rate limiting between requests

      const params = {
        pubStartDate: chunk.start.toISOString(),
        pubEndDate: chunk.end.toISOString(),
        resultsPerPage: 10,
        startIndex: 0,
      }

      const response = await axios.get<NvdApiResponse>(NVD_API_URL, {
        headers,
        params,
        timeout: 15000,
      })

      const chunkTotal = response.data.totalResults || 0
      totalCount += chunkTotal
    }

    console.log(`✅ NVD API reports ${totalCount} total CVEs published in ${year}`)
    return totalCount
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.error(`NVD API access forbidden for year ${year}. Check API key or rate limits.`)
      } else if (error.response?.status === 503) {
        console.error(`NVD API service unavailable for year ${year}. Try again later.`)
      } else {
        console.error(`Error fetching NVD year total for ${year}:`, error.message)
      }
    } else {
      console.error(`Error fetching NVD year total for ${year}:`, error)
    }
    // Return -1 to indicate error, caller can fallback to DB count
    return -1
  }
}

/**
 * Check if NVD API is configured
 */
export const isNvdConfigured = (): boolean => {
  return !!NVD_API_KEY
}
