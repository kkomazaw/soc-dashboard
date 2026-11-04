import axios from 'axios'

const CISA_KEV_URL =
  'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'

interface CisaKevResponse {
  title: string
  catalogVersion: string
  dateReleased: string
  count: number
  vulnerabilities: Array<{
    cveID: string
    vendorProject: string
    product: string
    vulnerabilityName: string
    dateAdded: string
    shortDescription: string
    requiredAction: string
    dueDate: string
    knownRansomwareCampaignUse: string
    notes: string
  }>
}

export interface CisaKevItem {
  cveId: string
  vendorProject?: string
  product?: string
  vulnerabilityName?: string
  dateAdded: string
  shortDescription?: string
  requiredAction?: string
  dueDate?: string
  knownRansomwareCampaignUse?: boolean
  notes?: string
}

export const fetchCisaKevData = async (): Promise<CisaKevItem[]> => {
  try {
    const response = await axios.get<CisaKevResponse>(CISA_KEV_URL, {
      timeout: 10000,
    })

    const vulnerabilities: CisaKevItem[] = response.data.vulnerabilities.map((item) => ({
      cveId: item.cveID,
      vendorProject: item.vendorProject,
      product: item.product,
      vulnerabilityName: item.vulnerabilityName,
      dateAdded: item.dateAdded,
      shortDescription: item.shortDescription,
      requiredAction: item.requiredAction,
      dueDate: item.dueDate,
      knownRansomwareCampaignUse: item.knownRansomwareCampaignUse === 'Known',
      notes: item.notes,
    }))

    return vulnerabilities
  } catch (error) {
    console.error('Failed to fetch CISA KEV data:', error)
    throw new Error(`CISA KEV API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
