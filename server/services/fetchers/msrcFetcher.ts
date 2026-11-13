import axios from 'axios'

/**
 * Microsoft Security Response Center (MSRC) API
 * Fetches security updates and patches from Microsoft
 *
 * API Documentation: https://api.msrc.microsoft.com/cvrf/v2.0/swagger/index
 */

const MSRC_API_BASE = 'https://api.msrc.microsoft.com/cvrf/v2.0'
const MSRC_API_KEY = process.env.MSRC_API_KEY || ''

export interface MsrcUpdate {
  ID: string // e.g., "2024-Jan"
  Alias: string
  DocumentTitle: string
  Severity?: {
    Type: number
    Description: string
  }
  InitialReleaseDate: string
  CurrentReleaseDate: string
  CvrfUrl: string
}

export interface MsrcPatch {
  patchId: string // KB number
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
 * Get list of available security updates
 */
export const fetchMsrcUpdates = async (): Promise<MsrcUpdate[]> => {
  try {
    console.log('Fetching MSRC security updates list...')

    const response = await axios.get(`${MSRC_API_BASE}/updates`, {
      headers: {
        'Accept': 'application/json',
        ...(MSRC_API_KEY && { 'api-key': MSRC_API_KEY }),
      },
      timeout: 30000,
    })

    const updates: MsrcUpdate[] = response.data.value || []
    console.log(`✓ Fetched ${updates.length} MSRC updates`)

    return updates
  } catch (error: any) {
    console.error('Error fetching MSRC updates:', error.message)
    if (error.response?.status === 401) {
      console.warn('MSRC API authentication failed. Please set MSRC_API_KEY in .env')
    }
    return []
  }
}

/**
 * Get details for a specific security update
 */
export const fetchMsrcUpdateDetails = async (updateId: string): Promise<any> => {
  try {
    console.log(`Fetching MSRC update details for ${updateId}...`)

    const response = await axios.get(`${MSRC_API_BASE}/cvrf/${updateId}`, {
      headers: {
        'Accept': 'application/json',
        ...(MSRC_API_KEY && { 'api-key': MSRC_API_KEY }),
      },
      timeout: 30000,
    })

    return response.data
  } catch (error: any) {
    console.error(`Error fetching MSRC update ${updateId}:`, error.message)
    return null
  }
}

/**
 * Parse MSRC CVRF document to extract patch information
 */
export const parseMsrcCvrf = (cvrf: any): MsrcPatch[] => {
  const patches: MsrcPatch[] = []

  try {
    // Extract Value property if documentTitle is an object
    const rawDocumentTitle = cvrf.DocumentTitle || ''
    const documentTitle = typeof rawDocumentTitle === 'object' && rawDocumentTitle !== null
      ? (rawDocumentTitle.Value || 'Security Update')
      : (rawDocumentTitle || 'Security Update')
    const documentPublisher = cvrf.DocumentPublisher || {}
    const vulnerability = cvrf.Vulnerability || []
    const productTree = cvrf.ProductTree || {}
    const releaseDate = new Date(cvrf.DocumentTracking?.CurrentReleaseDate || new Date())

    // Determine if this is Patch Tuesday or out-of-band
    const releaseType = isPatchTuesday(releaseDate) ? 'regular' : 'out-of-band'

    // Extract CVE information
    const cveMap = new Map<string, any>()
    vulnerability.forEach((vuln: any) => {
      const cveId = vuln.CVE || ''
      if (cveId) {
        cveMap.set(cveId, vuln)
      }
    })

    // Extract remediation (KB articles) from each vulnerability
    const kbMap = new Map<string, any>()

    console.log(`  Processing ${vulnerability.length} vulnerabilities...`)

    vulnerability.forEach((vuln: any) => {
      const remediations = vuln.Remediations || []

      remediations.forEach((remediation: any) => {
        // Type 3 = Workaround (often has KB), Type 6 = Vendor Fix
        if (remediation.Type === 3 || remediation.Type === 6) {
          let kbNumber = null

          // Try to extract KB number from URL (e.g., https://support.microsoft.com/help/5046616)
          if (remediation.URL) {
            const urlMatch = remediation.URL.match(/help\/(\d+)/i)
            if (urlMatch) {
              kbNumber = `KB${urlMatch[1]}`
            }
          }

          // Fallback: try to extract from Description
          if (!kbNumber && remediation.Description?.Value) {
            const descMatch = remediation.Description.Value.match(/KB\d+/i)
            if (descMatch) {
              kbNumber = descMatch[0]
            }
          }

          if (kbNumber && !kbMap.has(kbNumber)) {
            console.log(`    Found KB: ${kbNumber}`)
            kbMap.set(kbNumber, {
              kbNumber,
              description: remediation.Description?.Value || documentTitle,
              url: remediation.URL,
              productIds: remediation.ProductID || [],
              supercedence: remediation.Supercedence || [],
              cveId: vuln.CVE,
            })
          }
        }
      })
    })

    console.log(`  Found ${kbMap.size} unique KB articles`)

    // Get product names
    const productMap = new Map<string, string>()
    if (productTree.Branch) {
      extractProductNames(productTree.Branch, productMap)
    }

    // Create patch entries for each KB
    kbMap.forEach((kb, kbNumber) => {
      // Get associated CVEs (collect all CVEs that have this KB as a remediation)
      const associatedCves: string[] = []

      vulnerability.forEach((vuln: any) => {
        const cveId = vuln.CVE
        if (cveId && vuln.Remediations) {
          vuln.Remediations.forEach((rem: any) => {
            // Check if this remediation matches our KB (by URL or description)
            const hasKbInUrl = rem.URL && rem.URL.includes(kbNumber.replace('KB', ''))
            const hasKbInDesc = rem.Description?.Value && rem.Description.Value.includes(kbNumber)

            if (hasKbInUrl || hasKbInDesc) {
              associatedCves.push(cveId)
            }
          })
        }
      })

      // Determine severity
      let maxSeverity = 'Low'
      associatedCves.forEach(cveId => {
        const vuln = cveMap.get(cveId)
        if (vuln?.Severity) {
          const severity = vuln.Severity[0]?.Description || 'Low'
          if (severity === 'Critical' || maxSeverity !== 'Critical') {
            if (severity === 'Important' && maxSeverity !== 'Critical') {
              maxSeverity = 'Important'
            } else if (severity === 'Critical') {
              maxSeverity = 'Critical'
            }
          }
        }
      })

      // Get product names
      const products = kb.productIds.map((id: string) => productMap.get(id) || 'Unknown')
      const productName = products[0] || 'Windows'

      patches.push({
        patchId: kbNumber,
        title: `${kbNumber} - ${documentTitle}`,
        description: kb.description || documentTitle,
        severity: maxSeverity,
        releaseDate,
        releaseType,
        cveIds: [...new Set(associatedCves)],
        product: productName,
        bulletinUrl: cvrf.DocumentTracking?.Identification?.URL || '',
        kbArticleUrl: kb.url,
        supersedes: kb.supercedence?.map((s: any) => s.Value).filter(Boolean),
      })
    })

    console.log(`✓ Parsed ${patches.length} patches from CVRF`)
    return patches
  } catch (error: any) {
    console.error('Error parsing MSRC CVRF:', error.message)
    return []
  }
}

/**
 * Extract product names from product tree
 */
const extractProductNames = (branches: any[], productMap: Map<string, string>) => {
  branches.forEach((branch: any) => {
    if (branch.Type === 'Product Name' && branch.FullProductName) {
      const productId = branch.FullProductName.ProductID
      const productName = branch.FullProductName.Value
      if (productId && productName) {
        productMap.set(productId, productName)
      }
    }

    if (branch.Branch) {
      extractProductNames(branch.Branch, productMap)
    }
  })
}

/**
 * Check if a date is Patch Tuesday (second Tuesday of the month)
 */
export const isPatchTuesday = (date: Date): boolean => {
  const day = date.getDay()
  const dateNum = date.getDate()

  // Must be Tuesday (2)
  if (day !== 2) return false

  // Must be between 8th and 14th (second week)
  return dateNum >= 8 && dateNum <= 14
}

/**
 * Get the next Patch Tuesday date
 */
export const getNextPatchTuesday = (): Date => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // Find second Tuesday of current month
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()

