import axios from 'axios'
import { saveSecurityIncidents, type SecurityIncidentData } from '../database/securityIncidentDb'

/**
 * Fetch and parse security incidents from CISA advisories
 */
async function fetchCisaIncidents(): Promise<SecurityIncidentData[]> {
  try {
    console.log('Fetching CISA security advisories...')

    // CISA doesn't have a direct "incidents" API, but we can derive incidents from their advisories
    // For now, we'll use their known vulnerabilities that indicate major campaigns
    const response = await axios.get('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json')

    const incidents: SecurityIncidentData[] = []
    const data = response.data

    // Group vulnerabilities by vendor/campaign if they appear to be related
    // This is a simplified approach - in production, you'd use more sophisticated clustering
    const recentVulns = data.vulnerabilities?.slice(0, 20) || []

    // Look for patterns that indicate major campaigns
    // For example, multiple CVEs from the same vendor around the same time
    const vendorMap = new Map<string, any[]>()

    recentVulns.forEach((vuln: any) => {
      const vendor = vuln.vendorProject || 'Unknown'
      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, [])
      }
      vendorMap.get(vendor)!.push(vuln)
    })

    // If a vendor has multiple CVEs in a short time, it might be a campaign
    vendorMap.forEach((vulns, vendor) => {
      if (vulns.length >= 2) {
        const incident: SecurityIncidentData = {
          incidentId: `cisa-${vendor.toLowerCase().replace(/\s+/g, '-')}-${new Date().getFullYear()}`,
          name: `${vendor} Security Campaign`,
          discoveryDate: vulns[0].dateAdded,
          severity: 'CRITICAL',
          category: 'vulnerability',
          description: `Multiple vulnerabilities affecting ${vendor} products added to CISA KEV`,
          affectedSystems: vulns.map((v: any) => v.product),
          relatedCVEs: vulns.map((v: any) => v.cveID),
          mitigations: vulns.map((v: any) => v.requiredAction),
          references: [{
            title: 'CISA KEV Catalog',
            url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
          }],
          impact: `${vulns.length} known exploited vulnerabilities affecting ${vendor} products`,
          status: 'active',
          source: 'cisa',
          sourceUrl: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
        }
        incidents.push(incident)
      }
    })

    console.log(`Extracted ${incidents.length} potential incidents from CISA advisories`)
    return incidents
  } catch (error) {
    console.error('Error fetching CISA incidents:', error)
    return []
  }
}

/**
 * Fetch security incidents from BleepingComputer RSS feed
 * This can identify major named attacks and campaigns
 */
async function fetchNewsBasedIncidents(): Promise<SecurityIncidentData[]> {
  try {
    console.log('Analyzing security news for major incidents...')

    const incidents: SecurityIncidentData[] = []

    // Keywords that indicate major security incidents
    const incidentKeywords = [
      'campaign', 'operation', 'exploit', 'ransomware', 'apt', 'zero-day',
      'supply chain', 'breach', 'attack', 'malware', 'vulnerability'
    ]

    // Pattern to identify named campaigns (usually capitalized or in quotes)
    // This is a simplified approach - in production, you'd use NLP

    // For now, return empty array - this would need actual RSS parsing
    // In production, you'd parse the RSS feed and extract incident information

    console.log('News-based incident detection requires RSS feed parsing (not implemented in this version)')
    return incidents
  } catch (error) {
    console.error('Error fetching news-based incidents:', error)
    return []
  }
}

/**
 * Manually seed initial incident data
 * This provides a baseline of well-known historical incidents
 */
