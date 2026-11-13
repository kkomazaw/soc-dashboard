import axios from 'axios'
import { getCountryName } from '../../utils/countryMapper'

const ABUSEIPDB_API_BASE = 'https://api.abuseipdb.com/api/v2'
const API_KEY = process.env.ABUSEIPDB_API_KEY

export interface AbuseIPDBReport {
  ipAddress: string
  countryCode: string
  country: string
  abuseConfidenceScore: number // 0-100
  totalReports: number
  lastReportedAt: string
  categories: number[] // AbuseIPDB category IDs
  threatType: string // Mapped threat type
  severity: string // 'critical', 'high', 'medium', 'low'
}

/**
 * Map AbuseIPDB categories to threat types
 * https://www.abuseipdb.com/categories
 */
const mapCategoriesToThreatType = (categories: number[]): string => {
  if (categories.includes(18) || categories.includes(20)) return 'malware'
  if (categories.includes(15) || categories.includes(16)) return 'scanning'
  if (categories.includes(17)) return 'botnet'
  if (categories.includes(4)) return 'ddos'
  if (categories.includes(10) || categories.includes(11)) return 'phishing'
  if (categories.includes(21)) return 'ransomware'
  if (categories.includes(19)) return 'exploit'
  return 'suspicious'
}

/**
 * Map abuse confidence score to severity
 */
const mapScoreToSeverity = (score: number): string => {
  if (score >= 90) return 'critical'
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

/**
 * Fetch malicious IPs from AbuseIPDB blacklist
 * @param limit Number of IPs to fetch (max 10000, default 100)
 * @param minConfidence Minimum confidence score 25-100 (default 90)
 */
export const fetchAbuseIPDBBlacklist = async (
  limit: number = 100,
  minConfidence: number = 90
): Promise<AbuseIPDBReport[]> => {
  try {
    if (!API_KEY) {
      console.warn('ABUSEIPDB_API_KEY not configured, skipping AbuseIPDB fetch')
      return []
    }

    console.log(`Fetching AbuseIPDB blacklist (limit: ${limit}, minConfidence: ${minConfidence})...`)

    const response = await axios.get(`${ABUSEIPDB_API_BASE}/blacklist`, {
      headers: {
        Key: API_KEY,
        Accept: 'application/json',
      },
      params: {
        confidenceMinimum: minConfidence,
        limit: Math.min(limit, 10000), // API max is 10000
      },
      timeout: 30000,
    })

    if (!response.data || !response.data.data) {
      console.warn('AbuseIPDB returned empty data')
      return []
    }

    const reports: AbuseIPDBReport[] = response.data.data.map((item: any) => {
      const categories = item.categories || []
      const threatType = mapCategoriesToThreatType(categories)
      const severity = mapScoreToSeverity(item.abuseConfidenceScore)

      const countryCode = item.countryCode || 'XX'
      const countryName = item.countryName || getCountryName(countryCode)

      return {
        ipAddress: item.ipAddress,
        countryCode,
        country: countryName,
        abuseConfidenceScore: item.abuseConfidenceScore,
        totalReports: item.totalReports || 0,
        lastReportedAt: item.lastReportedAt,
        categories,
        threatType,
        severity,
      }
    })

    console.log(`Successfully fetched ${reports.length} malicious IPs from AbuseIPDB`)
    return reports
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.warn('AbuseIPDB API rate limit exceeded')
    } else if (error.response?.status === 401) {
      console.error('AbuseIPDB API key is invalid')
    } else {
      console.error('Error fetching AbuseIPDB blacklist:', error.message)
    }
    return [] // Return empty array on error to not block other sources
  }
}

/**
 * Check a single IP address for abuse reports
 * @param ipAddress IP address to check
 */
export const checkIPAddress = async (ipAddress: string): Promise<AbuseIPDBReport | null> => {
  try {
    if (!API_KEY) {
      console.warn('ABUSEIPDB_API_KEY not configured')
      return null
    }

    const response = await axios.get(`${ABUSEIPDB_API_BASE}/check`, {
      headers: {
        Key: API_KEY,
        Accept: 'application/json',
      },
      params: {
        ipAddress,
        maxAgeInDays: 90,
        verbose: true,
      },
      timeout: 10000,
    })

    if (!response.data || !response.data.data) {
      return null
    }

    const item = response.data.data
    const categories = item.reports?.map((r: any) => r.categories).flat() || []
    const threatType = mapCategoriesToThreatType(categories)
    const severity = mapScoreToSeverity(item.abuseConfidenceScore)

    return {
      ipAddress: item.ipAddress,
      countryCode: item.countryCode || 'XX',
      country: item.countryName || 'Unknown',
      abuseConfidenceScore: item.abuseConfidenceScore,
      totalReports: item.totalReports || 0,
      lastReportedAt: item.lastReportedAt,
      categories,
      threatType,
      severity,
    }
  } catch (error: any) {
    console.error(`Error checking IP ${ipAddress}:`, error.message)
    return null
  }
}

/**
 * Get AbuseIPDB API usage statistics
 */
export const getAPIUsage = async (): Promise<any> => {
  try {
    if (!API_KEY) {
      return { error: 'API key not configured' }
    }

    const response = await axios.get(`${ABUSEIPDB_API_BASE}/check`, {
      headers: {
        Key: API_KEY,
        Accept: 'application/json',
      },
      params: {
        ipAddress: '127.0.0.1', // Dummy request to get headers
        maxAgeInDays: 1,
      },
      timeout: 10000,
    })

    return {
      dailyLimit: response.headers['x-ratelimit-limit'],
      remaining: response.headers['x-ratelimit-remaining'],
    }
  } catch (error: any) {
    console.error('Error getting AbuseIPDB API usage:', error.message)
    return { error: error.message }
  }
}
