import { test, expect } from '@playwright/test'

const mockUser = {
  id: 1, name: 'Test User', email: 'test@example.com', role: 'candidate',
  phone: null, avatar_url: null, is_active: true,
  created_at: '2026-01-01T00:00:00.000000Z',
}

test.describe('Authentication pages', () => {

  test('login page loads with form elements', async ({ page }) => {
    await page.goto('/login')

    // Card title shows "Sign in"
    await expect(page.locator('.card-title')).toHaveText('Sign in')
    // Form fields exist
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    // Submit button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    // Register link
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible()
  })

  test('login empty submit shows validation errors', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('navigate from login to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /register/i }).click()

    await expect(page).toHaveURL(/\/register/)
    await expect(page.getByLabel(/^name/i)).toBeVisible()
  })

  test('register page loads with form elements', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByLabel(/^name/i)).toBeVisible()
    await expect(page.getByLabel(/^email/i)).toBeVisible()
    await expect(page.getByLabel(/^password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByLabel(/i want to/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    // There are 2 "Sign in" links (nav + page), so use first()
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible()
  })
})
