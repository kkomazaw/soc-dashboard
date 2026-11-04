import { prisma } from './prismaClient'
import type { CisaKev } from '@prisma/client'

export interface CisaKevData {
  cveId: string
  vendorProject: string
  product: string
  vulnerabilityName: string
  dateAdded: string
  shortDescription: string
  requiredAction: string
  dueDate: string
  knownRansomwareCampaignUse: boolean
  notes?: string
}

/**
 * Save or update CISA KEV vulnerabilities in the database
 */
export const saveCisaKevData = async (
  vulnerabilities: CisaKevData[]
): Promise<void> => {
  console.log(`Saving ${vulnerabilities.length} CISA KEV entries to database...`)

  try {
    // Use transaction for better performance
    await prisma.$transaction(
      vulnerabilities.map((vuln) =>
        prisma.cisaKev.upsert({
          where: { cveId: vuln.cveId },
          update: {
            vendorProject: vuln.vendorProject,
            product: vuln.product,
            vulnerabilityName: vuln.vulnerabilityName,
            dateAdded: new Date(vuln.dateAdded),
            shortDescription: vuln.shortDescription,
            requiredAction: vuln.requiredAction,
            dueDate: new Date(vuln.dueDate),
            knownRansomwareCampaignUse: vuln.knownRansomwareCampaignUse,
            notes: vuln.notes || null,
          },
          create: {
            cveId: vuln.cveId,
            vendorProject: vuln.vendorProject,
            product: vuln.product,
            vulnerabilityName: vuln.vulnerabilityName,
            dateAdded: new Date(vuln.dateAdded),
            shortDescription: vuln.shortDescription,
            requiredAction: vuln.requiredAction,
            dueDate: new Date(vuln.dueDate),
            knownRansomwareCampaignUse: vuln.knownRansomwareCampaignUse,
            notes: vuln.notes || null,
          },
        })
      )
    )

    console.log(`Successfully saved ${vulnerabilities.length} CISA KEV entries`)
  } catch (error) {
    console.error('Failed to save CISA KEV data to database:', error)
    throw error
  }
}

/**
 * Get all CISA KEV vulnerabilities from the database
 */
export const getAllCisaKev = async (): Promise<CisaKev[]> => {
  try {
    const vulnerabilities = await prisma.cisaKev.findMany({
      orderBy: {
        dateAdded: 'desc',
      },
    })

    console.log(`Retrieved ${vulnerabilities.length} CISA KEV entries from database`)
    return vulnerabilities
  } catch (error) {
    console.error('Failed to retrieve CISA KEV data from database:', error)
    throw error
  }
}

/**
 * Get CISA KEV vulnerabilities added in the last N hours
 */
export const getRecentCisaKev = async (hours: number = 24): Promise<CisaKev[]> => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - hours)

    const vulnerabilities = await prisma.cisaKev.findMany({
      where: {
        dateAdded: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        dateAdded: 'desc',
      },
    })

    console.log(`Found ${vulnerabilities.length} CISA KEV entries from last ${hours} hours`)
    return vulnerabilities
  } catch (error) {
    console.error('Failed to retrieve recent CISA KEV data:', error)
    throw error
  }
}

/**
 * Get database statistics
 */
export const getCisaKevStats = async () => {
  try {
    const total = await prisma.cisaKev.count()
    const last24h = await prisma.cisaKev.count({
      where: {
        dateAdded: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    return { total, last24h }
  } catch (error) {
    console.error('Failed to get CISA KEV stats:', error)
    throw error
  }
}
