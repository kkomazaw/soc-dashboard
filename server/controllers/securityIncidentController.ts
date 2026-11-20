import type { Request, Response } from 'express'
import {
  getAllSecurityIncidents,
  getSecurityIncidentsBySeverity,
  getSecurityIncidentsByCategory,
  getSecurityIncidentsByStatus,
  getRecentSecurityIncidents,
  getSecurityIncidentById,
  updateSecurityIncidentStatus,
  getSecurityIncidentStats,
} from '../services/database/securityIncidentDb'
import {
  fetchAndSyncSecurityIncidents,
  initializeSecurityIncidents,
} from '../services/fetchers/securityIncidentFetcher'

/**
 * Get all security incidents
 */
export const getSecurityIncidents = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving security incidents from database...')

    const { severity, category, status, days } = req.query

    let data

    // Apply filters if provided
    if (severity && typeof severity === 'string') {
      data = await getSecurityIncidentsBySeverity(severity)
    } else if (category && typeof category === 'string') {
      data = await getSecurityIncidentsByCategory(category)
    } else if (status && typeof status === 'string') {
      data = await getSecurityIncidentsByStatus(status)
    } else if (days && typeof days === 'string') {
      data = await getRecentSecurityIncidents(parseInt(days, 10))
    } else {
      data = await getAllSecurityIncidents()
    }

    // If database is empty, initialize with historical data
    if (data.length === 0) {
      console.log('Database is empty, initializing with historical incidents...')
      await initializeSecurityIncidents()
      data = await getAllSecurityIncidents()
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = data.map((item) => ({
      id: item.incidentId,
      name: item.name,
      alternateName: item.alternateName || undefined,
      discoveryDate: item.discoveryDate.toISOString().split('T')[0],
      publicDisclosure: item.publicDisclosure ? item.publicDisclosure.toISOString().split('T')[0] : undefined,
      severity: item.severity,
      category: item.category,
      description: item.description,
      affectedSystems: item.affectedSystems ? JSON.parse(item.affectedSystems) : [],
      relatedCVEs: item.relatedCVEs ? JSON.parse(item.relatedCVEs) : [],
      threatActors: item.threatActors ? JSON.parse(item.threatActors) : undefined,
      mitigations: item.mitigations ? JSON.parse(item.mitigations) : [],
      references: item.references ? JSON.parse(item.references) : [],
      impact: item.impact || undefined,
      status: item.status,
    }))

    console.log(`Successfully retrieved ${responseData.length} security incidents`)
    res.json(responseData)
  } catch (error) {
    console.error('Error fetching security incidents:', error)
    res.status(500).json({
      error: 'Failed to fetch security incidents',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a single security incident by ID
 */
export const getSecurityIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log(`Retrieving security incident ${id}...`)

    const incident = await getSecurityIncidentById(id)

    if (!incident) {
      return res.status(404).json({
        error: 'Security incident not found',
        message: `No incident found with ID: ${id}`,
      })
    }

    // Convert Prisma Date objects and JSON strings to proper format for response
    const responseData = {
      id: incident.incidentId,
      name: incident.name,
      alternateName: incident.alternateName || undefined,
      discoveryDate: incident.discoveryDate.toISOString().split('T')[0],
      publicDisclosure: incident.publicDisclosure ? incident.publicDisclosure.toISOString().split('T')[0] : undefined,
      severity: incident.severity,
      category: incident.category,
      description: incident.description,
      affectedSystems: incident.affectedSystems ? JSON.parse(incident.affectedSystems) : [],
      relatedCVEs: incident.relatedCVEs ? JSON.parse(incident.relatedCVEs) : [],
      threatActors: incident.threatActors ? JSON.parse(incident.threatActors) : undefined,
      mitigations: incident.mitigations ? JSON.parse(incident.mitigations) : [],
      references: incident.references ? JSON.parse(incident.references) : [],
      impact: incident.impact || undefined,
      status: incident.status,
    }

    res.json(responseData)
  } catch (error) {
    console.error(`Error fetching security incident ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to fetch security incident',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Refresh security incidents from threat intelligence feeds
 */
export const refreshSecurityIncidents = async (req: Request, res: Response) => {
  try {
    console.log('Manually refreshing security incidents from feeds...')
    await fetchAndSyncSecurityIncidents()
    const data = await getAllSecurityIncidents()

    res.json({
      message: 'Security incidents refreshed successfully',
      count: data.length,
    })
  } catch (error) {
    console.error('Error refreshing security incidents:', error)
    res.status(500).json({
      error: 'Failed to refresh security incidents',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Initialize security incidents database with historical data
 */
export const initializeIncidents = async (req: Request, res: Response) => {
  try {
    console.log('Initializing security incidents database...')
    await initializeSecurityIncidents()
    const data = await getAllSecurityIncidents()

    res.json({
      message: 'Security incidents initialized successfully',
      count: data.length,
    })
  } catch (error) {
    console.error('Error initializing security incidents:', error)
    res.status(500).json({
      error: 'Failed to initialize security incidents',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Update security incident status
 */
export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'contained', 'mitigated'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: active, contained, mitigated',
      })
    }

    console.log(`Updating incident ${id} status to ${status}...`)
    const incident = await updateSecurityIncidentStatus(id, status)

    res.json({
      message: 'Incident status updated successfully',
      incident: {
        id: incident.incidentId,
        status: incident.status,
      },
    })
  } catch (error) {
    console.error(`Error updating incident ${req.params.id} status:`, error)
    res.status(500).json({
      error: 'Failed to update incident status',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get security incident statistics
 */
export const getIncidentStats = async (req: Request, res: Response) => {
  try {
    console.log('Retrieving security incident statistics...')
    const stats = await getSecurityIncidentStats()

    res.json(stats)
  } catch (error) {
    console.error('Error fetching security incident stats:', error)
    res.status(500).json({
      error: 'Failed to fetch incident statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
