import type { Request, Response } from 'express'
import {
  getAllRelationships,
  getRelationshipsForEntity,
  getRelationshipsByType,
  getRelationshipsFromTo,
  deleteRelationship,
  deleteRelationshipsForEntity,
  getRelationshipStats,
  saveRelationships,
  type RelationshipData,
} from '../services/database/relationshipDb'

/**
 * Get all relationships
 */
export const getRelationships = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving relationships from database...')

    const { type, entityType, entityId, sourceType, sourceId, targetType } = req.query

    let data

    if (entityType && entityId && typeof entityType === 'string' && typeof entityId === 'string') {
      data = await getRelationshipsForEntity(entityType, entityId)
    } else if (
      sourceType &&
      sourceId &&
      targetType &&
      typeof sourceType === 'string' &&
      typeof sourceId === 'string' &&
      typeof targetType === 'string'
    ) {
      data = await getRelationshipsFromTo(sourceType, sourceId, targetType)
    } else if (type && typeof type === 'string') {
      data = await getRelationshipsByType(type)
    } else {
      data = await getAllRelationships()
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = data.map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      targetType: item.targetType,
      targetId: item.targetId,
      relationshipType: item.relationshipType,
      confidence: item.confidence,
      description: item.description,
      firstSeen: item.firstSeen ? item.firstSeen.toISOString().split('T')[0] : undefined,
      lastSeen: item.lastSeen ? item.lastSeen.toISOString().split('T')[0] : undefined,
      source: item.source,
      metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    console.log(`Successfully retrieved ${responseData.length} relationships`)
    res.json(responseData)
  } catch (error) {
    console.error('Error fetching relationships:', error)
    res.status(500).json({
      error: 'Failed to fetch relationships',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Create a new relationship
 */
export const createRelationship = async (req: Request, res: Response) => {
  try {
    const relationshipData: RelationshipData = req.body

    if (
      !relationshipData.sourceType ||
      !relationshipData.sourceId ||
      !relationshipData.targetType ||
      !relationshipData.targetId ||
      !relationshipData.relationshipType
    ) {
      return res.status(400).json({
        error: 'Invalid relationship data',
        message:
          'sourceType, sourceId, targetType, targetId, and relationshipType are required',
      })
    }

    console.log(
      `Creating relationship: ${relationshipData.sourceType}:${relationshipData.sourceId} -> ${relationshipData.relationshipType} -> ${relationshipData.targetType}:${relationshipData.targetId}...`
    )
    await saveRelationships([relationshipData])

    res.status(201).json({
      message: 'Relationship created successfully',
    })
  } catch (error) {
    console.error('Error creating relationship:', error)
    res.status(500).json({
      error: 'Failed to create relationship',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Delete a relationship
 */
export const removeRelationship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const relationshipId = parseInt(id, 10)

    if (isNaN(relationshipId)) {
      return res.status(400).json({
        error: 'Invalid relationship ID',
        message: 'Relationship ID must be a number',
      })
    }

    console.log(`Deleting relationship ${relationshipId}...`)
    await deleteRelationship(relationshipId)

    res.json({
      message: 'Relationship deleted successfully',
    })
  } catch (error) {
    console.error(`Error deleting relationship ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to delete relationship',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Delete all relationships for an entity
 */
export const removeEntityRelationships = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params

    console.log(`Deleting all relationships for ${entityType}:${entityId}...`)
    await deleteRelationshipsForEntity(entityType, entityId)

    res.json({
      message: `All relationships for ${entityType}:${entityId} deleted successfully`,
    })
  } catch (error) {
    console.error(
      `Error deleting relationships for ${req.params.entityType}:${req.params.entityId}:`,
      error
    )
    res.status(500).json({
      error: 'Failed to delete entity relationships',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get relationship statistics
 */
export const getRelationshipStatistics = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving relationship statistics...')
    const stats = await getRelationshipStats()

    res.json(stats)
  } catch (error) {
    console.error('Error fetching relationship stats:', error)
    res.status(500).json({
      error: 'Failed to fetch relationship statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
