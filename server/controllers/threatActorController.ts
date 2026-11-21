import type { Request, Response } from 'express'
import {
  getAllThreatActors,
  getThreatActorById,
  getThreatActorsByType,
  getThreatActorsByOrigin,
  getThreatActorsByMotivation,
  deleteThreatActor,
  searchThreatActors,
  getThreatActorStats,
  saveThreatActors,
  type ThreatActorData,
} from '../services/database/threatActorDb'
import { getRelationshipsForEntity } from '../services/database/relationshipDb'

/**
 * Get all threat actors
 */
export const getThreatActors = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving threat actors from database...')

    const { type, origin, motivation, search } = req.query

    let data

    if (search && typeof search === 'string') {
      data = await searchThreatActors(search)
    } else if (type && typeof type === 'string') {
      data = await getThreatActorsByType(type)
    } else if (origin && typeof origin === 'string') {
      data = await getThreatActorsByOrigin(origin)
    } else if (motivation && typeof motivation === 'string') {
      data = await getThreatActorsByMotivation(motivation)
    } else {
      data = await getAllThreatActors()
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = data.map((item) => ({
      id: item.actorId,
      actorId: item.actorId,
      name: item.name,
      aliases: item.aliases ? JSON.parse(item.aliases) : [],
      description: item.description,
      actorType: item.actorType,
      sophistication: item.sophistication,
      resourceLevel: item.resourceLevel,
      primaryMotivation: item.primaryMotivation,
      origin: item.origin,
      firstSeen: item.firstSeen ? item.firstSeen.toISOString().split('T')[0] : undefined,
      lastSeen: item.lastSeen ? item.lastSeen.toISOString().split('T')[0] : undefined,
      targetedSectors: item.targetedSectors ? JSON.parse(item.targetedSectors) : [],
      targetedCountries: item.targetedCountries ? JSON.parse(item.targetedCountries) : [],
      source: item.source,
      sourceUrl: item.sourceUrl,
      metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    console.log(`Successfully retrieved ${responseData.length} threat actors`)
    res.json(responseData)
  } catch (error) {
    console.error('Error fetching threat actors:', error)
    res.status(500).json({
      error: 'Failed to fetch threat actors',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a single threat actor by ID
 */
export const getThreatActor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Retrieving threat actor ${id}...`)

    const actor = await getThreatActorById(id)

    if (!actor) {
      return res.status(404).json({
        error: 'Threat actor not found',
        message: `No threat actor found with ID: ${id}`,
      })
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = {
      id: actor.actorId,
      actorId: actor.actorId,
      name: actor.name,
      aliases: actor.aliases ? JSON.parse(actor.aliases) : [],
      description: actor.description,
      actorType: actor.actorType,
      sophistication: actor.sophistication,
      resourceLevel: actor.resourceLevel,
      primaryMotivation: actor.primaryMotivation,
      origin: actor.origin,
      firstSeen: actor.firstSeen ? actor.firstSeen.toISOString().split('T')[0] : undefined,
      lastSeen: actor.lastSeen ? actor.lastSeen.toISOString().split('T')[0] : undefined,
      targetedSectors: actor.targetedSectors ? JSON.parse(actor.targetedSectors) : [],
      targetedCountries: actor.targetedCountries ? JSON.parse(actor.targetedCountries) : [],
      source: actor.source,
      sourceUrl: actor.sourceUrl,
      metadata: actor.metadata ? JSON.parse(actor.metadata) : undefined,
      createdAt: actor.createdAt.toISOString(),
      updatedAt: actor.updatedAt.toISOString(),
    }

    res.json(responseData)
  } catch (error) {
    console.error(`Error fetching threat actor ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to fetch threat actor',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get campaigns associated with a threat actor
 */
export const getThreatActorCampaigns = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Retrieving campaigns for threat actor ${id}...`)

    const relationships = await getRelationshipsForEntity('threat-actor', id)

    // Filter for 'attributed-to' relationships where the threat actor is the target
    const campaignRelationships = relationships.filter(
      (rel) =>
        rel.relationshipType === 'attributed-to' &&
        rel.targetType === 'threat-actor' &&
        rel.targetId === id
    )

    res.json({
      actorId: id,
      campaigns: campaignRelationships.map((rel) => ({
        campaignId: rel.sourceId,
        relationshipType: rel.relationshipType,
        confidence: rel.confidence,
        firstSeen: rel.firstSeen ? rel.firstSeen.toISOString().split('T')[0] : undefined,
        lastSeen: rel.lastSeen ? rel.lastSeen.toISOString().split('T')[0] : undefined,
      })),
    })
  } catch (error) {
    console.error(`Error fetching campaigns for threat actor ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to fetch threat actor campaigns',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Create a new threat actor
 */
export const createThreatActor = async (req: Request, res: Response) => {
  try {
    const actorData: ThreatActorData = req.body

    if (!actorData.actorId || !actorData.name || !actorData.actorType) {
      return res.status(400).json({
        error: 'Invalid threat actor data',
        message: 'actorId, name, and actorType are required',
      })
    }

    console.log(`Creating threat actor ${actorData.actorId}...`)
    await saveThreatActors([actorData])

    const actor = await getThreatActorById(actorData.actorId)

    res.status(201).json({
      message: 'Threat actor created successfully',
      actor,
    })
  } catch (error) {
    console.error('Error creating threat actor:', error)
    res.status(500).json({
      error: 'Failed to create threat actor',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Delete a threat actor
 */
export const removeThreatActor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    console.log(`Deleting threat actor ${id}...`)
    await deleteThreatActor(id)

    res.json({
      message: 'Threat actor deleted successfully',
    })
  } catch (error) {
    console.error(`Error deleting threat actor ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to delete threat actor',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get threat actor statistics
 */
export const getThreatActorStatistics = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving threat actor statistics...')
    const stats = await getThreatActorStats()

    res.json(stats)
  } catch (error) {
    console.error('Error fetching threat actor stats:', error)
    res.status(500).json({
      error: 'Failed to fetch threat actor statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
