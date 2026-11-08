import { prisma } from './prismaClient'
import type { NvdCveItem } from '../fetchers/nvdFetcher'
import { extractDescription, extractCvssData, fetchNvdYearTotal } from '../fetchers/nvdFetcher'

// Cache for year total to avoid hitting NVD API rate limits
let cachedYearTotal: { year: number; total: number; timestamp: number } | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export const saveNvdCves = async (cves: NvdCveItem[]): Promise<void> => {
  console.log(`Saving ${cves.length} NVD CVEs to database...`)

  const operations = cves.map((cve) => {
    const cvssData = extractCvssData(cve)
    const description = extractDescription(cve)

    // Extract weaknesses (CWE IDs)
    const weaknesses = cve.weaknesses
      ?.flatMap(w => w.description.map(d => d.value))
      .filter(Boolean) || []

    // Extract reference URLs
    const references = cve.references?.map(r => r.url) || []

    return prisma.nvdCve.upsert({
      where: { cveId: cve.id },
      update: {
        sourceIdentifier: cve.sourceIdentifier,
        lastModified: new Date(cve.lastModified),
        vulnStatus: cve.vulnStatus,
        description,
        cvssScore: cvssData.score,
        cvssSeverity: cvssData.severity,
        cvssVector: cvssData.vector,
        cvssVersion: cvssData.version,
        weaknesses: JSON.stringify(weaknesses),
        references: JSON.stringify(references),
      },
      create: {
        cveId: cve.id,
        sourceIdentifier: cve.sourceIdentifier,
        published: new Date(cve.published),
        lastModified: new Date(cve.lastModified),
        vulnStatus: cve.vulnStatus,
        description,
        cvssScore: cvssData.score,
        cvssSeverity: cvssData.severity,
        cvssVector: cvssData.vector,
        cvssVersion: cvssData.version,
        weaknesses: JSON.stringify(weaknesses),
        references: JSON.stringify(references),
      },
    })
  })

  await prisma.$transaction(operations)
  console.log(`Successfully saved ${cves.length} NVD CVEs`)
}

export const getAllNvdCves = async () => {
  return await prisma.nvdCve.findMany({
    orderBy: { published: 'desc' },
  })
}

export const getRecentNvdCves = async (days: number = 30) => {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  return await prisma.nvdCve.findMany({
    where: {
      published: {
        gte: dateThreshold,
      },
    },
    orderBy: { published: 'desc' },
  })
}

export const searchNvdCveById = async (cveId: string) => {
  return await prisma.nvdCve.findUnique({
    where: { cveId },
  })
}

export const getNvdStats = async () => {
  // Get current year
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1) // January 1st of current year
  const yearEnd = new Date(currentYear + 1, 0, 1) // January 1st of next year

  // Check cache first
  const now = Date.now()
  let apiTotal = -1

  if (cachedYearTotal && cachedYearTotal.year === currentYear && now - cachedYearTotal.timestamp < CACHE_DURATION) {
    console.log(`Using cached NVD year total: ${cachedYearTotal.total}`)
    apiTotal = cachedYearTotal.total
  } else {
    // Get accurate total from NVD API
    apiTotal = await fetchNvdYearTotal(currentYear)

    // Cache the result if successful
    if (apiTotal > 0) {
      cachedYearTotal = { year: currentYear, total: apiTotal, timestamp: now }
    }
  }

  // Fallback to DB count if API fails
  const dbTotal = await prisma.nvdCve.count({
    where: {
      published: {
        gte: yearStart,
        lt: yearEnd,
      },
    },
  })

  // Use API total if available, otherwise use DB count
  const total = apiTotal > 0 ? apiTotal : dbTotal

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  const recent24h = await prisma.nvdCve.count({
    where: {
      published: {
        gte: oneDayAgo,
      },
    },
  })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recent7days = await prisma.nvdCve.count({
    where: {
      published: {
        gte: sevenDaysAgo,
      },
    },
  })

  // Count by CVSS severity (current year only)
  const critical = await prisma.nvdCve.count({
    where: {
      published: {
        gte: yearStart,
        lt: yearEnd,
      },
      OR: [
        { cvssSeverity: 'CRITICAL' },
        { cvssScore: { gte: 9.0 } },
      ],
    },
  })

  const high = await prisma.nvdCve.count({
    where: {
      published: {
        gte: yearStart,
        lt: yearEnd,
      },
      OR: [
        { cvssSeverity: 'HIGH' },
        { cvssScore: { gte: 7.0, lt: 9.0 } },
      ],
    },
  })

  const medium = await prisma.nvdCve.count({
    where: {
      published: {
        gte: yearStart,
        lt: yearEnd,
      },
      OR: [
        { cvssSeverity: 'MEDIUM' },
        { cvssScore: { gte: 4.0, lt: 7.0 } },
      ],
    },
  })

  const low = await prisma.nvdCve.count({
    where: {
      published: {
        gte: yearStart,
        lt: yearEnd,
      },
      OR: [
        { cvssSeverity: 'LOW' },
        { cvssScore: { gte: 0.1, lt: 4.0 } },
      ],
    },
  })

  return {
    total,
    currentYear,
    recent24h,
    recent7days,
    bySeverity: {
      critical,
      high,
      medium,
      low,
    },
  }
}
