import { Request, Response } from 'express'
import {
  fetchAbuseIPDBBlacklist,
  checkIPAddress as checkAbuseIPDB,
  getAPIUsage as getAbuseIPDBUsage,
} from '../services/fetchers/abuseipdbFetcher'
import {
  fetchOTXHighConfidenceIPs,
  fetchIPReputation as checkOTX,
} from '../services/fetchers/otxFetcher'
import {
  saveAbuseIPDBReports,
  saveOTXReports,
  calculateGeoThreatAggregations,
  getAllGeoThreatAggregations,
  getTopThreatCountries,
  getGeoThreatStats,
  getRecentIpThreatReports,
  getThreatReportsByCountry,
  cleanupOldThreatReports,
} from '../services/database/geoThreatDb'

/**
 * Get all geographic threat aggregations
 */
export const getAllAggregations = async (req: Request, res: Response) => {
  try {
    const aggregations = await getAllGeoThreatAggregations()

    res.json({
      success: true,
      data: aggregations,
      count: aggregations.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching geographic threat aggregations:', error)
    res.status(500).json({
      error: 'Failed to fetch geographic threat aggregations',
      message: error.message,
    })
  }
}

/**
 * Get top threat countries
 */
export const getTopCountries = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const countries = await getTopThreatCountries(limit)

    res.json({
      success: true,
      data: countries,
      count: countries.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching top threat countries:', error)
    res.status(500).json({
      error: 'Failed to fetch top threat countries',
      message: error.message,
    })
  }
}

/**
 * Get geographic threat statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getGeoThreatStats()

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching geographic threat stats:', error)
    res.status(500).json({
      error: 'Failed to fetch geographic threat stats',
      message: error.message,
    })
  }
}

/**
 * Get recent IP threat reports
 */
export const getRecentReports = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100
    const reports = await getRecentIpThreatReports(limit)

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching recent IP threat reports:', error)
    res.status(500).json({
      error: 'Failed to fetch recent IP threat reports',
      message: error.message,
    })
  }
}

/**
 * Get threat reports by country
 */
export const getReportsByCountry = async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params
    const reports = await getThreatReportsByCountry(countryCode.toUpperCase())

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      countryCode: countryCode.toUpperCase(),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error(`Error fetching threat reports for country ${req.params.countryCode}:`, error)
    res.status(500).json({
      error: 'Failed to fetch threat reports by country',
      message: error.message,
    })
  }
}

/**
 * Check a specific IP address for threats
 */
export const checkIP = async (req: Request, res: Response) => {
  try {
    const { ipAddress } = req.params

    // Check both sources in parallel
    const [abuseResult, otxResult] = await Promise.allSettled([
      checkAbuseIPDB(ipAddress),
      checkOTX(ipAddress),
    ])

    const abuse = abuseResult.status === 'fulfilled' ? abuseResult.value : null
    const otx = otxResult.status === 'fulfilled' ? otxResult.value : null

    res.json({
      success: true,
      ipAddress,
      data: {
        abuseipdb: abuse,
        otx: otx,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error(`Error checking IP ${req.params.ipAddress}:`, error)
    res.status(500).json({
      error: 'Failed to check IP address',
      message: error.message,
    })
  }
}

/**
 * Refresh geographic threat data from external sources
 */
export const refreshData = async (req: Request, res: Response) => {
  try {
    console.log('Manual geographic threat data refresh requested...')

    const limit = parseInt(req.query.limit as string) || 100
    const minConfidence = parseInt(req.query.minConfidence as string) || 90

    // Fetch from both sources in parallel
    console.log('Fetching threat data from external sources...')
    const [abuseReports, otxReports] = await Promise.allSettled([
      fetchAbuseIPDBBlacklist(limit, minConfidence),
      fetchOTXHighConfidenceIPs(),
    ])

    const abuseData = abuseReports.status === 'fulfilled' ? abuseReports.value : []
    const otxData = otxReports.status === 'fulfilled' ? otxReports.value : []

    // Save to database
    console.log('Saving threat data to database...')
    if (abuseData.length > 0) {
      await saveAbuseIPDBReports(abuseData)
    }
    if (otxData.length > 0) {
      await saveOTXReports(otxData)
    }

    // Calculate aggregations
    console.log('Calculating geographic aggregations...')
    await calculateGeoThreatAggregations()

    // Get updated stats
    const stats = await getGeoThreatStats()

    res.json({
      success: true,
      message: 'Geographic threat data refreshed successfully',
      stats: {
        abuseipdb: abuseData.length,
        otx: otxData.length,
        total: abuseData.length + otxData.length,
      },
      overallStats: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error refreshing geographic threat data:', error)
    res.status(500).json({
      error: 'Failed to refresh geographic threat data',
      message: error.message,
    })
  }
}

/**
 * Clean up old threat reports
 */
export const cleanupOldData = async (req: Request, res: Response) => {
  try {
    const daysToKeep = parseInt(req.query.days as string) || 90
    const deletedCount = await cleanupOldThreatReports(daysToKeep)

    res.json({
      success: true,
      message: `Cleaned up threat reports older than ${daysToKeep} days`,
      deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error cleaning up old threat reports:', error)
    res.status(500).json({
      error: 'Failed to clean up old threat reports',
      message: error.message,
    })
  }
}

/**
 * Get API usage statistics
 */
export const getAPIStats = async (req: Request, res: Response) => {
  try {
    const abuseUsage = await getAbuseIPDBUsage()

    res.json({
      success: true,
      data: {
        abuseipdb: abuseUsage,
        // OTX doesn't provide usage stats in the same way
        otx: { status: 'configured', available: !!process.env.OTX_API_KEY },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching API stats:', error)
    res.status(500).json({
      error: 'Failed to fetch API stats',
      message: error.message,
    })
  }
}
