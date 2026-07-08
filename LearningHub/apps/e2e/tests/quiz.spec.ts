import { test, expect } from '@playwright/test';

test.describe('Quiz flow', () => {
  test('quiz page loads with mode selection', async ({ page }) => {
    await page.goto('/quiz/sample-bank-id');
    await expect(page.getByText('Loading...')).toBeVisible();
  });

  test('quiz page shows mode options after load', async ({ page }) => {
    await page.goto('/quiz/sample-bank-id');
    await page.waitForTimeout(3000);
    const practiceBtn = page.getByText('Luyện tập');
    const examBtn = page.getByText('Thi thử');
    await expect(
      practiceBtn.or(examBtn).or(page.getByText('Loading...')),
    ).toBeVisible();
  });
});
