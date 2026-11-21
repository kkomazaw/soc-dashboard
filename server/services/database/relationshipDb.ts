import { prisma } from './prismaClient'
import type { CampaignRelationship } from '@prisma/client'

export interface RelationshipData {
  sourceType: string
  sourceId: string
  targetType: string
  targetId: string
  relationshipType: string
  confidence?: number
  description?: string
  firstSeen?: string
  lastSeen?: string
  source?: string
  metadata?: Record<string, any>
}

/**
 * Save or update relationships in the database
 */
export const saveRelationships = async (relationships: RelationshipData[]): Promise<void> => {
  console.log(`Saving ${relationships.length} relationship entries to database...`)

  try {
    await prisma.$transaction(
      relationships.map((rel) =>
        prisma.campaignRelationship.upsert({
          where: {
            sourceType_sourceId_targetType_targetId_relationshipType: {
              sourceType: rel.sourceType,
              sourceId: rel.sourceId,
              targetType: rel.targetType,
              targetId: rel.targetId,
              relationshipType: rel.relationshipType,
            },
          },
          update: {
            confidence: rel.confidence ?? 50,
            description: rel.description,
            firstSeen: rel.firstSeen ? new Date(rel.firstSeen) : null,
            lastSeen: rel.lastSeen ? new Date(rel.lastSeen) : null,
            source: rel.source || 'manual',
            metadata: rel.metadata ? JSON.stringify(rel.metadata) : null,
          },
          create: {
            sourceType: rel.sourceType,
            sourceId: rel.sourceId,
            targetType: rel.targetType,
            targetId: rel.targetId,
            relationshipType: rel.relationshipType,
            confidence: rel.confidence ?? 50,
            description: rel.description,
            firstSeen: rel.firstSeen ? new Date(rel.firstSeen) : null,
            lastSeen: rel.lastSeen ? new Date(rel.lastSeen) : null,
            source: rel.source || 'manual',
            metadata: rel.metadata ? JSON.stringify(rel.metadata) : null,
          },
        })
      )
    )

    console.log(`Successfully saved ${relationships.length} relationship entries`)
  } catch (error) {
    console.error('Failed to save relationship data to database:', error)
    throw error
  }
}

/**
 * Get all relationships from the database
 */
