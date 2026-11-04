/**
 * Analytics Routes
 * Endpoints for vulnerability trend analysis and statistics
 */

import express from 'express'
import {
  getVulnerabilityTrends,
  getSeverityDistribution,
  getTopVendorsProducts,
  getCvssDistribution,
  getMonthlyStats,
} from '../controllers/analyticsController.js'

const router = express.Router()

// Vulnerability trends over time
router.get('/trends', getVulnerabilityTrends)

// Severity distribution
router.get('/severity-distribution', getSeverityDistribution)

// Top vendors and products
router.get('/top-vendors-products', getTopVendorsProducts)

// CVSS score distribution
router.get('/cvss-distribution', getCvssDistribution)

// Monthly statistics
router.get('/monthly-stats', getMonthlyStats)

export default router
