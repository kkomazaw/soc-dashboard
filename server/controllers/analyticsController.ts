/**
 * Analytics Controller
 * Provides trend analysis and statistical data for vulnerabilities
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get vulnerability trends over time (daily aggregation)
 * Groups vulnerabilities by date and severity
 */
export const getVulnerabilityTrends = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query
    const daysNum = parseInt(days as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysNum)

    // Get CISA KEV trends
    const cisaTrends = await prisma.cisaKev.findMany({
      where: {
        dateAdded: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        dateAdded: true,
        cveId: true,
      },
      orderBy: {
        dateAdded: 'asc',
      },
    })

    // Get JVN trends
    const jvnTrends = await prisma.jvnVulnerability.findMany({
      where: {
        publishedDate: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        publishedDate: true,
        severity: true,
        cvssScore: true,
      },
      orderBy: {
        publishedDate: 'asc',
      },
    })

    // Get NVD trends
    const nvdTrends = await prisma.nvdCve.findMany({
      where: {
        publishedDate: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        publishedDate: true,
        cvssScore: true,
        severity: true,
      },
      orderBy: {
        publishedDate: 'asc',
      },
    })

    // Aggregate by day
    const dailyStats = new Map<string, any>()

    // Process CISA KEV
    cisaTrends.forEach((item) => {
      const date = item.dateAdded.split('T')[0]
      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          date,
          cisaKev: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          total: 0,
        })
      }
      const stats = dailyStats.get(date)
      stats.cisaKev++
      stats.total++
    })

    // Process JVN
    jvnTrends.forEach((item) => {
      if (!item.publishedDate) return
      const date = item.publishedDate.split('T')[0]
      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          date,
          cisaKev: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          total: 0,
        })
      }
      const stats = dailyStats.get(date)
      const score = item.cvssScore || 0

      if (score >= 9.0 || item.severity === '緊急') stats.critical++
      else if (score >= 7.0 || item.severity === '重要') stats.high++
      else if (score >= 4.0 || item.severity === '警告') stats.medium++
      else stats.low++

      stats.total++
    })

    // Process NVD
    nvdTrends.forEach((item) => {
      if (!item.publishedDate) return
      const date = item.publishedDate.split('T')[0]
      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          date,
          cisaKev: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          total: 0,
        })
      }
      const stats = dailyStats.get(date)
      const score = item.cvssScore || 0

      if (score >= 9.0) stats.critical++
      else if (score >= 7.0) stats.high++
      else if (score >= 4.0) stats.medium++
      else if (score > 0) stats.low++

      stats.total++
    })

    // Convert to array and sort by date
    const trends = Array.from(dailyStats.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    res.json({
      success: true,
      data: trends,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days: daysNum,
      },
    })
  } catch (error: any) {
    console.error('Error fetching vulnerability trends:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vulnerability trends',
    })
  }
}

/**
 * Get severity distribution across all sources
 */
export const getSeverityDistribution = async (req: Request, res: Response) => {
  try {
    // Get NVD severity counts
    const nvdCves = await prisma.nvdCve.findMany({
      select: {
        cvssScore: true,
        severity: true,
      },
    })

    // Get JVN severity counts
    const jvnVulns = await prisma.jvnVulnerability.findMany({
      select: {
        cvssScore: true,
        severity: true,
      },
    })

    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
    }

    // Count NVD
    nvdCves.forEach((cve) => {
      const score = cve.cvssScore || 0
      if (score >= 9.0) distribution.critical++
      else if (score >= 7.0) distribution.high++
      else if (score >= 4.0) distribution.medium++
      else if (score > 0) distribution.low++
      else distribution.none++
    })

    // Count JVN
    jvnVulns.forEach((vuln) => {
      const score = vuln.cvssScore || 0
      if (score >= 9.0 || vuln.severity === '緊急') distribution.critical++
      else if (score >= 7.0 || vuln.severity === '重要') distribution.high++
      else if (score >= 4.0 || vuln.severity === '警告') distribution.medium++
      else if (score > 0 || vuln.severity === '注意') distribution.low++
      else distribution.none++
    })

    const total = Object.values(distribution).reduce((a, b) => a + b, 0)

    res.json({
      success: true,
      data: {
        distribution,
        total,
        percentage: {
          critical: total > 0 ? ((distribution.critical / total) * 100).toFixed(1) : '0.0',
          high: total > 0 ? ((distribution.high / total) * 100).toFixed(1) : '0.0',
          medium: total > 0 ? ((distribution.medium / total) * 100).toFixed(1) : '0.0',
          low: total > 0 ? ((distribution.low / total) * 100).toFixed(1) : '0.0',
          none: total > 0 ? ((distribution.none / total) * 100).toFixed(1) : '0.0',
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching severity distribution:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch severity distribution',
    })
  }
}

/**
 * Get top affected vendors/products
 */
export const getTopVendorsProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query
    const limitNum = parseInt(limit as string)

    // Get CISA KEV vendor/product data
    const cisaKevs = await prisma.cisaKev.findMany({
      select: {
        vendorProject: true,
        product: true,
      },
    })

    // Count by vendor
    const vendorCounts = new Map<string, number>()
    const productCounts = new Map<string, number>()

    cisaKevs.forEach((kev) => {
      if (kev.vendorProject) {
        vendorCounts.set(kev.vendorProject, (vendorCounts.get(kev.vendorProject) || 0) + 1)
      }
      if (kev.product) {
        productCounts.set(kev.product, (productCounts.get(kev.product) || 0) + 1)
      }
    })

    // Convert to arrays and sort
    const topVendors = Array.from(vendorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum)

    const topProducts = Array.from(productCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum)

    res.json({
      success: true,
      data: {
        topVendors,
        topProducts,
        totalVendors: vendorCounts.size,
        totalProducts: productCounts.size,
      },
    })
  } catch (error: any) {
    console.error('Error fetching top vendors/products:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch top vendors/products',
    })
  }
}

