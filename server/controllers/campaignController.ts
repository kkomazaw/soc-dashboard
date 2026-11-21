import type { Request, Response } from 'express'
import {
  getAllCampaigns,
  getCampaignById,
  getCampaignsByStatus,
  getCampaignsByObjective,
  getCampaignsBySophistication,
  getRecentCampaigns,
  updateCampaignStatus,
  deleteCampaign,
  searchCampaigns,
  getCampaignStats,
  saveCampaigns,
  type CampaignData,
} from '../services/database/campaignDb'
import { getCampaignGraph } from '../services/database/relationshipDb'

/**
 * Get all campaigns
 */
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving campaigns from database...')

    const { status, objective, sophistication, days, search } = req.query

    let data

    if (search && typeof search === 'string') {
      data = await searchCampaigns(search)
    } else if (status && typeof status === 'string') {
      data = await getCampaignsByStatus(status)
    } else if (objective && typeof objective === 'string') {
      data = await getCampaignsByObjective(objective)
    } else if (sophistication && typeof sophistication === 'string') {
      data = await getCampaignsBySophistication(sophistication)
    } else if (days && typeof days === 'string') {
      data = await getRecentCampaigns(parseInt(days, 10))
    } else {
      data = await getAllCampaigns()
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = data.map((item) => ({
      id: item.campaignId,
      campaignId: item.campaignId,
      name: item.name,
      aliases: item.aliases ? JSON.parse(item.aliases) : [],
      description: item.description,
      firstSeen: item.firstSeen.toISOString().split('T')[0],
      lastSeen: item.lastSeen ? item.lastSeen.toISOString().split('T')[0] : undefined,
      objective: item.objective,
      confidence: item.confidence,
      sophistication: item.sophistication,
      status: item.status,
      source: item.source,
      sourceUrl: item.sourceUrl,
      metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    console.log(`Successfully retrieved ${responseData.length} campaigns`)
    res.json(responseData)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    res.status(500).json({
      error: 'Failed to fetch campaigns',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a single campaign by ID
 */
export const getCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Retrieving campaign ${id}...`)

    const campaign = await getCampaignById(id)

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found',
        message: `No campaign found with ID: ${id}`,
      })
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = {
      id: campaign.campaignId,
      campaignId: campaign.campaignId,
      name: campaign.name,
      aliases: campaign.aliases ? JSON.parse(campaign.aliases) : [],
      description: campaign.description,
      firstSeen: campaign.firstSeen.toISOString().split('T')[0],
      lastSeen: campaign.lastSeen ? campaign.lastSeen.toISOString().split('T')[0] : undefined,
      objective: campaign.objective,
      confidence: campaign.confidence,
      sophistication: campaign.sophistication,
      status: campaign.status,
      source: campaign.source,
      sourceUrl: campaign.sourceUrl,
      metadata: campaign.metadata ? JSON.parse(campaign.metadata) : undefined,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    }

    res.json(responseData)
  } catch (error) {
    console.error(`Error fetching campaign ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to fetch campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get campaign graph (relationships)
 */
export const getCampaignGraphData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Retrieving campaign graph for ${id}...`)

    const graphData = await getCampaignGraph(id)

    res.json(graphData)
  } catch (error) {
    console.error(`Error fetching campaign graph for ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to fetch campaign graph',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Create a new campaign
 */
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaignData: CampaignData = req.body

    if (!campaignData.campaignId || !campaignData.name || !campaignData.description || !campaignData.firstSeen) {
      return res.status(400).json({
        error: 'Invalid campaign data',
        message: 'campaignId, name, description, and firstSeen are required',
      })
    }

    console.log(`Creating campaign ${campaignData.campaignId}...`)
    await saveCampaigns([campaignData])

    const campaign = await getCampaignById(campaignData.campaignId)

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign,
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Update campaign status
 */
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'inactive', 'ongoing'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: active, inactive, ongoing',
      })
    }

    console.log(`Updating campaign ${id} status to ${status}...`)
    const campaign = await updateCampaignStatus(id, status)

    res.json({
      message: 'Campaign status updated successfully',
      campaign: {
        id: campaign.campaignId,
        status: campaign.status,
      },
    })
  } catch (error) {
    console.error(`Error updating campaign ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to update campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Delete a campaign
 */
export const removeCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    console.log(`Deleting campaign ${id}...`)
    await deleteCampaign(id)

    res.json({
      message: 'Campaign deleted successfully',
    })
  } catch (error) {
    console.error(`Error deleting campaign ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get campaign statistics
 */
export const getCampaignStatistics = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving campaign statistics...')
    const stats = await getCampaignStats()

    res.json(stats)
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    res.status(500).json({
      error: 'Failed to fetch campaign statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
