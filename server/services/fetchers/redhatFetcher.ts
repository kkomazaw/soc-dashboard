import axios from 'axios'

const REDHAT_API_BASE = 'https://access.redhat.com/labs/securitydataapi'

export interface RedHatAdvisory {
  id: string // e.g., RHSA-2024:0001
  type: string // RHSA, RHBA, RHEA
  severity: string // Critical, Important, Moderate, Low
  synopsis: string
  description: string
  public_date: string
  CVEs: string[]
  affected_packages: string[]
  bugzilla: Array<{
    id: string
    description: string
  }>
  resource_url: string
}

export interface RedHatCVE {
  CVE: string
  severity: string
  public_date: string
  advisories: string[]
  bugzilla: {
    description: string
    id: string
    url: string
  }
  cvss: {
    cvss_base_score: string
    cvss_scoring_vector: string
    status: string
  }
  cvss3: {
    cvss3_base_score: string
    cvss3_scoring_vector: string
    status: string
  }
  cwe: string
  details: string[]
  affected_packages: Array<{
    cpe: string
    name: string
    version: string
  }>
  resource_url: string
  upstream_fix?: string
  references?: string[]
}

interface AdvisoryApiResponse {
  RHSA?: RedHatAdvisory[]
  RHBA?: RedHatAdvisory[]
  RHEA?: RedHatAdvisory[]
}

/**
 * Fetch Red Hat Security Advisories (RHSA)
 * @param days Number of days to look back (default: 30)
 */
export const fetchRedHatAdvisories = async (days: number = 30): Promise<RedHatAdvisory[]> => {
  try {
    const afterDate = new Date()
    afterDate.setDate(afterDate.getDate() - days)
    const afterDateStr = afterDate.toISOString().split('T')[0]

    console.log(`Fetching Red Hat Security Advisories from ${afterDateStr}...`)

    const response = await axios.get<AdvisoryApiResponse>(`${REDHAT_API_BASE}/advisory.json`, {
      params: {
        after: afterDateStr,
      },
      timeout: 30000,
    })

    const advisories: RedHatAdvisory[] = []

    // Extract RHSA (Security Advisories)
    if (response.data.RHSA && Array.isArray(response.data.RHSA)) {
      advisories.push(...response.data.RHSA.map(item => ({
        ...item,
        type: 'RHSA',
        resource_url: item.resource_url || `https://access.redhat.com/errata/${item.id}`,
      })))
    }

    // Sort by public_date (newest first)
    advisories.sort((a, b) => new Date(b.public_date).getTime() - new Date(a.public_date).getTime())

    console.log(`Successfully fetched ${advisories.length} Red Hat Security Advisories`)
    return advisories
  } catch (error: any) {
    console.error('Error fetching Red Hat advisories:', error.message)
    throw error
  }
}

/**
 * Fetch CVE details from Red Hat Security Data API
 * @param cveId CVE ID (e.g., CVE-2024-0001)
 */
export const fetchRedHatCVE = async (cveId: string): Promise<RedHatCVE | null> => {
  try {
    console.log(`Fetching Red Hat CVE data for ${cveId}...`)

    const response = await axios.get<RedHatCVE>(`${REDHAT_API_BASE}/cve/${cveId}.json`, {
      timeout: 10000,
    })

    return {
      ...response.data,
      resource_url: response.data.resource_url || `https://access.redhat.com/security/cve/${cveId}`,
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`CVE ${cveId} not found in Red Hat database`)
      return null
    }
    console.error(`Error fetching Red Hat CVE ${cveId}:`, error.message)
    throw error
  }
}

/**
 * Fetch recent CVEs affecting Red Hat products
 * @param days Number of days to look back (default: 30)
 */
export const fetchRedHatCVEs = async (days: number = 30): Promise<RedHatCVE[]> => {
  try {
    const afterDate = new Date()
    afterDate.setDate(afterDate.getDate() - days)
    const afterDateStr = afterDate.toISOString().split('T')[0]

    console.log(`Fetching Red Hat CVEs from ${afterDateStr}...`)

    const response = await axios.get<RedHatCVE[]>(`${REDHAT_API_BASE}/cve.json`, {
      params: {
        after: afterDateStr,
      },
      timeout: 30000,
    })

    const cves = Array.isArray(response.data) ? response.data : []

    // Add resource_url if missing
    const enrichedCves = cves.map(cve => ({
      ...cve,
      resource_url: cve.resource_url || `https://access.redhat.com/security/cve/${cve.CVE}`,
    }))

    // Sort by public_date (newest first)
    enrichedCves.sort((a, b) => new Date(b.public_date).getTime() - new Date(a.public_date).getTime())

    console.log(`Successfully fetched ${enrichedCves.length} CVEs from Red Hat`)
    return enrichedCves
  } catch (error: any) {
    console.error('Error fetching Red Hat CVEs:', error.message)
    throw error
  }
}

/**
 * Fetch all Red Hat security data (advisories and CVEs)
 */
export const fetchAllRedHatSecurityData = async (days: number = 30) => {
  console.log('Fetching all Red Hat security data...')

  const [advisories, cves] = await Promise.all([
    fetchRedHatAdvisories(days),
    fetchRedHatCVEs(days),
  ])

  return {
    advisories,
    cves,
    stats: {
      totalAdvisories: advisories.length,
      totalCVEs: cves.length,
      bySeverity: {
        critical: [
          ...advisories.filter(a => a.severity?.toLowerCase() === 'critical'),
          ...cves.filter(c => c.severity?.toLowerCase() === 'critical'),
        ].length,
        important: [
          ...advisories.filter(a => a.severity?.toLowerCase() === 'important'),
          ...cves.filter(c => c.severity?.toLowerCase() === 'important'),
        ].length,
        moderate: [
          ...advisories.filter(a => a.severity?.toLowerCase() === 'moderate'),
          ...cves.filter(c => c.severity?.toLowerCase() === 'moderate'),
        ].length,
        low: [
          ...advisories.filter(a => a.severity?.toLowerCase() === 'low'),
          ...cves.filter(c => c.severity?.toLowerCase() === 'low'),
        ].length,
      },
    },
  }
}
