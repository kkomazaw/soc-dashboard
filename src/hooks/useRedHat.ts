import { useQuery } from '@tanstack/react-query'
import {
  getRedHatAdvisories,
  getRedHatCVEs,
  getRedHatStats,
  getAllRedHatData,
} from '@/services/api/redhatApi'

/**
 * Hook to fetch Red Hat Security Advisories
 */
export const useRedHatAdvisories = () => {
  return useQuery({
    queryKey: ['redhat-advisories'],
    queryFn: getRedHatAdvisories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch Red Hat CVEs
 */
export const useRedHatCVEs = () => {
  return useQuery({
    queryKey: ['redhat-cves'],
    queryFn: getRedHatCVEs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch Red Hat security statistics
 */
export const useRedHatStats = () => {
  return useQuery({
    queryKey: ['redhat-stats'],
    queryFn: getRedHatStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch all Red Hat security data
 */
export const useAllRedHatData = () => {
  return useQuery({
    queryKey: ['redhat-all'],
    queryFn: getAllRedHatData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
