import { Router } from 'express'
import {
  getCveMappings,
  getTechniqueCves,
  getAll,
  getStats,
  triggerMappingAll,
  triggerMappingCisa,
  triggerMappingJvn,
  triggerMappingNvd,
} from '../controllers/mappingController'

const router = Router()

// Get all CVE-to-ATT&CK mappings
router.get('/all', getAll)

// Get ATT&CK technique mappings for a specific CVE
router.get('/cve/:cveId', getCveMappings)

// Get CVEs mapped to a specific ATT&CK technique
router.get('/technique/:techniqueId', getTechniqueCves)

// Get mapping statistics
router.get('/stats', getStats)

// Trigger mapping for all vulnerabilities
router.post('/trigger/all', triggerMappingAll)

// Trigger mapping for specific sources
router.post('/trigger/cisa', triggerMappingCisa)
router.post('/trigger/jvn', triggerMappingJvn)
router.post('/trigger/nvd', triggerMappingNvd)

export default router
