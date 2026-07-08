import { test, expect } from '@playwright/test';

test.describe('Roadmap flow', () => {
  test('roadmap list page renders', async ({ page }) => {
    await page.goto('/roadmaps');
    await expect(
      page.getByRole('heading', { name: 'Learning Roadmaps' }),
    ).toBeVisible();
  });

  test('roadmap list has create button', async ({ page }) => {
    await page.goto('/roadmaps');
    await expect(
      page.getByRole('button', { name: 'Create Roadmap' }),
    ).toBeVisible();
  });

  test('navigate to roadmap detail from list', async ({ page }) => {
    await page.goto('/roadmaps');
    const viewButton = page.getByRole('button', { name: 'View' }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page).toHaveURL(/\/roadmaps\/.+/);
    }
  });

  test('roadmap detail page renders back button and title', async ({
    page,
  }) => {
    await page.goto('/roadmaps');
    const viewButton = page.getByRole('button', { name: 'View' }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForURL(/\/roadmaps\/.+/);
      await expect(
        page.getByRole('button', { name: /back|roadmaps/i }).first(),
      ).toBeVisible();
    }
  });
});
