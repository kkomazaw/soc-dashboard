import axios from 'axios'

const OTX_API_BASE = 'https://otx.alienvault.com/api/v1'
const OTX_API_KEY = process.env.OTX_API_KEY

export interface OTXPulse {
  id: string
  name: string
  description: string
  author_name: string
  created: string
  modified: string
  tags: string[]
  references: string[]
  tlp: string
  adversary: string
  targeted_countries: string[]
  malware_families: string[]
  attack_ids: string[]
  industries: string[]
  indicator_count: number
}

export interface OTXIndicator {
  id: number
  indicator: string
  type: string
  title: string
  description: string
  created: string
  content: string
  access_type: string
  access_reason: string
}

export interface OTXIPReputation {
  reputation: number
  country_code: string
  country_name: string
  city: string
  continent_code: string
  latitude: number
  longitude: number
  asn: string
  organization: string
  pulse_info: {
    count: number
    pulses: Array<{
      id: string
      name: string
      tags: string[]
      created: string
      modified: string
    }>
  }
  malware: {
    count: number
    data: Array<{
      hash: string
      detections: {
        avast: string
        avg: string
      }
    }>
  }
  url_list: {
    count: number
    url_list: Array<{
      url: string
      date: string
    }>
  }
}

export interface OTXDomainReputation {
  indicator: string
  pulse_info: {
    count: number
    pulses: Array<{
      id: string
      name: string
      tags: string[]
      created: string
    }>
  }
  alexa: string
  whois: string
}

export interface OTXHashReputation {
  indicator: string
  pulse_info: {
    count: number
    pulses: Array<{
      id: string
      name: string
      tags: string[]
      created: string
    }>
  }
  analysis: {
    malware: string
    file_class: string
    file_type: string
  }
}

class OTXClient {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = OTX_API_KEY
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
  }

  private getHeaders() {
    if (!this.apiKey) {
      throw new Error('OTX API key not configured')
    }

    return {
      'X-OTX-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  // Get subscribed pulses
  async getSubscribedPulses(limit: number = 10): Promise<OTXPulse[]> {
    if (!this.isConfigured()) {
      throw new Error('OTX API key not configured')
    }

    try {
      const response = await axios.get(`${OTX_API_BASE}/pulses/subscribed`, {
        headers: this.getHeaders(),
        params: { limit },
      })

      return response.data.results || []
    } catch (error: any) {
      console.error('OTX API error (subscribed pulses):', error.message)
      throw new Error(`Failed to fetch OTX subscribed pulses: ${error.message}`)
    }
  }

  // Get recent pulses
  async getRecentPulses(limit: number = 10): Promise<OTXPulse[]> {
    try {
      // Public endpoint - no API key required
      const response = await axios.get(`${OTX_API_BASE}/pulses/activity`, {
        params: { limit },
      })

      return response.data.results || []
    } catch (error: any) {
      console.error('OTX API error (recent pulses):', error.message)
      throw new Error(`Failed to fetch OTX recent pulses: ${error.message}`)
    }
  }

  // Search pulses by keyword
  async searchPulses(query: string): Promise<OTXPulse[]> {
    try {
      const response = await axios.get(`${OTX_API_BASE}/search/pulses`, {
        params: { q: query },
      })

      return response.data.results || []
    } catch (error: any) {
      console.error('OTX API error (search pulses):', error.message)
      throw new Error(`Failed to search OTX pulses: ${error.message}`)
    }
  }

  // Get IP reputation
  async getIPReputation(ip: string): Promise<OTXIPReputation> {
    try {
      const response = await axios.get(`${OTX_API_BASE}/indicators/IPv4/${ip}/general`)

      return response.data
    } catch (error: any) {
      console.error(`OTX API error (IP ${ip}):`, error.message)
      throw new Error(`Failed to fetch OTX IP reputation: ${error.message}`)
    }
  }

  // Get domain reputation
  async getDomainReputation(domain: string): Promise<OTXDomainReputation> {
    try {
      const response = await axios.get(`${OTX_API_BASE}/indicators/domain/${domain}/general`)

      return response.data
    } catch (error: any) {
      console.error(`OTX API error (domain ${domain}):`, error.message)
      throw new Error(`Failed to fetch OTX domain reputation: ${error.message}`)
    }
  }

  // Get URL reputation
  async getURLReputation(url: string): Promise<any> {
    try {
      // URL needs to be base64 encoded
      const encodedUrl = Buffer.from(url).toString('base64')
      const response = await axios.get(`${OTX_API_BASE}/indicators/url/${encodedUrl}/general`)

      return response.data
    } catch (error: any) {
      console.error(`OTX API error (URL):`, error.message)
      throw new Error(`Failed to fetch OTX URL reputation: ${error.message}`)
    }
  }

  // Get file hash reputation
  async getHashReputation(hash: string): Promise<OTXHashReputation> {
    try {
      const response = await axios.get(`${OTX_API_BASE}/indicators/file/${hash}/general`)

      return response.data
    } catch (error: any) {
      console.error(`OTX API error (hash ${hash}):`, error.message)
      throw new Error(`Failed to fetch OTX hash reputation: ${error.message}`)
    }
  }
}

export const otxClient = new OTXClient()
