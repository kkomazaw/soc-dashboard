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
    const days = parseInt(req.query.days as string) || 7
    console.log(`Manual NVD data refresh requested (last ${days} days)...`)

    // Note: NVD API works without key, just with lower rate limits
    const apiConfigured = isNvdConfigured()
    if (!apiConfigured) {
      console.warn('NVD API key not configured - using public API with rate limits')
    }

    const cves = await fetchRecentNvdCves(days)

    if (cves.length > 0) {
      await saveNvdCves(cves)
    }

    const stats = await getNvdStats()

    res.json({
      success: true,
      message: apiConfigured
        ? 'NVD data refreshed successfully'
        : 'NVD data refreshed successfully (using public API)',
      count: cves.length,
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
