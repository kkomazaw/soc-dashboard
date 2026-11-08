import { Request, Response } from 'express'
import {
  fetchRedHatAdvisories,
  fetchRedHatCVEs,
  fetchAllRedHatSecurityData,
} from '../services/fetchers/redhatFetcher'
import {
  getAllRedHatAdvisories,
  getRecentRedHatAdvisories,
  getAllRedHatCVEs,
  getRecentRedHatCVEs,
  getRedHatStats,
  saveRedHatAdvisories,
  saveRedHatCVEs,
} from '../services/database/redhatDb'
import { getEpssScoresByCveIds } from '../services/database/epssDb'
import { interpretEpssScore } from '../services/fetchers/epssFetcher'

/**
 * Get all Red Hat Security Advisories
 */
export const getAdvisories = async (req: Request, res: Response) => {
  try {
    const advisories = await getAllRedHatAdvisories()

    // Parse JSON strings
    const parsedAdvisories = advisories.map((advisory) => ({
      ...advisory,
      cves: advisory.cves ? JSON.parse(advisory.cves) : [],
      affectedPackages: advisory.affectedPackages
        ? JSON.parse(advisory.affectedPackages)
        : [],
      bugzilla: advisory.bugzilla ? JSON.parse(advisory.bugzilla) : [],
    }))

    res.json(parsedAdvisories)
  } catch (error: any) {
    console.error('Error fetching Red Hat advisories:', error)
    res.status(500).json({ error: 'Failed to fetch Red Hat advisories' })
  }
}

/**
 * Get all Red Hat CVEs
 */
export const getCVEs = async (req: Request, res: Response) => {
  try {
    const cves = await getAllRedHatCVEs()

    // Get EPSS scores for all CVEs
    const cveIds = cves.map(cve => cve.cveId)
    const epssScores = await getEpssScoresByCveIds(cveIds)
    const epssMap = new Map(epssScores.map(score => [score.cveId, score]))

    // Parse JSON strings and add EPSS data
    const parsedCVEs = cves.map((cve) => ({
      ...cve,
      advisories: cve.advisories ? JSON.parse(cve.advisories) : [],
      details: cve.details ? JSON.parse(cve.details) : [],
      affectedPackages: cve.affectedPackages ? JSON.parse(cve.affectedPackages) : [],
      references: cve.references ? JSON.parse(cve.references) : [],
      epss: epssMap.has(cve.cveId) ? {
        score: epssMap.get(cve.cveId)!.epss,
        percentile: epssMap.get(cve.cveId)!.percentile,
        interpretation: interpretEpssScore(epssMap.get(cve.cveId)!.epss),
        scoreDate: epssMap.get(cve.cveId)!.scoreDate,
      } : null,
    }))

    res.json(parsedCVEs)
  } catch (error: any) {
    console.error('Error fetching Red Hat CVEs:', error)
    res.status(500).json({ error: 'Failed to fetch Red Hat CVEs' })
  }
}

/**
 * Get Red Hat security statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getRedHatStats()
    res.json(stats)
  } catch (error: any) {
    console.error('Error fetching Red Hat stats:', error)
    res.status(500).json({ error: 'Failed to fetch Red Hat stats' })
  }
}

/**
 * Get combined Red Hat security data (advisories + CVEs)
 */
export const getAllData = async (req: Request, res: Response) => {
  try {
    const [advisories, cves, stats] = await Promise.all([
      getAllRedHatAdvisories(),
      getAllRedHatCVEs(),
      getRedHatStats(),
    ])

    // Get EPSS scores for all CVEs
    const cveIds = cves.map(cve => cve.cveId)
    const epssScores = await getEpssScoresByCveIds(cveIds)
    const epssMap = new Map(epssScores.map(score => [score.cveId, score]))

    // Parse JSON strings for advisories
    const parsedAdvisories = advisories.map((advisory) => ({
      ...advisory,
      cves: advisory.cves ? JSON.parse(advisory.cves) : [],
      affectedPackages: advisory.affectedPackages
        ? JSON.parse(advisory.affectedPackages)
        : [],
      bugzilla: advisory.bugzilla ? JSON.parse(advisory.bugzilla) : [],
    }))

    // Parse JSON strings for CVEs and add EPSS data
    const parsedCVEs = cves.map((cve) => ({
      ...cve,
      advisories: cve.advisories ? JSON.parse(cve.advisories) : [],
      details: cve.details ? JSON.parse(cve.details) : [],
      affectedPackages: cve.affectedPackages ? JSON.parse(cve.affectedPackages) : [],
      references: cve.references ? JSON.parse(cve.references) : [],
      epss: epssMap.has(cve.cveId) ? {
        score: epssMap.get(cve.cveId)!.epss,
        percentile: epssMap.get(cve.cveId)!.percentile,
        interpretation: interpretEpssScore(epssMap.get(cve.cveId)!.epss),
        scoreDate: epssMap.get(cve.cveId)!.scoreDate,
      } : null,
    }))

    res.json({
      advisories: parsedAdvisories,
      cves: parsedCVEs,
      stats,
    })
  } catch (error: any) {
    console.error('Error fetching Red Hat data:', error)
    res.status(500).json({ error: 'Failed to fetch Red Hat data' })
  }
}

/**
 * Refresh Red Hat security data from API
 */
export const refreshData = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    console.log(`Refreshing Red Hat security data for last ${days} days...`)

    const data = await fetchAllRedHatSecurityData(days)

    // Save to database
    await Promise.all([
      saveRedHatAdvisories(data.advisories),
      saveRedHatCVEs(data.cves),
    ])

    // Get updated stats
    const stats = await getRedHatStats()

    res.json({
      success: true,
      message: `Successfully refreshed Red Hat security data`,
      stats,
    })
  } catch (error: any) {
    console.error('Error refreshing Red Hat data:', error)
    res.status(500).json({
      error: 'Failed to refresh Red Hat data',
      message: error.message,
    })
  }
}
