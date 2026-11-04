import { Router } from 'express'
import {
  getTechniques,
  getTactics,
  getMatrix,
  searchTechnique,
  getTechniquesByTacticEndpoint,
  getTechniquesByPlatformEndpoint,
  searchTechniquesEndpoint,
  getStats,
  refreshAttackData,
} from '../controllers/attackController'

const router = Router()

// Get all techniques
router.get('/techniques', getTechniques)

// Get all tactics
router.get('/tactics', getTactics)

// Get full ATT&CK matrix
router.get('/matrix', getMatrix)

// Get statistics
router.get('/stats', getStats)

// Search techniques by keyword
router.get('/search', searchTechniquesEndpoint)

// Get specific technique by ID
router.get('/techniques/:techniqueId', searchTechnique)

// Get techniques by tactic
router.get('/tactics/:tactic/techniques', getTechniquesByTacticEndpoint)

// Get techniques by platform
router.get('/platforms/:platform/techniques', getTechniquesByPlatformEndpoint)

// Refresh ATT&CK data
router.post('/refresh', refreshAttackData)

export default router
