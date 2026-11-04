import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCisaKev } from '@/services/api/cisaApi'
import { getJvnVulnerabilities } from '@/services/api/jvnApi'
import { getNvdCves } from '@/services/api/nvdApi'
import { fetchAllRssFeeds } from '@/services/api/rssParser'
import {
  notifyCisaKev,
  notifyCriticalCve,
  notifyHighCve,
  notifySecurityNews,
  getLastCheckTime,
  updateLastCheckTime,
  getNotificationPermission,
} from '@/services/notificationService'

/**
 * Hook to monitor data changes and trigger desktop notifications
 * for critical security events
 */
export const useNotificationMonitor = () => {
  const lastCheckRef = useRef<Date>(getLastCheckTime())
  const cisaProcessedRef = useRef(new Set<string>())
  const nvdProcessedRef = useRef(new Set<string>())
  const jvnProcessedRef = useRef(new Set<string>())
  const newsProcessedRef = useRef(new Set<string>())

  // Fetch data
  const { data: cisaData } = useQuery({
    queryKey: ['cisa-kev'],
    queryFn: fetchCisaKev,
  })

  const { data: jvnData } = useQuery({
    queryKey: ['jvn-vulnerabilities'],
    queryFn: getJvnVulnerabilities,
  })

  const { data: nvdData } = useQuery({
    queryKey: ['nvd-cves'],
    queryFn: getNvdCves,
  })

  const { data: newsData } = useQuery({
    queryKey: ['news'],
    queryFn: fetchAllRssFeeds,
  })

  // Monitor CISA KEV
  useEffect(() => {
    if (!cisaData || getNotificationPermission() !== 'granted') return

    const newVulns = cisaData.filter((vuln) => {
      // Skip if already processed
      if (cisaProcessedRef.current.has(vuln.cveId)) return false

      // Check if it's new (added after last check)
      const dateAdded = new Date(vuln.dateAdded)
      return dateAdded > lastCheckRef.current
    })

    if (newVulns.length > 0) {
      // Mark as processed
      newVulns.forEach((vuln) => cisaProcessedRef.current.add(vuln.cveId))

      // Send notification
      const latestVuln = newVulns[0]
      notifyCisaKev(newVulns.length, latestVuln.cveId)

      // Update last check time
      updateLastCheckTime()
      lastCheckRef.current = new Date()
    }
  }, [cisaData])

  // Monitor NVD for critical and high severity CVEs
  useEffect(() => {
    if (!nvdData?.data || getNotificationPermission() !== 'granted') return

    nvdData.data.forEach((cve: any) => {
      // Skip if already processed
      if (nvdProcessedRef.current.has(cve.cveId)) return

      // Check if it's new
      const publishedDate = new Date(cve.publishedDate)
      if (publishedDate <= lastCheckRef.current) return

      // Mark as processed
      nvdProcessedRef.current.add(cve.cveId)

      const cvssScore = cve.cvssScore || 0
      const description = cve.description || ''

      // Notify based on severity
      if (cvssScore >= 9.0) {
        notifyCriticalCve(cve.cveId, description, cvssScore)
      } else if (cvssScore >= 7.0) {
        notifyHighCve(cve.cveId, description, cvssScore)
      }
    })
  }, [nvdData])

  // Monitor JVN for critical and high severity vulnerabilities
  useEffect(() => {
    if (!jvnData?.data || getNotificationPermission() !== 'granted') return

    jvnData.data.forEach((vuln: any) => {
      // Skip if already processed
      if (jvnProcessedRef.current.has(vuln.jvnId)) return

      // Check if it's new
      if (vuln.publishedDate) {
        const publishedDate = new Date(vuln.publishedDate)
        if (publishedDate <= lastCheckRef.current) return
      }

      // Mark as processed
      jvnProcessedRef.current.add(vuln.jvnId)

      const cvssScore = vuln.cvssScore || 0
      const description = vuln.summary || vuln.title || ''
      const cveId = vuln.cveId || vuln.jvnId

      // Notify based on severity
      if (cvssScore >= 9.0 || vuln.severity === '緊急') {
        notifyCriticalCve(cveId, description, cvssScore)
      } else if (cvssScore >= 7.0 || vuln.severity === '重要') {
        notifyHighCve(cveId, description, cvssScore)
      }
    })
  }, [jvnData])

  // Monitor security news
  useEffect(() => {
    if (!newsData || getNotificationPermission() !== 'granted') return

    const recentNews = newsData.filter((article) => {
      // Skip if already processed
      if (newsProcessedRef.current.has(article.guid)) return false

      // Check if it's new
      const publishedDate = new Date(article.publishedDate)
      return publishedDate > lastCheckRef.current
    })

    if (recentNews.length > 0) {
      // Mark as processed
      recentNews.forEach((article) => newsProcessedRef.current.add(article.guid))

      // Only notify about the most recent article to avoid spam
      const latestArticle = recentNews[0]

      // Check if title contains critical keywords
      const criticalKeywords = [
        'zero-day',
        'ransomware',
        'critical',
        'urgent',
        'emergency',
        'breach',
        'exploit',
        'vulnerability',
      ]

      const title = latestArticle.title.toLowerCase()
      const isCritical = criticalKeywords.some((keyword) => title.includes(keyword))

      if (isCritical) {
        notifySecurityNews(latestArticle.title, latestArticle.source)
      }
    }
  }, [newsData])

  return {
    isMonitoring: getNotificationPermission() === 'granted',
  }
}
