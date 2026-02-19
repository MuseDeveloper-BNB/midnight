import { test, expect } from '@playwright/test';

test('homepage displays published news', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Midnight News/i);
});

test('news detail page loads', async ({ page }) => {
  await page.goto('/news/example');
  await expect(page.locator('body')).toBeVisible();
});

test('blog list page loads', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('body')).toBeVisible();
});

test('draft content not visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Draft')).toHaveCount(0);
});
