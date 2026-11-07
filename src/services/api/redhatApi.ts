const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface RedHatAdvisory {
  id: number
  advisoryId: string // RHSA-2024:0001
  advisoryType: string // RHSA, RHBA, RHEA
  severity: string | null
  synopsis: string
  description: string | null
  publicDate: string
  cves: string[]
  affectedPackages: string[]
  bugzilla: Array<{
    id: string
    description: string
  }>
  resourceUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface RedHatCVE {
  id: number
  cveId: string
  severity: string | null
  publicDate: string
  advisories: string[]
  bugzillaId: string | null
  bugzillaDesc: string | null
  cvssScore: string | null
  cvssVector: string | null
  cvss3Score: string | null
  cvss3Vector: string | null
  cwe: string | null
  details: string[]
  affectedPackages: Array<{
    cpe?: string
    name: string
    version?: string
  }>
  resourceUrl: string | null
  references: string[]
  createdAt: string
  updatedAt: string
}

export interface RedHatStats {
  advisories: {
    total: number
    recent24h: number
    recent7days: number
    bySeverity: {
      critical: number
      important: number
      moderate: number
      low: number
    }
  }
  cves: {
    total: number
    recent24h: number
    recent7days: number
    bySeverity: {
      critical: number
      important: number
      moderate: number
      low: number
    }
  }
  combined: {
    total: number
    recent24h: number
    recent7days: number
    bySeverity: {
      critical: number
      important: number
      moderate: number
      low: number
    }
  }
}

export interface RedHatAllData {
  advisories: RedHatAdvisory[]
  cves: RedHatCVE[]
  stats: RedHatStats
}

/**
 * Get all Red Hat Security Advisories
 */
export const getRedHatAdvisories = async (): Promise<RedHatAdvisory[]> => {
  const response = await fetch(`${API_BASE_URL}/redhat/advisories`)
  if (!response.ok) {
    throw new Error('Failed to fetch Red Hat advisories')
  }
  return response.json()
}

/**
 * Get all Red Hat CVEs
 */
export const getRedHatCVEs = async (): Promise<RedHatCVE[]> => {
  const response = await fetch(`${API_BASE_URL}/redhat/cves`)
  if (!response.ok) {
    throw new Error('Failed to fetch Red Hat CVEs')
  }
  return response.json()
}

/**
 * Get Red Hat security statistics
 */
export const getRedHatStats = async (): Promise<RedHatStats> => {
  const response = await fetch(`${API_BASE_URL}/redhat/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch Red Hat stats')
  }
  return response.json()
}

/**
 * Get all Red Hat security data (advisories + CVEs + stats)
 */
export const getAllRedHatData = async (): Promise<RedHatAllData> => {
  const response = await fetch(`${API_BASE_URL}/redhat/all`)
  if (!response.ok) {
    throw new Error('Failed to fetch Red Hat data')
  }
  return response.json()
}

/**
 * Refresh Red Hat security data from API
 */
export const refreshRedHatData = async (days: number = 30): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/redhat/refresh?days=${days}`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to refresh Red Hat data')
  }
}
