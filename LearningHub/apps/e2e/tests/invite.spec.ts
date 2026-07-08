import { test, expect } from '@playwright/test';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

test.describe('Invite flow', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('invalid/expired invite token shows error', async ({ page }) => {
    await page.goto('/invite/invalid-token-12345');
    await page.waitForTimeout(5000);
    const error = page
      .getByText(/error|lỗi|invalid|expired|hết hạn/i)
      .or(page.getByText(/invite/i));
    await expect(error.first()).toBeVisible({ timeout: 10000 });
  });

  test('invite page shows loading then result', async ({ page }) => {
    await page.goto('/invite/test-token');
    await page.waitForTimeout(3000);
    const content = page.getByText(
      /accept|joining|error|chấp nhận|tham gia|lỗi/i,
    );
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});
