import type { Request, Response } from 'express'
import { fetchJvnVulnerabilities } from '../services/fetchers/jvnFetcher'
import {
  getAllJvnVulnerabilities,
  getRecentJvnVulnerabilities,
  getJvnStats,
  saveJvnVulnerabilities,
} from '../services/database/jvnDb'

export const getJvnVulnerabilities = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving JVN vulnerabilities from database...')
    const vulnerabilities = await getAllJvnVulnerabilities()
    console.log(`Retrieved ${vulnerabilities.length} JVN vulnerabilities from database`)

    const stats = await getJvnStats()

    res.json({
      success: true,
      data: vulnerabilities,
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

    res.json({
      success: true,
      data: vulnerabilities,
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
