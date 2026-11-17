import type { Request, Response } from 'express'
import {
  fetchRecentNvdCves,
  fetchCveById,
  isNvdConfigured,
} from '../services/fetchers/nvdFetcher'
import {
  getAllNvdCves,
  getRecentNvdCves,
  getNvdStats,
  saveNvdCves,
  searchNvdCveById,
} from '../services/database/nvdDb'
import {
  getEpssScoresByCveIds,
  getEpssScoreByCveId,
} from '../services/database/epssDb'
import { interpretEpssScore } from '../services/fetchers/epssFetcher'
import { syncNvdData } from '../services/dataSync'

export const getNvdCves = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving NVD CVEs from database...')
    const cves = await getAllNvdCves()
    console.log(`Retrieved ${cves.length} NVD CVEs from database`)

    // Get EPSS scores for all CVEs
    const cveIds = cves.map(cve => cve.cveId)
    const epssScores = await getEpssScoresByCveIds(cveIds)
    const epssMap = new Map(epssScores.map(score => [score.cveId, score]))

    // Enrich CVEs with EPSS data
    const enrichedCves = cves.map(cve => ({
      ...cve,
      epss: epssMap.has(cve.cveId) ? {
        score: epssMap.get(cve.cveId)!.epss,
        percentile: epssMap.get(cve.cveId)!.percentile,
        interpretation: interpretEpssScore(epssMap.get(cve.cveId)!.epss),
        scoreDate: epssMap.get(cve.cveId)!.scoreDate,
      } : null,
    }))

    const stats = await getNvdStats()

    res.json({
      success: true,
      data: enrichedCves,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error retrieving NVD CVEs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve NVD CVEs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const getRecentNvd = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    console.log(`Retrieving NVD CVEs from last ${days} days...`)

    const cves = await getRecentNvdCves(days)

    // Get EPSS scores for all CVEs
    const cveIds = cves.map(cve => cve.cveId)
    const epssScores = await getEpssScoresByCveIds(cveIds)
    const epssMap = new Map(epssScores.map(score => [score.cveId, score]))

    // Enrich CVEs with EPSS data
    const enrichedCves = cves.map(cve => ({
      ...cve,
      epss: epssMap.has(cve.cveId) ? {
        score: epssMap.get(cve.cveId)!.epss,
        percentile: epssMap.get(cve.cveId)!.percentile,
        interpretation: interpretEpssScore(epssMap.get(cve.cveId)!.epss),
        scoreDate: epssMap.get(cve.cveId)!.scoreDate,
      } : null,
    }))

    res.json({
      success: true,
      data: enrichedCves,
      count: cves.length,
      days,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error retrieving recent NVD CVEs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent NVD CVEs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const searchCve = async (req: Request, res: Response) => {
  try {
    const { cveId } = req.params
    console.log(`Searching for CVE ${cveId}...`)

    // First check database
    let cve = await searchNvdCveById(cveId)

    if (cve) {
      console.log(`Found CVE ${cveId} in database`)

      // Get EPSS score
      const epssScore = await getEpssScoreByCveId(cve.cveId)
      const enrichedCve = {
        ...cve,
        epss: epssScore ? {
          score: epssScore.epss,
          percentile: epssScore.percentile,
          interpretation: interpretEpssScore(epssScore.epss),
          scoreDate: epssScore.scoreDate,
        } : null,
      }

      return res.json({
        success: true,
        data: enrichedCve,
        source: 'database',
        timestamp: new Date().toISOString(),
      })
    }

    // If not in database and NVD API is configured, fetch from API
    if (isNvdConfigured()) {
      console.log(`CVE ${cveId} not in database, fetching from NVD API...`)
      const cveData = await fetchCveById(cveId)

      if (cveData) {
        // Save to database
        await saveNvdCves([cveData])

        // Retrieve from database to get consistent format
        cve = await searchNvdCveById(cveId)

        if (cve) {
          // Get EPSS score
          const epssScore = await getEpssScoreByCveId(cve.cveId)
          const enrichedCve = {
            ...cve,
            epss: epssScore ? {
              score: epssScore.epss,
              percentile: epssScore.percentile,
              interpretation: interpretEpssScore(epssScore.epss),
              scoreDate: epssScore.scoreDate,
            } : null,
          }

          return res.json({
            success: true,
            data: enrichedCve,
            source: 'nvd-api',
            timestamp: new Date().toISOString(),
          })
        }
      }
    }

    res.status(404).json({
      success: false,
      error: 'CVE not found',
      message: `CVE ${cveId} not found in database${isNvdConfigured() ? ' or NVD API' : ''}`,
    })
  } catch (error) {
    console.error('Error searching for CVE:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to search for CVE',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const refreshNvdData = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    console.log(`Manual NVD data refresh requested (last ${days} days)...`)

    // Note: NVD API works without key, just with lower rate limits
    const apiConfigured = isNvdConfigured()
    if (!apiConfigured) {
      console.warn('NVD API key not configured - using public API with rate limits')
    }

    // Use syncNvdData to maintain initial sync tracking
    await syncNvdData(days)

    const stats = await getNvdStats()

    res.json({
      success: true,
      message: apiConfigured
        ? 'NVD data refreshed successfully'
        : 'NVD data refreshed successfully (using public API)',
      stats,
      apiConfigured,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error refreshing NVD data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refresh NVD data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const refreshNvdHistoricalData = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 365
    console.log(`Manual NVD historical data refresh requested (last ${days} days)...`)

    // Note: NVD API works without key, just with lower rate limits
    const apiConfigured = isNvdConfigured()
    if (!apiConfigured) {
      console.warn('NVD API key not configured - using public API with slower rate limits')
      console.warn(`Fetching ${days} days of data may take several minutes...`)
    } else {
      console.log(`Fetching ${days} days of historical data with API key...`)
    }

    // Force historical sync
    await syncNvdData(days, true)

    const stats = await getNvdStats()

    res.json({
      success: true,
      message: `NVD historical data refreshed successfully (${days} days)`,
      stats,
      apiConfigured,
      daysRequested: days,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error refreshing NVD historical data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refresh NVD historical data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const getNvdApiStatus = async (req: Request, res: Response) => {
  try {
    const configured = isNvdConfigured()
    const stats = await getNvdStats()

    res.json({
      success: true,
      configured,
      stats,
      message: configured
        ? 'NVD API key is configured'
        : 'NVD API key not configured (using public API with rate limits)',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting NVD API status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get NVD API status',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const getNvdAnalytics = async (req: Request, res: Response) => {
  try {
    console.log('Calculating NVD analytics...')
    const cves = await getAllNvdCves()
    console.log(`Processing ${cves.length} CVEs for analytics`)

    const now = new Date()

    // 1. Severity distribution
    const severityCounts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      NONE: 0,
    }

    cves.forEach(cve => {
      const severity = (cve.cvssSeverity?.toUpperCase() || 'NONE')
      if (severityCounts[severity] !== undefined) {
        severityCounts[severity]++
      } else {
        severityCounts.NONE++
      }
    })

    const severityData = Object.entries(severityCounts)
      .filter(([, count]) => count > 0)
      .map(([severity, count]) => ({ severity, count }))

    // 2. CVSS score distribution
    const scoreDistribution: Record<string, number> = {
      '0.0-3.9': 0,
      '4.0-6.9': 0,
      '7.0-8.9': 0,
      '9.0-10.0': 0,
      '未採点': 0,
    }

    cves.forEach(cve => {
      if (!cve.cvssScore) {
        scoreDistribution['未採点']++
      } else if (cve.cvssScore < 4.0) {
        scoreDistribution['0.0-3.9']++
      } else if (cve.cvssScore < 7.0) {
        scoreDistribution['4.0-6.9']++
      } else if (cve.cvssScore < 9.0) {
        scoreDistribution['7.0-8.9']++
      } else {
        scoreDistribution['9.0-10.0']++
      }
    })

    const scoreData = Object.entries(scoreDistribution).map(([range, count]) => ({
      range,
      count,
    }))

    // 3. Monthly trend (last 12 months)
    const monthlyData: Record<string, number> = {}

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[key] = 0
    }

    cves.forEach(cve => {
      const date = new Date(cve.published)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++
      }
    })

    const trendData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }))

    // 4. Age distribution
    const ageDistribution: Record<string, number> = {
      '0-7日': 0,
      '8-30日': 0,
      '31-90日': 0,
      '91-180日': 0,
      '180日超': 0,
    }

    cves.forEach(cve => {
      const daysSincePublished = Math.floor((now.getTime() - new Date(cve.published).getTime()) / (1000 * 60 * 60 * 24))

      if (daysSincePublished <= 7) {
        ageDistribution['0-7日']++
      } else if (daysSincePublished <= 30) {
        ageDistribution['8-30日']++
      } else if (daysSincePublished <= 90) {
        ageDistribution['31-90日']++
      } else if (daysSincePublished <= 180) {
        ageDistribution['91-180日']++
      } else {
        ageDistribution['180日超']++
      }
    })

    const ageData = Object.entries(ageDistribution).map(([age, count]) => ({
      age,
      count,
    }))

    // 5. Vulnerability status distribution
    const statusCounts: Record<string, number> = {}

    cves.forEach(cve => {
      const status = cve.vulnStatus || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const statusData = Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([status, count]) => ({ status, count }))

    // 6. CVSS version distribution
    const versionCounts: Record<string, number> = {
      'v3.1': 0,
      'v2.0': 0,
      '未採点': 0,
    }

    cves.forEach(cve => {
      if (!cve.cvssVersion) {
        versionCounts['未採点']++
      } else if (cve.cvssVersion === 'v3.1') {
        versionCounts['v3.1']++
      } else if (cve.cvssVersion === 'v2.0') {
        versionCounts['v2.0']++
      }
    })

    const versionData = Object.entries(versionCounts)
      .filter(([, count]) => count > 0)
      .map(([version, count]) => ({ version, count }))

    // Calculate statistics
    const cvssScores = cves.filter(c => c.cvssScore).map(c => c.cvssScore!)
    const avgCvssScore = cvssScores.length > 0
      ? cvssScores.reduce((a, b) => a + b, 0) / cvssScores.length
      : 0

    const criticalHighCount = severityCounts.CRITICAL + severityCounts.HIGH

    console.log('Analytics calculation complete')

    res.json({
      success: true,
      analytics: {
        severityData,
        scoreData,
        trendData,
        ageData,
        statusData,
        versionData,
        totalCount: cves.length,
        criticalHighCount,
        avgCvssScore,
        currentMonthCount: trendData[trendData.length - 1]?.count || 0,
        currentMonth: trendData[trendData.length - 1]?.month || '',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error calculating NVD analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to calculate NVD analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
