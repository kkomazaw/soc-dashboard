import { PrismaClient } from '@prisma/client'
import type { AttackTechnique, AttackTactic } from '../fetchers/attackFetcher'

const prisma = new PrismaClient()

// Save or update techniques
export const saveAttackTechniques = async (
  techniques: AttackTechnique[]
): Promise<void> => {
  try {
    const operations = techniques.map((technique) =>
      prisma.attackTechnique.upsert({
        where: { techniqueId: technique.id },
        update: {
          name: technique.name,
          description: technique.description,
          tactics: JSON.stringify(technique.tactics),
          platforms: JSON.stringify(technique.platforms),
          dataSource: JSON.stringify(technique.dataSource),
          url: technique.url,
          mitigations: technique.mitigations
            ? JSON.stringify(technique.mitigations)
            : null,
          subtechniques: technique.subtechniques
            ? JSON.stringify(technique.subtechniques)
            : null,
        },
        create: {
          techniqueId: technique.id,
          name: technique.name,
          description: technique.description,
          tactics: JSON.stringify(technique.tactics),
          platforms: JSON.stringify(technique.platforms),
          dataSource: JSON.stringify(technique.dataSource),
          url: technique.url,
          mitigations: technique.mitigations
            ? JSON.stringify(technique.mitigations)
            : null,
          subtechniques: technique.subtechniques
            ? JSON.stringify(technique.subtechniques)
            : null,
        },
      })
    )

    await prisma.$transaction(operations)
    console.log(`✅ Saved ${techniques.length} ATT&CK techniques to database`)
  } catch (error) {
    console.error('Error saving ATT&CK techniques:', error)
    throw error
  }
}

// Save or update tactics
export const saveAttackTactics = async (
  tactics: AttackTactic[]
): Promise<void> => {
  try {
    const operations = tactics.map((tactic) =>
      prisma.attackTactic.upsert({
        where: { tacticId: tactic.id },
        update: {
          name: tactic.name,
          description: tactic.description,
          shortName: tactic.shortName,
          techniques: JSON.stringify(tactic.techniques),
        },
        create: {
          tacticId: tactic.id,
          name: tactic.name,
          description: tactic.description,
          shortName: tactic.shortName,
          techniques: JSON.stringify(tactic.techniques),
        },
      })
    )

    await prisma.$transaction(operations)
    console.log(`✅ Saved ${tactics.length} ATT&CK tactics to database`)
  } catch (error) {
    console.error('Error saving ATT&CK tactics:', error)
    throw error
  }
}

// Get all techniques
export const getAllTechniques = async () => {
  try {
    const techniques = await prisma.attackTechnique.findMany({
      orderBy: { techniqueId: 'asc' },
    })

    return techniques.map((tech) => ({
      id: tech.techniqueId,
      name: tech.name,
      description: tech.description,
      tactics: tech.tactics ? JSON.parse(tech.tactics) : [],
      platforms: tech.platforms ? JSON.parse(tech.platforms) : [],
      dataSource: tech.dataSource ? JSON.parse(tech.dataSource) : [],
      url: tech.url,
      mitigations: tech.mitigations ? JSON.parse(tech.mitigations) : [],
      subtechniques: tech.subtechniques ? JSON.parse(tech.subtechniques) : [],
    }))
  } catch (error) {
    console.error('Error retrieving techniques:', error)
    throw error
  }
}

// Get all tactics
export const getAllTactics = async () => {
  try {
    const tactics = await prisma.attackTactic.findMany({
      orderBy: { tacticId: 'asc' },
    })

    return tactics.map((tactic) => ({
      id: tactic.tacticId,
      name: tactic.name,
      description: tactic.description,
      shortName: tactic.shortName,
      techniques: tactic.techniques ? JSON.parse(tactic.techniques) : [],
    }))
  } catch (error) {
    console.error('Error retrieving tactics:', error)
    throw error
  }
}

