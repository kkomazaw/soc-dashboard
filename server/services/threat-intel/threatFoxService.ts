import axios from 'axios'

const THREATFOX_API_BASE = 'https://threatfox-api.abuse.ch/api/v1/'
const FEODOTRACKER_API_BASE = 'https://feodotracker.abuse.ch'

export interface ThreatFoxIOC {
  id: string
  ioc: string
  ioc_type: string
  threat_type: string
  threat_type_desc: string
  malware: string
  malware_printable: string
  malware_alias: string
  malware_malpedia: string
  confidence_level: number
  first_seen: string
  last_seen: string
  reporter: string
  reference: string
  tags: string[]
}

export interface ThreatFoxResponse {
  query_status: string
  data?: ThreatFoxIOC[]
}

export interface FeodoC2 {
  ip_address: string
  port: number
  status: string
  hostname: string | null
  as_number: number
  as_name: string
  country: string
  first_seen: string
  last_seen: string
  malware: string
}

/**
 * Get recent IOCs from ThreatFox
 */
export const getRecentThreatFoxIOCs = async (days: number = 3): Promise<ThreatFoxResponse> => {
  try {
    const response = await axios.post(THREATFOX_API_BASE, {
      query: 'get_iocs',
      days,
    })

    return response.data
  } catch (error: any) {
    console.error('ThreatFox API error (recent IOCs):', error.message)
    throw new Error(`Failed to fetch ThreatFox IOCs: ${error.message}`)
  }
}

/**
 * Search IOC in ThreatFox
 */
export const searchThreatFoxIOC = async (ioc: string): Promise<ThreatFoxResponse> => {
  try {
    const response = await axios.post(THREATFOX_API_BASE, {
      query: 'search_ioc',
      search_term: ioc,
    })

    return response.data
  } catch (error: any) {
    console.error(`ThreatFox API error (search IOC ${ioc}):`, error.message)
    throw new Error(`Failed to search ThreatFox IOC: ${error.message}`)
  }
}

/**
 * Search hash in ThreatFox
 */
export const searchThreatFoxHash = async (hash: string): Promise<ThreatFoxResponse> => {
  try {
    const response = await axios.post(THREATFOX_API_BASE, {
      query: 'search_hash',
      search_term: hash,
    })

    return response.data
  } catch (error: any) {
    console.error(`ThreatFox API error (search hash ${hash}):`, error.message)
    throw new Error(`Failed to search ThreatFox hash: ${error.message}`)
  }
}

/**
 * Get Feodo Tracker C2 blocklist
 */
export const getFeodoC2Blocklist = async (): Promise<FeodoC2[]> => {
  try {
    const response = await axios.get(`${FEODOTRACKER_API_BASE}/downloads/ipblocklist.json`)

    if (!response.data || !Array.isArray(response.data)) {
      return []
    }

    return response.data
  } catch (error: any) {
    console.error('Feodo Tracker API error:', error.message)
    throw new Error(`Failed to fetch Feodo Tracker blocklist: ${error.message}`)
  }
}

/**
 * Search IP in Feodo Tracker blocklist
 */
export const searchFeodoIP = async (ip: string): Promise<FeodoC2 | null> => {
  try {
    const blocklist = await getFeodoC2Blocklist()
    const found = blocklist.find((c2) => c2.ip_address === ip)

    return found || null
  } catch (error: any) {
    console.error(`Feodo Tracker search error (IP ${ip}):`, error.message)
    throw new Error(`Failed to search Feodo Tracker: ${error.message}`)
  }
}

/**
 * Check ThreatFox and Feodo Tracker status
 */
export const checkThreatIntelStatus = async (): Promise<{
  threatFox: boolean
  feodoTracker: boolean
}> => {
  const status = {
    threatFox: false,
    feodoTracker: false,
  }

  try {
    // Test ThreatFox with a simple query
    await axios.post(
      THREATFOX_API_BASE,
      { query: 'get_iocs', days: 1 },
      { timeout: 5000 }
    )
    status.threatFox = true
  } catch (error) {
    console.error('ThreatFox status check failed:', error)
  }

  try {
    // Test Feodo Tracker
    await axios.get(`${FEODOTRACKER_API_BASE}/downloads/ipblocklist.json`, {
      timeout: 5000,
    })
    status.feodoTracker = true
  } catch (error) {
    console.error('Feodo Tracker status check failed:', error)
  }

  return status
}
