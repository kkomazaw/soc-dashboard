import { useQuery } from '@tanstack/react-query'
import { getCveTimeline, searchCves } from '@/services/api/cveTimelineApi'

/**
 * Hook to fetch CVE timeline data
 */
export const useCveTimeline = (cveId: string | null) => {
  return useQuery({
    queryKey: ['cve-timeline', cveId],
    queryFn: () => getCveTimeline(cveId!),
    enabled: !!cveId && cveId.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to search CVEs
 */
export const useCveSearch = (query: string | null) => {
  return useQuery({
    queryKey: ['cve-search', query],
    queryFn: () => searchCves(query!),
    enabled: !!query && query.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
