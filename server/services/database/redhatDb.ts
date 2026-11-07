import { prisma } from './prismaClient'
import type { RedHatAdvisory, RedHatCVE } from '../fetchers/redhatFetcher'

/**
 * Save Red Hat Security Advisories to database
 */
export const saveRedHatAdvisories = async (advisories: RedHatAdvisory[]): Promise<void> => {
  console.log(`Saving ${advisories.length} Red Hat advisories to database...`)

  const operations = advisories.map((advisory) => {
    const publicDate = advisory.public_date ? new Date(advisory.public_date) : new Date()

    return prisma.redHatAdvisory.upsert({
      where: { advisoryId: advisory.id },
      update: {
        advisoryType: advisory.type,
        severity: advisory.severity || null,
        synopsis: advisory.synopsis,
        description: advisory.description || null,
        publicDate: publicDate,
        cves: advisory.CVEs ? JSON.stringify(advisory.CVEs) : null,
        affectedPackages: advisory.affected_packages
          ? JSON.stringify(advisory.affected_packages)
          : null,
        bugzilla: advisory.bugzilla ? JSON.stringify(advisory.bugzilla) : null,
        resourceUrl: advisory.resource_url || null,
        updatedAt: new Date(),
      },
      create: {
        advisoryId: advisory.id,
        advisoryType: advisory.type,
        severity: advisory.severity || null,
        synopsis: advisory.synopsis,
        description: advisory.description || null,
        publicDate: publicDate,
        cves: advisory.CVEs ? JSON.stringify(advisory.CVEs) : null,
        affectedPackages: advisory.affected_packages
          ? JSON.stringify(advisory.affected_packages)
          : null,
        bugzilla: advisory.bugzilla ? JSON.stringify(advisory.bugzilla) : null,
        resourceUrl: advisory.resource_url || null,
      },
    })
  })

  await prisma.$transaction(operations)
  console.log(`Successfully saved ${advisories.length} Red Hat advisories`)
}

/**
 * Save Red Hat CVEs to database
 */
export const saveRedHatCVEs = async (cves: RedHatCVE[]): Promise<void> => {
  console.log(`Saving ${cves.length} Red Hat CVEs to database...`)

  const operations = cves.map((cve) => {
    const publicDate = cve.public_date ? new Date(cve.public_date) : new Date()

    return prisma.redHatCve.upsert({
      where: { cveId: cve.CVE },
      update: {
        severity: cve.severity || null,
        publicDate: publicDate,
        advisories: cve.advisories ? JSON.stringify(cve.advisories) : null,
        bugzillaId: cve.bugzilla?.id || null,
        bugzillaDesc: cve.bugzilla?.description || null,
        cvssScore: cve.cvss?.cvss_base_score || null,
        cvssVector: cve.cvss?.cvss_scoring_vector || null,
        cvss3Score: cve.cvss3?.cvss3_base_score || null,
        cvss3Vector: cve.cvss3?.cvss3_scoring_vector || null,
        cwe: cve.cwe || null,
        details: cve.details ? JSON.stringify(cve.details) : null,
        affectedPackages: cve.affected_packages ? JSON.stringify(cve.affected_packages) : null,
        resourceUrl: cve.resource_url || null,
        references: cve.references ? JSON.stringify(cve.references) : null,
        updatedAt: new Date(),
      },
      create: {
        cveId: cve.CVE,
        severity: cve.severity || null,
        publicDate: publicDate,
        advisories: cve.advisories ? JSON.stringify(cve.advisories) : null,
        bugzillaId: cve.bugzilla?.id || null,
        bugzillaDesc: cve.bugzilla?.description || null,
        cvssScore: cve.cvss?.cvss_base_score || null,
        cvssVector: cve.cvss?.cvss_scoring_vector || null,
        cvss3Score: cve.cvss3?.cvss3_base_score || null,
        cvss3Vector: cve.cvss3?.cvss3_scoring_vector || null,
        cwe: cve.cwe || null,
        details: cve.details ? JSON.stringify(cve.details) : null,
        affectedPackages: cve.affected_packages ? JSON.stringify(cve.affected_packages) : null,
        resourceUrl: cve.resource_url || null,
        references: cve.references ? JSON.stringify(cve.references) : null,
      },
    })
  })

  await prisma.$transaction(operations)
  console.log(`Successfully saved ${cves.length} Red Hat CVEs`)
}

