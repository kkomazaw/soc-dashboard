import { Parser } from 'json2csv'

export interface ExportData {
  fields: string[]
  data: any[]
  filename: string
}

export const generateCSV = (exportData: ExportData): string => {
  try {
    const parser = new Parser({ fields: exportData.fields })
    const csv = parser.parse(exportData.data)
    return csv
  } catch (error) {
    console.error('CSV generation error:', error)
    throw new Error('Failed to generate CSV file')
  }
}

// CISA KEV CSV export
export const exportCisaKevToCSV = (vulnerabilities: any[]): string => {
  const fields = [
    'cveId',
    'vendorProject',
    'product',
    'vulnerabilityName',
    'dateAdded',
    'shortDescription',
    'requiredAction',
    'dueDate',
    'knownRansomwareCampaignUse',
  ]

  return generateCSV({
    fields,
    data: vulnerabilities,
    filename: 'cisa-kev-export.csv',
  })
}

// JVN Vulnerability CSV export
export const exportJvnToCSV = (vulnerabilities: any[]): string => {
  const fields = [
    'vulnId',
    'title',
    'severity',
    'cvssScore',
    'publishedDate',
    'lastModifiedDate',
    'description',
  ]

  const data = vulnerabilities.map((vuln) => ({
    ...vuln,
    publishedDate: vuln.publishedDate ? new Date(vuln.publishedDate).toISOString() : '',
    lastModifiedDate: vuln.lastModifiedDate ? new Date(vuln.lastModifiedDate).toISOString() : '',
  }))

  return generateCSV({
    fields,
    data,
    filename: 'jvn-export.csv',
  })
}

// NVD CVE CSV export
export const exportNvdToCSV = (cves: any[]): string => {
  const fields = [
    'cveId',
    'description',
    'severity',
    'cvssScore',
    'publishedDate',
    'lastModifiedDate',
    'vulnStatus',
  ]

  const data = cves.map((cve) => ({
    ...cve,
    publishedDate: cve.publishedDate ? new Date(cve.publishedDate).toISOString() : '',
    lastModifiedDate: cve.lastModifiedDate ? new Date(cve.lastModifiedDate).toISOString() : '',
  }))

  return generateCSV({
    fields,
    data,
    filename: 'nvd-export.csv',
  })
}

// ATT&CK Techniques CSV export
export const exportAttackTechniquesToCSV = (techniques: any[]): string => {
  const fields = [
    'techniqueId',
    'name',
    'description',
    'tactics',
    'platforms',
    'dataSource',
  ]

  const data = techniques.map((tech) => ({
    techniqueId: tech.techniqueId,
    name: tech.name,
    description: tech.description,
    tactics: Array.isArray(tech.tactics) ? tech.tactics.join('; ') : tech.tactics,
    platforms: Array.isArray(tech.platforms) ? tech.platforms.join('; ') : tech.platforms,
    dataSource: Array.isArray(tech.dataSource) ? tech.dataSource.join('; ') : tech.dataSource,
  }))

  return generateCSV({
    fields,
    data,
    filename: 'attack-techniques-export.csv',
  })
}

// News Feed CSV export
export const exportNewsToCSV = (articles: any[]): string => {
  const fields = [
    'title',
    'source',
    'link',
    'publishedDate',
    'description',
  ]

  const data = articles.map((article) => ({
    ...article,
    publishedDate: article.publishedDate ? new Date(article.publishedDate).toISOString() : '',
  }))

  return generateCSV({
    fields,
    data,
    filename: 'news-feed-export.csv',
  })
}
