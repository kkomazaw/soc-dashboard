import axios from 'axios'
import type { CisaKevItem } from '@/types/vulnerability'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchCisaKev = async (): Promise<CisaKevItem[]> => {
  try {
    const response = await axios.get<CisaKevItem[]>(
      `${API_BASE_URL}/api/vulnerabilities/cisa-kev`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch CISA KEV data:', error)
    throw error
  }
}
