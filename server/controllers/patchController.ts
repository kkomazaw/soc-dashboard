import type { Request, Response } from 'express'
import {
  getAllPatches,
  getPatchesByVendor,
  getPatchesBySeverity,
  getPatchesByDeploymentStatus,
  getPatchStats,
  getPatchCalendar,
  updatePatchDeploymentStatus,
  searchPatches,
  getPatchById,
  saveMicrosoftPatch,
  saveRedHatPatch,
  saveCiscoPatch,
  saveVMwarePatch,
  saveOraclePatch,
  saveAdobePatch,
  saveFortinetPatch,
  savePaloAltoPatch,
} from '../services/database/patchDb'
import { fetchRecentMicrosoftPatches } from '../services/fetchers/msrcFetcher'
import { fetchRecentRedHatPatches } from '../services/fetchers/redhatPatchFetcher'
import { fetchRecentCiscoPatches } from '../services/fetchers/ciscoPatchFetcher'
import { fetchRecentVMwarePatches } from '../services/fetchers/vmwarePatchFetcher'
import { fetchRecentOraclePatches } from '../services/fetchers/oraclePatchFetcher'
import { fetchRecentAdobePatches } from '../services/fetchers/adobePatchFetcher'
import { fetchRecentFortinetPatches } from '../services/fetchers/fortinetPatchFetcher'
import { fetchRecentPaloAltoPatches } from '../services/fetchers/paloaltoPatchFetcher'

/**
 * Get all patches
 */
