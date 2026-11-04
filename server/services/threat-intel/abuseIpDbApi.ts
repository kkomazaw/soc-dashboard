import axios from 'axios'

const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY
const ABUSEIPDB_API_URL = 'https://api.abuseipdb.com/api/v2'

export interface AbuseIPDBReport {
  data: {
    ipAddress: string
    isPublic: boolean
    ipVersion: number
    isWhitelisted: boolean
    abuseConfidenceScore: number
    countryCode: string
    countryName: string
    usageType: string
    isp: string
    domain: string
    hostnames: string[]
    isTor: boolean
    totalReports: number
    numDistinctUsers: number
    lastReportedAt: string | null
    reports?: Array<{
      reportedAt: string
      comment: string
      categories: number[]
      reporterId: number
      reporterCountryCode: string
    }>
  }
}

/**
 * Check IP address reputation in AbuseIPDB
 */
export const checkIpAddress = async (
  ipAddress: string,
  maxAgeInDays: number = 90,
  verbose: boolean = false
): Promise<AbuseIPDBReport | null> => {
  if (!ABUSEIPDB_API_KEY) {
    console.warn('AbuseIPDB API key not configured')
    return null
  }

  try {
    console.log(`Checking IP address in AbuseIPDB: ${ipAddress}`)

    const params: any = {
      ipAddress,
      maxAgeInDays,
    }

    if (verbose) {
      params.verbose = true
    }

    const response = await axios.get<AbuseIPDBReport>(
      `${ABUSEIPDB_API_URL}/check`,
      {
        headers: {
          Key: ABUSEIPDB_API_KEY,
          Accept: 'application/json',
        },
        params,
        timeout: 10000,
      }
    )

    console.log(`AbuseIPDB check successful: ${ipAddress} (Score: ${response.data.data.abuseConfidenceScore})`)
    return response.data
  } catch (error) {
    console.error('AbuseIPDB check failed:', error)
    throw error
  }
}

/**
 * Get blacklisted IPs from AbuseIPDB
 */
export const getBlacklist = async (
  confidenceMinimum: number = 90,
  limit: number = 100
): Promise<any> => {
  if (!ABUSEIPDB_API_KEY) {
    console.warn('AbuseIPDB API key not configured')
    return null
  }

  try {
    console.log(`Fetching AbuseIPDB blacklist (confidence >= ${confidenceMinimum})`)

    const response = await axios.get(
      `${ABUSEIPDB_API_URL}/blacklist`,
      {
        headers: {
          Key: ABUSEIPDB_API_KEY,
          Accept: 'application/json',
        },
        params: {
          confidenceMinimum,
          limit,
        },
        timeout: 30000,
      }
    )

    console.log(`AbuseIPDB blacklist fetched: ${response.data.meta?.total || 0} entries`)
    return response.data
  } catch (error) {
    console.error('AbuseIPDB blacklist fetch failed:', error)
    throw error
  }
}

/**
 * Check if AbuseIPDB API is configured
 */
export const isAbuseIPDBConfigured = (): boolean => {
  return !!ABUSEIPDB_API_KEY
}

/**
 * Get category name from category ID
 */
export const getCategoryName = (categoryId: number): string => {
  const categories: Record<number, string> = {
    3: 'Fraud Orders',
    4: 'DDoS Attack',
    5: 'FTP Brute-Force',
    6: 'Ping of Death',
    7: 'Phishing',
    8: 'Fraud VoIP',
    9: 'Open Proxy',
    10: 'Web Spam',
    11: 'Email Spam',
    12: 'Blog Spam',
    13: 'VPN IP',
    14: 'Port Scan',
    15: 'Hacking',
    16: 'SQL Injection',
    17: 'Spoofing',
    18: 'Brute-Force',
    19: 'Bad Web Bot',
    20: 'Exploited Host',
    21: 'Web App Attack',
    22: 'SSH',
    23: 'IoT Targeted',
  }

  return categories[categoryId] || `Unknown (${categoryId})`
}
