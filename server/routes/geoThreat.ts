import express from 'express'
import {
  getAllAggregations,
  getTopCountries,
  getStats,
  getRecentReports,
  getReportsByCountry,
  checkIP,
  refreshData,
  cleanupOldData,
  getAPIStats,
} from '../controllers/geoThreatController'

const router = express.Router()

// GET /api/geo-threat/aggregations - Get all geographic threat aggregations
router.get('/aggregations', getAllAggregations)

// GET /api/geo-threat/top-countries - Get top threat countries
router.get('/top-countries', getTopCountries)

// GET /api/geo-threat/stats - Get geographic threat statistics
router.get('/stats', getStats)

// GET /api/geo-threat/recent - Get recent IP threat reports
router.get('/recent', getRecentReports)

// GET /api/geo-threat/country/:countryCode - Get threat reports by country
router.get('/country/:countryCode', getReportsByCountry)

// GET /api/geo-threat/check/:ipAddress - Check a specific IP address
router.get('/check/:ipAddress', checkIP)

// GET /api/geo-threat/api-stats - Get API usage statistics
router.get('/api-stats', getAPIStats)

// POST /api/geo-threat/refresh - Refresh geographic threat data from external sources
router.post('/refresh', refreshData)

// POST /api/geo-threat/cleanup - Clean up old threat reports
router.post('/cleanup', cleanupOldData)

export default router
