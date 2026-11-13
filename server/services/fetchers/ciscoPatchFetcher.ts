import axios from 'axios'

/**
 * Cisco PSIRT OpenVuln API
 * Documentation: https://developer.cisco.com/docs/psirt/
 *
 * Note: Requires API credentials (client_id and client_secret)
 * Register at: https://apiconsole.cisco.com/
 */

const CISCO_API_BASE = 'https://apix.cisco.com/security/advisories'
const CISCO_CLIENT_ID = process.env.CISCO_CLIENT_ID || ''
const CISCO_CLIENT_SECRET = process.env.CISCO_CLIENT_SECRET || ''

export interface CiscoPatch {
  patchId: string
  title: string
  description: string
  severity: string
  releaseDate: Date
  releaseType: string
  cveIds: string[]
  product: string
  productVersion?: string
  bulletinUrl: string
  kbArticleUrl?: string
  supersedes?: string[]
}

interface CiscoAdvisory {
  advisoryId: string
  advisoryTitle: string
  publicationUrl: string
  sir: string // Security Impact Rating: Critical, High, Medium, Low
  firstPublished: string
  lastUpdated: string
  cves: string[]
  productNames: string[]
  summary: string
}

/**
 * Get OAuth token for Cisco API
 */
const getCiscoToken = async (): Promise<string | null> => {
  if (!CISCO_CLIENT_ID || !CISCO_CLIENT_SECRET) {
    console.warn('Cisco API credentials not configured. Set CISCO_CLIENT_ID and CISCO_CLIENT_SECRET in .env')
    return null
  }

  try {
    const response = await axios.post(
      'https://id.cisco.com/oauth2/default/v1/token',
      'grant_type=client_credentials',
      {
        auth: {
          username: CISCO_CLIENT_ID,
          password: CISCO_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    )

    return response.data.access_token
  } catch (error: any) {
    console.error('Failed to get Cisco API token:', error.message)
    return null
  }
}

/**
 * Fetch recent Cisco security advisories
 */
export const fetchRecentCiscoPatches = async (): Promise<CiscoPatch[]> => {
  try {
    console.log('🔍 Fetching recent Cisco security advisories...')

    const token = await getCiscoToken()
    if (!token) {
      console.warn('Skipping Cisco patches - API credentials not configured')
      return []
    }

    // Get advisories from last 3 months
    const response = await axios.get(`${CISCO_API_BASE}/latest/100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      timeout: 30000,
    })

    const advisories: CiscoAdvisory[] = response.data.advisories || []

    // Filter to last 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const recentAdvisories = advisories.filter(adv => {
      const publishDate = new Date(adv.firstPublished)
      return publishDate >= ninetyDaysAgo
    })

    const patches: CiscoPatch[] = recentAdvisories.map(adv => ({
      patchId: adv.advisoryId,
      title: adv.advisoryTitle,
      description: adv.summary || adv.advisoryTitle,
      severity: adv.sir || 'Medium',
      releaseDate: new Date(adv.firstPublished),
      releaseType: 'security',
      cveIds: adv.cves || [],
      product: adv.productNames?.[0] || 'Cisco Product',
      bulletinUrl: adv.publicationUrl || `https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/${adv.advisoryId}`,
    }))

    console.log(`✅ Fetched ${patches.length} Cisco patches`)
    return patches
  } catch (error: any) {
    console.error('Error fetching Cisco patches:', error.message)
    if (error.response?.status === 401) {
      console.warn('Cisco API authentication failed. Please check CISCO_CLIENT_ID and CISCO_CLIENT_SECRET')
    }
    return []
  }
}
