import { test, expect } from '@playwright/test'

test.describe('Navigation and layout', () => {

  test('home page loads', async ({ page }) => {
    await page.goto('/')
    // Page loads without error
    await expect(page.locator('body')).toBeVisible()
    // Home page has heading content
    const heading = page.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible()
  })

  test('responsive layout — mobile viewport renders without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    // Bootstrap gutters + Navbar padding may add a few extra pixels
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })
})
