import { fetchRedHatAdvisories, type RedHatAdvisory } from './redhatFetcher'

export interface RedHatPatch {
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

/**
 * Convert Red Hat advisory to patch format
 */
const convertAdvisoryToPatch = (advisory: RedHatAdvisory): RedHatPatch => {
  return {
    patchId: advisory.id,
    title: advisory.synopsis,
    description: advisory.description,
    severity: advisory.severity || 'Low',
    releaseDate: new Date(advisory.public_date),
    releaseType: advisory.type === 'RHSA' ? 'security' : 'regular',
    cveIds: advisory.CVEs || [],
    product: 'Red Hat Enterprise Linux',
    bulletinUrl: advisory.resource_url || `https://access.redhat.com/errata/${advisory.id}`,
  }
}

/**
 * Fetch recent Red Hat patches
 */
export const fetchRecentRedHatPatches = async (): Promise<RedHatPatch[]> => {
  try {
    console.log('🔍 Fetching recent Red Hat security advisories...')

    // Get advisories from last 90 days
    const advisories = await fetchRedHatAdvisories(90)

    // Filter to only security advisories (RHSA)
    const securityAdvisories = advisories.filter(adv => adv.type === 'RHSA')

    const patches = securityAdvisories.map(convertAdvisoryToPatch)

    console.log(`✅ Fetched ${patches.length} Red Hat patches`)
    return patches
  } catch (error: any) {
    console.error('Error fetching Red Hat patches:', error.message)
    return []
  }
}
