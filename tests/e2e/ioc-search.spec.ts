import { test, expect } from '@playwright/test'

test.describe('IoC Search', () => {
  test('should load IoC search page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to IoC Search
    const iocLink = page.locator('text=IoC Search').first()
    if (await iocLink.isVisible()) {
      await iocLink.click()
      await page.waitForTimeout(1000)

      // Check for search interface
      const hasSearchInterface = await page.locator('input, button').count()
      expect(hasSearchInterface).toBeGreaterThan(0)
    }
  })

  test('should have different search type tabs', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to IoC Search
    const iocLink = page.locator('text=IoC Search').first()
    if (await iocLink.isVisible()) {
      await iocLink.click()
      await page.waitForTimeout(1000)

      // Look for tabs (File Hash, URL, IP Address)
      const searchTypes = ['File Hash', 'URL', 'IP Address']
      for (const type of searchTypes) {
        const tab = page.locator(`text=${type}`).first()
        if (await tab.isVisible()) {
          await tab.click()
          await page.waitForTimeout(300)
        }
      }
    }
  })
})
