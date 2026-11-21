import { prisma } from './prismaClient'
import type { Indicator } from '@prisma/client'

export interface IndicatorData {
  indicatorId: string
  indicatorType: string
  value: string
  pattern?: string
  patternType?: string
  confidence?: number
  validFrom: string
  validUntil?: string
  threatType?: string
  severity?: string
  description?: string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
}

/**
 * Save or update indicators in the database
 */
export const saveIndicators = async (indicators: IndicatorData[]): Promise<void> => {
  console.log(`Saving ${indicators.length} indicator entries to database...`)

  try {
    await prisma.$transaction(
      indicators.map((indicator) =>
        prisma.indicator.upsert({
          where: { indicatorId: indicator.indicatorId },
          update: {
            indicatorType: indicator.indicatorType,
            value: indicator.value,
            pattern: indicator.pattern,
            patternType: indicator.patternType,
            confidence: indicator.confidence ?? 50,
            validFrom: new Date(indicator.validFrom),
            validUntil: indicator.validUntil ? new Date(indicator.validUntil) : null,
            threatType: indicator.threatType,
            severity: indicator.severity,
            description: indicator.description,
            source: indicator.source || 'manual',
            sourceUrl: indicator.sourceUrl,
            metadata: indicator.metadata ? JSON.stringify(indicator.metadata) : null,
          },
          create: {
            indicatorId: indicator.indicatorId,
            indicatorType: indicator.indicatorType,
            value: indicator.value,
            pattern: indicator.pattern,
            patternType: indicator.patternType,
            confidence: indicator.confidence ?? 50,
            validFrom: new Date(indicator.validFrom),
            validUntil: indicator.validUntil ? new Date(indicator.validUntil) : null,
            threatType: indicator.threatType,
            severity: indicator.severity,
            description: indicator.description,
            source: indicator.source || 'manual',
            sourceUrl: indicator.sourceUrl,
            metadata: indicator.metadata ? JSON.stringify(indicator.metadata) : null,
          },
        })
      )
    )

    console.log(`Successfully saved ${indicators.length} indicator entries`)
  } catch (error) {
    console.error('Failed to save indicator data to database:', error)
    throw error
  }
}

/**
 * Get all indicators from the database
 */
export const getAllIndicators = async (): Promise<Indicator[]> => {
  try {
    const indicators = await prisma.indicator.findMany({
      orderBy: {
        validFrom: 'desc',
      },
    })

    console.log(`Retrieved ${indicators.length} indicator entries from database`)
    return indicators
  } catch (error) {
    console.error('Failed to retrieve indicators from database:', error)
    throw error
  }
}

/**
 * Get an indicator by its ID
 */
export const getIndicatorById = async (indicatorId: string): Promise<Indicator | null> => {
  try {
    const indicator = await prisma.indicator.findUnique({
      where: { indicatorId },
    })

    return indicator
  } catch (error) {
    console.error(`Failed to retrieve indicator ${indicatorId} from database:`, error)
    throw error
  }
}

/**
 * Get indicators by type
 */
export const getIndicatorsByType = async (indicatorType: string): Promise<Indicator[]> => {
  try {
    const indicators = await prisma.indicator.findMany({
      where: { indicatorType },
      orderBy: {
        validFrom: 'desc',
      },
    })

    return indicators
  } catch (error) {
    console.error(`Failed to retrieve indicators with type ${indicatorType}:`, error)
    throw error
  }
}

/**
 * Get indicators by threat type
 */
export const getIndicatorsByThreatType = async (threatType: string): Promise<Indicator[]> => {
  try {
    const indicators = await prisma.indicator.findMany({
      where: { threatType },
      orderBy: {
        validFrom: 'desc',
      },
    })

    return indicators
  } catch (error) {
    console.error(`Failed to retrieve indicators with threat type ${threatType}:`, error)
    throw error
  }
}

/**
 * Get indicators by severity
 */
export const getIndicatorsBySeverity = async (severity: string): Promise<Indicator[]> => {
  try {
    const indicators = await prisma.indicator.findMany({
      where: { severity },
      orderBy: {
        validFrom: 'desc',
      },
    })

    return indicators
  } catch (error) {
    console.error(`Failed to retrieve indicators with severity ${severity}:`, error)
    throw error
  }
}

/**
 * Get active indicators (not expired)
 */
export const getActiveIndicators = async (): Promise<Indicator[]> => {
  try {
    const now = new Date()
    const indicators = await prisma.indicator.findMany({
      where: {
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: {
        validFrom: 'desc',
      },
    })

    return indicators
  } catch (error) {
    console.error('Failed to retrieve active indicators:', error)
    throw error
  }
}

/**
 * Search indicators by value
 */
export const searchIndicators = async (query: string): Promise<Indicator[]> => {
  try {
    const indicators = await prisma.indicator.findMany({
      where: {
        OR: [{ value: { contains: query } }, { description: { contains: query } }],
      },
      orderBy: {
        validFrom: 'desc',
      },
    })

    return indicators
  } catch (error) {
    console.error(`Failed to search indicators with query "${query}":`, error)
    throw error
  }
}

/**
 * Delete an indicator
 */
export const deleteIndicator = async (indicatorId: string): Promise<void> => {
  try {
    await prisma.indicator.delete({
      where: { indicatorId },
    })

    console.log(`Deleted indicator ${indicatorId}`)
  } catch (error) {
    console.error(`Failed to delete indicator ${indicatorId}:`, error)
    throw error
  }
}

/**
 * Get indicator statistics
 */
export const getIndicatorStats = async () => {
  try {
    const total = await prisma.indicator.count()
    const now = new Date()
    const active = await prisma.indicator.count({
      where: {
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
    })

    // Count by type
    const ipv4 = await prisma.indicator.count({ where: { indicatorType: 'ipv4' } })
    const domain = await prisma.indicator.count({ where: { indicatorType: 'domain' } })
    const url = await prisma.indicator.count({ where: { indicatorType: 'url' } })
    const fileHash = await prisma.indicator.count({
      where: {
        indicatorType: {
          in: ['file-hash-md5', 'file-hash-sha1', 'file-hash-sha256'],
        },
      },
    })

    // Count by threat type
    const malware = await prisma.indicator.count({ where: { threatType: 'malware' } })
    const phishing = await prisma.indicator.count({ where: { threatType: 'phishing' } })
    const c2 = await prisma.indicator.count({ where: { threatType: 'c2' } })

    return {
      total,
      active,
      byType: {
        ipv4,
        domain,
        url,
        'file-hash': fileHash,
      },
      byThreatType: {
        malware,
        phishing,
        c2,
      },
    }
  } catch (error) {
    console.error('Failed to retrieve indicator statistics:', error)
    throw error
  }
}
