import { PrismaClient } from '@prisma/client'
import type { MsrcPatch } from '../fetchers/msrcFetcher'
import type { RedHatPatch } from '../fetchers/redhatPatchFetcher'
import type { CiscoPatch } from '../fetchers/ciscoPatchFetcher'
import type { VMwarePatch } from '../fetchers/vmwarePatchFetcher'
import type { OraclePatch } from '../fetchers/oraclePatchFetcher'
import type { AdobePatch } from '../fetchers/adobePatchFetcher'
import type { FortinetPatch } from '../fetchers/fortinetPatchFetcher'
import type { PaloAltoPatch } from '../fetchers/paloaltoPatchFetcher'

const prisma = new PrismaClient()

// Track if we've logged a sample for debugging
let sampleLogged = false

// Helper function to extract string value from object or return string/null
const extractString = (value: any): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.Value) return value.Value
  return String(value)
}

/**
 * Save Microsoft patch to database
 */
export const saveMicrosoftPatch = async (patch: MsrcPatch): Promise<void> => {
  try {
    // Convert empty strings to null and ensure proper date object
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Microsoft',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`\n❌ Error saving patch ${patch.patchId}`)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)

    // Log the full error object with all properties
    if (error?.name === 'PrismaClientValidationError') {
      console.error('Full validation error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    }

    // Log a sample patch data for the first error to see what we're sending
    if (!sampleLogged) {
      console.error('\n📋 Sample patch data being saved:')
      console.error('Original patch:', JSON.stringify(patch, null, 2))
      console.error('Prepared patchData:', JSON.stringify(patchData, null, 2))
      sampleLogged = true
    }

    throw error
  }
}

/**
 * Get all patches
 */
export const getAllPatches = async () => {
  return await prisma.vendorPatch.findMany({
    orderBy: {
      releaseDate: 'desc',
    },
  })
}

/**
 * Get patches by vendor
 */
export const getPatchesByVendor = async (vendor: string) => {
  return await prisma.vendorPatch.findMany({
    where: {
      vendor,
    },
    orderBy: {
      releaseDate: 'desc',
    },
  })
}

/**
 * Get patches by severity
 */
export const getPatchesBySeverity = async (severity: string) => {
  return await prisma.vendorPatch.findMany({
    where: {
      severity,
    },
    orderBy: {
      releaseDate: 'desc',
    },
  })
}

/**
 * Get patches by deployment status
 */
export const getPatchesByDeploymentStatus = async (status: string) => {
  return await prisma.vendorPatch.findMany({
    where: {
      deploymentStatus: status,
    },
    orderBy: {
      releaseDate: 'desc',
    },
  })
}

/**
 * Get patch statistics
 */
export const getPatchStats = async () => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [
    total,
    thisMonthCount,
    last24HoursCount,
    byVendor,
    bySeverity,
    byDeploymentStatus,
    pending,
    criticalUndeployed,
  ] = await Promise.all([
    // Total patches
    prisma.vendorPatch.count(),

    // This month
    prisma.vendorPatch.count({
      where: {
        releaseDate: {
          gte: thisMonth,
        },
      },
    }),

    // Last 24 hours
    prisma.vendorPatch.count({
      where: {
        releaseDate: {
          gte: last24Hours,
        },
      },
    }),

    // By vendor
    prisma.vendorPatch.groupBy({
      by: ['vendor'],
      _count: true,
    }),

    // By severity
    prisma.vendorPatch.groupBy({
      by: ['severity'],
      _count: true,
    }),

    // By deployment status
    prisma.vendorPatch.groupBy({
      by: ['deploymentStatus'],
      _count: true,
    }),

    // Pending patches
    prisma.vendorPatch.count({
      where: {
        deploymentStatus: 'pending',
      },
    }),

    // Critical undeployed
    prisma.vendorPatch.count({
      where: {
        severity: 'Critical',
        deploymentStatus: {
          not: 'deployed',
        },
      },
    }),
  ])

  return {
    total,
    thisMonth: thisMonthCount,
    last24Hours: last24HoursCount,
    pending,
    criticalUndeployed,
    byVendor: byVendor.reduce((acc, item) => {
      acc[item.vendor] = item._count
      return acc
    }, {} as Record<string, number>),
    bySeverity: bySeverity.reduce((acc, item) => {
      acc[item.severity] = item._count
      return acc
    }, {} as Record<string, number>),
    byDeploymentStatus: byDeploymentStatus.reduce((acc, item) => {
      acc[item.deploymentStatus] = item._count
      return acc
    }, {} as Record<string, number>),
  }
}

/**
 * Get calendar data (patches grouped by date)
 */
export const getPatchCalendar = async (year: number, month: number) => {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  const patches = await prisma.vendorPatch.findMany({
    where: {
      releaseDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      releaseDate: 'asc',
    },
  })

  // Group by date
  const calendar: Record<string, any[]> = {}
  patches.forEach(patch => {
    const dateKey = patch.releaseDate.toISOString().split('T')[0]
    if (!calendar[dateKey]) {
      calendar[dateKey] = []
    }
    calendar[dateKey].push(patch)
  })

  return calendar
}

/**
 * Update patch deployment status
 */
export const updatePatchDeploymentStatus = async (
  patchId: string,
  status: string,
  notes?: string
) => {
  return await prisma.vendorPatch.update({
    where: {
      patchId,
    },
    data: {
      deploymentStatus: status,
      deploymentDate: status === 'deployed' ? new Date() : null,
      deploymentNotes: notes,
      updatedAt: new Date(),
    },
  })
}

/**
 * Search patches
 */
export const searchPatches = async (query: string) => {
  return await prisma.vendorPatch.findMany({
    where: {
      OR: [
        {
          patchId: {
            contains: query,
          },
        },
        {
          title: {
            contains: query,
          },
        },
        {
          description: {
            contains: query,
          },
        },
        {
          cveIds: {
            contains: query,
          },
        },
      ],
    },
    orderBy: {
      releaseDate: 'desc',
    },
  })
}

/**
 * Get patch by ID
 */
export const getPatchById = async (patchId: string) => {
  return await prisma.vendorPatch.findUnique({
    where: {
      patchId,
    },
  })
}

/**
 * Delete old patches (older than specified days)
 */
export const deleteOldPatches = async (daysOld: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const result = await prisma.vendorPatch.deleteMany({
    where: {
      releaseDate: {
        lt: cutoffDate,
      },
      deploymentStatus: {
        in: ['deployed', 'skipped'],
      },
    },
  })

  return result.count
}

/**
 * Save Red Hat patch to database
 */
export const saveRedHatPatch = async (patch: RedHatPatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Red Hat',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving Red Hat patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}

/**
 * Save Cisco patch to database
 */
export const saveCiscoPatch = async (patch: CiscoPatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Cisco',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving Cisco patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}

/**
 * Save VMware patch to database
 */
export const saveVMwarePatch = async (patch: VMwarePatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'VMware',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving VMware patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}

/**
 * Save Oracle patch to database
 */
export const saveOraclePatch = async (patch: OraclePatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Oracle',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving Oracle patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}

/**
 * Save Adobe patch to database
 */
export const saveAdobePatch = async (patch: AdobePatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Adobe',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving Adobe patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}

/**
 * Save Fortinet patch to database
 */
export const saveFortinetPatch = async (patch: FortinetPatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Fortinet',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving Fortinet patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}

/**
 * Save Palo Alto patch to database
 */
export const savePaloAltoPatch = async (patch: PaloAltoPatch): Promise<void> => {
  try {
    const patchData = {
      title: extractString(patch.title) || 'Unknown',
      description: extractString(patch.description),
      severity: patch.severity,
      releaseDate: new Date(patch.releaseDate),
      releaseType: patch.releaseType,
      cveIds: JSON.stringify(patch.cveIds || []),
      cveCount: patch.cveIds?.length || 0,
      product: patch.product,
      productVersion: patch.productVersion || null,
      bulletinUrl: patch.bulletinUrl || null,
      kbArticleUrl: patch.kbArticleUrl || null,
      supersedes: patch.supersedes?.length ? JSON.stringify(patch.supersedes) : null,
    }

    await prisma.vendorPatch.upsert({
      where: {
        patchId: patch.patchId,
      },
      update: {
        ...patchData,
        updatedAt: new Date(),
      },
      create: {
        vendor: 'Palo Alto Networks',
        patchId: patch.patchId,
        ...patchData,
      },
    })
  } catch (error: any) {
    console.error(`Error saving Palo Alto patch ${patch.patchId}:`, error?.message || error)
    throw error
  }
}
