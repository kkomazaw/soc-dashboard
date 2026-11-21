import { Router } from 'express'
import {
  getIndicators,
  getIndicator,
  createIndicator,
  createIndicatorsBulk,
  removeIndicator,
  getIndicatorStatistics,
} from '../controllers/indicatorController'

const router = Router()

// Get all indicators (with optional filters)
router.get('/', getIndicators)

// Get statistics
router.get('/stats', getIndicatorStatistics)

// Get a single indicator by ID
router.get('/:id', getIndicator)

// Create a new indicator
router.post('/', createIndicator)

// Bulk create indicators
router.post('/bulk', createIndicatorsBulk)

// Delete an indicator
router.delete('/:id', removeIndicator)

export default router
