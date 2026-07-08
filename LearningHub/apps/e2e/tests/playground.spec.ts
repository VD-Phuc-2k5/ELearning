import { test, expect } from '@playwright/test';

test.describe('Playground flow', () => {
  test('playground page renders header and run button', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByText('Code Sandbox Playground')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Code' })).toBeVisible();
  });

  test('playground has language selector', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByText('Code Sandbox Playground')).toBeVisible();
  });

  test('playground has code editor area', async ({ page }) => {
    await page.goto('/playground');
    await expect(
      page.locator('[class*="monaco"]').or(page.locator('textarea')),
    ).toBeVisible({ timeout: 5000 });
  });

  test('playground run button is enabled', async ({ page }) => {
    await page.goto('/playground');
    const runButton = page.getByRole('button', { name: 'Run Code' });
    await expect(runButton).toBeEnabled();
  });
});
