/**
 * Desktop Notification Service for SOC Dashboard
 * Provides real-time alerts for critical security events
 */

export type NotificationPreferences = {
  enabled: boolean
  cisaKev: boolean
  criticalCves: boolean
  highCves: boolean
  securityNews: boolean
  soundEnabled: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  cisaKev: true,
  criticalCves: true,
  highCves: true,
  securityNews: false,
  soundEnabled: true,
}

const STORAGE_KEY = 'soc-dashboard-notification-prefs'
const LAST_CHECK_KEY = 'soc-dashboard-last-check'

/**
 * Check if browser supports notifications
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window
}

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

/**
 * Get notification preferences from localStorage
 */
export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error)
  }
  return DEFAULT_PREFERENCES
}

/**
 * Save notification preferences to localStorage
 */
export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error('Error saving notification preferences:', error)
  }
}

/**
 * Get last check timestamp
 */
export const getLastCheckTime = (): Date => {
  try {
    const stored = localStorage.getItem(LAST_CHECK_KEY)
    if (stored) {
      return new Date(stored)
    }
  } catch (error) {
    console.error('Error loading last check time:', error)
  }
  return new Date(Date.now() - 24 * 60 * 60 * 1000) // Default to 24 hours ago
}

/**
 * Update last check timestamp
 */
export const updateLastCheckTime = (): void => {
  try {
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
  } catch (error) {
    console.error('Error updating last check time:', error)
  }
}

/**
 * Show a desktop notification
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  const permission = getNotificationPermission()

  if (permission !== 'granted') {
    return
  }

  const prefs = getNotificationPreferences()
  if (!prefs.enabled) {
    return
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options,
    })

    // Play sound if enabled
    if (prefs.soundEnabled) {
      playNotificationSound()
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)

    // Handle click to focus window
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

/**
 * Play notification sound
 */
const playNotificationSound = (): void => {
  try {
    // Using a subtle notification sound (system default)
    const audio = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRh')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore audio play errors (browser restrictions)
    })
  } catch (error) {
    // Ignore sound errors
  }
}

/**
 * Notify about new CISA KEV vulnerabilities
 */
export const notifyCisaKev = async (count: number, latestCve: string): Promise<void> => {
  const prefs = getNotificationPreferences()
  if (!prefs.cisaKev || !prefs.enabled) return

  await showNotification('🚨 New CISA KEV Alert', {
    body: `${count} new exploited ${count === 1 ? 'vulnerability' : 'vulnerabilities'} detected!\nLatest: ${latestCve}`,
    tag: 'cisa-kev',
    icon: '/favicon.ico',
  })
}

/**
 * Notify about critical CVE
 */
export const notifyCriticalCve = async (
  cveId: string,
  description: string,
  cvssScore?: number
): Promise<void> => {
  const prefs = getNotificationPreferences()
  if (!prefs.criticalCves || !prefs.enabled) return

  const scoreText = cvssScore ? ` (CVSS ${cvssScore})` : ''

  await showNotification(`🔴 Critical Vulnerability${scoreText}`, {
    body: `${cveId}\n${description.substring(0, 100)}...`,
    tag: `cve-${cveId}`,
    icon: '/favicon.ico',
  })
}

/**
 * Notify about high severity CVE
 */
export const notifyHighCve = async (
  cveId: string,
  description: string,
  cvssScore?: number
): Promise<void> => {
  const prefs = getNotificationPreferences()
  if (!prefs.highCves || !prefs.enabled) return

  const scoreText = cvssScore ? ` (CVSS ${cvssScore})` : ''

  await showNotification(`🟠 High Severity Vulnerability${scoreText}`, {
    body: `${cveId}\n${description.substring(0, 100)}...`,
    tag: `cve-${cveId}`,
    icon: '/favicon.ico',
  })
}

/**
 * Notify about important security news
 */
export const notifySecurityNews = async (title: string, source: string): Promise<void> => {
  const prefs = getNotificationPreferences()
  if (!prefs.securityNews || !prefs.enabled) return

  await showNotification('📰 Security News Alert', {
    body: `${source}: ${title.substring(0, 100)}...`,
    tag: 'security-news',
    icon: '/favicon.ico',
  })
}

/**
 * Test notification (for settings page)
 */
export const sendTestNotification = async (): Promise<void> => {
  // Direct test without going through showNotification to get better errors
  const permission = getNotificationPermission()

  if (permission !== 'granted') {
    throw new Error('Notification permission not granted')
  }

  const prefs = getNotificationPreferences()
  if (!prefs.enabled) {
    throw new Error('Notifications are disabled in preferences')
  }

  try {
    // Create notification without icon to avoid path issues
    const notification = new Notification('✅ Test Notification', {
      body: 'Your SOC Dashboard notifications are working correctly!',
      tag: 'test',
      requireInteraction: false,
    })

    // Play sound if enabled
    if (prefs.soundEnabled) {
      try {
        playNotificationSound()
      } catch (soundError) {
        // Ignore sound errors
      }
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)

    // Handle click to focus window
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch (error) {
    console.error('Failed to create notification:', error)
    throw error
  }
}
