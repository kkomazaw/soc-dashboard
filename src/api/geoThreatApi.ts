import axios from 'axios'

const API_BASE = '/api/geo-threat'

export interface ThreatLocation {
  countryCode: string
  country: string
  threatCount: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  topThreats: string[]
  uniqueIps: number
  lastReportDate: Date | string
}

export interface GeoThreatStats {
  totalReports: number
  totalCountries: number
  uniqueIps: number
  criticalThreats: number
  highThreats: number
  reportsLast24h: number
}

/**
 * Fetch all geographic threat aggregations
 */
export const fetchAllAggregations = async (): Promise<ThreatLocation[]> => {
  try {
    const response = await axios.get(`${API_BASE}/aggregations`)
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch geo threat aggregations:', error)
    return []
  }
}

/**
 * Fetch top N threat countries
 */
export const fetchTopCountries = async (limit: number = 10): Promise<ThreatLocation[]> => {
  try {
    const response = await axios.get(`${API_BASE}/top-countries`, {
      params: { limit },
    })
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch top countries:', error)
    return []
  }
}

/**
 * Fetch geographic threat statistics
 */
export const fetchGeoThreatStats = async (): Promise<GeoThreatStats> => {
  try {
    const response = await axios.get(`${API_BASE}/stats`)
    return response.data.stats || {
      totalReports: 0,
      totalCountries: 0,
      uniqueIps: 0,
      criticalThreats: 0,
      highThreats: 0,
      reportsLast24h: 0,
    }
  } catch (error) {
    console.error('Failed to fetch geo threat stats:', error)
    return {
      totalReports: 0,
      totalCountries: 0,
      uniqueIps: 0,
      criticalThreats: 0,
      highThreats: 0,
      reportsLast24h: 0,
    }
  }
}

/**
 * Refresh geographic threat data from external sources
 */
export const refreshGeoThreatData = async (
  limit?: number,
  minConfidence?: number
): Promise<any> => {
  const response = await axios.post(`${API_BASE}/refresh`, null, {
    params: { limit, minConfidence },
  })
  return response.data
}

/**
 * Check a specific IP address for threats
 */
export const checkIPAddress = async (ipAddress: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE}/check/${ipAddress}`)
    return response.data
  } catch (error) {
    console.error('Failed to check IP address:', error)
    throw error
  }
}

/**
 * Fetch threat reports for a specific country
 */
export const fetchCountryReports = async (countryCode: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE}/country/${countryCode}`)
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch country reports:', error)
    return []
  }
}
