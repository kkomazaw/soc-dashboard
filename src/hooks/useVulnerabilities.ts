import { useQuery } from '@tanstack/react-query'
import { fetchCisaKev } from '@/services/api/cisaApi'

export const useCisaKev = () => {
  return useQuery({
    queryKey: ['cisaKev'],
    queryFn: fetchCisaKev,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  })
}
