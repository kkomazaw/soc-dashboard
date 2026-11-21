import { Router } from 'express'
import {
  getThreatActors,
  getThreatActor,
  getThreatActorCampaigns,
  createThreatActor,
  removeThreatActor,
  getThreatActorStatistics,
} from '../controllers/threatActorController'

const router = Router()

// Get all threat actors (with optional filters)
router.get('/', getThreatActors)

// Get statistics
router.get('/stats', getThreatActorStatistics)

// Get a single threat actor by ID
router.get('/:id', getThreatActor)

// Get campaigns associated with a threat actor
router.get('/:id/campaigns', getThreatActorCampaigns)

// Create a new threat actor
router.post('/', createThreatActor)

// Delete a threat actor
router.delete('/:id', removeThreatActor)

export default router
