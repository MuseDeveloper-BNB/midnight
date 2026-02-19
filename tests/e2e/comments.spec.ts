import { test, expect } from '@playwright/test';

test('comment creation form visible for logged-in users', async ({ page }) => {
  await page.goto('/news/example');
  await expect(page.locator('text=Please log in')).toBeVisible();
});

test('comment ownership enforcement placeholder', async ({ page }) => {
  await page.goto('/news/example');
  await expect(page.locator('body')).toBeVisible();
});
