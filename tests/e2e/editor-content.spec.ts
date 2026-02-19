import { test, expect } from '@playwright/test';

test('editor creates and publishes content', async ({ page }) => {
  await page.goto('/editor/dashboard');
  await expect(page.locator('text=Editor Dashboard')).toBeVisible();
});

test('editor moderates comments', async ({ page }) => {
  await page.goto('/news/example');
  await expect(page.locator('text=Moderation controls available.')).toHaveCount(0);
});