export const getPatches = async (req: Request, res: Response) => {
  try {
    const { vendor, severity, status, search } = req.query

    let patches

    if (search && typeof search === 'string') {
      patches = await searchPatches(search)
    } else if (vendor && typeof vendor === 'string') {
      patches = await getPatchesByVendor(vendor)
    } else if (severity && typeof severity === 'string') {
      patches = await getPatchesBySeverity(severity)
    } else if (status && typeof status === 'string') {
      patches = await getPatchesByDeploymentStatus(status)
    } else {
      patches = await getAllPatches()
    }

    // Parse JSON fields
    const parsedPatches = patches.map((patch) => ({
      ...patch,
      cveIds: patch.cveIds ? JSON.parse(patch.cveIds) : [],
      supersedes: patch.supersedes ? JSON.parse(patch.supersedes) : [],
      supersededBy: patch.supersededBy ? JSON.parse(patch.supersededBy) : [],
      affectedSystems: patch.affectedSystems ? JSON.parse(patch.affectedSystems) : [],
    }))

    res.json({
      total: parsedPatches.length,
      patches: parsedPatches,
    })
  } catch (error) {
    console.error('Get patches error:', error)
    res.status(500).json({
      error: 'Failed to fetch patches',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get patch by ID
 */
export const getPatch = async (req: Request, res: Response) => {
  try {
    const { patchId } = req.params

    const patch = await getPatchById(patchId)

    if (!patch) {
      return res.status(404).json({
        error: 'Patch not found',
      })
    }

    // Parse JSON fields
    const parsedPatch = {
      ...patch,
      cveIds: patch.cveIds ? JSON.parse(patch.cveIds) : [],
      supersedes: patch.supersedes ? JSON.parse(patch.supersedes) : [],
      supersededBy: patch.supersededBy ? JSON.parse(patch.supersededBy) : [],
      affectedSystems: patch.affectedSystems ? JSON.parse(patch.affectedSystems) : [],
    }

    res.json(parsedPatch)
  } catch (error) {
    console.error('Get patch error:', error)
    res.status(500).json({
      error: 'Failed to fetch patch',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get patch statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getPatchStats()
    res.json(stats)
  } catch (error) {
    console.error('Get patch stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch patch statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get patch calendar
 */
export const getCalendar = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({
        error: 'Year and month are required',
      })
    }

    const yearNum = parseInt(year as string, 10)
    const monthNum = parseInt(month as string, 10) - 1 // 0-indexed

    const calendar = await getPatchCalendar(yearNum, monthNum)

    // Parse JSON fields in calendar
    const parsedCalendar: Record<string, any[]> = {}
    Object.keys(calendar).forEach((dateKey) => {
      parsedCalendar[dateKey] = calendar[dateKey].map((patch) => ({
        ...patch,
        cveIds: patch.cveIds ? JSON.parse(patch.cveIds) : [],
      }))
    })

    res.json(parsedCalendar)
  } catch (error) {
    console.error('Get patch calendar error:', error)
    res.status(500).json({
      error: 'Failed to fetch patch calendar',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Update patch deployment status
 */
export const updateDeploymentStatus = async (req: Request, res: Response) => {
  try {
    const { patchId } = req.params
    const { status, notes } = req.body

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
      })
    }

    const validStatuses = ['pending', 'testing', 'deployed', 'skipped']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      })
    }

    const patch = await updatePatchDeploymentStatus(patchId, status, notes)

    res.json({
      message: 'Patch deployment status updated successfully',
      patch,
    })
  } catch (error) {
    console.error('Update deployment status error:', error)
    res.status(500).json({
      error: 'Failed to update deployment status',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Refresh patches from sources
 */
export const refreshPatches = async (req: Request, res: Response) => {
  try {
    const { vendor } = req.query

    console.log('🔄 Refreshing patches...')

    let refreshedCount = 0
    const vendorCounts: Record<string, number> = {}

    // Microsoft patches
    if (!vendor || vendor === 'Microsoft') {
      console.log('Fetching Microsoft patches...')
      const microsoftPatches = await fetchRecentMicrosoftPatches()
      let msCount = 0

      for (const patch of microsoftPatches) {
        try {
          await saveMicrosoftPatch(patch)
          msCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Microsoft patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Microsoft'] = msCount
      console.log(`  ✓ Saved ${msCount} Microsoft patches`)
    }

    // Red Hat patches
    if (!vendor || vendor === 'Red Hat') {
      console.log('Fetching Red Hat patches...')
      const redhatPatches = await fetchRecentRedHatPatches()
      let rhCount = 0

      for (const patch of redhatPatches) {
        try {
          await saveRedHatPatch(patch)
          rhCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Red Hat patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Red Hat'] = rhCount
      console.log(`  ✓ Saved ${rhCount} Red Hat patches`)
    }

    // Cisco patches
    if (!vendor || vendor === 'Cisco') {
      console.log('Fetching Cisco patches...')
      const ciscoPatches = await fetchRecentCiscoPatches()
      let ciscoCount = 0

      for (const patch of ciscoPatches) {
        try {
          await saveCiscoPatch(patch)
          ciscoCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Cisco patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Cisco'] = ciscoCount
      console.log(`  ✓ Saved ${ciscoCount} Cisco patches`)
    }

    // VMware patches
    if (!vendor || vendor === 'VMware') {
      console.log('Fetching VMware patches...')
      const vmwarePatches = await fetchRecentVMwarePatches()
      let vmCount = 0

      for (const patch of vmwarePatches) {
        try {
          await saveVMwarePatch(patch)
          vmCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save VMware patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['VMware'] = vmCount
      console.log(`  ✓ Saved ${vmCount} VMware patches`)
    }

    // Oracle patches
    if (!vendor || vendor === 'Oracle') {
      console.log('Fetching Oracle patches...')
      const oraclePatches = await fetchRecentOraclePatches()
      let oracleCount = 0

      for (const patch of oraclePatches) {
        try {
          await saveOraclePatch(patch)
          oracleCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Oracle patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Oracle'] = oracleCount
      console.log(`  ✓ Saved ${oracleCount} Oracle patches`)
    }

    // Adobe patches
    if (!vendor || vendor === 'Adobe') {
      console.log('Fetching Adobe patches...')
      const adobePatches = await fetchRecentAdobePatches()
      let adobeCount = 0

      for (const patch of adobePatches) {
        try {
          await saveAdobePatch(patch)
          adobeCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Adobe patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Adobe'] = adobeCount
      console.log(`  ✓ Saved ${adobeCount} Adobe patches`)
    }

    // Fortinet patches
    if (!vendor || vendor === 'Fortinet') {
      console.log('Fetching Fortinet patches...')
      const fortinetPatches = await fetchRecentFortinetPatches()
      let fortinetCount = 0

      for (const patch of fortinetPatches) {
        try {
          await saveFortinetPatch(patch)
          fortinetCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Fortinet patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Fortinet'] = fortinetCount
      console.log(`  ✓ Saved ${fortinetCount} Fortinet patches`)
    }

    // Palo Alto Networks patches
    if (!vendor || vendor === 'Palo Alto Networks') {
      console.log('Fetching Palo Alto Networks patches...')
      const paloaltoPatches = await fetchRecentPaloAltoPatches()
      let paloaltoCount = 0

      for (const patch of paloaltoPatches) {
        try {
          await savePaloAltoPatch(patch)
          paloaltoCount++
          refreshedCount++
        } catch (error) {
          console.error(`Failed to save Palo Alto patch ${patch.patchId}:`, error)
        }
      }
      vendorCounts['Palo Alto Networks'] = paloaltoCount
      console.log(`  ✓ Saved ${paloaltoCount} Palo Alto Networks patches`)
    }

    console.log(`✅ Refreshed ${refreshedCount} total patches`)
    console.log(`   Breakdown:`, vendorCounts)

    res.json({
      message: 'Patches refreshed successfully',
      refreshedCount,
      byVendor: vendorCounts,
    })
  } catch (error) {
    console.error('Refresh patches error:', error)
    res.status(500).json({
      error: 'Failed to refresh patches',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
