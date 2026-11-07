import express from 'express'
import { getCveTimeline, searchCves } from '../controllers/cveTimelineController'

const router = express.Router()

/**
 * @route GET /api/cve/search
 * @desc Search for CVEs across all sources
 */
router.get('/search', searchCves)

/**
 * @route GET /api/cve/:cveId/timeline
 * @desc Get timeline data for a specific CVE
 */
router.get('/:cveId/timeline', getCveTimeline)

export default router
