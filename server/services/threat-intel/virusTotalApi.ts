import axios from 'axios'

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3'

export interface VirusTotalFileReport {
  data: {
    id: string
    type: string
    attributes: {
      last_analysis_stats: {
        harmless: number
        malicious: number
        suspicious: number
        undetected: number
        timeout: number
      }
      last_analysis_results: Record<string, any>
      meaningful_name?: string
      names?: string[]
      sha256: string
      md5: string
      sha1: string
      size: number
      type_description?: string
      first_submission_date: number
      last_analysis_date: number
    }
  }
}

export interface VirusTotalUrlReport {
  data: {
    id: string
    type: string
    attributes: {
      last_analysis_stats: {
        harmless: number
        malicious: number
        suspicious: number
        undetected: number
        timeout: number
      }
      url: string
      last_analysis_date: number
      categories: Record<string, string>
    }
  }
}

/**
 * Search file hash in VirusTotal
 */
export const searchFileHash = async (hash: string): Promise<VirusTotalFileReport | null> => {
  if (!VIRUSTOTAL_API_KEY) {
    console.warn('VirusTotal API key not configured')
    return null
  }

  try {
    console.log(`Searching file hash in VirusTotal: ${hash}`)
    const response = await axios.get<VirusTotalFileReport>(
      `${VIRUSTOTAL_API_URL}/files/${hash}`,
      {
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
        },
        timeout: 10000,
      }
    )

    console.log(`VirusTotal file hash search successful: ${hash}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`File hash not found in VirusTotal: ${hash}`)
      return null
    }
    console.error('VirusTotal file hash search failed:', error)
    throw error
  }
}

/**
 * Search URL in VirusTotal
 */
export const searchUrl = async (url: string): Promise<VirusTotalUrlReport | null> => {
  if (!VIRUSTOTAL_API_KEY) {
    console.warn('VirusTotal API key not configured')
    return null
  }

  try {
    console.log(`Searching URL in VirusTotal: ${url}`)

    // First, get the URL identifier
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '')

    const response = await axios.get<VirusTotalUrlReport>(
      `${VIRUSTOTAL_API_URL}/urls/${urlId}`,
      {
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
        },
        timeout: 10000,
      }
    )

    console.log(`VirusTotal URL search successful: ${url}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`URL not found in VirusTotal: ${url}`)
      return null
    }
    console.error('VirusTotal URL search failed:', error)
    throw error
  }
}

/**
 * Check if VirusTotal API is configured
 */
export const isVirusTotalConfigured = (): boolean => {
  return !!VIRUSTOTAL_API_KEY
}
