import { prisma } from './prismaClient'

/**
 * Get an app setting value by key
 */
export const getAppSetting = async (key: string): Promise<string | null> => {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    })
    return setting?.value || null
  } catch (error) {
    console.error(`Error getting app setting ${key}:`, error)
    return null
  }
}

/**
 * Set an app setting value
 */
export const setAppSetting = async (
  key: string,
  value: string,
  type: 'string' | 'number' | 'boolean' | 'json' = 'string'
): Promise<void> => {
  try {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type },
    })
  } catch (error) {
    console.error(`Error setting app setting ${key}:`, error)
    throw error
  }
}

/**
 * Check if a boolean app setting is true
 */
export const isAppSettingEnabled = async (key: string): Promise<boolean> => {
  const value = await getAppSetting(key)
  return value === 'true' || value === '1'
}

/**
 * Get a numeric app setting
 */
export const getNumericSetting = async (key: string, defaultValue: number = 0): Promise<number> => {
  const value = await getAppSetting(key)
  if (!value) return defaultValue
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

/**
 * Check if initial sync has been completed for a specific data source
 */
export const hasCompletedInitialSync = async (dataSource: string): Promise<boolean> => {
  const key = `initial_sync_completed_${dataSource}`
  return await isAppSettingEnabled(key)
}

/**
 * Mark initial sync as completed for a specific data source
 */
export const markInitialSyncCompleted = async (dataSource: string): Promise<void> => {
  const key = `initial_sync_completed_${dataSource}`
  await setAppSetting(key, 'true', 'boolean')
  console.log(`✅ Marked initial sync as completed for ${dataSource}`)
}

/**
 * Get the last sync timestamp for a data source
 */
export const getLastSyncTimestamp = async (dataSource: string): Promise<Date | null> => {
  const key = `last_sync_${dataSource}`
  const value = await getAppSetting(key)
  return value ? new Date(value) : null
}

/**
 * Update the last sync timestamp for a data source
 */
export const updateLastSyncTimestamp = async (dataSource: string): Promise<void> => {
  const key = `last_sync_${dataSource}`
  await setAppSetting(key, new Date().toISOString(), 'string')
}
