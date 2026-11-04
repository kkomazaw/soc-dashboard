import { test, expect } from '@playwright/test'

test.describe('Vulnerability Pages', () => {
  test('should load CISA KEV page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to CISA KEV
    const cisaLink = page.locator('text=CISA KEV').first()
    if (await cisaLink.isVisible()) {
      await cisaLink.click()
      await page.waitForTimeout(1000)

      // Check if vulnerability table or list is present
      const hasContent = await page.locator('table, [role="list"]').count()
      expect(hasContent).toBeGreaterThan(0)
    }
  })

  test('should load JVN page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to JVN
    const jvnLink = page.locator('text=JVN').first()
    if (await jvnLink.isVisible()) {
      await jvnLink.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should load NVD page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to NVD
    const nvdLink = page.locator('text=NVD').first()
    if (await nvdLink.isVisible()) {
      await nvdLink.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('CVE-2024')
      await page.waitForTimeout(500)

      // Clear search
      await searchInput.clear()
    }
  })
})
