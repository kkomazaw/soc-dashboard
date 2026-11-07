import axios from 'axios'

const REDHAT_API_BASE = 'https://access.redhat.com/hydra/rest/securitydata'

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
  severity?: string
  threat_severity?: string
  public_date: string
  advisories?: string[]
  bugzilla?: {
    description: string
    id: string
    url: string
  }
  cvss?: {
    cvss_base_score: string
    cvss_scoring_vector: string
    status: string
  }
  cvss3?: {
    cvss3_base_score: string
    cvss3_scoring_vector: string
    status: string
  }
  cwe?: string
  details?: string[]
  affected_packages?: Array<{
    cpe: string
    name: string
    version: string
  }>
  affected_release?: Array<{
    product_name: string
    release_date: string
    advisory: string
    cpe: string
    package: string
    impact?: string
  }>
  resource_url?: string
  upstream_fix?: string
  references?: string[]
}

interface AdvisoryApiResponse {
  RHSA?: RedHatAdvisory[]
  RHBA?: RedHatAdvisory[]
  RHEA?: RedHatAdvisory[]
}

/**
 * Fetch Red Hat Security Advisories (RHSA) - extracted from CVE data
 * @param days Number of days to look back (default: 30)
 */
export const fetchRedHatAdvisories = async (days: number = 30): Promise<RedHatAdvisory[]> => {
  try {
    // Red Hat doesn't provide a direct advisory list endpoint
    // We'll extract advisory information from CVE data
    const cves = await fetchRedHatCVEs(days)

    // Create a map of unique advisories
    const advisoryMap = new Map<string, RedHatAdvisory>()

    for (const cve of cves) {
      if (cve.advisories && cve.advisories.length > 0) {
        for (const advisoryId of cve.advisories) {
          if (!advisoryMap.has(advisoryId)) {
            // Determine advisory type from ID
            let type = 'RHSA'
            if (advisoryId.startsWith('RHBA-')) type = 'RHBA'
            else if (advisoryId.startsWith('RHEA-')) type = 'RHEA'

            advisoryMap.set(advisoryId, {
              id: advisoryId,
              type,
              severity: cve.severity || null,
              synopsis: cve.bugzilla?.description || `Security update for ${cve.CVE}`,
              description: cve.details?.[0] || null,
              public_date: cve.public_date,
              CVEs: [cve.CVE],
              affected_packages: cve.affected_packages || [],
              bugzilla: cve.bugzilla ? [{
                id: cve.bugzilla.id,
                description: cve.bugzilla.description
              }] : [],
              resource_url: `https://access.redhat.com/errata/${advisoryId}`,
            })
          } else {
            // Add CVE to existing advisory
            const advisory = advisoryMap.get(advisoryId)!
            if (!advisory.CVEs.includes(cve.CVE)) {
              advisory.CVEs.push(cve.CVE)
            }
          }
        }
      }
    }

    const advisories = Array.from(advisoryMap.values())
    advisories.sort((a, b) => new Date(b.public_date).getTime() - new Date(a.public_date).getTime())

    console.log(`Successfully extracted ${advisories.length} Red Hat Security Advisories from CVE data`)
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

    const beforeDate = new Date()
    const beforeDateStr = beforeDate.toISOString().split('T')[0]

    console.log(`Fetching Red Hat CVEs from ${afterDateStr} to ${beforeDateStr}...`)

    const response = await axios.get<any[]>(`${REDHAT_API_BASE}/cve.json`, {
      params: {
        after: afterDateStr,
        before: beforeDateStr,
      },
      timeout: 30000,
    })

    const cves = Array.isArray(response.data) ? response.data : []

    // Transform API response to RedHatCVE format
    const enrichedCves: RedHatCVE[] = cves.map((item: any) => ({
      CVE: item.CVE,
      severity: item.severity || item.threat_severity || null,
      public_date: item.public_date,
      advisories: Array.isArray(item.advisories) ? item.advisories : [],
      bugzilla: item.bugzilla ? {
        id: item.bugzilla,
        description: item.bugzilla_description,
        url: `https://bugzilla.redhat.com/show_bug.cgi?id=${item.bugzilla}`
      } : null,
      cvss: {
        cvss_base_score: item.cvss_score || item.cvss3?.cvss3_base_score || null,
        cvss_scoring_vector: item.cvss_scoring_vector || item.cvss3?.cvss3_scoring_vector || null,
        status: item.cvss3?.status || 'unknown'
      },
      cvss3: {
        cvss3_base_score: item.cvss3?.cvss3_base_score || null,
        cvss3_scoring_vector: item.cvss3?.cvss3_scoring_vector || null,
        status: item.cvss3?.status || 'unknown'
      },
      cwe: item.CWE || null,
      details: Array.isArray(item.details) ? item.details : (item.details ? [item.details] : []),
      affected_packages: Array.isArray(item.affected_packages) ? item.affected_packages : [],
      resource_url: `https://access.redhat.com/security/cve/${item.CVE}`,
      upstream_fix: item.upstream_fix,
      references: Array.isArray(item.references) ? item.references : []
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
