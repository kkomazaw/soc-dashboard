import { Request, Response } from 'express'
import { prisma } from '../services/database/prismaClient'
import { fetchRedHatCVE } from '../services/fetchers/redhatFetcher'

export interface TimelineEvent {
  date: string
  type: 'published' | 'added_to_kev' | 'advisory' | 'updated' | 'patch_available'
  source: 'nvd' | 'cisa' | 'jvn' | 'redhat'
  title: string
  description?: string
  severity?: string
  cvssScore?: number
  url?: string
  advisoryId?: string
}

/**
 * Get timeline data for a specific CVE
 */
export const getCveTimeline = async (req: Request, res: Response) => {
  try {
    const { cveId } = req.params
    const normalizedCveId = cveId.toUpperCase()

    console.log(`Fetching timeline data for ${normalizedCveId}...`)

    const timeline: TimelineEvent[] = []

    // 1. Check NVD data
    const nvdData = await prisma.nvdCve.findFirst({
      where: { cveId: normalizedCveId },
    })

    if (nvdData) {
      // Published date
      timeline.push({
        date: nvdData.published.toISOString(),
        type: 'published',
        source: 'nvd',
        title: 'CVE Published',
        description: nvdData.description || undefined,
        severity: nvdData.cvssSeverity || undefined,
        cvssScore: nvdData.cvssScore || undefined,
        url: `https://nvd.nist.gov/vuln/detail/${normalizedCveId}`,
      })

      // Last modified date (if different from published)
      if (nvdData.lastModified && nvdData.lastModified.getTime() !== nvdData.published.getTime()) {
        timeline.push({
          date: nvdData.lastModified.toISOString(),
          type: 'updated',
          source: 'nvd',
          title: 'NVD Entry Updated',
          description: 'CVE information updated in NVD database',
          severity: nvdData.cvssSeverity || undefined,
          cvssScore: nvdData.cvssScore || undefined,
          url: `https://nvd.nist.gov/vuln/detail/${normalizedCveId}`,
        })
      }
    }

    // 2. Check CISA KEV data
    const cisaData = await prisma.cisaKev.findFirst({
      where: { cveId: normalizedCveId },
    })

    if (cisaData) {
      timeline.push({
        date: typeof cisaData.dateAdded === 'string' ? cisaData.dateAdded : cisaData.dateAdded.toISOString(),
        type: 'added_to_kev',
        source: 'cisa',
        title: 'Added to CISA KEV',
        description: cisaData.shortDescription || cisaData.vulnerabilityName || undefined,
        severity: 'CRITICAL',
        url: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog`,
      })

      // Due date if available
      if (cisaData.dueDate) {
        timeline.push({
          date: typeof cisaData.dueDate === 'string' ? cisaData.dueDate : cisaData.dueDate.toISOString(),
          type: 'patch_available',
          source: 'cisa',
          title: 'CISA Remediation Due Date',
          description: `Required remediation action: ${cisaData.requiredAction || 'Apply updates per vendor instructions'}`,
          severity: 'CRITICAL',
          url: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog`,
        })
      }
    }

    // 3. Check JVN data
    const jvnData = await prisma.jvnVulnerability.findMany({
      where: {
        OR: [
          { jvnId: { contains: normalizedCveId } },
          { cveId: normalizedCveId },
        ],
      },
    })

    for (const jvn of jvnData) {
      if (jvn.publishedDate) {
        timeline.push({
          date: jvn.publishedDate.toISOString(),
          type: 'advisory',
          source: 'jvn',
          title: `JVN Advisory: ${jvn.jvnId}`,
          description: jvn.title || undefined,
          severity: jvn.severity || undefined,
          cvssScore: jvn.cvssScore || undefined,
          url: `https://jvn.jp/en/jp/${jvn.jvnId}/`,
          advisoryId: jvn.jvnId,
        })
      }

      if (jvn.lastModifiedDate && jvn.publishedDate && jvn.lastModifiedDate.getTime() !== jvn.publishedDate.getTime()) {
        timeline.push({
          date: jvn.lastModifiedDate.toISOString(),
          type: 'updated',
          source: 'jvn',
          title: `JVN Advisory Updated: ${jvn.jvnId}`,
          description: 'Advisory information updated',
          severity: jvn.severity || undefined,
          url: `https://jvn.jp/en/jp/${jvn.jvnId}/`,
        })
      }
    }

    // 4. Check Red Hat CVE data
    let redhatCve = await prisma.redHatCve.findFirst({
      where: { cveId: normalizedCveId },
    })

    // If not in database, try fetching from Red Hat API directly
    if (!redhatCve) {
      try {
        const apiData = await fetchRedHatCVE(normalizedCveId)
        if (apiData) {
          // Use the API data directly without saving to database
          const publicDate = apiData.public_date ? new Date(apiData.public_date) : new Date()
          timeline.push({
            date: publicDate.toISOString(),
            type: 'advisory',
            source: 'redhat',
            title: 'Red Hat CVE Published',
            description: apiData.bugzilla?.description || undefined,
            severity: apiData.severity?.toUpperCase() || apiData.threat_severity?.toUpperCase() || undefined,
            cvssScore: parseFloat(apiData.cvss3?.cvss3_base_score || apiData.cvss?.cvss_base_score || '0') || undefined,
            url: apiData.resource_url || `https://access.redhat.com/security/cve/${normalizedCveId}`,
          })

          // Add affected release advisories
          if (apiData.affected_release && Array.isArray(apiData.affected_release)) {
            for (const release of apiData.affected_release) {
              if (release.advisory && release.release_date) {
                timeline.push({
                  date: new Date(release.release_date).toISOString(),
                  type: 'advisory',
                  source: 'redhat',
                  title: `Red Hat Advisory: ${release.advisory}`,
                  description: `${release.product_name} - ${release.package || ''}`,
                  severity: release.impact?.toUpperCase() || apiData.threat_severity?.toUpperCase() || undefined,
                  url: `https://access.redhat.com/errata/${release.advisory}`,
                  advisoryId: release.advisory,
                })
              }
            }
          }

          // Mark that we found it in Red Hat (for the summary)
          redhatCve = {
            publicDate,
            severity: apiData.severity,
            cvss3Score: apiData.cvss3?.cvss3_base_score || null,
            cvssScore: apiData.cvss?.cvss_base_score || null,
            bugzillaDesc: apiData.bugzilla?.description || null,
            resourceUrl: apiData.resource_url || null,
          } as any
        }
      } catch (error) {
        // Silently continue if Red Hat API fetch fails
        console.log(`Could not fetch ${normalizedCveId} from Red Hat API`)
      }
    } else {
      timeline.push({
        date: redhatCve.publicDate.toISOString(),
        type: 'advisory',
        source: 'redhat',
        title: 'Red Hat CVE Published',
        description: redhatCve.bugzillaDesc || undefined,
        severity: redhatCve.severity?.toUpperCase() || undefined,
        cvssScore: parseFloat(redhatCve.cvss3Score || redhatCve.cvssScore || '0') || undefined,
        url: redhatCve.resourceUrl || `https://access.redhat.com/security/cve/${normalizedCveId}`,
      })

      if (redhatCve.updatedAt && redhatCve.updatedAt.getTime() !== redhatCve.publicDate.getTime()) {
        timeline.push({
          date: redhatCve.updatedAt.toISOString(),
          type: 'updated',
          source: 'redhat',
          title: 'Red Hat CVE Updated',
          description: 'Red Hat CVE information updated',
          severity: redhatCve.severity?.toUpperCase() || undefined,
          url: redhatCve.resourceUrl || `https://access.redhat.com/security/cve/${normalizedCveId}`,
        })
      }
    }

    // 5. Check Red Hat Advisories that reference this CVE
    const redhatAdvisories = await prisma.redHatAdvisory.findMany({
      where: {
        cves: {
          contains: normalizedCveId,
        },
      },
    })

    for (const advisory of redhatAdvisories) {
      timeline.push({
        date: advisory.publicDate.toISOString(),
        type: 'advisory',
        source: 'redhat',
        title: `Red Hat Advisory: ${advisory.advisoryId}`,
        description: advisory.synopsis || undefined,
        severity: advisory.severity?.toUpperCase() || undefined,
        url: advisory.resourceUrl || `https://access.redhat.com/errata/${advisory.advisoryId}`,
        advisoryId: advisory.advisoryId,
      })
    }

    // Sort timeline by date (newest first)
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Get basic CVE info for summary
    const cveInfo = {
      cveId: normalizedCveId,
      foundInSources: {
        nvd: !!nvdData,
        cisa: !!cisaData,
        jvn: jvnData.length > 0,
        redhat: !!redhatCve || redhatAdvisories.length > 0,
      },
      summary: nvdData?.description || cisaData?.shortDescription || jvnData[0]?.title || 'No description available',
      severity: nvdData?.cvssSeverity || cisaData?.vulnerabilityName || jvnData[0]?.severity || redhatCve?.severity || 'UNKNOWN',
      cvssScore: nvdData?.cvssScore || jvnData[0]?.cvssScore || parseFloat(redhatCve?.cvss3Score || redhatCve?.cvssScore || '0') || null,
    }

    res.json({
      cveInfo,
      timeline,
      totalEvents: timeline.length,
    })
  } catch (error: any) {
    console.error('Error fetching CVE timeline:', error.message)
    res.status(500).json({
      error: 'Failed to fetch CVE timeline',
      message: error.message,
    })
  }
}

