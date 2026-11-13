import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface VendorPatch {
  id: number
  vendor: string
  product: string
  productVersion?: string
  patchId: string
  title: string
  description?: string
  severity: string
  cveIds: string[]
  cveCount: number
  releaseDate: string
  releaseType: string
  bulletinUrl?: string
  downloadUrl?: string
  kbArticleUrl?: string
  supersedes?: string[]
  supersededBy?: string[]
  affectedSystems?: string[]
  deploymentStatus: string
  deploymentDate?: string
  deploymentNotes?: string
  createdAt: string
  updatedAt: string
}

export interface PatchStats {
  total: number
  thisMonth: number
  last24Hours: number
  pending: number
  criticalUndeployed: number
  byVendor: Record<string, number>
  bySeverity: Record<string, number>
  byDeploymentStatus: Record<string, number>
}

export interface PatchCalendar {
  [date: string]: VendorPatch[]
}

/**
 * Get all patches with optional filters
 */
export const getPatches = async (params?: {
  vendor?: string
  severity?: string
  status?: string
  search?: string
}) => {
  const response = await axios.get(`${API_BASE_URL}/api/patches`, { params })
  return response.data
}

/**
 * Get patch by ID
 */
export const getPatchById = async (patchId: string): Promise<VendorPatch> => {
  const response = await axios.get(`${API_BASE_URL}/api/patches/${patchId}`)
  return response.data
}

/**
 * Get patch statistics
 */
export const getPatchStats = async (): Promise<PatchStats> => {
  const response = await axios.get(`${API_BASE_URL}/api/patches/stats`)
  return response.data
}

/**
 * Get patch calendar
 */
export const getPatchCalendar = async (year: number, month: number): Promise<PatchCalendar> => {
  const response = await axios.get(`${API_BASE_URL}/api/patches/calendar`, {
    params: { year, month },
  })
  return response.data
}

/**
 * Update patch deployment status
 */
export const updatePatchDeploymentStatus = async (
  patchId: string,
  status: string,
  notes?: string
) => {
  const response = await axios.patch(`${API_BASE_URL}/api/patches/${patchId}/status`, {
    status,
    notes,
  })
  return response.data
}

/**
 * Refresh patches from sources
 */
export const refreshPatches = async (vendor?: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/patches/refresh`, null, {
    params: { vendor },
  })
  return response.data
}
