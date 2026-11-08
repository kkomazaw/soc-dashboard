import type { Request, Response } from 'express'
import { fetchJvnVulnerabilities } from '../services/fetchers/jvnFetcher'
import {
  getAllJvnVulnerabilities,
  getRecentJvnVulnerabilities,
  getJvnStats,
  saveJvnVulnerabilities,
} from '../services/database/jvnDb'
import { getEpssScoresByCveIds } from '../services/database/epssDb'
import { interpretEpssScore } from '../services/fetchers/epssFetcher'

export const getJvnVulnerabilities = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving JVN vulnerabilities from database...')
    const vulnerabilities = await getAllJvnVulnerabilities()
    console.log(`Retrieved ${vulnerabilities.length} JVN vulnerabilities from database`)

    // Get EPSS scores for all CVEs
    const cveIds = vulnerabilities.map(v => v.cveId).filter(id => id !== null) as string[]
    const epssScores = await getEpssScoresByCveIds(cveIds)
    const epssMap = new Map(epssScores.map(score => [score.cveId, score]))

    // Enrich vulnerabilities with EPSS data
    const enrichedVulns = vulnerabilities.map(vuln => ({
      ...vuln,
      epss: vuln.cveId && epssMap.has(vuln.cveId) ? {
        score: epssMap.get(vuln.cveId)!.epss,
        percentile: epssMap.get(vuln.cveId)!.percentile,
        interpretation: interpretEpssScore(epssMap.get(vuln.cveId)!.epss),
        scoreDate: epssMap.get(vuln.cveId)!.scoreDate,
      } : null,
    }))

    const stats = await getJvnStats()

    res.json({
      success: true,
      data: enrichedVulns,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error retrieving JVN vulnerabilities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve JVN vulnerabilities',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const getRecentJvn = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    console.log(`Retrieving JVN vulnerabilities from last ${days} days...`)

    const vulnerabilities = await getRecentJvnVulnerabilities(days)

    // Get EPSS scores for all CVEs
    const cveIds = vulnerabilities.map(v => v.cveId).filter(id => id !== null) as string[]
    const epssScores = await getEpssScoresByCveIds(cveIds)
    const epssMap = new Map(epssScores.map(score => [score.cveId, score]))

    // Enrich vulnerabilities with EPSS data
    const enrichedVulns = vulnerabilities.map(vuln => ({
      ...vuln,
      epss: vuln.cveId && epssMap.has(vuln.cveId) ? {
        score: epssMap.get(vuln.cveId)!.epss,
        percentile: epssMap.get(vuln.cveId)!.percentile,
        interpretation: interpretEpssScore(epssMap.get(vuln.cveId)!.epss),
        scoreDate: epssMap.get(vuln.cveId)!.scoreDate,
      } : null,
    }))

    res.json({
      success: true,
      data: enrichedVulns,
      count: vulnerabilities.length,
      days,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error retrieving recent JVN vulnerabilities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent JVN vulnerabilities',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const refreshJvnData = async (req: Request, res: Response) => {
  try {
    console.log('Manual JVN data refresh requested...')

    const vulnerabilities = await fetchJvnVulnerabilities()

    if (vulnerabilities.length > 0) {
      await saveJvnVulnerabilities(vulnerabilities)
    }

    const stats = await getJvnStats()

    res.json({
      success: true,
      message: 'JVN data refreshed successfully',
      count: vulnerabilities.length,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error refreshing JVN data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refresh JVN data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
