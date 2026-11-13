import axios from 'axios'
import { getCountryName } from '../../utils/countryMapper'

const OTX_API_BASE = 'https://otx.alienvault.com/api/v1'
const API_KEY = process.env.OTX_API_KEY

export interface OTXIPIndicator {
  ipAddress: string
  countryCode: string
  country: string
  threatType: string
  severity: string
  reputation: number // -1 to 10 (higher = more malicious)
  pulseCount: number // Number of threat intelligence pulses referencing this IP
  tags: string[]
  lastSeen: string
}

/**
 * Map OTX tags to threat types
 */
const mapTagsToThreatType = (tags: string[]): string => {
  const lowerTags = tags.map(t => t.toLowerCase())

  if (lowerTags.some(t => t.includes('malware') || t.includes('trojan') || t.includes('virus'))) {
    return 'malware'
  }
  if (lowerTags.some(t => t.includes('ransomware') || t.includes('crypto'))) {
    return 'ransomware'
  }
  if (lowerTags.some(t => t.includes('phish') || t.includes('spam'))) {
    return 'phishing'
  }
  if (lowerTags.some(t => t.includes('botnet') || t.includes('c2') || t.includes('c&c'))) {
    return 'botnet'
  }
  if (lowerTags.some(t => t.includes('ddos') || t.includes('dos'))) {
    return 'ddos'
  }
  if (lowerTags.some(t => t.includes('scan') || t.includes('probe'))) {
    return 'scanning'
  }
  if (lowerTags.some(t => t.includes('exploit') || t.includes('cve'))) {
    return 'exploit'
  }
  if (lowerTags.some(t => t.includes('apt') || t.includes('targeted'))) {
    return 'apt'
  }

  return 'suspicious'
}

/**
 * Map OTX reputation score to severity
 * OTX uses -1 to 10 scale where higher = more malicious
 */
const mapReputationToSeverity = (reputation: number, pulseCount: number): string => {
  if (reputation >= 7 || pulseCount >= 10) return 'critical'
  if (reputation >= 5 || pulseCount >= 5) return 'high'
  if (reputation >= 3 || pulseCount >= 2) return 'medium'
  return 'low'
}

/**
 * Fetch malicious IP indicators from OTX subscribed pulses
 * @param limit Number of recent pulses to fetch (default 10)
 */
export const fetchOTXMaliciousIPs = async (limit: number = 10): Promise<OTXIPIndicator[]> => {
  try {
    if (!API_KEY) {
      console.warn('OTX_API_KEY not configured, skipping OTX fetch')
      return []
    }

    console.log(`Fetching malicious IPs from OTX subscribed pulses (limit: ${limit})...`)

    // Fetch recent subscribed pulses
    const pulsesResponse = await axios.get(`${OTX_API_BASE}/pulses/subscribed`, {
      headers: {
        'X-OTX-API-KEY': API_KEY,
      },
      params: {
        limit,
        page: 1,
      },
      timeout: 30000,
    })

    if (!pulsesResponse.data || !pulsesResponse.data.results) {
      console.warn('OTX returned empty pulse data')
      return []
    }

    const ipIndicators: OTXIPIndicator[] = []
    const seenIPs = new Set<string>()

    // Extract IPv4 indicators from pulses
    for (const pulse of pulsesResponse.data.results) {
      if (!pulse.indicators) continue

      for (const indicator of pulse.indicators) {
        // Only process IPv4 indicators
        if (indicator.type !== 'IPv4') continue

        const ip = indicator.indicator
        if (seenIPs.has(ip)) continue
        seenIPs.add(ip)

        try {
          // Fetch detailed IP information
          const ipInfo = await fetchIPReputation(ip)
          if (ipInfo) {
            ipIndicators.push(ipInfo)
          }
        } catch (error) {
          // Continue on individual IP errors
          console.warn(`Failed to fetch info for IP ${ip}`)
        }

        // Rate limiting: add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`Successfully fetched ${ipIndicators.length} malicious IPs from OTX`)
    return ipIndicators
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.warn('OTX API rate limit exceeded')
    } else if (error.response?.status === 403) {
      console.error('OTX API key is invalid or forbidden')
    } else {
      console.error('Error fetching OTX malicious IPs:', error.message)
    }
    return []
  }
}

/**
 * Fetch reputation and geolocation data for a specific IP
 * @param ipAddress IP address to check
 */
export const fetchIPReputation = async (ipAddress: string): Promise<OTXIPIndicator | null> => {
  try {
    if (!API_KEY) {
      console.warn('OTX_API_KEY not configured')
      return null
    }

    const response = await axios.get(`${OTX_API_BASE}/indicators/IPv4/${ipAddress}/general`, {
      headers: {
        'X-OTX-API-KEY': API_KEY,
      },
      timeout: 10000,
    })

    if (!response.data) {
      return null
    }

    const data = response.data
    const reputation = data.reputation || 0
    const pulseCount = data.pulse_info?.count || 0
    const tags = data.pulse_info?.pulses?.flatMap((p: any) => p.tags || []) || []
    const threatType = mapTagsToThreatType(tags)
    const severity = mapReputationToSeverity(reputation, pulseCount)

    const countryCode = data.country_code || 'XX'
    const countryName = data.country_name || getCountryName(countryCode)

    return {
      ipAddress,
      countryCode,
      country: countryName,
      threatType,
      severity,
      reputation,
      pulseCount,
      tags: [...new Set(tags)].slice(0, 10), // Unique tags, max 10
      lastSeen: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error(`Error fetching OTX IP reputation for ${ipAddress}:`, error.message)
    return null
  }
}

/**
 * Search for pulses by query (keywords, tags, etc.)
 * @param query Search query
 * @param limit Number of results (default 20)
 */
export const searchOTXPulses = async (query: string, limit: number = 20): Promise<any[]> => {
  try {
    if (!API_KEY) {
      console.warn('OTX_API_KEY not configured')
      return []
    }

    const response = await axios.get(`${OTX_API_BASE}/search/pulses`, {
      headers: {
        'X-OTX-API-KEY': API_KEY,
      },
      params: {
        q: query,
        limit,
      },
      timeout: 15000,
    })

    return response.data?.results || []
  } catch (error: any) {
    console.error(`Error searching OTX pulses for "${query}":`, error.message)
    return []
  }
}

/**
 * Fetch recent malicious IPs from OTX with aggressive filtering
 * This focuses on high-confidence malicious IPs for geographic threat analysis
 */
export const fetchOTXHighConfidenceIPs = async (): Promise<OTXIPIndicator[]> => {
  try {
    if (!API_KEY) {
      console.warn('OTX_API_KEY not configured, skipping OTX fetch')
      return []
    }

    console.log('Fetching high-confidence malicious IPs from OTX...')

    // Fetch malware-related pulses
    const malwareIPs = await fetchOTXMaliciousIPs(20)

    // Filter for high severity only
    const highConfidenceIPs = malwareIPs.filter(ip =>
      ip.severity === 'critical' || ip.severity === 'high'
    )

    console.log(`Filtered to ${highConfidenceIPs.length} high-confidence IPs`)
    return highConfidenceIPs
  } catch (error: any) {
    console.error('Error fetching OTX high-confidence IPs:', error.message)
    return []
  }
}
