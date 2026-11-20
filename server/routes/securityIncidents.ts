import { Router } from 'express'
import {
  getSecurityIncidents,
  getSecurityIncident,
  refreshSecurityIncidents,
  initializeIncidents,
  updateIncidentStatus,
  getIncidentStats,
} from '../controllers/securityIncidentController'

const router = Router()

// Get all security incidents (with optional filters)
router.get('/', getSecurityIncidents)

// Get statistics
router.get('/stats', getIncidentStats)

// Get a single incident by ID
router.get('/:id', getSecurityIncident)

// Refresh incidents from threat intel feeds
router.post('/refresh', refreshSecurityIncidents)

// Initialize database with historical incidents
router.post('/initialize', initializeIncidents)

// Update incident status
router.patch('/:id/status', updateIncidentStatus)

export default router