// Search technique by ID
export const searchTechniqueById = async (techniqueId: string) => {
  try {
    const technique = await prisma.attackTechnique.findUnique({
      where: { techniqueId },
    })

    if (!technique) return null

    return {
      id: technique.techniqueId,
      name: technique.name,
      description: technique.description,
      tactics: technique.tactics ? JSON.parse(technique.tactics) : [],
      platforms: technique.platforms ? JSON.parse(technique.platforms) : [],
      dataSource: technique.dataSource ? JSON.parse(technique.dataSource) : [],
      url: technique.url,
      mitigations: technique.mitigations ? JSON.parse(technique.mitigations) : [],
      subtechniques: technique.subtechniques
        ? JSON.parse(technique.subtechniques)
        : [],
    }
  } catch (error) {
    console.error('Error searching technique:', error)
    throw error
  }
}

// Get techniques by tactic
export const getTechniquesByTactic = async (tacticShortName: string) => {
  try {
    const techniques = await prisma.attackTechnique.findMany()

    const filtered = techniques.filter((tech) => {
      const tactics = tech.tactics ? JSON.parse(tech.tactics) : []
      return tactics.some(
        (t: string) => t.toLowerCase() === tacticShortName.toLowerCase()
      )
    })

    return filtered.map((tech) => ({
      id: tech.techniqueId,
      name: tech.name,
      description: tech.description,
      tactics: tech.tactics ? JSON.parse(tech.tactics) : [],
      platforms: tech.platforms ? JSON.parse(tech.platforms) : [],
      dataSource: tech.dataSource ? JSON.parse(tech.dataSource) : [],
      url: tech.url,
      mitigations: tech.mitigations ? JSON.parse(tech.mitigations) : [],
      subtechniques: tech.subtechniques ? JSON.parse(tech.subtechniques) : [],
    }))
  } catch (error) {
    console.error('Error getting techniques by tactic:', error)
    throw error
  }
}

// Get techniques by platform
export const getTechniquesByPlatform = async (platform: string) => {
  try {
    const techniques = await prisma.attackTechnique.findMany()

    const filtered = techniques.filter((tech) => {
      const platforms = tech.platforms ? JSON.parse(tech.platforms) : []
      return platforms.some(
        (p: string) => p.toLowerCase() === platform.toLowerCase()
      )
    })

    return filtered.map((tech) => ({
      id: tech.techniqueId,
      name: tech.name,
      description: tech.description,
      tactics: tech.tactics ? JSON.parse(tech.tactics) : [],
      platforms: tech.platforms ? JSON.parse(tech.platforms) : [],
      dataSource: tech.dataSource ? JSON.parse(tech.dataSource) : [],
      url: tech.url,
    }))
  } catch (error) {
    console.error('Error getting techniques by platform:', error)
    throw error
  }
}

// Get ATT&CK statistics
export const getAttackStats = async () => {
  try {
    const totalTechniques = await prisma.attackTechnique.count()
    const totalTactics = await prisma.attackTactic.count()

    // Count techniques by tactic
    const tactics = await getAllTactics()
    const techniquesByTactic = tactics.map((tactic) => ({
      tactic: tactic.name,
      shortName: tactic.shortName,
      count: tactic.techniques.length,
    }))

    return {
      totalTechniques,
      totalTactics,
      techniquesByTactic,
    }
  } catch (error) {
    console.error('Error getting ATT&CK stats:', error)
    throw error
  }
}

// Search techniques by keyword
export const searchTechniques = async (keyword: string) => {
  try {
    const techniques = await prisma.attackTechnique.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { techniqueId: { contains: keyword } },
        ],
      },
      orderBy: { techniqueId: 'asc' },
    })

    return techniques.map((tech) => ({
      id: tech.techniqueId,
      name: tech.name,
      description: tech.description,
      tactics: tech.tactics ? JSON.parse(tech.tactics) : [],
      platforms: tech.platforms ? JSON.parse(tech.platforms) : [],
      dataSource: tech.dataSource ? JSON.parse(tech.dataSource) : [],
      url: tech.url,
    }))
  } catch (error) {
    console.error('Error searching techniques:', error)
    throw error
  }
}
