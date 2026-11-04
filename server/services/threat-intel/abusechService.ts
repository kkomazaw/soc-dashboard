import axios from 'axios'

// URLhaus API - https://urlhaus-api.abuse.ch/
const URLHAUS_API_URL = 'https://urlhaus-api.abuse.ch/v1'

// MalwareBazaar API - https://mb-api.abuse.ch/
const MALWAREBAZAAR_API_URL = 'https://mb-api.abuse.ch/api/v1'

export interface UrlhausResult {
  query_status: string
  url?: string
  url_status?: string
  host?: string
  date_added?: string
  threat?: string
  blacklists?: {
    spamhaus_dbl?: string
    surbl?: string
  }
  reporter?: string
  larted?: string
  tags?: string[]
  urlhaus_link?: string
}

export interface MalwareBazaarResult {
  query_status: string
  data?: Array<{
    sha256_hash: string
    sha1_hash: string
    md5_hash: string
    file_name: string
    file_size: number
    file_type_mime: string
    file_type?: string
    reporter: string
    origin_country: string
    first_seen: string
    last_seen?: string
    signature?: string
    tags?: string[]
    intelligence?: {
      downloads?: number
      uploads?: number
      mail?: string
    }
  }>
}

/**
 * URLhaus - Check if a URL is known to distribute malware
 */
export const checkUrlInUrlhaus = async (url: string): Promise<UrlhausResult> => {
  try {
    console.log(`Checking URL in URLhaus: ${url}`)

    const response = await axios.post(
      `${URLHAUS_API_URL}/url/`,
      new URLSearchParams({ url }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    )

    console.log(`URLhaus check complete for ${url}`)
    return response.data
  } catch (error) {
    console.error('URLhaus API error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data
    }
    throw new Error('Failed to check URL in URLhaus')
  }
}

/**
 * URLhaus - Get recent URLs (last 3 days)
 */
export const getRecentUrlhausUrls = async (limit: number = 100): Promise<any> => {
  try {
    console.log(`Fetching recent URLhaus URLs (limit: ${limit})`)

    const response = await axios.get(`${URLHAUS_API_URL}/urls/recent/`, {
      params: { limit },
      timeout: 10000,
    })

    console.log(`Retrieved ${response.data.urls?.length || 0} recent URLs`)
    return response.data
  } catch (error) {
    console.error('URLhaus recent URLs error:', error)
    throw new Error('Failed to fetch recent URLhaus URLs')
  }
}

/**
 * MalwareBazaar - Query malware sample by hash
 */
export const queryMalwareByHash = async (
  hash: string
): Promise<MalwareBazaarResult> => {
  try {
    console.log(`Querying MalwareBazaar for hash: ${hash}`)

    const response = await axios.post(
      `${MALWAREBAZAAR_API_URL}/query/`,
      {
        query: 'get_info',
        hash: hash,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    console.log(`MalwareBazaar query complete for ${hash}`)
    return response.data
  } catch (error) {
    console.error('MalwareBazaar API error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data
    }
    throw new Error('Failed to query MalwareBazaar')
  }
}

/**
 * MalwareBazaar - Query malware samples by signature
 */
export const queryMalwareBySignature = async (
  signature: string
): Promise<MalwareBazaarResult> => {
  try {
    console.log(`Querying MalwareBazaar for signature: ${signature}`)

    const response = await axios.post(
      `${MALWAREBAZAAR_API_URL}/query/`,
      {
        query: 'get_sigcheck',
        signature: signature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    console.log(`MalwareBazaar signature query complete`)
    return response.data
  } catch (error) {
    console.error('MalwareBazaar signature query error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data
    }
    throw new Error('Failed to query MalwareBazaar by signature')
  }
}

/**
 * MalwareBazaar - Query malware samples by tag
 */
export const queryMalwareByTag = async (
  tag: string
): Promise<MalwareBazaarResult> => {
  try {
    console.log(`Querying MalwareBazaar for tag: ${tag}`)

    const response = await axios.post(
      `${MALWAREBAZAAR_API_URL}/query/`,
      {
        query: 'get_taginfo',
        tag: tag,
        limit: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    console.log(`MalwareBazaar tag query complete`)
    return response.data
  } catch (error) {
    console.error('MalwareBazaar tag query error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data
    }
    throw new Error('Failed to query MalwareBazaar by tag')
  }
}

/**
 * MalwareBazaar - Get recent malware samples
 */
export const getRecentMalwareSamples = async (): Promise<MalwareBazaarResult> => {
  try {
    console.log('Fetching recent MalwareBazaar samples')

    const response = await axios.post(
      `${MALWAREBAZAAR_API_URL}/query/`,
      {
        query: 'get_recent',
        selector: '100',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    console.log(`Retrieved ${response.data.data?.length || 0} recent samples`)
    return response.data
  } catch (error) {
    console.error('MalwareBazaar recent samples error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data
    }
    throw new Error('Failed to fetch recent malware samples')
  }
}

/**
 * Check if abuse.ch services are available
 */
export const checkAbusechStatus = async (): Promise<{
  urlhaus: boolean
  malwareBazaar: boolean
}> => {
  const status = {
    urlhaus: false,
    malwareBazaar: false,
  }

  try {
    const urlhausResponse = await axios.get(`${URLHAUS_API_URL}/urls/recent/`, {
      params: { limit: 1 },
      timeout: 5000,
    })
    status.urlhaus = urlhausResponse.status === 200
  } catch (error) {
    console.warn('URLhaus status check failed')
  }

  try {
    const mbResponse = await axios.post(
      `${MALWAREBAZAAR_API_URL}/query/`,
      { query: 'get_recent', selector: '1' },
      { timeout: 5000 }
    )
    status.malwareBazaar = mbResponse.status === 200
  } catch (error) {
    console.warn('MalwareBazaar status check failed')
  }

  return status
}
