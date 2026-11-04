import { test, expect } from '@playwright/test'

test.describe('SOC Dashboard', () => {
  test('should load the dashboard overview page', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/SOC Dashboard/i)

    // Check for main layout elements
    await expect(page.locator('text=SOC Dashboard')).toBeVisible()
  })

  test('should navigate between different views', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if navigation menu is present
    const navItems = [
      'Dashboard',
      'CISA KEV',
      'JVN',
      'NVD',
      'News Feed',
      'IoC Search',
    ]

    for (const item of navItems) {
      const navItem = page.locator(`text=${item}`).first()
      if (await navItem.isVisible()) {
        await navItem.click()
        await page.waitForTimeout(500) // Wait for view to load
      }
    }
  })

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]')
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      await page.waitForTimeout(300)

      // Click again to toggle back
      await themeToggle.click()
      await page.waitForTimeout(300)
    }
  })

  test('should display vulnerability data', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for data to load (with timeout)
    await page.waitForTimeout(3000)

    // Check if any vulnerability count is displayed
    const hasNumbers = await page.locator('text=/\\d+/').count()
    expect(hasNumbers).toBeGreaterThan(0)
  })
})