/**
 * Search for CVEs across all sources
 */
export const searchCves = async (req: Request, res: Response) => {
  try {
    const { query } = req.query

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    const searchTerm = query.toUpperCase()
    const limit = 20

    // Search across all sources
    const [nvdResults, cisaResults, jvnResults, redhatResults] = await Promise.all([
      prisma.nvdCve.findMany({
        where: {
          OR: [
            { cveId: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: limit,
        orderBy: { published: 'desc' },
      }),
      prisma.cisaKev.findMany({
        where: {
          OR: [
            { cveId: { contains: searchTerm } },
            { vulnerabilityName: { contains: searchTerm } },
            { vendorProject: { contains: searchTerm } },
            { product: { contains: searchTerm } },
          ],
        },
        take: limit,
        orderBy: { dateAdded: 'desc' },
      }),
      prisma.jvnVulnerability.findMany({
        where: {
          OR: [
            { jvnId: { contains: searchTerm } },
            { cveId: { contains: searchTerm } },
            { title: { contains: searchTerm } },
          ],
        },
        take: limit,
        orderBy: { publishedDate: 'desc' },
      }),
      prisma.redHatCve.findMany({
        where: {
          OR: [
            { cveId: { contains: searchTerm } },
            { bugzillaDesc: { contains: searchTerm } },
          ],
        },
        take: limit,
        orderBy: { publicDate: 'desc' },
      }),
    ])

    // Combine and deduplicate by CVE ID
    const cveMap = new Map<string, any>()

    nvdResults.forEach((item) => {
      if (!cveMap.has(item.cveId)) {
        cveMap.set(item.cveId, {
          cveId: item.cveId,
          description: item.description,
          publishedDate: item.published,
          severity: item.cvssSeverity,
          cvssScore: item.cvssScore,
          sources: ['nvd'],
        })
      }
    })

    cisaResults.forEach((item) => {
      const cveId = item.cveId || ''
      if (cveId && !cveMap.has(cveId)) {
        cveMap.set(cveId, {
          cveId: cveId,
          description: item.shortDescription || item.vulnerabilityName,
          publishedDate: item.dateAdded,
          severity: 'CRITICAL',
          sources: ['cisa'],
        })
      } else if (cveId && cveMap.has(cveId)) {
        cveMap.get(cveId).sources.push('cisa')
      }
    })

    jvnResults.forEach((item) => {
      const cveId = item.cveId || item.jvnId
      if (cveId && !cveMap.has(cveId)) {
        cveMap.set(cveId, {
          cveId: cveId,
          description: item.title,
          publishedDate: item.publishedDate,
          severity: item.severity,
          cvssScore: item.cvssScore,
          sources: ['jvn'],
        })
      } else if (cveId && cveMap.has(cveId)) {
        cveMap.get(cveId).sources.push('jvn')
      }
    })

    redhatResults.forEach((item) => {
      if (!cveMap.has(item.cveId)) {
        cveMap.set(item.cveId, {
          cveId: item.cveId,
          description: item.bugzillaDesc,
          publishedDate: item.publicDate,
          severity: item.severity?.toUpperCase(),
          cvssScore: parseFloat(item.cvss3Score || item.cvssScore || '0') || null,
          sources: ['redhat'],
        })
      } else {
        cveMap.get(item.cveId).sources.push('redhat')
      }
    })

    const results = Array.from(cveMap.values())
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .slice(0, limit)

    res.json({
      query: searchTerm,
      results,
      total: results.length,
    })
  } catch (error: any) {
    console.error('Error searching CVEs:', error.message)
    res.status(500).json({
      error: 'Failed to search CVEs',
      message: error.message,
    })
  }
}
