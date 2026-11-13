import { prisma } from './prismaClient'
import { getCountryName } from '../../utils/countryMapper'
import type { AbuseIPDBReport } from '../fetchers/abuseipdbFetcher'
import type { OTXIPIndicator } from '../fetchers/otxFetcher'

export interface IpThreatReportInput {
  ipAddress: string
  countryCode: string
  country: string
  threatType: string
  severity: string
  confidence: number
  source: string
  sourceReportId?: string
  description?: string
  reportedDate: Date
  metadata?: any
}

export interface GeoThreatAggregation {
  countryCode: string
  country: string
  threatCount: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  topThreats: string[]
  uniqueIps: number
  lastReportDate: Date
}

/**
 * Save IP threat reports from AbuseIPDB
 */
export const saveAbuseIPDBReports = async (reports: AbuseIPDBReport[]): Promise<void> => {
  console.log(`Saving ${reports.length} AbuseIPDB threat reports...`)

  const operations = reports.map((report) => {
    const sourceReportId = `abuseipdb-${report.ipAddress}`
    return prisma.ipThreatReport.upsert({
      where: {
        ipAddress_source_reportedDate: {
          ipAddress: report.ipAddress,
          source: 'abuseipdb',
          reportedDate: new Date(report.lastReportedAt),
        },
      },
      update: {
        countryCode: report.countryCode,
        country: report.country,
        threatType: report.threatType,
        severity: report.severity,
        confidence: report.abuseConfidenceScore,
        sourceReportId,
        description: `${report.totalReports} reports, categories: ${report.categories.join(', ')}`,
        metadata: JSON.stringify({
          abuseConfidenceScore: report.abuseConfidenceScore,
          totalReports: report.totalReports,
          categories: report.categories,
        }),
        updatedAt: new Date(),
      },
      create: {
        ipAddress: report.ipAddress,
        countryCode: report.countryCode,
        country: report.country,
        threatType: report.threatType,
        severity: report.severity,
        confidence: report.abuseConfidenceScore,
        source: 'abuseipdb',
        sourceReportId,
        description: `${report.totalReports} reports, categories: ${report.categories.join(', ')}`,
        reportedDate: new Date(report.lastReportedAt),
        metadata: JSON.stringify({
          abuseConfidenceScore: report.abuseConfidenceScore,
          totalReports: report.totalReports,
          categories: report.categories,
        }),
      },
    })
  })

  // Process in batches
  const batchSize = 50
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize)
    await prisma.$transaction(batch)
    console.log(`Processed ${Math.min(i + batchSize, operations.length)}/${operations.length} AbuseIPDB reports`)
  }

  console.log(`Successfully saved ${reports.length} AbuseIPDB reports`)
}

/**
 * Save IP threat reports from OTX
 */
export const saveOTXReports = async (reports: OTXIPIndicator[]): Promise<void> => {
  console.log(`Saving ${reports.length} OTX threat reports...`)

  const operations = reports.map((report) => {
    const sourceReportId = `otx-${report.ipAddress}`
    return prisma.ipThreatReport.upsert({
      where: {
        ipAddress_source_reportedDate: {
          ipAddress: report.ipAddress,
          source: 'otx',
          reportedDate: new Date(report.lastSeen),
        },
      },
      update: {
        countryCode: report.countryCode,
        country: report.country,
        threatType: report.threatType,
        severity: report.severity,
        confidence: Math.min(Math.round((report.reputation / 10) * 100), 100),
        sourceReportId,
        description: `${report.pulseCount} pulses, tags: ${report.tags.slice(0, 5).join(', ')}`,
        metadata: JSON.stringify({
          reputation: report.reputation,
          pulseCount: report.pulseCount,
          tags: report.tags,
        }),
        updatedAt: new Date(),
      },
      create: {
        ipAddress: report.ipAddress,
        countryCode: report.countryCode,
        country: report.country,
        threatType: report.threatType,
        severity: report.severity,
        confidence: Math.min(Math.round((report.reputation / 10) * 100), 100),
        source: 'otx',
        sourceReportId,
        description: `${report.pulseCount} pulses, tags: ${report.tags.slice(0, 5).join(', ')}`,
        reportedDate: new Date(report.lastSeen),
        metadata: JSON.stringify({
          reputation: report.reputation,
          pulseCount: report.pulseCount,
          tags: report.tags,
        }),
      },
    })
  })

  // Process in batches
  const batchSize = 50
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize)
    await prisma.$transaction(batch)
    console.log(`Processed ${Math.min(i + batchSize, operations.length)}/${operations.length} OTX reports`)
  }

  console.log(`Successfully saved ${reports.length} OTX reports`)
}

/**
 * Calculate and save geographic threat aggregations
 */
