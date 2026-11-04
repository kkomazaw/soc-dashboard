import { useState, useEffect } from 'react'
import { Bell, BellOff, X, Settings } from 'lucide-react'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences,
  sendTestNotification,
  type NotificationPreferences,
} from '@/services/notificationService'

export const NotificationBanner = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>(getNotificationPreferences())

  useEffect(() => {
    if (isNotificationSupported()) {
      const currentPermission = getNotificationPermission()
      setPermission(currentPermission)

      // Show banner if permission is default (not asked yet)
      if (currentPermission === 'default') {
        setShowBanner(true)
      }
    }
  }, [])

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)

    if (result === 'granted') {
      setShowBanner(false)
      // Send a test notification
      await sendTestNotification()
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  const handleToggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    saveNotificationPreferences(newPrefs)
  }

  const handleTestNotification = async () => {
    try {
      await sendTestNotification()
      alert('✅ Test notification sent! Check your desktop for the notification.')
    } catch (error: any) {
      console.error('Test notification error:', error)
      const errorMessage = error?.message || 'Unknown error'
      alert(`Failed to send test notification:\n\n${errorMessage}\n\nDetails in browser console (F12).`)
    }
  }

  if (!isNotificationSupported()) {
    return null
  }

  return (
    <>
      {/* Permission Request Banner */}
      {showBanner && permission === 'default' && (
        <div className="bg-blue-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <p className="font-medium">Enable Desktop Notifications</p>
                <p className="text-sm text-blue-100">Get real-time alerts for critical vulnerabilities and security events</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-white text-blue-600 rounded font-medium hover:bg-blue-50 transition-colors"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-blue-700 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Toggle */}
      {permission === 'granted' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleToggleSettings}
            className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            aria-label="Notification Settings"
          >
            {preferences.enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && permission === 'granted' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Settings
                </h3>
                <button
                  onClick={handleToggleSettings}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Master Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Enable Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Master switch for all notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.enabled}
                      onChange={(e) => handlePreferenceChange('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Individual Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">CISA KEV Alerts</label>
                    <input
                      type="checkbox"
                      checked={preferences.cisaKev}
                      onChange={(e) => handlePreferenceChange('cisaKev', e.target.checked)}
                      disabled={!preferences.enabled}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Critical CVEs (CVSS 9.0+)</label>
                    <input
                      type="checkbox"
                      checked={preferences.criticalCves}
                      onChange={(e) => handlePreferenceChange('criticalCves', e.target.checked)}
                      disabled={!preferences.enabled}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">High Severity CVEs (CVSS 7.0-8.9)</label>
                    <input
                      type="checkbox"
                      checked={preferences.highCves}
                      onChange={(e) => handlePreferenceChange('highCves', e.target.checked)}
                      disabled={!preferences.enabled}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Security News</label>
                    <input
                      type="checkbox"
                      checked={preferences.securityNews}
                      onChange={(e) => handlePreferenceChange('securityNews', e.target.checked)}
                      disabled={!preferences.enabled}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Sound Alerts</label>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                      disabled={!preferences.enabled}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Test Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleTestNotification}
                    disabled={!preferences.enabled}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Send Test Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