export const getAllRelationships = async (): Promise<CampaignRelationship[]> => {
  try {
    const relationships = await prisma.campaignRelationship.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Retrieved ${relationships.length} relationship entries from database`)
    return relationships
  } catch (error) {
    console.error('Failed to retrieve relationships from database:', error)
    throw error
  }
}

/**
 * Get relationships for a specific entity
 */
export const getRelationshipsForEntity = async (
  entityType: string,
  entityId: string
): Promise<CampaignRelationship[]> => {
  try {
    const relationships = await prisma.campaignRelationship.findMany({
      where: {
        OR: [
          { sourceType: entityType, sourceId: entityId },
          { targetType: entityType, targetId: entityId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return relationships
  } catch (error) {
    console.error(`Failed to retrieve relationships for ${entityType}:${entityId}:`, error)
    throw error
  }
}

/**
 * Get relationships by type
 */
export const getRelationshipsByType = async (
  relationshipType: string
): Promise<CampaignRelationship[]> => {
  try {
    const relationships = await prisma.campaignRelationship.findMany({
      where: { relationshipType },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return relationships
  } catch (error) {
    console.error(`Failed to retrieve relationships with type ${relationshipType}:`, error)
    throw error
  }
}

/**
 * Get relationships from source to target
 */
export const getRelationshipsFromTo = async (
  sourceType: string,
  sourceId: string,
  targetType: string
): Promise<CampaignRelationship[]> => {
  try {
    const relationships = await prisma.campaignRelationship.findMany({
      where: {
        sourceType,
        sourceId,
        targetType,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return relationships
  } catch (error) {
    console.error(
      `Failed to retrieve relationships from ${sourceType}:${sourceId} to ${targetType}:`,
      error
    )
    throw error
  }
}

/**
 * Delete a relationship
 */
export const deleteRelationship = async (id: number): Promise<void> => {
  try {
    await prisma.campaignRelationship.delete({
      where: { id },
    })

    console.log(`Deleted relationship ${id}`)
  } catch (error) {
    console.error(`Failed to delete relationship ${id}:`, error)
    throw error
  }
}

/**
 * Delete all relationships for an entity
 */
export const deleteRelationshipsForEntity = async (
  entityType: string,
  entityId: string
): Promise<void> => {
  try {
    await prisma.campaignRelationship.deleteMany({
      where: {
        OR: [
          { sourceType: entityType, sourceId: entityId },
          { targetType: entityType, targetId: entityId },
        ],
      },
    })

    console.log(`Deleted all relationships for ${entityType}:${entityId}`)
  } catch (error) {
    console.error(`Failed to delete relationships for ${entityType}:${entityId}:`, error)
    throw error
  }
}

/**
 * Get relationship statistics
 */
export const getRelationshipStats = async () => {
  try {
    const total = await prisma.campaignRelationship.count()

    // Count by relationship type
    const uses = await prisma.campaignRelationship.count({ where: { relationshipType: 'uses' } })
    const attributedTo = await prisma.campaignRelationship.count({
      where: { relationshipType: 'attributed-to' },
    })
    const indicates = await prisma.campaignRelationship.count({
      where: { relationshipType: 'indicates' },
    })
    const targets = await prisma.campaignRelationship.count({
      where: { relationshipType: 'targets' },
    })

    return {
      total,
      byType: {
        uses,
        'attributed-to': attributedTo,
        indicates,
        targets,
      },
    }
  } catch (error) {
    console.error('Failed to retrieve relationship statistics:', error)
    throw error
  }
}

/**
 * Get campaign graph data (relationships centered on a campaign)
 */
export const getCampaignGraph = async (campaignId: string) => {
  try {
    const relationships = await getRelationshipsForEntity('campaign', campaignId)

    // Get all related entity IDs
    const entityIds = new Set<string>()
    const entityTypes = new Map<string, string>()

    relationships.forEach((rel) => {
      if (rel.sourceId !== campaignId) {
        entityIds.add(rel.sourceId)
        entityTypes.set(rel.sourceId, rel.sourceType)
      }
      if (rel.targetId !== campaignId) {
        entityIds.add(rel.targetId)
        entityTypes.set(rel.targetId, rel.targetType)
      }
    })

    // Fetch entity details
    const entities: Array<{ id: string; type: string; name: string; data: any }> = []

    // Add campaign itself
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId },
    })
    if (campaign) {
      entities.push({
        id: campaign.campaignId,
        type: 'campaign',
        name: campaign.name,
        data: campaign,
      })
    }

    // Fetch related entities
    for (const [entityId, entityType] of entityTypes) {
      let entity: any = null
      let name = ''

      switch (entityType) {
        case 'threat-actor':
          entity = await prisma.threatActor.findUnique({ where: { actorId: entityId } })
          name = entity?.name || entityId
          break
        case 'malware':
          entity = await prisma.malware.findUnique({ where: { malwareId: entityId } })
          name = entity?.name || entityId
          break
        case 'indicator':
          entity = await prisma.indicator.findUnique({ where: { indicatorId: entityId } })
          name = entity?.value || entityId
          break
        case 'attack-pattern':
          entity = await prisma.attackTechnique.findUnique({ where: { techniqueId: entityId } })
          name = entity?.name || entityId
          break
        case 'vulnerability':
          // Try to find in NVD, CISA KEV, or JVN
          const nvdCve = await prisma.nvdCve.findUnique({ where: { cveId: entityId } })
          if (nvdCve) {
            entity = nvdCve
            name = entityId
          }
          break
      }

      if (entity) {
        entities.push({
          id: entityId,
          type: entityType,
          name,
          data: entity,
        })
      }
    }

    return {
      entities,
      relationships: relationships.map((rel) => ({
        id: rel.id,
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.relationshipType,
        confidence: rel.confidence,
        description: rel.description,
      })),
    }
  } catch (error) {
    console.error(`Failed to get campaign graph for ${campaignId}:`, error)
    throw error
  }
}
