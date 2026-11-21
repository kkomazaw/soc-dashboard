import { prisma } from './prismaClient'
import type { ThreatActor } from '@prisma/client'

export interface ThreatActorData {
  actorId: string
  name: string
  aliases?: string[]
  description?: string
  actorType: string
  sophistication?: string
  resourceLevel?: string
  primaryMotivation?: string
  origin?: string
  firstSeen?: string
  lastSeen?: string
  targetedSectors?: string[]
  targetedCountries?: string[]
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
}

/**
 * Save or update threat actors in the database
 */
export const saveThreatActors = async (actors: ThreatActorData[]): Promise<void> => {
  console.log(`Saving ${actors.length} threat actor entries to database...`)

  try {
    await prisma.$transaction(
      actors.map((actor) =>
        prisma.threatActor.upsert({
          where: { actorId: actor.actorId },
          update: {
            name: actor.name,
            aliases: actor.aliases ? JSON.stringify(actor.aliases) : null,
            description: actor.description,
            actorType: actor.actorType,
            sophistication: actor.sophistication,
            resourceLevel: actor.resourceLevel,
            primaryMotivation: actor.primaryMotivation,
            origin: actor.origin,
            firstSeen: actor.firstSeen ? new Date(actor.firstSeen) : null,
            lastSeen: actor.lastSeen ? new Date(actor.lastSeen) : null,
            targetedSectors: actor.targetedSectors ? JSON.stringify(actor.targetedSectors) : null,
            targetedCountries: actor.targetedCountries
              ? JSON.stringify(actor.targetedCountries)
              : null,
            source: actor.source || 'manual',
            sourceUrl: actor.sourceUrl,
            metadata: actor.metadata ? JSON.stringify(actor.metadata) : null,
          },
          create: {
            actorId: actor.actorId,
            name: actor.name,
            aliases: actor.aliases ? JSON.stringify(actor.aliases) : null,
            description: actor.description,
            actorType: actor.actorType,
            sophistication: actor.sophistication,
            resourceLevel: actor.resourceLevel,
            primaryMotivation: actor.primaryMotivation,
            origin: actor.origin,
            firstSeen: actor.firstSeen ? new Date(actor.firstSeen) : null,
            lastSeen: actor.lastSeen ? new Date(actor.lastSeen) : null,
            targetedSectors: actor.targetedSectors ? JSON.stringify(actor.targetedSectors) : null,
            targetedCountries: actor.targetedCountries
              ? JSON.stringify(actor.targetedCountries)
              : null,
            source: actor.source || 'manual',
            sourceUrl: actor.sourceUrl,
            metadata: actor.metadata ? JSON.stringify(actor.metadata) : null,
          },
        })
      )
    )

    console.log(`Successfully saved ${actors.length} threat actor entries`)
  } catch (error) {
    console.error('Failed to save threat actor data to database:', error)
    throw error
  }
}

/**
 * Get all threat actors from the database
 */
export const getAllThreatActors = async (): Promise<ThreatActor[]> => {
  try {
    const actors = await prisma.threatActor.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`Retrieved ${actors.length} threat actor entries from database`)
    return actors
  } catch (error) {
    console.error('Failed to retrieve threat actors from database:', error)
    throw error
  }
}

/**
 * Get a threat actor by its ID
 */
export const getThreatActorById = async (actorId: string): Promise<ThreatActor | null> => {
  try {
    const actor = await prisma.threatActor.findUnique({
      where: { actorId },
    })

    return actor
  } catch (error) {
    console.error(`Failed to retrieve threat actor ${actorId} from database:`, error)
    throw error
  }
}

/**
 * Get threat actors by type
 */
export const getThreatActorsByType = async (actorType: string): Promise<ThreatActor[]> => {
  try {
    const actors = await prisma.threatActor.findMany({
      where: { actorType },
      orderBy: {
        name: 'asc',
      },
    })

    return actors
  } catch (error) {
    console.error(`Failed to retrieve threat actors with type ${actorType}:`, error)
    throw error
  }
}

/**
 * Get threat actors by origin (country)
 */
export const getThreatActorsByOrigin = async (origin: string): Promise<ThreatActor[]> => {
  try {
    const actors = await prisma.threatActor.findMany({
      where: { origin },
      orderBy: {
        name: 'asc',
      },
    })

    return actors
  } catch (error) {
    console.error(`Failed to retrieve threat actors with origin ${origin}:`, error)
    throw error
  }
}

/**
 * Get threat actors by motivation
 */
export const getThreatActorsByMotivation = async (motivation: string): Promise<ThreatActor[]> => {
  try {
    const actors = await prisma.threatActor.findMany({
      where: { primaryMotivation: motivation },
      orderBy: {
        name: 'asc',
      },
    })

    return actors
  } catch (error) {
    console.error(`Failed to retrieve threat actors with motivation ${motivation}:`, error)
    throw error
  }
}

/**
 * Delete a threat actor
 */
export const deleteThreatActor = async (actorId: string): Promise<void> => {
  try {
    await prisma.threatActor.delete({
      where: { actorId },
    })

    console.log(`Deleted threat actor ${actorId}`)
  } catch (error) {
    console.error(`Failed to delete threat actor ${actorId}:`, error)
    throw error
  }
}

/**
 * Search threat actors by name or description
 */
export const searchThreatActors = async (query: string): Promise<ThreatActor[]> => {
  try {
    const actors = await prisma.threatActor.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { aliases: { contains: query } },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    })

    return actors
  } catch (error) {
    console.error(`Failed to search threat actors with query "${query}":`, error)
    throw error
  }
}

/**
 * Get threat actor statistics
 */
export const getThreatActorStats = async () => {
  try {
    const total = await prisma.threatActor.count()

    // Count by type
    const nationState = await prisma.threatActor.count({ where: { actorType: 'nation-state' } })
    const cybercrime = await prisma.threatActor.count({ where: { actorType: 'cybercrime' } })
    const hacktivist = await prisma.threatActor.count({ where: { actorType: 'hacktivist' } })

    // Count by sophistication
    const strategic = await prisma.threatActor.count({ where: { sophistication: 'strategic' } })
    const expert = await prisma.threatActor.count({ where: { sophistication: 'expert' } })
    const advanced = await prisma.threatActor.count({ where: { sophistication: 'advanced' } })

    return {
      total,
      byType: {
        'nation-state': nationState,
        cybercrime,
        hacktivist,
      },
      bySophistication: {
        strategic,
        expert,
        advanced,
      },
    }
  } catch (error) {
    console.error('Failed to retrieve threat actor statistics:', error)
    throw error
  }
}
