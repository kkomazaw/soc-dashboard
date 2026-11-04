/**
 * Analytics API Client
 * Fetches vulnerability trend and statistical data from backend
 */

const API_BASE_URL = 'http://localhost:3001/api/analytics'

export interface DailyTrend {
  date: string
  cisaKev: number
  critical: number
  high: number
  medium: number
  low: number
  total: number
}

export interface SeverityDistribution {
  critical: number
  high: number
  medium: number
  low: number
  none: number
}

export interface VendorProduct {
  name: string
  count: number
}

export interface CvssDistribution {
  range: string
  count: number
  min: number
  max: number
}

export interface MonthlyStats {
  month: string
  cisaKev: number
  nvd: number
  jvn: number
  critical: number
  high: number
  total: number
}

/**
 * Get vulnerability trends over time
 */
export const getVulnerabilityTrends = async (days: number = 30): Promise<DailyTrend[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trends?days=${days}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Failed to fetch vulnerability trends:', error)
    throw error
  }
}

/**
 * Get severity distribution across all sources
 */
export const getSeverityDistribution = async (): Promise<{
  distribution: SeverityDistribution
  total: number
  percentage: Record<string, string>
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/severity-distribution`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Failed to fetch severity distribution:', error)
    throw error
  }
}

/**
 * Get top affected vendors and products
 */
export const getTopVendorsProducts = async (
  limit: number = 10
): Promise<{
  topVendors: VendorProduct[]
  topProducts: VendorProduct[]
  totalVendors: number
  totalProducts: number
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/top-vendors-products?limit=${limit}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Failed to fetch top vendors/products:', error)
    throw error
  }
}

/**
 * Get CVSS score distribution
 */
export const getCvssDistribution = async (): Promise<CvssDistribution[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cvss-distribution`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Failed to fetch CVSS distribution:', error)
    throw error
  }
}

/**
 * Get monthly statistics
 */
export const getMonthlyStats = async (months: number = 12): Promise<MonthlyStats[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/monthly-stats?months=${months}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Failed to fetch monthly stats:', error)
    throw error
  }
}
