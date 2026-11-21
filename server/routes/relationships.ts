import { Router } from 'express'
import {
  getRelationships,
  createRelationship,
  removeRelationship,
  removeEntityRelationships,
  getRelationshipStatistics,
} from '../controllers/relationshipController'

const router = Router()

// Get all relationships (with optional filters)
router.get('/', getRelationships)

// Get statistics
router.get('/stats', getRelationshipStatistics)

// Create a new relationship
router.post('/', createRelationship)

// Delete a relationship by ID
router.delete('/:id', removeRelationship)

// Delete all relationships for an entity
router.delete('/:entityType/:entityId', removeEntityRelationships)

export default router
