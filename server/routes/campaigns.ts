import { Router } from 'express'
import {
  getCampaigns,
  getCampaign,
  getCampaignGraphData,
  createCampaign,
  updateCampaign,
  removeCampaign,
  getCampaignStatistics,
} from '../controllers/campaignController'

const router = Router()

// Get all campaigns (with optional filters)
router.get('/', getCampaigns)

// Get statistics
router.get('/stats', getCampaignStatistics)

// Get a single campaign by ID
router.get('/:id', getCampaign)

// Get campaign graph data (relationships)
router.get('/:id/graph', getCampaignGraphData)

// Create a new campaign
router.post('/', createCampaign)

// Update campaign (status)
router.patch('/:id', updateCampaign)

// Delete a campaign
router.delete('/:id', removeCampaign)

export default router
