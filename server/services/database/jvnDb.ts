import { prisma } from './prismaClient'
import type { JvnVulnerabilityItem } from '../fetchers/jvnFetcher'

export const saveJvnVulnerabilities = async (
  vulnerabilities: JvnVulnerabilityItem[]
): Promise<void> => {
  console.log(`Saving ${vulnerabilities.length} JVN vulnerabilities to database...`)

  const operations = vulnerabilities.map((vuln) => {
    const publishedDate = vuln.pubDate ? new Date(vuln.pubDate) : new Date()

    return prisma.jvnVulnerability.upsert({
      where: { jvnId: vuln.identifier },
      update: {
        title: vuln.title,
        summary: vuln.description,
        severity: vuln.severity,
        cvssScore: vuln.cvssScore,
        references: vuln.references || vuln.link,
        publishedDate: publishedDate,
        lastModifiedDate: new Date(),
      },
      create: {
        jvnId: vuln.identifier,
        title: vuln.title,
        summary: vuln.description,
        severity: vuln.severity,
        cvssScore: vuln.cvssScore,
        references: vuln.references || vuln.link,
        publishedDate: publishedDate,
      },
    })
  })

  await prisma.$transaction(operations)
  console.log(`Successfully saved ${vulnerabilities.length} JVN vulnerabilities`)
}

export const getAllJvnVulnerabilities = async () => {
  return await prisma.jvnVulnerability.findMany({
    orderBy: { publishedDate: 'desc' },
  })
}

export const getRecentJvnVulnerabilities = async (days: number = 30) => {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  return await prisma.jvnVulnerability.findMany({
    where: {
      publishedDate: {
        gte: dateThreshold,
      },
    },
    orderBy: { publishedDate: 'desc' },
  })
}

export const getJvnStats = async () => {
  const total = await prisma.jvnVulnerability.count()

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  const recent24h = await prisma.jvnVulnerability.count({
    where: {
      publishedDate: {
        gte: oneDayAgo,
      },
    },
  })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recent7days = await prisma.jvnVulnerability.count({
    where: {
      publishedDate: {
        gte: sevenDaysAgo,
      },
    },
  })

  // Count by severity
  const critical = await prisma.jvnVulnerability.count({
    where: {
      OR: [
        { severity: { contains: '緊急' } },
        { severity: { contains: 'Critical' } },
        { cvssScore: { gte: 9.0 } },
      ],
    },
  })

  const high = await prisma.jvnVulnerability.count({
    where: {
      OR: [
        { severity: { contains: '重要' } },
        { severity: { contains: 'High' } },
        { cvssScore: { gte: 7.0, lt: 9.0 } },
      ],
    },
  })

  return {
    total,
    recent24h,
    recent7days,
    bySeverity: {
      critical,
      high,
    },
  }
}
