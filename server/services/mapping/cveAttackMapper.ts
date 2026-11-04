import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TechniqueKeywords {
  techniqueId: string
  keywords: string[]
  tactics: string[]
  weight: number // Higher weight = stronger correlation
}

// Comprehensive keyword-to-technique mapping based on MITRE ATT&CK
const TECHNIQUE_KEYWORDS: TechniqueKeywords[] = [
  // Initial Access
  { techniqueId: 'T1566', keywords: ['phishing', 'spearphishing', 'malicious email', 'email attachment'], tactics: ['initial-access'], weight: 3 },
  { techniqueId: 'T1190', keywords: ['exploit public-facing application', 'web application', 'web server', 'exposed service'], tactics: ['initial-access'], weight: 3 },
  { techniqueId: 'T1133', keywords: ['external remote services', 'vpn', 'remote desktop', 'rdp'], tactics: ['initial-access'], weight: 2 },
  { techniqueId: 'T1078', keywords: ['valid accounts', 'credential', 'authentication', 'login'], tactics: ['initial-access', 'persistence'], weight: 2 },
  { techniqueId: 'T1195', keywords: ['supply chain compromise', 'third-party', 'software supply'], tactics: ['initial-access'], weight: 3 },

  // Execution
  { techniqueId: 'T1059', keywords: ['command and scripting interpreter', 'powershell', 'cmd', 'bash', 'script execution'], tactics: ['execution'], weight: 3 },
  { techniqueId: 'T1203', keywords: ['exploitation for client execution', 'browser', 'office', 'document exploit'], tactics: ['execution'], weight: 3 },
  { techniqueId: 'T1204', keywords: ['user execution', 'malicious file', 'user-initiated'], tactics: ['execution'], weight: 2 },

  // Persistence
  { techniqueId: 'T1547', keywords: ['boot or logon autostart', 'startup', 'registry run key', 'autostart'], tactics: ['persistence'], weight: 2 },
  { techniqueId: 'T1053', keywords: ['scheduled task', 'cron', 'at command', 'task scheduler'], tactics: ['persistence'], weight: 2 },
  { techniqueId: 'T1543', keywords: ['create or modify system process', 'service creation', 'windows service'], tactics: ['persistence'], weight: 2 },
  { techniqueId: 'T1098', keywords: ['account manipulation', 'add user', 'modify account'], tactics: ['persistence'], weight: 2 },

  // Privilege Escalation
  { techniqueId: 'T1068', keywords: ['exploitation for privilege escalation', 'privilege escalation', 'local privilege', 'elevate privileges'], tactics: ['privilege-escalation'], weight: 3 },
  { techniqueId: 'T1055', keywords: ['process injection', 'dll injection', 'code injection'], tactics: ['privilege-escalation'], weight: 3 },
  { techniqueId: 'T1134', keywords: ['access token manipulation', 'token impersonation'], tactics: ['privilege-escalation'], weight: 2 },

  // Defense Evasion
  { techniqueId: 'T1070', keywords: ['indicator removal', 'clear logs', 'delete artifacts', 'timestomp'], tactics: ['defense-evasion'], weight: 2 },
  { techniqueId: 'T1027', keywords: ['obfuscated files or information', 'encryption', 'encoding', 'obfuscation'], tactics: ['defense-evasion'], weight: 2 },
  { techniqueId: 'T1562', keywords: ['impair defenses', 'disable security tools', 'bypass security'], tactics: ['defense-evasion'], weight: 3 },
  { techniqueId: 'T1036', keywords: ['masquerading', 'rename', 'disguise'], tactics: ['defense-evasion'], weight: 2 },

  // Credential Access
  { techniqueId: 'T1110', keywords: ['brute force', 'password guessing', 'credential stuffing'], tactics: ['credential-access'], weight: 3 },
  { techniqueId: 'T1003', keywords: ['credential dumping', 'lsass', 'sam database', 'memory credentials'], tactics: ['credential-access'], weight: 3 },
  { techniqueId: 'T1056', keywords: ['input capture', 'keylogging', 'credential input'], tactics: ['credential-access'], weight: 3 },
  { techniqueId: 'T1552', keywords: ['unsecured credentials', 'credentials in files', 'plaintext credentials'], tactics: ['credential-access'], weight: 2 },

  // Discovery
  { techniqueId: 'T1087', keywords: ['account discovery', 'enumerate users', 'list accounts'], tactics: ['discovery'], weight: 1 },
  { techniqueId: 'T1083', keywords: ['file and directory discovery', 'enumerate files'], tactics: ['discovery'], weight: 1 },
  { techniqueId: 'T1082', keywords: ['system information discovery', 'system enumeration'], tactics: ['discovery'], weight: 1 },

  // Lateral Movement
  { techniqueId: 'T1021', keywords: ['remote services', 'lateral movement', 'remote execution'], tactics: ['lateral-movement'], weight: 2 },
  { techniqueId: 'T1550', keywords: ['use alternate authentication material', 'pass the hash', 'pass the ticket'], tactics: ['lateral-movement'], weight: 3 },

  // Collection
  { techniqueId: 'T1005', keywords: ['data from local system', 'local data', 'file collection'], tactics: ['collection'], weight: 1 },
  { techniqueId: 'T1113', keywords: ['screen capture', 'screenshot'], tactics: ['collection'], weight: 2 },

  // Command and Control
  { techniqueId: 'T1071', keywords: ['application layer protocol', 'http', 'https', 'dns', 'c2 communication'], tactics: ['command-and-control'], weight: 2 },
  { techniqueId: 'T1573', keywords: ['encrypted channel', 'encrypted c2'], tactics: ['command-and-control'], weight: 2 },
  { techniqueId: 'T1095', keywords: ['non-application layer protocol', 'raw socket'], tactics: ['command-and-control'], weight: 2 },

  // Exfiltration
  { techniqueId: 'T1041', keywords: ['exfiltration over c2 channel', 'data exfiltration'], tactics: ['exfiltration'], weight: 2 },
  { techniqueId: 'T1567', keywords: ['exfiltration over web service', 'cloud storage'], tactics: ['exfiltration'], weight: 2 },

  // Impact
  { techniqueId: 'T1486', keywords: ['data encrypted for impact', 'ransomware', 'encryption'], tactics: ['impact'], weight: 3 },
  { techniqueId: 'T1489', keywords: ['service stop', 'stop services'], tactics: ['impact'], weight: 2 },
  { techniqueId: 'T1490', keywords: ['inhibit system recovery', 'delete backups', 'shadow copies'], tactics: ['impact'], weight: 3 },
  { techniqueId: 'T1491', keywords: ['defacement', 'web defacement'], tactics: ['impact'], weight: 3 },
  { techniqueId: 'T1499', keywords: ['endpoint denial of service', 'dos', 'resource exhaustion'], tactics: ['impact'], weight: 3 },
  { techniqueId: 'T1485', keywords: ['data destruction', 'wiper', 'delete data'], tactics: ['impact'], weight: 3 },
]