  // Calculate second Tuesday
  let secondTuesday = 8 + ((2 - firstDayOfWeek + 7) % 7)
  if (secondTuesday < 8) secondTuesday += 7

  const patchTuesday = new Date(year, month, secondTuesday)

  // If it's passed, get next month's
  if (patchTuesday < now) {
    const nextMonth = month + 1
    const nextYear = nextMonth > 11 ? year + 1 : year
    const nextMonthNum = nextMonth > 11 ? 0 : nextMonth

    const firstDayNext = new Date(nextYear, nextMonthNum, 1)
    const firstDayOfWeekNext = firstDayNext.getDay()

    let secondTuesdayNext = 8 + ((2 - firstDayOfWeekNext + 7) % 7)
    if (secondTuesdayNext < 8) secondTuesdayNext += 7

    return new Date(nextYear, nextMonthNum, secondTuesdayNext)
  }

  return patchTuesday
}

/**
 * Fetch recent Microsoft patches (last 3 months)
 */
export const fetchRecentMicrosoftPatches = async (): Promise<MsrcPatch[]> => {
  try {
    console.log('🔍 Fetching recent Microsoft security patches...')

    // Get list of updates
    const updates = await fetchMsrcUpdates()

    if (!updates || updates.length === 0) {
      console.warn('No MSRC updates available')
      return []
    }

    // Get the most recent 3 months (MSRC API returns in chronological order, so take last 3)
    const recentUpdates = updates.slice(-3).reverse()
    const allPatches: MsrcPatch[] = []

    for (const update of recentUpdates) {
      console.log(`  Fetching details for ${update.ID}...`)
      const cvrf = await fetchMsrcUpdateDetails(update.ID)

      if (cvrf) {
        const patches = parseMsrcCvrf(cvrf)
        allPatches.push(...patches)
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`✅ Fetched ${allPatches.length} Microsoft patches from ${recentUpdates.length} updates`)
    return allPatches
  } catch (error: any) {
    console.error('Error fetching recent Microsoft patches:', error.message)
    return []
  }
}