/**
 * Get CVSS score distribution
 */
export const getCvssDistribution = async (req: Request, res: Response) => {
  try {
    const nvdCves = await prisma.nvdCve.findMany({
      select: {
        cvssScore: true,
      },
    })

    const jvnVulns = await prisma.jvnVulnerability.findMany({
      select: {
        cvssScore: true,
      },
    })

    // Create distribution buckets (0-1, 1-2, 2-3, ... 9-10)
    const distribution = Array(11)
      .fill(0)
      .map((_, i) => ({
        range: i === 10 ? '10.0' : `${i}.0-${i}.9`,
        count: 0,
        min: i,
        max: i === 10 ? 10 : i + 0.9,
      }))

    // Count NVD
    nvdCves.forEach((cve) => {
      const score = cve.cvssScore || 0
      const bucket = Math.min(Math.floor(score), 10)
      distribution[bucket].count++
    })

    // Count JVN
    jvnVulns.forEach((vuln) => {
      const score = vuln.cvssScore || 0
      const bucket = Math.min(Math.floor(score), 10)
      distribution[bucket].count++
    })

    res.json({
      success: true,
      data: distribution,
    })
  } catch (error: any) {
    console.error('Error fetching CVSS distribution:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch CVSS distribution',
    })
  }
}

/**
 * Get monthly statistics
 */
export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const { months = 12 } = req.query
    const monthsNum = parseInt(months as string)

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - monthsNum)

    // Get data for the period
    const cisaKevs = await prisma.cisaKev.findMany({
      where: {
        dateAdded: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        dateAdded: true,
      },
    })

    const nvdCves = await prisma.nvdCve.findMany({
      where: {
        publishedDate: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        publishedDate: true,
        cvssScore: true,
      },
    })

    const jvnVulns = await prisma.jvnVulnerability.findMany({
      where: {
        publishedDate: {
          gte: startDate.toISOString(),
        },
      },
      select: {
        publishedDate: true,
        cvssScore: true,
      },
    })

    // Aggregate by month
    const monthlyStats = new Map<string, any>()

    const processMonth = (dateStr: string | null, type: string, cvssScore?: number) => {
      if (!dateStr) return
      const date = new Date(dateStr)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthKey,
          cisaKev: 0,
          nvd: 0,
          jvn: 0,
          critical: 0,
          high: 0,
          total: 0,
        })
      }

      const stats = monthlyStats.get(monthKey)
      stats[type]++
      stats.total++

      if (cvssScore) {
        if (cvssScore >= 9.0) stats.critical++
        else if (cvssScore >= 7.0) stats.high++
      }
    }

    cisaKevs.forEach((kev) => processMonth(kev.dateAdded, 'cisaKev'))
    nvdCves.forEach((cve) => processMonth(cve.publishedDate, 'nvd', cve.cvssScore || undefined))
    jvnVulns.forEach((vuln) =>
      processMonth(vuln.publishedDate, 'jvn', vuln.cvssScore || undefined)
    )

    const stats = Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month))

    res.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    console.error('Error fetching monthly stats:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch monthly stats',
    })
  }
}
