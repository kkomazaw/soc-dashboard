import { prisma } from './prismaClient'
import type { SecurityIncident } from '@prisma/client'

export interface SecurityIncidentData {
  incidentId: string
  name: string
  alternateName?: string
  discoveryDate: string
  publicDisclosure?: string
  severity: string
  category: string
  description: string
  affectedSystems?: string[]
  relatedCVEs?: string[]
  threatActors?: string[]
  mitigations?: string[]
  references?: Array<{ title: string; url: string }>
  impact?: string
  status?: string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
}

/**
 * Save or update security incidents in the database
 */
export const saveSecurityIncidents = async (
  incidents: SecurityIncidentData[]
): Promise<void> => {
  console.log(`Saving ${incidents.length} security incident entries to database...`)

  try {
    // Use transaction for better performance
    await prisma.$transaction(
      incidents.map((incident) =>
        prisma.securityIncident.upsert({
          where: { incidentId: incident.incidentId },
          update: {
            name: incident.name,
            alternateName: incident.alternateName,
            discoveryDate: new Date(incident.discoveryDate),
            publicDisclosure: incident.publicDisclosure ? new Date(incident.publicDisclosure) : null,
            severity: incident.severity,
            category: incident.category,
            description: incident.description,
            affectedSystems: incident.affectedSystems ? JSON.stringify(incident.affectedSystems) : null,
            relatedCVEs: incident.relatedCVEs ? JSON.stringify(incident.relatedCVEs) : null,
            threatActors: incident.threatActors ? JSON.stringify(incident.threatActors) : null,
            mitigations: incident.mitigations ? JSON.stringify(incident.mitigations) : null,
            references: incident.references ? JSON.stringify(incident.references) : null,
            impact: incident.impact,
            status: incident.status || 'active',
            source: incident.source || 'manual',
            sourceUrl: incident.sourceUrl,
            metadata: incident.metadata ? JSON.stringify(incident.metadata) : null,
          },
          create: {
            incidentId: incident.incidentId,
            name: incident.name,
            alternateName: incident.alternateName,
            discoveryDate: new Date(incident.discoveryDate),
            publicDisclosure: incident.publicDisclosure ? new Date(incident.publicDisclosure) : null,
            severity: incident.severity,
            category: incident.category,
            description: incident.description,
            affectedSystems: incident.affectedSystems ? JSON.stringify(incident.affectedSystems) : null,
            relatedCVEs: incident.relatedCVEs ? JSON.stringify(incident.relatedCVEs) : null,
            threatActors: incident.threatActors ? JSON.stringify(incident.threatActors) : null,
            mitigations: incident.mitigations ? JSON.stringify(incident.mitigations) : null,
            references: incident.references ? JSON.stringify(incident.references) : null,
            impact: incident.impact,
            status: incident.status || 'active',
            source: incident.source || 'manual',
            sourceUrl: incident.sourceUrl,
            metadata: incident.metadata ? JSON.stringify(incident.metadata) : null,
          },
        })
      )
    )

    console.log(`Successfully saved ${incidents.length} security incident entries`)
  } catch (error) {
    console.error('Failed to save security incident data to database:', error)
    throw error
  }
}

/**
 * Get all security incidents from the database
 */
export const getAllSecurityIncidents = async (): Promise<SecurityIncident[]> => {
  try {
    const incidents = await prisma.securityIncident.findMany({
      orderBy: {
        discoveryDate: 'desc',
      },
    })

    console.log(`Retrieved ${incidents.length} security incident entries from database`)
    return incidents
  } catch (error) {
    console.error('Failed to retrieve security incident data from database:', error)
    throw error
  }
}

/**
 * Get security incidents by severity
 */
export const getSecurityIncidentsBySeverity = async (severity: string): Promise<SecurityIncident[]> => {
  try {
    const incidents = await prisma.securityIncident.findMany({
      where: {
        severity,
      },
      orderBy: {
        discoveryDate: 'desc',
      },
    })

    console.log(`Found ${incidents.length} security incidents with severity: ${severity}`)
    return incidents
  } catch (error) {
    console.error('Failed to retrieve security incidents by severity:', error)
    throw error
  }
}

/**
 * Get security incidents by category
 */
export const getSecurityIncidentsByCategory = async (category: string): Promise<SecurityIncident[]> => {
  try {
    const incidents = await prisma.securityIncident.findMany({
      where: {
        category,
      },
      orderBy: {
        discoveryDate: 'desc',
      },
    })

    console.log(`Found ${incidents.length} security incidents in category: ${category}`)
    return incidents
  } catch (error) {
    console.error('Failed to retrieve security incidents by category:', error)
    throw error
  }
}

/**
 * Get security incidents by status
 */
export const getSecurityIncidentsByStatus = async (status: string): Promise<SecurityIncident[]> => {
  try {
    const incidents = await prisma.securityIncident.findMany({
      where: {
        status,
      },
      orderBy: {
        discoveryDate: 'desc',
      },
    })

    console.log(`Found ${incidents.length} security incidents with status: ${status}`)
    return incidents
  } catch (error) {
    console.error('Failed to retrieve security incidents by status:', error)
    throw error
  }
}

/**
 * Get recent security incidents (last N days)
 */
export const getRecentSecurityIncidents = async (days: number = 30): Promise<SecurityIncident[]> => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const incidents = await prisma.securityIncident.findMany({
      where: {
        discoveryDate: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        discoveryDate: 'desc',
      },
    })

    console.log(`Found ${incidents.length} security incidents from last ${days} days`)
    return incidents
  } catch (error) {
    console.error('Failed to retrieve recent security incidents:', error)
    throw error
  }
}

/**
 * Get a single security incident by incidentId
 */
export const getSecurityIncidentById = async (incidentId: string): Promise<SecurityIncident | null> => {
  try {
    const incident = await prisma.securityIncident.findUnique({
      where: {
        incidentId,
      },
    })

    return incident
  } catch (error) {
    console.error(`Failed to retrieve security incident with ID ${incidentId}:`, error)
    throw error
  }
}

/**
 * Update security incident status
 */
export const updateSecurityIncidentStatus = async (
  incidentId: string,
  status: string
): Promise<SecurityIncident> => {
  try {
    const incident = await prisma.securityIncident.update({
      where: {
        incidentId,
      },
      data: {
        status,
      },
    })

    console.log(`Updated status for incident ${incidentId} to ${status}`)
    return incident
  } catch (error) {
    console.error(`Failed to update status for incident ${incidentId}:`, error)
    throw error
  }
}

/**
 * Delete a security incident
 */
export const deleteSecurityIncident = async (incidentId: string): Promise<void> => {
  try {
    await prisma.securityIncident.delete({
      where: {
        incidentId,
      },
    })

    console.log(`Deleted security incident ${incidentId}`)
  } catch (error) {
    console.error(`Failed to delete security incident ${incidentId}:`, error)
    throw error
  }
}

/**
 * Get database statistics
 */
export const getSecurityIncidentStats = async () => {
  try {
    const total = await prisma.securityIncident.count()
    const active = await prisma.securityIncident.count({
      where: {
        status: 'active',
      },
    })
    const critical = await prisma.securityIncident.count({
      where: {
        severity: 'CRITICAL',
      },
    })

    return { total, active, critical }
  } catch (error) {
    console.error('Failed to get security incident stats:', error)
    throw error
  }
}
