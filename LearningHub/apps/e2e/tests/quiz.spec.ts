import { test, expect } from '@playwright/test';

test.describe('Quiz flow', () => {
  test('quiz page loads with mode selection', async ({ page }) => {
    await page.goto('/quiz/sample-bank-id');
    await expect(page.getByText('Loading...')).toBeVisible();
  });

  test('quiz page shows mode options after load', async ({ page }) => {
    await page.goto('/quiz/sample-bank-id');
    await page.waitForTimeout(3000);
    await expect(page.getByText('Luyện tập').first()).toBeVisible();
    await expect(page.getByText('Thi thử').first()).toBeVisible();
  });
});
