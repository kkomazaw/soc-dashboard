import type { Request, Response } from 'express'
import {
  getMappingsForCve,
  getCvesForTechnique,
  getMappingStats,
  getAllMappings,
  mapAllVulnerabilitiesToAttack,
  mapAllCisaKevToAttack,
  mapAllJvnToAttack,
  mapAllNvdToAttack,
} from '../services/mapping/cveAttackMapper'

/**
 * Get ATT&CK technique mappings for a specific CVE
 */
export const getCveMappings = async (req: Request, res: Response) => {
  try {
    const { cveId } = req.params

    if (!cveId) {
      return res.status(400).json({ error: 'CVE ID parameter is required' })
    }

    console.log(`Fetching ATT&CK mappings for CVE: ${cveId}`)
    const mappings = await getMappingsForCve(cveId)

    res.json({
      cveId,
      count: mappings.length,
      mappings,
    })
  } catch (error) {
    console.error('CVE mappings fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch CVE mappings',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get CVEs mapped to a specific ATT&CK technique
 */
export const getTechniqueCves = async (req: Request, res: Response) => {
  try {
    const { techniqueId } = req.params

    if (!techniqueId) {
      return res.status(400).json({ error: 'Technique ID parameter is required' })
    }

    console.log(`Fetching CVEs for ATT&CK technique: ${techniqueId}`)
    const cves = await getCvesForTechnique(techniqueId)

    res.json({
      techniqueId,
      count: cves.length,
      cves,
    })
  } catch (error) {
    console.error('Technique CVEs fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch technique CVEs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get all CVE-to-ATT&CK mappings
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all CVE-to-ATT&CK mappings')
    const mappings = await getAllMappings()

    res.json(mappings)
  } catch (error) {
    console.error('All mappings fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch all mappings',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get mapping statistics
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    console.log('Fetching mapping statistics')
    const stats = await getMappingStats()

    res.json(stats)
  } catch (error) {
    console.error('Mapping stats fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch mapping statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Trigger mapping for all vulnerabilities
 */
export const triggerMappingAll = async (req: Request, res: Response) => {
  try {
    console.log('Triggering mapping for all vulnerabilities...')

    // Run mapping in background
    mapAllVulnerabilitiesToAttack().catch((error) => {
      console.error('Background mapping failed:', error)
    })

    res.json({
      message: 'Mapping process started in background',
      status: 'processing',
    })
  } catch (error) {
    console.error('Mapping trigger error:', error)
    res.status(500).json({
      error: 'Failed to trigger mapping',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Trigger mapping for CISA KEV vulnerabilities only
 */
export const triggerMappingCisa = async (req: Request, res: Response) => {
  try {
    console.log('Triggering mapping for CISA KEV vulnerabilities...')

    // Run mapping in background
    mapAllCisaKevToAttack().catch((error) => {
      console.error('Background mapping failed:', error)
    })

    res.json({
      message: 'CISA KEV mapping process started in background',
      status: 'processing',
    })
  } catch (error) {
    console.error('Mapping trigger error:', error)
    res.status(500).json({
      error: 'Failed to trigger CISA mapping',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Trigger mapping for JVN vulnerabilities only
 */
export const triggerMappingJvn = async (req: Request, res: Response) => {
  try {
    console.log('Triggering mapping for JVN vulnerabilities...')

    // Run mapping in background
    mapAllJvnToAttack().catch((error) => {
      console.error('Background mapping failed:', error)
    })

    res.json({
      message: 'JVN mapping process started in background',
      status: 'processing',
    })
  } catch (error) {
    console.error('Mapping trigger error:', error)
    res.status(500).json({
      error: 'Failed to trigger JVN mapping',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Trigger mapping for NVD CVEs only
 */
export const triggerMappingNvd = async (req: Request, res: Response) => {
  try {
    console.log('Triggering mapping for NVD CVEs...')

    // Run mapping in background
    mapAllNvdToAttack().catch((error) => {
      console.error('Background mapping failed:', error)
    })

    res.json({
      message: 'NVD mapping process started in background',
      status: 'processing',
    })
  } catch (error) {
    console.error('Mapping trigger error:', error)
    res.status(500).json({
      error: 'Failed to trigger NVD mapping',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
