import type { NewsArticle } from '@/types/news'
import type { CisaKevItem } from '@/types/vulnerability'

// モックCISA KEVデータ（テスト用）
export const mockCisaKevData: CisaKevItem[] = [
  {
    cveId: 'CVE-2024-12345',
    vendorProject: 'Microsoft',
    product: 'Exchange Server',
    vulnerabilityName: 'Exchange Server Remote Code Execution Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    shortDescription: 'Microsoft Exchange Server contains a remote code execution vulnerability that allows an unauthenticated attacker to execute arbitrary code.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days from now
    knownRansomwareCampaignUse: true,
  },
  {
    cveId: 'CVE-2024-12346',
    vendorProject: 'Cisco',
    product: 'IOS XE',
    vulnerabilityName: 'Cisco IOS XE Web UI Privilege Escalation Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    shortDescription: 'Cisco IOS XE contains a privilege escalation vulnerability in the web UI that allows an authenticated attacker to gain root privileges.',
    requiredAction: 'Apply updates per vendor instructions or disable HTTP Server feature.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 13).toISOString(),
    knownRansomwareCampaignUse: false,
  },
  {
    cveId: 'CVE-2024-12347',
    vendorProject: 'VMware',
    product: 'vCenter Server',
    vulnerabilityName: 'VMware vCenter Server Authentication Bypass Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    shortDescription: 'VMware vCenter Server contains an authentication bypass vulnerability that allows a remote attacker to gain administrative access.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    knownRansomwareCampaignUse: true,
  },
  {
    cveId: 'CVE-2024-12348',
    vendorProject: 'Fortinet',
    product: 'FortiOS',
    vulnerabilityName: 'Fortinet FortiOS SSL-VPN Heap Buffer Overflow Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    shortDescription: 'Fortinet FortiOS contains a heap buffer overflow vulnerability in the SSL-VPN component.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11).toISOString(),
    knownRansomwareCampaignUse: false,
  },
  {
    cveId: 'CVE-2024-12349',
    vendorProject: 'Apache',
    product: 'Struts 2',
    vulnerabilityName: 'Apache Struts 2 Remote Code Execution Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    shortDescription: 'Apache Struts 2 contains a remote code execution vulnerability due to improper input validation.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    knownRansomwareCampaignUse: true,
  },
  {
    cveId: 'CVE-2024-12350',
    vendorProject: 'Adobe',
    product: 'ColdFusion',
    vulnerabilityName: 'Adobe ColdFusion Arbitrary Code Execution Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    shortDescription: 'Adobe ColdFusion contains an arbitrary code execution vulnerability that allows remote attackers to execute code.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    knownRansomwareCampaignUse: false,
  },
  {
    cveId: 'CVE-2024-12351',
    vendorProject: 'Citrix',
    product: 'NetScaler ADC',
    vulnerabilityName: 'Citrix NetScaler ADC and Gateway Code Injection Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    shortDescription: 'Citrix NetScaler ADC and Gateway contain a code injection vulnerability allowing remote code execution.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    knownRansomwareCampaignUse: true,
  },
  {
    cveId: 'CVE-2024-12352',
    vendorProject: 'Palo Alto Networks',
    product: 'PAN-OS',
    vulnerabilityName: 'PAN-OS Command Injection Vulnerability',
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    shortDescription: 'PAN-OS contains a command injection vulnerability in the web interface.',
    requiredAction: 'Apply updates per vendor instructions.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    knownRansomwareCampaignUse: false,
  },
]

// モックニュースデータ（テスト用）
export const mockNewsArticles: NewsArticle[] = [
  {
    guid: 'mock-1',
    title: 'Critical RCE Vulnerability Found in Apache Struts 2',
    link: 'https://example.com/news/1',
    description: 'A critical remote code execution vulnerability has been discovered in Apache Struts 2, affecting versions 2.0.0 through 2.5.30.',
    author: 'Security Researcher',
    source: 'bleepingcomputer',
    category: 'vulnerability',
    publishedDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
    isStarred: false,
  },
  {
    guid: 'mock-2',
    title: 'LockBit Ransomware Gang Targets Healthcare Sector',
    link: 'https://example.com/news/2',
    description: 'The LockBit ransomware group has launched a new campaign specifically targeting healthcare organizations across North America.',
    author: 'Cybersecurity News',
    source: 'thehackernews',
    category: 'ransomware',
    publishedDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    isRead: false,
    isStarred: false,
  },
  {
    guid: 'mock-3',
    title: 'Microsoft Patch Tuesday: 89 Vulnerabilities Fixed',
    link: 'https://example.com/news/3',
    description: 'Microsoft has released its November 2024 Patch Tuesday update, addressing 89 security vulnerabilities including 3 zero-days.',
    author: 'Microsoft Security',
    source: 'bleepingcomputer',
    category: 'patch',
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isRead: false,
    isStarred: false,
  },
  {
    guid: 'mock-4',
    title: 'APT29 Launches New Phishing Campaign Against Government Agencies',
    link: 'https://example.com/news/4',
    description: 'Russian state-sponsored hacking group APT29 (Cozy Bear) has been observed conducting sophisticated phishing attacks.',
    author: 'Threat Intelligence',
    source: 'thehackernews',
    category: 'apt',
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isRead: false,
    isStarred: false,
  },
  {
    guid: 'mock-5',
    title: 'Critical Cisco IOS XE Zero-Day Actively Exploited in the Wild',
    link: 'https://example.com/news/5',
    description: 'Cisco has confirmed active exploitation of a zero-day vulnerability in IOS XE web UI feature.',
    author: 'Cisco PSIRT',
    source: 'bleepingcomputer',
    category: 'vulnerability',
    publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    isStarred: false,
  },
]
