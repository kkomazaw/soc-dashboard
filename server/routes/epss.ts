import express from 'express'
import {
  getStats,
  getScoreByCve,
  getHighRisk,
  refreshData,
  getAllScores,
  getScoresByCves,
} from '../controllers/epssController'

const router = express.Router()

/**
 * EPSS API Routes
 * Base path: /api/epss
 */

// GET /api/epss/stats - Get EPSS statistics and distribution
router.get('/stats', getStats)

// GET /api/epss/high-risk - Get high-risk CVEs (EPSS >= threshold)
// Query params: threshold (default 0.5), limit (default 100)
router.get('/high-risk', getHighRisk)

// GET /api/epss/all - Get all EPSS scores (paginated)
// Query params: limit (default 1000), offset (default 0)
router.get('/all', getAllScores)

// GET /api/epss/:cveId - Get EPSS score for a specific CVE
router.get('/:cveId', getScoreByCve)

// POST /api/epss/refresh - Refresh EPSS data from API
// Query params: mode ('incremental' | 'full', default 'incremental')
router.post('/refresh', refreshData)

// POST /api/epss/bulk - Get EPSS scores for multiple CVEs
// Body: { cveIds: string[] }
router.post('/bulk', getScoresByCves)

export default router
