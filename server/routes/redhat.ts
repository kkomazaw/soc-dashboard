import express from 'express'
import {
  getAdvisories,
  getCVEs,
  getStats,
  getAllData,
  refreshData,
} from '../controllers/redhatController'

const router = express.Router()

// Get all Red Hat Security Advisories
router.get('/advisories', getAdvisories)

// Get all Red Hat CVEs
router.get('/cves', getCVEs)

// Get Red Hat security statistics
router.get('/stats', getStats)

// Get all Red Hat security data (advisories + CVEs + stats)
router.get('/all', getAllData)

// Refresh Red Hat security data from API
router.post('/refresh', refreshData)

export default router
