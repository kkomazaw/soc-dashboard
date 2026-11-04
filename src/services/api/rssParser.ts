import axios from 'axios'
import type { NewsArticle } from '@/types/news'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchAllRssFeeds = async (): Promise<NewsArticle[]> => {
  try {
    const response = await axios.get<NewsArticle[]>(
      `${API_BASE_URL}/api/news/feed`
    )
    return response.data
  } catch (error) {
    console.error('Failed to fetch news feed:', error)
    throw error
  }
}
