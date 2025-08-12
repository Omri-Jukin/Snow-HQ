import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Payload Blank Template/)

    const heading = page.locator('h1').first()

    await expect(heading).toBeVisible()
  })

  test('has hub navigation links', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page.locator('a', { hasText: 'Demo' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Templates' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Docs' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Examples' })).toBeVisible()
    await expect(page.locator('a', { hasText: 'Pricing' })).toBeVisible()
  })

  test('templates page renders', async ({ page }) => {
    await page.goto('http://localhost:3000/templates')
    await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible()
  })
})