interface MappingResult {
  techniqueId: string
  confidence: 'high' | 'medium' | 'low'
  matchType: 'keyword' | 'tactic'
  matchDetails: {
    matchedKeywords?: string[]
    matchedTactics?: string[]
  }
}

/**
 * Analyze CVE description and map to ATT&CK techniques
 */
export const analyzeCveForTechniques = async (
  description: string,
  vulnerabilityName?: string
): Promise<MappingResult[]> => {
  const mappings: MappingResult[] = []
  const lowerDesc = (description + ' ' + (vulnerabilityName || '')).toLowerCase()

  for (const techKeywords of TECHNIQUE_KEYWORDS) {
    const matchedKeywords: string[] = []
    let score = 0

    // Check each keyword
    for (const keyword of techKeywords.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword)
        score += techKeywords.weight
      }
    }

    // If we have matches, create a mapping
    if (matchedKeywords.length > 0) {
      let confidence: 'high' | 'medium' | 'low' = 'low'

      // Determine confidence based on score and number of matches
      if (score >= 6 || matchedKeywords.length >= 3) {
        confidence = 'high'
      } else if (score >= 3 || matchedKeywords.length >= 2) {
        confidence = 'medium'
      }

      mappings.push({
        techniqueId: techKeywords.techniqueId,
        confidence,
        matchType: 'keyword',
        matchDetails: {
          matchedKeywords,
          matchedTactics: techKeywords.tactics,
        },
      })
    }
  }

  // Sort by confidence (high > medium > low)
  const confidenceOrder = { high: 3, medium: 2, low: 1 }
  mappings.sort((a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence])

  return mappings
}