export async function seedHistoricalIncidents(): Promise<void> {
  console.log('Seeding historical security incidents...')

  const historicalIncidents: SecurityIncidentData[] = [
    {
      incidentId: 'log4shell-2021',
      name: 'Log4Shell',
      alternateName: 'LogJam',
      discoveryDate: '2021-11-24',
      publicDisclosure: '2021-12-09',
      severity: 'CRITICAL',
      category: 'zero-day',
      description: 'Apache Log4jライブラリの極めて重大なゼロデイ脆弱性（CVE-2021-44228）。リモートコード実行が可能で、インターネット上の無数のシステムに影響。',
      affectedSystems: ['Apache Log4j 2.x', 'Java アプリケーション全般', 'クラウドサービス'],
      relatedCVEs: ['CVE-2021-44228', 'CVE-2021-45046', 'CVE-2021-45105'],
      threatActors: ['複数の国家支援型APT', 'サイバー犯罪グループ'],
      mitigations: [
        'Log4j 2.17.0以降へのアップグレード',
        'JNDIルックアップの無効化',
        'WAF/IPSルールの適用',
        '影響を受けるシステムの特定とパッチ適用'
      ],
      references: [
        { title: 'Apache Log4j Security', url: 'https://logging.apache.org/log4j/2.x/security.html' },
        { title: 'CISA Log4Shell Guidance', url: 'https://www.cisa.gov/uscert/apache-log4j-vulnerability-guidance' }
      ],
      impact: '世界中で数百万のシステムが影響を受け、史上最大規模のサイバーセキュリティインシデントの一つとされる。',
      status: 'mitigated',
      source: 'manual'
    },
    {
      incidentId: 'sunburst-2020',
      name: 'SolarWinds Sunburst',
      alternateName: 'Solorigate',
      discoveryDate: '2020-12-08',
      publicDisclosure: '2020-12-13',
      severity: 'CRITICAL',
      category: 'supply-chain',
      description: 'SolarWinds Orion製品のサプライチェーン攻撃。正規のソフトウェアアップデートにバックドアが埋め込まれ、18,000以上の組織に配布された。',
      affectedSystems: ['SolarWinds Orion Platform 2019.4 - 2020.2.1'],
      relatedCVEs: ['CVE-2020-10148'],
      threatActors: ['APT29 (Cozy Bear, SVR)'],
      mitigations: [
        'SolarWinds Orionの隔離と調査',
        'ネットワークトラフィックの分析',
        '侵害の痕跡（IoC）の確認',
        'ゼロトラストセキュリティモデルの採用'
      ],
      references: [
        { title: 'FireEye Analysis', url: 'https://www.fireeye.com/blog/threat-research/2020/12/' },
        { title: 'Microsoft Solorigate Resource Center', url: 'https://www.microsoft.com/security/blog/' }
      ],
      impact: '米国政府機関、Fortune 500企業など世界最高レベルのセキュリティを持つ組織が侵害された史上最大のサプライチェーン攻撃。',
      status: 'mitigated',
      source: 'manual'
    },
    {
      incidentId: 'wannacry-2017',
      name: 'WannaCry',
      alternateName: 'WannaCrypt, WanaCrypt0r',
      discoveryDate: '2017-05-12',
      publicDisclosure: '2017-05-12',
      severity: 'CRITICAL',
      category: 'ransomware',
      description: 'EternalBlue脆弱性を悪用した世界的なランサムウェア攻撃。自己増殖型ワームとして急速に拡散し、150カ国以上で被害が発生。',
      affectedSystems: ['Windows XP', 'Windows 7', 'Windows Server 2008'],
      relatedCVEs: ['CVE-2017-0144', 'CVE-2017-0145'],
      threatActors: ['Lazarus Group (北朝鮮)'],
      mitigations: [
        'MS17-010パッチの適用',
        'SMBv1の無効化',
        'ネットワークセグメンテーション',
        'バックアップの定期的な実施と検証'
      ],
      references: [
        { title: 'Microsoft Security Response', url: 'https://msrc.microsoft.com/' },
        { title: 'CISA WannaCry Analysis', url: 'https://www.cisa.gov/' }
      ],
      impact: '30万台以上のコンピューターが感染。医療機関、製造業、政府機関など重要サービスが停止し、推定被害額は数十億ドル。',
      status: 'mitigated',
      source: 'manual'
    }
  ]

  await saveSecurityIncidents(historicalIncidents)
  console.log(`Seeded ${historicalIncidents.length} historical incidents`)
}

/**
 * Main function to fetch and sync security incidents from all sources
 */
export async function fetchAndSyncSecurityIncidents(): Promise<void> {
  console.log('Starting security incident sync from threat intelligence feeds...')

  try {
    // Fetch from multiple sources
    const cisaIncidents = await fetchCisaIncidents()
    const newsIncidents = await fetchNewsBasedIncidents()

    // Combine all incidents
    const allIncidents = [...cisaIncidents, ...newsIncidents]

    if (allIncidents.length > 0) {
      await saveSecurityIncidents(allIncidents)
      console.log(`Successfully synced ${allIncidents.length} security incidents`)
    } else {
      console.log('No new security incidents found from feeds')
    }
  } catch (error) {
    console.error('Error syncing security incidents:', error)
    throw error
  }
}

/**
 * Initialize the security incidents database with historical data
 */
export async function initializeSecurityIncidents(): Promise<void> {
  console.log('Initializing security incidents database...')

  try {
    // First, seed historical incidents
    await seedHistoricalIncidents()

    // Then fetch current incidents from feeds
    await fetchAndSyncSecurityIncidents()

    console.log('Security incidents initialization complete')
  } catch (error) {
    console.error('Error initializing security incidents:', error)
    throw error
  }
}
