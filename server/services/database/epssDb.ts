import { prisma } from './prismaClient'
import type { EpssScore } from '../fetchers/epssFetcher'

/**
 * Save or update EPSS scores in database
 */
export const saveEpssScores = async (scores: EpssScore[]): Promise<void> => {
  console.log(`Saving ${scores.length} EPSS scores to database...`)

  const operations = scores.map((score) => {
    return prisma.epssScore.upsert({
      where: { cveId: score.cve },
      update: {
        epss: score.epss,
        percentile: score.percentile,
        modelVersion: score.model_version,
        scoreDate: new Date(score.date),
        updatedAt: new Date(),
      },
      create: {
        cveId: score.cve,
        epss: score.epss,
        percentile: score.percentile,
        modelVersion: score.model_version,
        scoreDate: new Date(score.date),
      },
    })
  })

  // Process in batches to avoid overwhelming the database
  const batchSize = 100
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize)
    await prisma.$transaction(batch)
    console.log(`Processed ${Math.min(i + batchSize, operations.length)}/${operations.length} EPSS scores`)
  }

  console.log(`Successfully saved ${scores.length} EPSS scores`)
}

/**
 * Get EPSS score for a specific CVE
 */
export const getEpssScoreByCveId = async (cveId: string) => {
  return await prisma.epssScore.findUnique({
    where: { cveId },
  })
}

/**
 * Get EPSS scores for multiple CVEs
 */
export const getEpssScoresByCveIds = async (cveIds: string[]) => {
  return await prisma.epssScore.findMany({
    where: {
      cveId: {
        in: cveIds,
      },
    },
  })
}

/**
 * Get all EPSS scores
 */
export const getAllEpssScores = async () => {
  return await prisma.epssScore.findMany({
    orderBy: { epss: 'desc' },
  })
}

/**
 * Get high-risk CVEs (EPSS score above threshold)
 */
export const getHighRiskCves = async (threshold: number = 0.5, limit: number = 100) => {
  return await prisma.epssScore.findMany({
    where: {
      epss: {
        gte: threshold,
      },
    },
    orderBy: { epss: 'desc' },
    take: limit,
  })
}

/**
 * Get EPSS statistics
 */
export const getEpssStats = async () => {
  const total = await prisma.epssScore.count()

  const highRisk = await prisma.epssScore.count({
    where: {
      epss: {
        gte: 0.5,
      },
    },
  })

  const criticalRisk = await prisma.epssScore.count({
    where: {
      epss: {
        gte: 0.8,
      },
    },
  })

  // Get average score
  const avgResult = await prisma.epssScore.aggregate({
    _avg: {
      epss: true,
    },
  })

  // Get percentile distribution (approximate)
  const p90 = await prisma.epssScore.findMany({
    orderBy: { epss: 'desc' },
    take: Math.max(1, Math.floor(total * 0.1)),
    select: { epss: true },
  })

  const p75 = await prisma.epssScore.findMany({
    orderBy: { epss: 'desc' },
    take: Math.max(1, Math.floor(total * 0.25)),
    select: { epss: true },
  })

  const p50 = await prisma.epssScore.findMany({
    orderBy: { epss: 'desc' },
    take: Math.max(1, Math.floor(total * 0.5)),
    select: { epss: true },
  })

  return {
    total,
    highRisk,
    criticalRisk,
    averageScore: avgResult._avg.epss || 0,
    percentiles: {
      p50: p50.length > 0 ? p50[p50.length - 1].epss : 0,
      p75: p75.length > 0 ? p75[p75.length - 1].epss : 0,
      p90: p90.length > 0 ? p90[p90.length - 1].epss : 0,
    },
  }
}

/**
 * Get EPSS score distribution by ranges
 */
export const getEpssDistribution = async () => {
  const ranges = [
    { label: '0.0-0.2', min: 0.0, max: 0.2 },
    { label: '0.2-0.5', min: 0.2, max: 0.5 },
    { label: '0.5-0.8', min: 0.5, max: 0.8 },
    { label: '0.8-1.0', min: 0.8, max: 1.0 },
  ]

  const distribution = await Promise.all(
    ranges.map(async (range) => {
      const count = await prisma.epssScore.count({
        where: {
          epss: {
            gte: range.min,
            lt: range.max === 1.0 ? undefined : range.max,
            lte: range.max === 1.0 ? 1.0 : undefined,
          },
        },
      })

      return {
        range: range.label,
        count,
      }
    })
  )

  return distribution
}

/**
 * Delete old EPSS scores (older than specified days)
 */
export const deleteOldEpssScores = async (days: number = 90) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const result = await prisma.epssScore.deleteMany({
    where: {
      scoreDate: {
        lt: cutoffDate,
      },
    },
  })

  console.log(`Deleted ${result.count} old EPSS scores (older than ${days} days)`)
  return result.count
}

/**
 * Get latest score date in database
 */
export const getLatestScoreDate = async (): Promise<Date | null> => {
  const latest = await prisma.epssScore.findFirst({
    orderBy: { scoreDate: 'desc' },
    select: { scoreDate: true },
  })

  return latest?.scoreDate || null
}
