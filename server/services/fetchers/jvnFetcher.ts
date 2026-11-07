import Parser from 'rss-parser'
import axios from 'axios'

const parser = new Parser({
  customFields: {
    item: [
      ['sec:identifier', 'identifier'],
      ['sec:references', 'references'],
      ['dc:date', 'dcDate'],
    ],
  },
})

export interface JvnVulnerabilityItem {
  identifier: string // JVN ID (e.g., JVNDB-2024-000001)
  title: string
  description: string
  link: string
  pubDate: string
  severity?: string
  cvssScore?: number
  references?: string
}

const JVN_FEEDS = {
  jvn: 'https://jvn.jp/rss/jvn.rdf',
  jpcert: 'https://www.jpcert.or.jp/at/feed.rss',
}

const JVN_API = 'https://jvndb.jvn.jp/myjvn'

const extractCvssScore = (description: string): number | undefined => {
  const cvssMatch = description.match(/CVSS[vV]?[23]?\s*(?:基本値|Base Score)?[:：]?\s*(\d+\.?\d*)/i)
  if (cvssMatch) {
    return parseFloat(cvssMatch[1])
  }
  return undefined
}

const extractSeverity = (description: string, cvssScore?: number): string => {
  // Try to extract severity from description
  const severityMatch = description.match(/深刻度[:：]?\s*([^\s、。]+)|Severity[:：]?\s*([^\s,\.]+)/i)
  if (severityMatch) {
    return severityMatch[1] || severityMatch[2]
  }

  // Fallback to CVSS score
  if (cvssScore !== undefined) {
    if (cvssScore >= 9.0) return '緊急 (Critical)'
    if (cvssScore >= 7.0) return '重要 (High)'
    if (cvssScore >= 4.0) return '警告 (Medium)'
    return '注意 (Low)'
  }

  return '不明'
}

/**
 * Fetch JVN vulnerability by CVE ID
 * @param cveId CVE ID (e.g., CVE-2024-0001)
 */
export const fetchJvnByCveId = async (cveId: string): Promise<JvnVulnerabilityItem | null> => {
  try {
    console.log(`Searching JVN for ${cveId}...`)

    // Try JVN iPedia API search
    const response = await axios.get(JVN_API, {
      params: {
        method: 'getVulnOverviewList',
        feed: 'hnd',
        keyword: cveId,
        rangeDatePublished: 'n',
        rangeDateFirstPublished: 'n',
      },
      timeout: 10000,
    })

    // Parse XML response
    if (response.data && typeof response.data === 'string') {
      // Extract vulnerability info from XML
      const vulnMatch = response.data.match(/<item>(.*?)<\/item>/s)
      if (vulnMatch) {
        const itemXml = vulnMatch[1]

        // Extract fields
        const titleMatch = itemXml.match(/<title>(.*?)<\/title>/)
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/)
        const descMatch = itemXml.match(/<description>(.*?)<\/description>/)
        const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)
        const identifierMatch = itemXml.match(/<sec:identifier>(.*?)<\/sec:identifier>/)

        const title = titleMatch ? titleMatch[1] : ''
        const description = descMatch ? descMatch[1] : ''
        const cvssScore = extractCvssScore(description)

        return {
          identifier: identifierMatch ? identifierMatch[1] : cveId,
          title: title || `JVN vulnerability for ${cveId}`,
          description: description,
          link: linkMatch ? linkMatch[1] : `https://jvn.jp/`,
          pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
          severity: extractSeverity(description, cvssScore),
          cvssScore,
        }
      }
    }

    console.log(`No JVN data found for ${cveId}`)
    return null
  } catch (error: any) {
    console.error(`Error fetching JVN data for ${cveId}:`, error.message)
    return null
  }
}

export const fetchJvnVulnerabilities = async (): Promise<JvnVulnerabilityItem[]> => {
  const results: JvnVulnerabilityItem[] = []

  try {
    console.log('Fetching JVN vulnerability feed...')
    const jvnFeed = await parser.parseURL(JVN_FEEDS.jvn)

    for (const item of jvnFeed.items) {
      const description = item.description || item.contentSnippet || ''
      const cvssScore = extractCvssScore(description)
      const severity = extractSeverity(description, cvssScore)

      // Extract JVN identifier from various possible locations
      let identifier = (item as any).identifier || ''
      if (!identifier && item.title) {
        const idMatch = item.title.match(/JVN[A-Z]*#?(\d{8})/i)
        if (idMatch) {
          identifier = `JVN#${idMatch[1]}`
        }
      }
      if (!identifier && item.link) {
        const idMatch = item.link.match(/JVN[A-Z]*#?(\d{8})/i)
        if (idMatch) {
          identifier = `JVN#${idMatch[1]}`
        }
      }

      results.push({
        identifier: identifier || item.guid || item.link || '',
        title: item.title || 'No title',
        description: description,
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        severity,
        cvssScore,
        references: (item as any).references,
      })
    }

    console.log(`Successfully fetched ${results.length} vulnerabilities from JVN feed`)
  } catch (error) {
    console.error('Error fetching JVN feed:', error)
  }

  try {
    console.log('Fetching JPCERT/CC alert feed...')
    const jpcertFeed = await parser.parseURL(JVN_FEEDS.jpcert)

    for (const item of jpcertFeed.items) {
      const description = item.description || item.contentSnippet || ''

      // Extract identifier from link or guid
      let identifier = item.guid || ''
      if (!identifier && item.link) {
        const idMatch = item.link.match(/at-(\d{4}-\d{4})/i)
        if (idMatch) {
          identifier = `JPCERT-${idMatch[1]}`
        }
      }

      results.push({
        identifier: identifier || item.link || '',
        title: item.title || 'No title',
        description: description,
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        severity: '注意喚起', // JPCERT alerts
        references: (item as any).references,
      })
    }

    console.log(`Successfully fetched ${jpcertFeed.items.length} alerts from JPCERT/CC feed`)
  } catch (error) {
    console.error('Error fetching JPCERT/CC feed:', error)
  }

  return results
}