/**
 * Map a single CVE to ATT&CK techniques
 */
export const mapCveToAttackTechniques = async (
  cveId: string,
  description: string,
  source: 'cisa' | 'jvn' | 'nvd',
  vulnerabilityName?: string
): Promise<void> => {
  try {
    const mappings = await analyzeCveForTechniques(description, vulnerabilityName)

    // Store each mapping in the database
    for (const mapping of mappings) {
      try {
        await prisma.cveAttackMapping.upsert({
          where: {
            cveId_techniqueId_source: {
              cveId,
              techniqueId: mapping.techniqueId,
              source,
            },
          },
          update: {
            confidence: mapping.confidence,
            matchType: mapping.matchType,
            matchDetails: JSON.stringify(mapping.matchDetails),
            updatedAt: new Date(),
          },
          create: {
            cveId,
            techniqueId: mapping.techniqueId,
            source,
            confidence: mapping.confidence,
            matchType: mapping.matchType,
            matchDetails: JSON.stringify(mapping.matchDetails),
          },
        })
      } catch (error) {
        console.error(`Failed to store mapping for ${cveId} -> ${mapping.techniqueId}:`, error)
      }
    }

    console.log(`✓ Mapped ${cveId} to ${mappings.length} ATT&CK techniques`)
  } catch (error) {
    console.error(`Failed to map CVE ${cveId}:`, error)
  }
}

/**
 * Batch process all CISA KEV vulnerabilities
 */
export const mapAllCisaKevToAttack = async (): Promise<void> => {
  console.log('🔍 Mapping CISA KEV vulnerabilities to ATT&CK techniques...')

  const cisaVulns = await prisma.cisaKev.findMany()

  for (const vuln of cisaVulns) {
    const description = vuln.shortDescription || vuln.vulnerabilityName || ''
    await mapCveToAttackTechniques(
      vuln.cveId,
      description,
      'cisa',
      vuln.vulnerabilityName || undefined
    )
  }

  console.log(`✓ Completed mapping ${cisaVulns.length} CISA KEV vulnerabilities`)
}

/**
 * Batch process all JVN vulnerabilities
 */
export const mapAllJvnToAttack = async (): Promise<void> => {
  console.log('🔍 Mapping JVN vulnerabilities to ATT&CK techniques...')

  const jvnVulns = await prisma.jvnVulnerability.findMany({
    where: {
      cveId: { not: null },
    },
  })

  for (const vuln of jvnVulns) {
    if (!vuln.cveId) continue

    const description = vuln.summary || vuln.title || ''
    await mapCveToAttackTechniques(vuln.cveId, description, 'jvn', vuln.title)
  }

  console.log(`✓ Completed mapping ${jvnVulns.length} JVN vulnerabilities`)
}

/**
 * Batch process all NVD CVEs
 */