/**
 * Get all Red Hat Security Advisories
 */
export const getAllRedHatAdvisories = async () => {
  return await prisma.redHatAdvisory.findMany({
    orderBy: { publicDate: 'desc' },
  })
}

/**
 * Get recent Red Hat Security Advisories
 */
export const getRecentRedHatAdvisories = async (days: number = 30) => {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  return await prisma.redHatAdvisory.findMany({
    where: {
      publicDate: {
        gte: dateThreshold,
      },
    },
    orderBy: { publicDate: 'desc' },
  })
}

/**
 * Get all Red Hat CVEs
 */
export const getAllRedHatCVEs = async () => {
  return await prisma.redHatCve.findMany({
    orderBy: { publicDate: 'desc' },
  })
}

/**
 * Get recent Red Hat CVEs
 */
export const getRecentRedHatCVEs = async (days: number = 30) => {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  return await prisma.redHatCve.findMany({
    where: {
      publicDate: {
        gte: dateThreshold,
      },
    },
    orderBy: { publicDate: 'desc' },
  })
}

/**
 * Get Red Hat statistics
 */
export const getRedHatStats = async () => {
  const totalAdvisories = await prisma.redHatAdvisory.count()
  const totalCVEs = await prisma.redHatCve.count()

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const advisoriesRecent24h = await prisma.redHatAdvisory.count({
    where: {
      publicDate: {
        gte: oneDayAgo,
      },
    },
  })

  const cvesRecent24h = await prisma.redHatCve.count({
    where: {
      publicDate: {
        gte: oneDayAgo,
      },
    },
  })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const advisoriesRecent7days = await prisma.redHatAdvisory.count({
    where: {
      publicDate: {
        gte: sevenDaysAgo,
      },
    },
  })

  const cvesRecent7days = await prisma.redHatCve.count({
    where: {
      publicDate: {
        gte: sevenDaysAgo,
      },
    },
  })

  // Count by severity (for advisories)
  const criticalAdvisories = await prisma.redHatAdvisory.count({
    where: {
      severity: { equals: 'Critical', mode: 'insensitive' },
    },
  })

  const importantAdvisories = await prisma.redHatAdvisory.count({
    where: {
      severity: { equals: 'Important', mode: 'insensitive' },
    },
  })

  const moderateAdvisories = await prisma.redHatAdvisory.count({
    where: {
      severity: { equals: 'Moderate', mode: 'insensitive' },
    },
  })

  const lowAdvisories = await prisma.redHatAdvisory.count({
    where: {
      severity: { equals: 'Low', mode: 'insensitive' },
    },
  })

  // Count by severity (for CVEs)
  const criticalCVEs = await prisma.redHatCve.count({
    where: {
      severity: { equals: 'Critical', mode: 'insensitive' },
    },
  })

  const importantCVEs = await prisma.redHatCve.count({
    where: {
      severity: { equals: 'Important', mode: 'insensitive' },
    },
  })

  const moderateCVEs = await prisma.redHatCve.count({
    where: {
      severity: { equals: 'Moderate', mode: 'insensitive' },
    },
  })

  const lowCVEs = await prisma.redHatCve.count({
    where: {
      severity: { equals: 'Low', mode: 'insensitive' },
    },
  })

  return {
    advisories: {
      total: totalAdvisories,
      recent24h: advisoriesRecent24h,
      recent7days: advisoriesRecent7days,
      bySeverity: {
        critical: criticalAdvisories,
        important: importantAdvisories,
        moderate: moderateAdvisories,
        low: lowAdvisories,
      },
    },
    cves: {
      total: totalCVEs,
      recent24h: cvesRecent24h,
      recent7days: cvesRecent7days,
      bySeverity: {
        critical: criticalCVEs,
        important: importantCVEs,
        moderate: moderateCVEs,
        low: lowCVEs,
      },
    },
    combined: {
      total: totalAdvisories + totalCVEs,
      recent24h: advisoriesRecent24h + cvesRecent24h,
      recent7days: advisoriesRecent7days + cvesRecent7days,
      bySeverity: {
        critical: criticalAdvisories + criticalCVEs,
        important: importantAdvisories + importantCVEs,
        moderate: moderateAdvisories + moderateCVEs,
        low: lowAdvisories + lowCVEs,
      },
    },
  }
}
