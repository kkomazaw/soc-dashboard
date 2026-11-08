import { Request, Response } from 'express'
import {
  fetchEpssScoresByCves,
  fetchAllEpssScores,
  interpretEpssScore,
} from '../services/fetchers/epssFetcher'
import {
  getEpssScoreByCveId,
  getEpssScoresByCveIds,
  getAllEpssScores,
  getHighRiskCves,
  getEpssStats,
  getEpssDistribution,
  saveEpssScores,
  getLatestScoreDate,
} from '../services/database/epssDb'

/**
 * Get EPSS statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getEpssStats()
    const distribution = await getEpssDistribution()

    res.json({
      success: true,
      stats,
      distribution,
    })
  } catch (error: any) {
    console.error('Error fetching EPSS stats:', error)
    res.status(500).json({
      error: 'Failed to fetch EPSS stats',
      message: error.message,
    })
  }
}

/**
 * Get EPSS score for a specific CVE
 */
export const getScoreByCve = async (req: Request, res: Response) => {
  try {
    const { cveId } = req.params

    const score = await getEpssScoreByCveId(cveId.toUpperCase())

    if (!score) {
      return res.status(404).json({
        error: 'EPSS score not found',
        message: `No EPSS score found for ${cveId}`,
      })
    }

    res.json({
      success: true,
      data: {
        cveId: score.cveId,
        epss: score.epss,
        percentile: score.percentile,
        scoreDate: score.scoreDate,
        modelVersion: score.modelVersion,
        interpretation: interpretEpssScore(score.epss),
      },
    })
  } catch (error: any) {
    console.error('Error fetching EPSS score:', error)
    res.status(500).json({
      error: 'Failed to fetch EPSS score',
      message: error.message,
    })
  }
}

/**
 * Get high-risk CVEs (EPSS score above threshold)
 */
export const getHighRisk = async (req: Request, res: Response) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 0.5
    const limit = parseInt(req.query.limit as string) || 100

    const cves = await getHighRiskCves(threshold, limit)

    res.json({
      success: true,
      threshold,
      count: cves.length,
      data: cves.map((score) => ({
        cveId: score.cveId,
        epss: score.epss,
        percentile: score.percentile,
        scoreDate: score.scoreDate,
        interpretation: interpretEpssScore(score.epss),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching high-risk CVEs:', error)
    res.status(500).json({
      error: 'Failed to fetch high-risk CVEs',
      message: error.message,
    })
  }
}

/**
 * Refresh EPSS data from API
 */
export const refreshData = async (req: Request, res: Response) => {
  try {
    const mode = req.query.mode as string || 'incremental'

    console.log(`Starting EPSS data refresh (mode: ${mode})...`)

    let scores
    if (mode === 'full') {
      // Full refresh: download all EPSS scores
      console.log('Performing full EPSS data refresh...')
      scores = await fetchAllEpssScores()
    } else {
      // Incremental: fetch scores for CVEs we already have in our database
      console.log('Performing incremental EPSS data refresh...')

      // Get all unique CVE IDs from our vulnerability databases
      const { prisma } = await import('../services/database/prismaClient')

      const nvdCves = await prisma.nvdCve.findMany({ select: { cveId: true } })
      const jvnCves = await prisma.jvnVulnerability.findMany({ select: { cveId: true } })
      const cisaCves = await prisma.cisaKev.findMany({ select: { cveId: true } })
      const redhatCves = await prisma.redHatCve.findMany({ select: { cveId: true } })

      const allCveIds = new Set<string>()
      nvdCves.forEach((c) => c.cveId && allCveIds.add(c.cveId))
      jvnCves.forEach((c) => c.cveId && allCveIds.add(c.cveId))
      cisaCves.forEach((c) => allCveIds.add(c.cveId))
      redhatCves.forEach((c) => allCveIds.add(c.cveId))

      const cveIdArray = Array.from(allCveIds)
      console.log(`Fetching EPSS scores for ${cveIdArray.length} unique CVEs...`)

      // Fetch in batches (EPSS API has limits)
      const batchSize = 100
      scores = []

      for (let i = 0; i < cveIdArray.length; i += batchSize) {
        const batch = cveIdArray.slice(i, i + batchSize)
        try {
          const batchScores = await fetchEpssScoresByCves(batch)
          scores.push(...batchScores)
          console.log(`Fetched ${scores.length}/${cveIdArray.length} EPSS scores...`)
        } catch (error) {
          console.error(`Error fetching batch ${i / batchSize + 1}:`, error)
          // Continue with next batch
        }
      }
    }

    // Save to database
    await saveEpssScores(scores)

    // Get updated stats
    const stats = await getEpssStats()
    const latestDate = await getLatestScoreDate()

    res.json({
      success: true,
      message: `Successfully refreshed ${scores.length} EPSS scores`,
      mode,
      scoresUpdated: scores.length,
      latestScoreDate: latestDate,
      stats,
    })
  } catch (error: any) {
    console.error('Error refreshing EPSS data:', error)
    res.status(500).json({
      error: 'Failed to refresh EPSS data',
      message: error.message,
    })
  }
}

/**
 * Get all EPSS scores
 */
export const getAllScores = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 1000
    const offset = parseInt(req.query.offset as string) || 0

    const allScores = await getAllEpssScores()
    const paginatedScores = allScores.slice(offset, offset + limit)

    res.json({
      success: true,
      total: allScores.length,
      limit,
      offset,
      data: paginatedScores,
    })
  } catch (error: any) {
    console.error('Error fetching all EPSS scores:', error)
    res.status(500).json({
      error: 'Failed to fetch EPSS scores',
      message: error.message,
    })
  }
}

/**
 * Get EPSS scores for multiple CVEs (bulk query)
 */
export const getScoresByCves = async (req: Request, res: Response) => {
  try {
    const cveIds = req.body.cveIds as string[]

    if (!Array.isArray(cveIds) || cveIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'cveIds must be a non-empty array',
      })
    }

    const scores = await getEpssScoresByCveIds(cveIds.map((id) => id.toUpperCase()))

    res.json({
      success: true,
      requested: cveIds.length,
      found: scores.length,
      data: scores,
    })
  } catch (error: any) {
    console.error('Error fetching EPSS scores:', error)
    res.status(500).json({
      error: 'Failed to fetch EPSS scores',
      message: error.message,
    })
  }
}
