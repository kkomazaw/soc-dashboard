import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface FileHashResult {
  hash: string
  md5: string
  sha1: string
  sha256: string
  size: number
  type?: string
  names: string[]
  firstSeen: string
  lastAnalysis: string
  stats: {
    harmless: number
    malicious: number
    suspicious: number
    undetected: number
    timeout: number
  }
  detectionRate: string
}

export interface UrlResult {
  url: string
  lastAnalysis: string
  stats: {
    harmless: number
    malicious: number
    suspicious: number
    undetected: number
    timeout: number
  }
  categories: Record<string, string>
  detectionRate: string
}

export interface IpResult {
  ipAddress: string
  isPublic: boolean
  abuseConfidenceScore: number
  country: string
  countryCode: string
  usageType: string
  isp: string
  domain: string
  hostnames: string[]
  isTor: boolean
  isWhitelisted: boolean
  totalReports: number
  numDistinctUsers: number
  lastReportedAt: string | null
  recentReports?: Array<{
    date: string
    comment: string
    categories: string[]
    country: string
  }>
}

export interface UrlhausResult {
  found: boolean
  message?: string
  url?: string
  urlStatus?: string
  host?: string
  dateAdded?: string
  threat?: string
  tags?: string[]
  reporter?: string
  blacklists?: {
    spamhaus_dbl?: string
    surbl?: string
  }
  urlhausLink?: string
}

export interface MalwareBazaarResult {
  found: boolean
  message?: string
  hash?: string
  sha256?: string
  sha1?: string
  md5?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  fileMime?: string
  signature?: string
  tags?: string[]
  firstSeen?: string
  lastSeen?: string
  reporter?: string
  originCountry?: string
  intelligence?: {
    downloads?: number
    uploads?: number
    mail?: string
  }
}

export interface ApiStatus {
  virusTotal: {
    configured: boolean
    available: boolean
  }
  abuseIPDB: {
    configured: boolean
    available: boolean
  }
  urlhaus: {
    configured: boolean
    available: boolean
  }
  malwareBazaar: {
    configured: boolean
    available: boolean
  }
  otx?: {
    configured: boolean
    available: boolean
  }
  threatFox?: {
    configured: boolean
    available: boolean
  }
  feodoTracker?: {
    configured: boolean
    available: boolean
  }
}

export const getApiStatus = async (): Promise<ApiStatus> => {
  try {
    const response = await axios.get<ApiStatus>(`${API_BASE_URL}/api/ioc/status`)
    return response.data
  } catch (error) {
    console.error('Failed to get API status:', error)
    throw error
  }
}

export const searchFileHash = async (hash: string): Promise<FileHashResult> => {
  try {
    const response = await axios.get<FileHashResult>(
      `${API_BASE_URL}/api/ioc/hash/${hash}`
    )
    return response.data
  } catch (error) {
    console.error('File hash search failed:', error)
    throw error
  }
}

export const searchUrl = async (url: string): Promise<UrlResult> => {
  try {
    const response = await axios.post<UrlResult>(
      `${API_BASE_URL}/api/ioc/url`,
      { url }
    )
    return response.data
  } catch (error) {
    console.error('URL search failed:', error)
    throw error
  }
}

export const searchIpAddress = async (ip: string): Promise<IpResult> => {
  try {
    const response = await axios.get<IpResult>(
      `${API_BASE_URL}/api/ioc/ip/${ip}`
    )
    return response.data
  } catch (error) {
    console.error('IP address search failed:', error)
    throw error
  }
}

export const checkUrlhaus = async (url: string): Promise<UrlhausResult> => {
  try {
    const response = await axios.post<UrlhausResult>(
      `${API_BASE_URL}/api/ioc/urlhaus`,
      { url }
    )
    return response.data
  } catch (error) {
    console.error('URLhaus check failed:', error)
    throw error
  }
}

export const checkMalwareBazaar = async (hash: string): Promise<MalwareBazaarResult> => {
  try {
    const response = await axios.get<MalwareBazaarResult>(
      `${API_BASE_URL}/api/ioc/malware/${hash}`
    )
    return response.data
  } catch (error) {
    console.error('MalwareBazaar check failed:', error)
    throw error
  }
}