export const mapAllNvdToAttack = async (): Promise<void> => {
  console.log('🔍 Mapping NVD CVEs to ATT&CK techniques...')

  const nvdCves = await prisma.nvdCve.findMany()

  for (const cve of nvdCves) {
    const description = cve.description || ''
    await mapCveToAttackTechniques(cve.cveId, description, 'nvd')
  }

  console.log(`✓ Completed mapping ${nvdCves.length} NVD CVEs`)
}

/**
 * Map all vulnerabilities from all sources
 */
export const mapAllVulnerabilitiesToAttack = async (): Promise<void> => {
  console.log('🚀 Starting comprehensive CVE-to-ATT&CK mapping...')

  await mapAllCisaKevToAttack()
  await mapAllJvnToAttack()
  await mapAllNvdToAttack()

  console.log('✅ All vulnerabilities mapped to ATT&CK techniques')
}

/**
 * Get mappings for a specific CVE
 */
export const getMappingsForCve = async (cveId: string) => {
  const mappings = await prisma.cveAttackMapping.findMany({
    where: { cveId },
    orderBy: [
      { confidence: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Enrich with technique details
  const enrichedMappings = await Promise.all(
    mappings.map(async (mapping) => {
      const technique = await prisma.attackTechnique.findUnique({
        where: { techniqueId: mapping.techniqueId },
      })

      return {
        ...mapping,
        technique: technique
          ? {
              id: technique.techniqueId,
              name: technique.name,
              description: technique.description,
              tactics: technique.tactics ? JSON.parse(technique.tactics) : [],
              url: technique.url,
            }
          : null,
        matchDetails: mapping.matchDetails ? JSON.parse(mapping.matchDetails) : null,
      }
    })
  )

  return enrichedMappings
}

/**
 * Get CVEs mapped to a specific ATT&CK technique
 */
export const getCvesForTechnique = async (techniqueId: string) => {
  const mappings = await prisma.cveAttackMapping.findMany({
    where: { techniqueId },
    orderBy: [
      { confidence: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return mappings.map((mapping) => ({
    cveId: mapping.cveId,
    source: mapping.source,
    confidence: mapping.confidence,
    matchType: mapping.matchType,
    matchDetails: mapping.matchDetails ? JSON.parse(mapping.matchDetails) : null,
  }))
}

/**
 * Get mapping statistics
 */
/**
 * Get all CVE-to-ATT&CK mappings with technique details
 */
export const getAllMappings = async () => {
  const mappings = await prisma.cveAttackMapping.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get all unique technique IDs
  const techniqueIds = [...new Set(mappings.map((m) => m.techniqueId))]

  // Fetch all techniques
  const techniques = await prisma.attackTechnique.findMany({
    where: {
      techniqueId: {
        in: techniqueIds,
      },
    },
  })

  // Create a map for quick lookup
  const techniqueMap = new Map(techniques.map((t) => [t.techniqueId, t]))

  // Combine mappings with technique details
  return mappings.map((mapping) => ({
    ...mapping,
    technique: techniqueMap.get(mapping.techniqueId) || null,
  }))
}

export const getMappingStats = async () => {
  const total = await prisma.cveAttackMapping.count()
  const bySource = await prisma.cveAttackMapping.groupBy({
    by: ['source'],
    _count: true,
  })
  const byConfidence = await prisma.cveAttackMapping.groupBy({
    by: ['confidence'],
    _count: true,
  })

  const uniqueCves = await prisma.cveAttackMapping.findMany({
    distinct: ['cveId'],
    select: { cveId: true },
  })

  const uniqueTechniques = await prisma.cveAttackMapping.findMany({
    distinct: ['techniqueId'],
    select: { techniqueId: true },
  })

  return {
    total,
    uniqueCves: uniqueCves.length,
    uniqueTechniques: uniqueTechniques.length,
    bySource: bySource.reduce((acc, item) => {
      acc[item.source] = item._count
      return acc
    }, {} as Record<string, number>),
    byConfidence: byConfidence.reduce((acc, item) => {
      acc[item.confidence] = item._count
      return acc
    }, {} as Record<string, number>),
  }
}
