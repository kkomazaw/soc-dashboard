import type { Request, Response } from 'express'
import {
  getAllIndicators,
  getIndicatorById,
  getIndicatorsByType,
  getIndicatorsByThreatType,
  getIndicatorsBySeverity,
  getActiveIndicators,
  searchIndicators,
  deleteIndicator,
  getIndicatorStats,
  saveIndicators,
  type IndicatorData,
} from '../services/database/indicatorDb'

/**
 * Get all indicators
 */
export const getIndicators = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving indicators from database...')

    const { type, threatType, severity, active, search } = req.query

    let data

    if (search && typeof search === 'string') {
      data = await searchIndicators(search)
    } else if (active === 'true') {
      data = await getActiveIndicators()
    } else if (type && typeof type === 'string') {
      data = await getIndicatorsByType(type)
    } else if (threatType && typeof threatType === 'string') {
      data = await getIndicatorsByThreatType(threatType)
    } else if (severity && typeof severity === 'string') {
      data = await getIndicatorsBySeverity(severity)
    } else {
      data = await getAllIndicators()
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = data.map((item) => ({
      id: item.indicatorId,
      indicatorId: item.indicatorId,
      indicatorType: item.indicatorType,
      value: item.value,
      pattern: item.pattern,
      patternType: item.patternType,
      confidence: item.confidence,
      validFrom: item.validFrom.toISOString().split('T')[0],
      validUntil: item.validUntil ? item.validUntil.toISOString().split('T')[0] : undefined,
      threatType: item.threatType,
      severity: item.severity,
      description: item.description,
      source: item.source,
      sourceUrl: item.sourceUrl,
      metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    console.log(`Successfully retrieved ${responseData.length} indicators`)
    res.json(responseData)
  } catch (error) {
    console.error('Error fetching indicators:', error)
    res.status(500).json({
      error: 'Failed to fetch indicators',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a single indicator by ID
 */
export const getIndicator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Retrieving indicator ${id}...`)

    const indicator = await getIndicatorById(id)

    if (!indicator) {
      return res.status(404).json({
        error: 'Indicator not found',
        message: `No indicator found with ID: ${id}`,
      })
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = {
      id: indicator.indicatorId,
      indicatorId: indicator.indicatorId,
      indicatorType: indicator.indicatorType,
      value: indicator.value,
      pattern: indicator.pattern,
      patternType: indicator.patternType,
      confidence: indicator.confidence,
      validFrom: indicator.validFrom.toISOString().split('T')[0],
      validUntil: indicator.validUntil ? indicator.validUntil.toISOString().split('T')[0] : undefined,
      threatType: indicator.threatType,
      severity: indicator.severity,
      description: indicator.description,
      source: indicator.source,
      sourceUrl: indicator.sourceUrl,
      metadata: indicator.metadata ? JSON.parse(indicator.metadata) : undefined,
      createdAt: indicator.createdAt.toISOString(),
      updatedAt: indicator.updatedAt.toISOString(),
    }

    res.json(responseData)
  } catch (error) {
    console.error(`Error fetching indicator ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to fetch indicator',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Create a new indicator
 */
export const createIndicator = async (req: Request, res: Response) => {
  try {
    const indicatorData: IndicatorData = req.body

    if (!indicatorData.indicatorId || !indicatorData.indicatorType || !indicatorData.value || !indicatorData.validFrom) {
      return res.status(400).json({
        error: 'Invalid indicator data',
        message: 'indicatorId, indicatorType, value, and validFrom are required',
      })
    }

    console.log(`Creating indicator ${indicatorData.indicatorId}...`)
    await saveIndicators([indicatorData])

    const indicator = await getIndicatorById(indicatorData.indicatorId)

    res.status(201).json({
      message: 'Indicator created successfully',
      indicator,
    })
  } catch (error) {
    console.error('Error creating indicator:', error)
    res.status(500).json({
      error: 'Failed to create indicator',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Bulk create indicators
 */
export const createIndicatorsBulk = async (req: Request, res: Response) => {
  try {
    const indicators: IndicatorData[] = req.body.indicators

    if (!Array.isArray(indicators) || indicators.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'indicators array is required and must not be empty',
      })
    }

    console.log(`Creating ${indicators.length} indicators in bulk...`)
    await saveIndicators(indicators)

    res.status(201).json({
      message: `${indicators.length} indicators created successfully`,
      count: indicators.length,
    })
  } catch (error) {
    console.error('Error creating indicators in bulk:', error)
    res.status(500).json({
      error: 'Failed to create indicators',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Delete an indicator
 */
export const removeIndicator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    console.log(`Deleting indicator ${id}...`)
    await deleteIndicator(id)

    res.json({
      message: 'Indicator deleted successfully',
    })
  } catch (error) {
    console.error(`Error deleting indicator ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to delete indicator',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get indicator statistics
 */
export const getIndicatorStatistics = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving indicator statistics...')
    const stats = await getIndicatorStats()

    res.json(stats)
  } catch (error) {
    console.error('Error fetching indicator stats:', error)
    res.status(500).json({
      error: 'Failed to fetch indicator statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
