import { test, expect } from '@playwright/test';

test('registration flow loads', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator('text=Register')).toBeVisible();
});

test('login flow loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('text=Login')).toBeVisible();
});
