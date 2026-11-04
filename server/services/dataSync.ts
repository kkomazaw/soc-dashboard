import { fetchCisaKevData } from './fetchers/cisaFetcher'
import { fetchAllRssFeeds } from './fetchers/rssFetcher'
import { fetchJvnVulnerabilities } from './fetchers/jvnFetcher'
import { fetchRecentNvdCves } from './fetchers/nvdFetcher'
import { fetchAttackData } from './fetchers/attackFetcher'
import { saveCisaKevData, getCisaKevStats } from './database/cisaKevDb'
import { saveNewsArticles, getNewsStats } from './database/newsDb'
import { saveJvnVulnerabilities, getJvnStats } from './database/jvnDb'
import { saveNvdCves, getNvdStats } from './database/nvdDb'
import { saveAttackTechniques, saveAttackTactics, getAttackStats } from './database/attackDb'

/**
 * Sync CISA KEV data from external API to database
 */
export const syncCisaKevData = async (): Promise<void> => {
  try {
    console.log('⏳ Starting CISA KEV data sync...')
    const vulnerabilities = await fetchCisaKevData()
    await saveCisaKevData(vulnerabilities)
    const stats = await getCisaKevStats()
    console.log(`✅ CISA KEV sync complete: ${stats.total} total, ${stats.last24h} in last 24h`)
  } catch (error) {
    console.error('❌ Failed to sync CISA KEV data:', error)
    throw error
  }
}

/**
 * Sync news articles from RSS feeds to database
 */
export const syncNewsData = async (): Promise<void> => {
  try {
    console.log('⏳ Starting news feed sync...')
    const articles = await fetchAllRssFeeds()
    await saveNewsArticles(articles)
    const stats = await getNewsStats()
    console.log(`✅ News sync complete: ${stats.total} total, ${stats.unread} unread`)
  } catch (error) {
    console.error('❌ Failed to sync news data:', error)
    throw error
  }
}

/**
 * Sync JVN vulnerability data from RSS feeds to database
 */
export const syncJvnData = async (): Promise<void> => {
  try {
    console.log('⏳ Starting JVN vulnerability sync...')
    const vulnerabilities = await fetchJvnVulnerabilities()
    if (vulnerabilities.length > 0) {
      await saveJvnVulnerabilities(vulnerabilities)
    }
    const stats = await getJvnStats()
    console.log(`✅ JVN sync complete: ${stats.total} total, ${stats.recent24h} in last 24h`)
  } catch (error) {
    console.error('❌ Failed to sync JVN data:', error)
    throw error
  }
}

/**
 * Sync NVD CVE data from API to database
 */
export const syncNvdData = async (daysBack: number = 7): Promise<void> => {
  try {
    console.log(`⏳ Starting NVD CVE sync (last ${daysBack} days)...`)
    const cves = await fetchRecentNvdCves(daysBack, 100)
    if (cves.length > 0) {
      await saveNvdCves(cves)
    }
    const stats = await getNvdStats()
    console.log(`✅ NVD sync complete: ${stats.total} total, ${stats.recent24h} in last 24h`)
  } catch (error) {
    console.error('❌ Failed to sync NVD data:', error)
    // Don't throw error for NVD sync failures to avoid blocking other syncs
    console.warn('Continuing with other syncs despite NVD failure...')
  }
}

/**
 * Sync MITRE ATT&CK data from GitHub to database
 */
export const syncAttackData = async (): Promise<void> => {
  try {
    console.log('⏳ Starting MITRE ATT&CK data sync...')
    const { techniques, tactics } = await fetchAttackData()

    if (techniques.length > 0) {
      await saveAttackTechniques(techniques)
    }

    if (tactics.length > 0) {
      await saveAttackTactics(tactics)
    }

    const stats = await getAttackStats()
    console.log(`✅ ATT&CK sync complete: ${stats.totalTechniques} techniques, ${stats.totalTactics} tactics`)
  } catch (error) {
    console.error('❌ Failed to sync ATT&CK data:', error)
    // Don't throw error for ATT&CK sync failures to avoid blocking other syncs
    console.warn('Continuing with other syncs despite ATT&CK failure...')
  }
}

/**
 * Sync all data sources
 */
export const syncAllData = async (): Promise<void> => {
  console.log('🔄 Starting full data sync...')
  const startTime = Date.now()

  try {
    // Run syncs in parallel for better performance
    await Promise.all([
      syncCisaKevData(),
      syncJvnData(),
      syncNvdData(),
      syncAttackData(),
      syncNewsData(),
    ])

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Full sync completed in ${duration}s`)
  } catch (error) {
    console.error('❌ Full sync failed:', error)
    throw error
  }
}

/**
 * Get sync status and statistics
 */
export const getSyncStatus = async () => {
  try {
    const [cisaStats, jvnStats, nvdStats, attackStats, newsStats] = await Promise.all([
      getCisaKevStats(),
      getJvnStats(),
      getNvdStats(),
      getAttackStats(),
      getNewsStats(),
    ])

    return {
      cisaKev: cisaStats,
      jvn: jvnStats,
      nvd: nvdStats,
      attack: attackStats,
      news: newsStats,
      lastSync: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to get sync status:', error)
    throw error
  }
}
