import { prisma } from './prismaClient'
import type { Campaign } from '@prisma/client'

export interface CampaignData {
  campaignId: string
  name: string
  aliases?: string[]
  description: string
  firstSeen: string
  lastSeen?: string
  objective?: string
  confidence?: number
  sophistication?: string
  status?: string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, any>
}

/**
 * Save or update campaigns in the database
 */
export const saveCampaigns = async (campaigns: CampaignData[]): Promise<void> => {
  console.log(`Saving ${campaigns.length} campaign entries to database...`)

  try {
    await prisma.$transaction(
      campaigns.map((campaign) =>
        prisma.campaign.upsert({
          where: { campaignId: campaign.campaignId },
          update: {
            name: campaign.name,
            aliases: campaign.aliases ? JSON.stringify(campaign.aliases) : null,
            description: campaign.description,
            firstSeen: new Date(campaign.firstSeen),
            lastSeen: campaign.lastSeen ? new Date(campaign.lastSeen) : null,
            objective: campaign.objective,
            confidence: campaign.confidence ?? 50,
            sophistication: campaign.sophistication,
            status: campaign.status || 'active',
            source: campaign.source || 'manual',
            sourceUrl: campaign.sourceUrl,
            metadata: campaign.metadata ? JSON.stringify(campaign.metadata) : null,
          },
          create: {
            campaignId: campaign.campaignId,
            name: campaign.name,
            aliases: campaign.aliases ? JSON.stringify(campaign.aliases) : null,
            description: campaign.description,
            firstSeen: new Date(campaign.firstSeen),
            lastSeen: campaign.lastSeen ? new Date(campaign.lastSeen) : null,
            objective: campaign.objective,
            confidence: campaign.confidence ?? 50,
            sophistication: campaign.sophistication,
            status: campaign.status || 'active',
            source: campaign.source || 'manual',
            sourceUrl: campaign.sourceUrl,
            metadata: campaign.metadata ? JSON.stringify(campaign.metadata) : null,
          },
        })
      )
    )

    console.log(`Successfully saved ${campaigns.length} campaign entries`)
  } catch (error) {
    console.error('Failed to save campaign data to database:', error)
    throw error
  }
}

/**
 * Get all campaigns from the database
 */
export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        firstSeen: 'desc',
      },
    })

    console.log(`Retrieved ${campaigns.length} campaign entries from database`)
    return campaigns
  } catch (error) {
    console.error('Failed to retrieve campaigns from database:', error)
    throw error
  }
}

/**
 * Get a campaign by its ID
 */
export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId },
    })

    return campaign
  } catch (error) {
    console.error(`Failed to retrieve campaign ${campaignId} from database:`, error)
    throw error
  }
}

/**
 * Get campaigns by status
 */
export const getCampaignsByStatus = async (status: string): Promise<Campaign[]> => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status },
      orderBy: {
        firstSeen: 'desc',
      },
    })

    return campaigns
  } catch (error) {
    console.error(`Failed to retrieve campaigns with status ${status}:`, error)
    throw error
  }
}

/**
 * Get campaigns by objective
 */
export const getCampaignsByObjective = async (objective: string): Promise<Campaign[]> => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { objective },
      orderBy: {
        firstSeen: 'desc',
      },
    })

    return campaigns
  } catch (error) {
    console.error(`Failed to retrieve campaigns with objective ${objective}:`, error)
    throw error
  }
}

/**
 * Get campaigns by sophistication level
 */
export const getCampaignsBySophistication = async (sophistication: string): Promise<Campaign[]> => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { sophistication },
      orderBy: {
        firstSeen: 'desc',
      },
    })

    return campaigns
  } catch (error) {
    console.error(`Failed to retrieve campaigns with sophistication ${sophistication}:`, error)
    throw error
  }
}

/**
 * Get recent campaigns (within last N days)
 */
export const getRecentCampaigns = async (days: number = 30): Promise<Campaign[]> => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const campaigns = await prisma.campaign.findMany({
      where: {
        firstSeen: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        firstSeen: 'desc',
      },
    })

    return campaigns
  } catch (error) {
    console.error(`Failed to retrieve recent campaigns:`, error)
    throw error
  }
}

/**
 * Update campaign status
 */
export const updateCampaignStatus = async (
  campaignId: string,
  status: string
): Promise<Campaign> => {
  try {
    const campaign = await prisma.campaign.update({
      where: { campaignId },
      data: { status },
    })

    console.log(`Updated campaign ${campaignId} status to ${status}`)
    return campaign
  } catch (error) {
    console.error(`Failed to update campaign ${campaignId} status:`, error)
    throw error
  }
}

/**
 * Delete a campaign
 */
export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    await prisma.campaign.delete({
      where: { campaignId },
    })

    console.log(`Deleted campaign ${campaignId}`)
  } catch (error) {
    console.error(`Failed to delete campaign ${campaignId}:`, error)
    throw error
  }
}

/**
 * Search campaigns by name or description
 */
export const searchCampaigns = async (query: string): Promise<Campaign[]> => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { aliases: { contains: query } },
        ],
      },
      orderBy: {
        firstSeen: 'desc',
      },
    })

    return campaigns
  } catch (error) {
    console.error(`Failed to search campaigns with query "${query}":`, error)
    throw error
  }
}

/**
 * Get campaign statistics
 */
export const getCampaignStats = async () => {
  try {
    const total = await prisma.campaign.count()
    const active = await prisma.campaign.count({ where: { status: 'active' } })
    const inactive = await prisma.campaign.count({ where: { status: 'inactive' } })
    const ongoing = await prisma.campaign.count({ where: { status: 'ongoing' } })

    // Count by objective
    const espionage = await prisma.campaign.count({ where: { objective: 'espionage' } })
    const financialGain = await prisma.campaign.count({ where: { objective: 'financial-gain' } })
    const disruption = await prisma.campaign.count({ where: { objective: 'disruption' } })

    // Count by sophistication
    const strategic = await prisma.campaign.count({ where: { sophistication: 'strategic' } })
    const expert = await prisma.campaign.count({ where: { sophistication: 'expert' } })
    const advanced = await prisma.campaign.count({ where: { sophistication: 'advanced' } })

    return {
      total,
      byStatus: {
        active,
        inactive,
        ongoing,
      },
      byObjective: {
        espionage,
        'financial-gain': financialGain,
        disruption,
      },
      bySophistication: {
        strategic,
        expert,
        advanced,
      },
    }
  } catch (error) {
    console.error('Failed to retrieve campaign statistics:', error)
    throw error
  }
}
