import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api/attack'

export interface AttackTechnique {
  id: string
  name: string
  description: string
  tactics: string[]
  platforms: string[]
  dataSource: string[]
  url?: string
  mitigations?: string[]
  subtechniques?: string[]
}

export interface AttackTactic {
  id: string
  name: string
  description: string
  shortName: string
  techniques: string[]
}

export interface AttackMatrix {
  id: string
  name: string
  description: string
  shortName: string
  techniques: string[]
  techniqueDetails: AttackTechnique[]
}

export interface AttackStats {
  totalTechniques: number
  totalTactics: number
  techniquesByTactic: Array<{
    tactic: string
    shortName: string
    count: number
  }>
}

// Get all techniques
export const getTechniques = async () => {
  const response = await axios.get<{
    success: boolean
    data: AttackTechnique[]
    stats: AttackStats
    count: number
  }>(`${API_BASE_URL}/techniques`)
  return response.data
}

// Get all tactics
export const getTactics = async () => {
  const response = await axios.get<{
    success: boolean
    data: AttackTactic[]
    count: number
  }>(`${API_BASE_URL}/tactics`)
  return response.data
}

// Get ATT&CK matrix (all tactics with techniques)
export const getMatrix = async () => {
  const response = await axios.get<{
    success: boolean
    data: AttackMatrix[]
    stats: {
      totalTactics: number
      totalTechniques: number
    }
  }>(`${API_BASE_URL}/matrix`)
  return response.data
}

// Search technique by ID
export const searchTechniqueById = async (techniqueId: string) => {
  const response = await axios.get<{
    success: boolean
    data: AttackTechnique
  }>(`${API_BASE_URL}/techniques/${techniqueId}`)
  return response.data
}

// Get techniques by tactic
export const getTechniquesByTactic = async (tacticName: string) => {
  const response = await axios.get<{
    success: boolean
    data: AttackTechnique[]
    count: number
    tactic: string
  }>(`${API_BASE_URL}/tactics/${tacticName}/techniques`)
  return response.data
}

// Get techniques by platform
export const getTechniquesByPlatform = async (platform: string) => {
  const response = await axios.get<{
    success: boolean
    data: AttackTechnique[]
    count: number
    platform: string
  }>(`${API_BASE_URL}/platforms/${platform}/techniques`)
  return response.data
}

// Search techniques by keyword
export const searchTechniques = async (keyword: string) => {
  const response = await axios.get<{
    success: boolean
    data: AttackTechnique[]
    count: number
    query: string
  }>(`${API_BASE_URL}/search`, {
    params: { q: keyword },
  })
  return response.data
}

// Get statistics
export const getAttackStats = async () => {
  const response = await axios.get<{
    success: boolean
    data: AttackStats
  }>(`${API_BASE_URL}/stats`)
  return response.data
}

// Refresh ATT&CK data
export const refreshAttackData = async () => {
  const response = await axios.post<{
    success: boolean
    message: string
    count: {
      techniques: number
      tactics: number
    }
    stats: AttackStats
  }>(`${API_BASE_URL}/refresh`)
  return response.data
}
