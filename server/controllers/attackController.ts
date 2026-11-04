import type { Request, Response } from 'express'
import { fetchAttackData } from '../services/fetchers/attackFetcher'
import {
  saveAttackTechniques,
  saveAttackTactics,
  getAllTechniques,
  getAllTactics,
  searchTechniqueById,
  getTechniquesByTactic,
  getTechniquesByPlatform,
  getAttackStats,
  searchTechniques,
} from '../services/database/attackDb'

// Get all techniques from database
export const getTechniques = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving ATT&CK techniques from database...')
    const techniques = await getAllTechniques()
    const stats = await getAttackStats()

    res.json({
      success: true,
      data: techniques,
      stats,
      count: techniques.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error retrieving techniques:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve techniques',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get all tactics from database
export const getTactics = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving ATT&CK tactics from database...')
    const tactics = await getAllTactics()

    res.json({
      success: true,
      data: tactics,
      count: tactics.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error retrieving tactics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tactics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get ATT&CK matrix (all tactics with their techniques)
export const getMatrix = async (req: Request, res: Response) => {
  try {
    console.log('Building ATT&CK matrix...')
    const tactics = await getAllTactics()
    const techniques = await getAllTechniques()

    // Build matrix structure
    const matrix = tactics.map((tactic) => {
      const tacticTechniques = techniques.filter((tech) =>
        tech.tactics.includes(tactic.shortName)
      )

      return {
        ...tactic,
        techniqueDetails: tacticTechniques,
      }
    })

    res.json({
      success: true,
      data: matrix,
      stats: {
        totalTactics: tactics.length,
        totalTechniques: techniques.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error building matrix:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to build ATT&CK matrix',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Search technique by ID
export const searchTechnique = async (req: Request, res: Response) => {
  try {
    const { techniqueId } = req.params
    console.log(`Searching for technique ${techniqueId}...`)

    const technique = await searchTechniqueById(techniqueId.toUpperCase())

    if (!technique) {
      return res.status(404).json({
        success: false,
        error: 'Technique not found',
        message: `Technique ${techniqueId} not found in database`,
      })
    }

    res.json({
      success: true,
      data: technique,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error searching technique:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to search technique',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get techniques by tactic
export const getTechniquesByTacticEndpoint = async (
  req: Request,
  res: Response
) => {
  try {
    const { tactic } = req.params
    console.log(`Getting techniques for tactic ${tactic}...`)

    const techniques = await getTechniquesByTactic(tactic)

    res.json({
      success: true,
      data: techniques,
      count: techniques.length,
      tactic,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting techniques by tactic:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get techniques by tactic',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get techniques by platform
export const getTechniquesByPlatformEndpoint = async (
  req: Request,
  res: Response
) => {
  try {
    const { platform } = req.params
    console.log(`Getting techniques for platform ${platform}...`)

    const techniques = await getTechniquesByPlatform(platform)

    res.json({
      success: true,
      data: techniques,
      count: techniques.length,
      platform,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting techniques by platform:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get techniques by platform',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Search techniques by keyword
export const searchTechniquesEndpoint = async (req: Request, res: Response) => {
  try {
    const { q } = req.query
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid search query',
        message: 'Please provide a search query parameter (?q=keyword)',
      })
    }

    console.log(`Searching techniques for keyword: ${q}...`)
    const techniques = await searchTechniques(q)

    res.json({
      success: true,
      data: techniques,
      count: techniques.length,
      query: q,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error searching techniques:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to search techniques',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Get ATT&CK statistics
export const getStats = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving ATT&CK statistics...')
    const stats = await getAttackStats()

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting statistics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Refresh ATT&CK data from MITRE
export const refreshAttackData = async (req: Request, res: Response) => {
  try {
    console.log('Manual ATT&CK data refresh requested...')

    const { techniques, tactics } = await fetchAttackData()

    if (techniques.length > 0) {
      await saveAttackTechniques(techniques)
    }

    if (tactics.length > 0) {
      await saveAttackTactics(tactics)
    }

    const stats = await getAttackStats()

    res.json({
      success: true,
      message: 'ATT&CK data refreshed successfully',
      count: {
        techniques: techniques.length,
        tactics: tactics.length,
      },
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error refreshing ATT&CK data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refresh ATT&CK data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