export const calculateGeoThreatAggregations = async (): Promise<void> => {
  console.log('Calculating geographic threat aggregations...')

  // Get all threat reports grouped by country code
  const countries = await prisma.ipThreatReport.groupBy({
    by: ['countryCode'],
    _count: {
      id: true,
    },
  })

  for (const { countryCode } of countries) {
    // Get proper country name from code
    const country = getCountryName(countryCode)
    // Get all reports for this country
    const reports = await prisma.ipThreatReport.findMany({
      where: { countryCode },
      orderBy: { reportedDate: 'desc' },
    })

    if (reports.length === 0) continue

    // Calculate statistics
    const threatCount = reports.length
    const criticalCount = reports.filter(r => r.severity === 'critical').length
    const highCount = reports.filter(r => r.severity === 'high').length
    const mediumCount = reports.filter(r => r.severity === 'medium').length
    const lowCount = reports.filter(r => r.severity === 'low').length
    const uniqueIps = new Set(reports.map(r => r.ipAddress)).size
    const lastReportDate = reports[0].reportedDate

    // Get top threat types
    const threatTypeCounts: { [key: string]: number } = {}
    reports.forEach(r => {
      threatTypeCounts[r.threatType] = (threatTypeCounts[r.threatType] || 0) + 1
    })
    const topThreats = Object.entries(threatTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type)

    // Upsert aggregation
    await prisma.geoThreatAggregation.upsert({
      where: { countryCode },
      update: {
        country,
        threatCount,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        topThreats: JSON.stringify(topThreats),
        uniqueIps,
        lastReportDate,
        calculatedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        countryCode,
        country,
        threatCount,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        topThreats: JSON.stringify(topThreats),
        uniqueIps,
        lastReportDate,
        calculatedAt: new Date(),
      },
    })
  }

  console.log(`Calculated aggregations for ${countries.length} countries`)
}

/**
 * Get all geographic threat aggregations
 */
export const getAllGeoThreatAggregations = async (): Promise<GeoThreatAggregation[]> => {
  const aggregations = await prisma.geoThreatAggregation.findMany({
    orderBy: { threatCount: 'desc' },
  })

  return aggregations.map(agg => ({
    countryCode: agg.countryCode,
    country: agg.country,
    threatCount: agg.threatCount,
    criticalCount: agg.criticalCount,
    highCount: agg.highCount,
    mediumCount: agg.mediumCount,
    lowCount: agg.lowCount,
    topThreats: JSON.parse(agg.topThreats),
    uniqueIps: agg.uniqueIps,
    lastReportDate: agg.lastReportDate,
  }))
}

/**
 * Get top N countries by threat count
 */
export const getTopThreatCountries = async (limit: number = 10): Promise<GeoThreatAggregation[]> => {
  const aggregations = await prisma.geoThreatAggregation.findMany({
    orderBy: { threatCount: 'desc' },
    take: limit,
  })

  return aggregations.map(agg => ({
    countryCode: agg.countryCode,
    country: agg.country,
    threatCount: agg.threatCount,
    criticalCount: agg.criticalCount,
    highCount: agg.highCount,
    mediumCount: agg.mediumCount,
    lowCount: agg.lowCount,
    topThreats: JSON.parse(agg.topThreats),
    uniqueIps: agg.uniqueIps,
    lastReportDate: agg.lastReportDate,
  }))
}

/**
 * Get geographic threat statistics
 */
export const getGeoThreatStats = async () => {
  const totalReports = await prisma.ipThreatReport.count()
  const totalCountries = await prisma.geoThreatAggregation.count()
  const uniqueIps = await prisma.ipThreatReport.groupBy({
    by: ['ipAddress'],
    _count: true,
  })

  const criticalThreats = await prisma.ipThreatReport.count({
    where: { severity: 'critical' },
  })

  const highThreats = await prisma.ipThreatReport.count({
    where: { severity: 'high' },
  })

  const last24h = await prisma.ipThreatReport.count({
    where: {
      reportedDate: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  })

  return {
    totalReports,
    totalCountries,
    uniqueIps: uniqueIps.length,
    criticalThreats,
    highThreats,
    reportsLast24h: last24h,
  }
}

/**
 * Get recent IP threat reports
 */
export const getRecentIpThreatReports = async (limit: number = 100) => {
  return await prisma.ipThreatReport.findMany({
    orderBy: { reportedDate: 'desc' },
    take: limit,
  })
}

/**
 * Get threat reports by country
 */
export const getThreatReportsByCountry = async (countryCode: string) => {
  return await prisma.ipThreatReport.findMany({
    where: { countryCode },
    orderBy: { reportedDate: 'desc' },
  })
}

/**
 * Clean up old threat reports (older than specified days)
 */
export const cleanupOldThreatReports = async (daysToKeep: number = 90): Promise<number> => {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

  const result = await prisma.ipThreatReport.deleteMany({
    where: {
      reportedDate: {
        lt: cutoffDate,
      },
    },
  })

  console.log(`Cleaned up ${result.count} old threat reports (older than ${daysToKeep} days)`)
  return result.count
}
