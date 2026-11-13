import { Router } from 'express'
import {
  getPatches,
  getPatch,
  getStats,
  getCalendar,
  updateDeploymentStatus,
  refreshPatches,
} from '../controllers/patchController'

const router = Router()

// Get patch statistics (must be before /:patchId to avoid conflicts)
router.get('/stats', getStats)

// Get patch calendar
router.get('/calendar', getCalendar)

// Refresh patches from sources
router.post('/refresh', refreshPatches)

// Get all patches (with optional filters)
router.get('/', getPatches)

// Get patch by ID
router.get('/:patchId', getPatch)

// Update patch deployment status
router.patch('/:patchId/status', updateDeploymentStatus)

export default router
