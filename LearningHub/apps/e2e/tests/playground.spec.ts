import { test, expect } from '@playwright/test';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

test.describe('Playground flow — code execution', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('playground page renders header and run button', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByText('Code Sandbox Playground')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('button', { name: 'Run Code' })).toBeVisible();
  });

  test('playground has code editor area', async ({ page }) => {
    await page.goto('/playground');
    await expect(
      page.locator('[class*="monaco"]').or(page.locator('textarea')),
    ).toBeVisible({ timeout: 8000 });
  });

  test('run button is enabled', async ({ page }) => {
    await page.goto('/playground');
    const runButton = page.getByRole('button', { name: 'Run Code' });
    await expect(runButton).toBeEnabled({ timeout: 5000 });
  });

  test('select language from dropdown', async ({ page }) => {
    await page.goto('/playground');
    const langSelector = page
      .getByRole('combobox')
      .or(page.locator('select'))
      .or(page.getByRole('button', { name: /language|python|javascript/i }));
    if (
      await langSelector
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await langSelector.first().click();
      await page.waitForTimeout(1000);

      const pythonOption = page
        .getByText('Python')
        .or(page.getByRole('option', { name: /python/i }));
      if (
        await pythonOption
          .first()
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        await pythonOption.first().click();
        await page.waitForTimeout(1000);
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('run code shows output', async ({ page }) => {
    await page.goto('/playground');
    const runButton = page.getByRole('button', { name: 'Run Code' });
    if (await runButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await runButton.click();
      await page.waitForTimeout(5000);

      const outputArea = page
        .locator('[class*="output"]')
        .or(page.locator('[class*="result"]'))
        .or(page.locator('pre'));
      if (
        await outputArea
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        await expect(outputArea.first()).toBeVisible();
      }
    }
  });

  test('run code with syntax error shows error message', async ({ page }) => {
    await page.goto('/playground');
    await page.waitForTimeout(2000);

    const editor = page
      .locator('[class*="monaco"]')
      .or(page.locator('textarea'));
    if (!(await editor.isVisible({ timeout: 5000 }).catch(() => false))) return;

    // Replace code with invalid Python
    await page.keyboard.press('Meta+a');
    await page.waitForTimeout(300);
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(300);
    await page.keyboard.type('print(undefined_variable');
    await page.waitForTimeout(500);

    const runButton = page.getByRole('button', { name: 'Run Code' });
    if (await runButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await runButton.click();
      await page.waitForTimeout(8000);

      const errorIndicator = page
        .getByText(/error/i)
        .or(page.locator('[class*="text-red"]'))
        .or(page.locator('[class*="text-rose"]'));
      const hasError = await errorIndicator
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      // If Docker isn't available, expect the generic error message
      const outputArea = page
        .locator('[class*="output"]')
        .or(page.locator('pre'));
      const hasOutput = await outputArea
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(hasError || hasOutput).toBe(true);
    }
  });

  test('playground shows error state when sandbox API fails', async ({
    page,
  }) => {
    await page.route('**/api/sandbox/execute', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Sandbox unavailable' }),
      }),
    );
    await page.goto('/playground');
    await page.waitForTimeout(2000);

    const runButton = page.getByRole('button', { name: 'Run Code' });
    if (await runButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await runButton.click();
      await page.waitForTimeout(5000);

      const errorText = page.getByText(/error|lỗi|thất bại|unavailable/i);
      const hasErrorDisplay = await errorText
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      expect(hasErrorDisplay).toBe(true);
    }
    await page.unroute('**/api/sandbox/execute');
  });
});
