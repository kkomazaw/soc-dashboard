import cron from 'node-cron'
import {
  syncAllData,
  syncCisaKevData,
  syncJvnData,
  syncNvdData,
  syncAttackData,
  syncNewsData,
  syncEpssData,
} from './dataSync'

/**
 * Initialize scheduled tasks for automatic data synchronization
 */
export const initializeScheduler = () => {
  console.log('📅 Initializing data sync scheduler...')

  // Sync CISA KEV data every 6 hours
  // Runs at: 00:00, 06:00, 12:00, 18:00
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running scheduled CISA KEV sync...')
    try {
      await syncCisaKevData()
    } catch (error) {
      console.error('Scheduled CISA KEV sync failed:', error)
    }
  })

  // Sync JVN data every 6 hours (offset by 1 hour)
  // Runs at: 01:00, 07:00, 13:00, 19:00
  cron.schedule('0 1,7,13,19 * * *', async () => {
    console.log('⏰ Running scheduled JVN sync...')
    try {
      await syncJvnData()
    } catch (error) {
      console.error('Scheduled JVN sync failed:', error)
    }
  })

  // Sync NVD data every 12 hours (offset by 2 hours)
  // Runs at: 02:00, 14:00
  cron.schedule('0 2,14 * * *', async () => {
    console.log('⏰ Running scheduled NVD sync...')
    try {
      await syncNvdData(7) // Last 7 days
    } catch (error) {
      console.error('Scheduled NVD sync failed:', error)
    }
  })

  // Sync MITRE ATT&CK data once per week
  // Runs at: Every Sunday at 03:00
  cron.schedule('0 3 * * 0', async () => {
    console.log('⏰ Running scheduled ATT&CK sync...')
    try {
      await syncAttackData()
    } catch (error) {
      console.error('Scheduled ATT&CK sync failed:', error)
    }
  })

  // Sync EPSS scores daily
  // Runs at: 04:00 every day
  cron.schedule('0 4 * * *', async () => {
    console.log('⏰ Running scheduled EPSS sync...')
    try {
      await syncEpssData()
    } catch (error) {
      console.error('Scheduled EPSS sync failed:', error)
    }
  })

  // Sync news feeds every 1 hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled news sync...')
    try {
      await syncNewsData()
    } catch (error) {
      console.error('Scheduled news sync failed:', error)
    }
  })

  // Run initial sync on startup (after a short delay)
  setTimeout(async () => {
    console.log('🚀 Running initial data sync on startup...')
    try {
      await syncAllData()
    } catch (error) {
      console.error('Initial sync failed:', error)
    }
  }, 3000) // 3 second delay to allow server to fully start

  console.log('✅ Scheduler initialized:')
  console.log('   - CISA KEV: Every 6 hours (00:00, 06:00, 12:00, 18:00)')
  console.log('   - JVN: Every 6 hours (01:00, 07:00, 13:00, 19:00)')
  console.log('   - NVD: Every 12 hours (02:00, 14:00)')
  console.log('   - MITRE ATT&CK: Weekly (Sunday at 03:00)')
  console.log('   - EPSS: Daily (04:00)')
  console.log('   - News Feed: Every 1 hour (on the hour)')
  console.log('   - Initial sync: Starting in 3 seconds...')
}
