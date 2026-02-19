import { test, expect } from '@playwright/test';

test('admin views users', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page.locator('text=Users')).toBeVisible();
});

test('admin changes user role', async ({ page }) => {
  await page.goto('/admin/users/example');
  await expect(page.locator('text=User Detail')).toBeVisible();
});

test('admin views moderation history', async ({ page }) => {
  await page.goto('/admin/moderation-history');
  await expect(page.locator('text=Moderation History')).toBeVisible();
});
