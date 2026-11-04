import type { Request, Response } from 'express'
import {
  searchFileHash as vtSearchFileHash,
  searchUrl as vtSearchUrl,
  isVirusTotalConfigured,
} from '../services/threat-intel/virusTotalApi'
import {
  checkIpAddress,
  isAbuseIPDBConfigured,
  getCategoryName,
} from '../services/threat-intel/abuseIpDbApi'
import {
  checkUrlInUrlhaus,
  queryMalwareByHash,
  checkAbusechStatus,
} from '../services/threat-intel/abusechService'
import { otxClient } from '../services/threat-intel/otxClient'
import {
  getRecentThreatFoxIOCs,
  searchThreatFoxIOC,
  searchThreatFoxHash,
  searchFeodoIP,
  getFeodoC2Blocklist,
  checkThreatIntelStatus,
} from '../services/threat-intel/threatFoxService'

/**
 * Search file hash (MD5, SHA1, SHA256) in VirusTotal
 */
export const searchFileHash = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params

    if (!hash) {
      return res.status(400).json({ error: 'Hash parameter is required' })
    }

    if (!isVirusTotalConfigured()) {
      return res.status(503).json({
        error: 'VirusTotal API is not configured',
        message: 'Please set VIRUSTOTAL_API_KEY in environment variables',
      })
    }

    console.log(`Searching file hash: ${hash}`)
    const result = await vtSearchFileHash(hash)

    if (!result) {
      return res.status(404).json({
        error: 'Hash not found',
        message: 'This file hash was not found in VirusTotal database',
      })
    }

    // Transform response for frontend
    const response = {
      hash: result.data.attributes.sha256,
      md5: result.data.attributes.md5,
      sha1: result.data.attributes.sha1,
      sha256: result.data.attributes.sha256,
      size: result.data.attributes.size,
      type: result.data.attributes.type_description,
      names: result.data.attributes.names || [],
      firstSeen: new Date(result.data.attributes.first_submission_date * 1000).toISOString(),
      lastAnalysis: new Date(result.data.attributes.last_analysis_date * 1000).toISOString(),
      stats: result.data.attributes.last_analysis_stats,
      detectionRate: `${result.data.attributes.last_analysis_stats.malicious}/${
        Object.values(result.data.attributes.last_analysis_stats).reduce((a, b) => a + b, 0)
      }`,
    }

    res.json(response)
  } catch (error) {
    console.error('File hash search error:', error)
    res.status(500).json({
      error: 'File hash search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Search URL/domain in VirusTotal
 */
export const searchUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    if (!isVirusTotalConfigured()) {
      return res.status(503).json({
        error: 'VirusTotal API is not configured',
        message: 'Please set VIRUSTOTAL_API_KEY in environment variables',
      })
    }

    console.log(`Searching URL: ${url}`)
    const result = await vtSearchUrl(url)

    if (!result) {
      return res.status(404).json({
        error: 'URL not found',
        message: 'This URL was not found in VirusTotal database',
      })
    }

    // Transform response for frontend
    const response = {
      url: result.data.attributes.url,
      lastAnalysis: new Date(result.data.attributes.last_analysis_date * 1000).toISOString(),
      stats: result.data.attributes.last_analysis_stats,
      categories: result.data.attributes.categories,
      detectionRate: `${result.data.attributes.last_analysis_stats.malicious}/${
        Object.values(result.data.attributes.last_analysis_stats).reduce((a, b) => a + b, 0)
      }`,
    }

    res.json(response)
  } catch (error) {
    console.error('URL search error:', error)
    res.status(500).json({
      error: 'URL search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Check IP address reputation in AbuseIPDB
 */
export const searchIpAddress = async (req: Request, res: Response) => {
  try {
    const { ip } = req.params

    if (!ip) {
      return res.status(400).json({ error: 'IP address parameter is required' })
    }

    if (!isAbuseIPDBConfigured()) {
      return res.status(503).json({
        error: 'AbuseIPDB API is not configured',
        message: 'Please set ABUSEIPDB_API_KEY in environment variables',
      })
    }

    console.log(`Checking IP address: ${ip}`)
    const result = await checkIpAddress(ip, 90, true)

    if (!result) {
      return res.status(404).json({
        error: 'IP check failed',
        message: 'Failed to check IP address',
      })
    }

    // Transform response for frontend
    const response = {
      ipAddress: result.data.ipAddress,
      isPublic: result.data.isPublic,
      abuseConfidenceScore: result.data.abuseConfidenceScore,
      country: result.data.countryName,
      countryCode: result.data.countryCode,
      usageType: result.data.usageType,
      isp: result.data.isp,
      domain: result.data.domain,
      hostnames: result.data.hostnames,
      isTor: result.data.isTor,
      isWhitelisted: result.data.isWhitelisted,
      totalReports: result.data.totalReports,
      numDistinctUsers: result.data.numDistinctUsers,
      lastReportedAt: result.data.lastReportedAt,
      recentReports: result.data.reports?.slice(0, 10).map((report) => ({
        date: report.reportedAt,
        comment: report.comment,
        categories: report.categories.map((catId) => getCategoryName(catId)),
        country: report.reporterCountryCode,
      })),
    }

    res.json(response)
  } catch (error) {
    console.error('IP address check error:', error)
    res.status(500).json({
      error: 'IP address check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Check URL in URLhaus (abuse.ch)
 */
export const checkUrlhaus = async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    console.log(`Checking URL in URLhaus: ${url}`)
    const result = await checkUrlInUrlhaus(url)

    if (result.query_status === 'no_results') {
      return res.json({
        found: false,
        message: 'URL not found in URLhaus database (likely safe)',
        url,
      })
    }

    if (result.query_status === 'ok') {
      return res.json({
        found: true,
        url: result.url,
        urlStatus: result.url_status,
        host: result.host,
        dateAdded: result.date_added,
        threat: result.threat,
        tags: result.tags || [],
        reporter: result.reporter,
        blacklists: result.blacklists,
        urlhausLink: result.urlhaus_link,
      })
    }

    res.json({
      found: false,
      message: 'URLhaus query status: ' + result.query_status,
    })
  } catch (error) {
    console.error('URLhaus check error:', error)
    res.status(500).json({
      error: 'URLhaus check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Check hash in MalwareBazaar (abuse.ch)
 */
export const checkMalwareBazaar = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params

    if (!hash) {
      return res.status(400).json({ error: 'Hash parameter is required' })
    }

    console.log(`Checking hash in MalwareBazaar: ${hash}`)
    const result = await queryMalwareByHash(hash)

    if (result.query_status === 'no_results') {
      return res.json({
        found: false,
        message: 'Hash not found in MalwareBazaar database',
        hash,
      })
    }

    if (result.query_status === 'ok' && result.data && result.data.length > 0) {
      const sample = result.data[0]
      return res.json({
        found: true,
        sha256: sample.sha256_hash,
        sha1: sample.sha1_hash,
        md5: sample.md5_hash,
        fileName: sample.file_name,
        fileSize: sample.file_size,
        fileType: sample.file_type,
        fileMime: sample.file_type_mime,
        signature: sample.signature,
        tags: sample.tags || [],
        firstSeen: sample.first_seen,
        lastSeen: sample.last_seen,
        reporter: sample.reporter,
        originCountry: sample.origin_country,
        intelligence: sample.intelligence,
      })
    }

    res.json({
      found: false,
      message: 'MalwareBazaar query status: ' + result.query_status,
    })
  } catch (error) {
    console.error('MalwareBazaar check error:', error)
    res.status(500).json({
      error: 'MalwareBazaar check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Check IP in AlienVault OTX
 */
export const checkOtxIp = async (req: Request, res: Response) => {
  try {
    const { ip } = req.params

    if (!ip) {
      return res.status(400).json({ error: 'IP parameter is required' })
    }

    console.log(`Checking IP in AlienVault OTX: ${ip}`)
    const result = await otxClient.getIPReputation(ip)

    res.json({
      indicator: ip,
      reputation: result.reputation || 0,
      country: result.country_name || 'Unknown',
      countryCode: result.country_code,
      city: result.city,
      asn: result.asn,
      organization: result.organization,
      pulseInfo: {
        count: result.pulse_info?.count || 0,
        pulses: result.pulse_info?.pulses?.slice(0, 5) || [],
      },
      malware: {
        count: result.malware?.count || 0,
      },
      urls: {
        count: result.url_list?.count || 0,
      },
    })
  } catch (error) {
    console.error('OTX IP check error:', error)
    res.status(500).json({
      error: 'OTX IP check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Check domain in AlienVault OTX
 */
export const checkOtxDomain = async (req: Request, res: Response) => {
  try {
    const { domain } = req.params

    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' })
    }

    console.log(`Checking domain in AlienVault OTX: ${domain}`)
    const result = await otxClient.getDomainReputation(domain)

    res.json({
      indicator: result.indicator,
      pulseInfo: {
        count: result.pulse_info?.count || 0,
        pulses: result.pulse_info?.pulses?.slice(0, 5) || [],
      },
      alexa: result.alexa,
      whois: result.whois,
    })
  } catch (error) {
    console.error('OTX domain check error:', error)
    res.status(500).json({
      error: 'OTX domain check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Check hash in AlienVault OTX
 */
export const checkOtxHash = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params

    if (!hash) {
      return res.status(400).json({ error: 'Hash parameter is required' })
    }

    console.log(`Checking hash in AlienVault OTX: ${hash}`)
    const result = await otxClient.getHashReputation(hash)

    res.json({
      indicator: result.indicator,
      pulseInfo: {
        count: result.pulse_info?.count || 0,
        pulses: result.pulse_info?.pulses?.slice(0, 5) || [],
      },
      analysis: result.analysis || {},
    })
  } catch (error) {
    console.error('OTX hash check error:', error)
    res.status(500).json({
      error: 'OTX hash check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get recent pulses from AlienVault OTX
 */
export const getOtxRecentPulses = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    console.log(`Fetching recent OTX pulses (limit: ${limit})`)
    const pulses = await otxClient.getRecentPulses(limit)

    res.json({
      count: pulses.length,
      pulses,
    })
  } catch (error) {
    console.error('OTX pulses fetch error:', error)
    res.status(500).json({
      error: 'OTX pulses fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get recent IOCs from ThreatFox
 */
export const getThreatFoxRecentIOCs = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 3

    console.log(`Fetching recent ThreatFox IOCs (${days} days)`)
    const result = await getRecentThreatFoxIOCs(days)

    if (result.query_status === 'no_result') {
      return res.json({
        found: false,
        message: 'No recent IOCs found',
        count: 0,
        iocs: [],
      })
    }

    if (result.query_status === 'ok') {
      return res.json({
        found: true,
        count: result.data?.length || 0,
        iocs: result.data || [],
      })
    }

    res.json({
      found: false,
      message: 'ThreatFox query status: ' + result.query_status,
    })
  } catch (error) {
    console.error('ThreatFox recent IOCs fetch error:', error)
    res.status(500).json({
      error: 'ThreatFox recent IOCs fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Search IOC in ThreatFox
 */
export const searchThreatFox = async (req: Request, res: Response) => {
  try {
    const { ioc } = req.body

    if (!ioc) {
      return res.status(400).json({ error: 'IOC parameter is required' })
    }

    console.log(`Searching IOC in ThreatFox: ${ioc}`)
    const result = await searchThreatFoxIOC(ioc)

    if (result.query_status === 'no_result') {
      return res.json({
        found: false,
        message: 'IOC not found in ThreatFox database',
        ioc,
      })
    }

    if (result.query_status === 'ok' && result.data && result.data.length > 0) {
      return res.json({
        found: true,
        count: result.data.length,
        iocs: result.data,
      })
    }

    res.json({
      found: false,
      message: 'ThreatFox query status: ' + result.query_status,
    })
  } catch (error) {
    console.error('ThreatFox search error:', error)
    res.status(500).json({
      error: 'ThreatFox search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Search hash in ThreatFox
 */
export const searchThreatFoxHashController = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params

    if (!hash) {
      return res.status(400).json({ error: 'Hash parameter is required' })
    }

    console.log(`Searching hash in ThreatFox: ${hash}`)
    const result = await searchThreatFoxHash(hash)

    if (result.query_status === 'no_result') {
      return res.json({
        found: false,
        message: 'Hash not found in ThreatFox database',
        hash,
      })
    }

    if (result.query_status === 'ok' && result.data && result.data.length > 0) {
      return res.json({
        found: true,
        count: result.data.length,
        iocs: result.data,
      })
    }

    res.json({
      found: false,
      message: 'ThreatFox query status: ' + result.query_status,
    })
  } catch (error) {
    console.error('ThreatFox hash search error:', error)
    res.status(500).json({
      error: 'ThreatFox hash search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Search IP in Feodo Tracker
 */
export const searchFeodoIPController = async (req: Request, res: Response) => {
  try {
    const { ip } = req.params

    if (!ip) {
      return res.status(400).json({ error: 'IP parameter is required' })
    }

    console.log(`Searching IP in Feodo Tracker: ${ip}`)
    const result = await searchFeodoIP(ip)

    if (!result) {
      return res.json({
        found: false,
        message: 'IP not found in Feodo Tracker C2 blocklist (likely safe)',
        ip,
      })
    }

    res.json({
      found: true,
      ip: result.ip_address,
      port: result.port,
      status: result.status,
      hostname: result.hostname,
      asn: result.as_number,
      asName: result.as_name,
      country: result.country,
      firstSeen: result.first_seen,
      lastSeen: result.last_seen,
      malware: result.malware,
    })
  } catch (error) {
    console.error('Feodo Tracker search error:', error)
    res.status(500).json({
      error: 'Feodo Tracker search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get Feodo Tracker C2 blocklist
 */
export const getFeodoBlocklist = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100

    console.log(`Fetching Feodo Tracker C2 blocklist (limit: ${limit})`)
    const blocklist = await getFeodoC2Blocklist()

    res.json({
      count: blocklist.length,
      limited: limit < blocklist.length,
      c2s: blocklist.slice(0, limit),
    })
  } catch (error) {
    console.error('Feodo Tracker blocklist fetch error:', error)
    res.status(500).json({
      error: 'Feodo Tracker blocklist fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get API configuration status
 */
export const getApiStatus = async (req: Request, res: Response) => {
  // Check abuse.ch services availability
  const abusechStatus = await checkAbusechStatus()
  const threatIntelStatus = await checkThreatIntelStatus()

  res.json({
    virusTotal: {
      configured: isVirusTotalConfigured(),
      available: isVirusTotalConfigured(),
    },
    abuseIPDB: {
      configured: isAbuseIPDBConfigured(),
      available: isAbuseIPDBConfigured(),
    },
    otx: {
      configured: otxClient.isConfigured(),
      available: true, // OTX public endpoints always available
    },
    urlhaus: {
      configured: true, // No API key required
      available: abusechStatus.urlhaus,
    },
    malwareBazaar: {
      configured: true, // No API key required
      available: abusechStatus.malwareBazaar,
    },
    threatFox: {
      configured: true, // No API key required
      available: threatIntelStatus.threatFox,
    },
    feodoTracker: {
      configured: true, // No API key required
      available: threatIntelStatus.feodoTracker,
    },
  })
}
