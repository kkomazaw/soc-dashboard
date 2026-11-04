import { useQuery } from '@tanstack/react-query'
import { fetchAllRssFeeds } from '@/services/api/rssParser'

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchAllRssFeeds,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  })
}
