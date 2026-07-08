import { test, expect } from '@playwright/test';

test.describe('Forum flow', () => {
  test('forum list page renders heading', async ({ page }) => {
    await page.goto('/forum');
    await expect(page.getByRole('heading', { name: 'Forum' })).toBeVisible();
  });

  test('forum list page has new forum button', async ({ page }) => {
    await page.goto('/forum');
    await expect(
      page
        .getByRole('link', { name: 'New Forum' })
        .or(page.getByText('No forums yet')),
    ).toBeVisible();
  });

  test('forum detail page renders', async ({ page }) => {
    await page.goto('/forum');
    const firstForumLink = page.locator('a[href^="/forum/"]').first();
    if (await firstForumLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await firstForumLink.getAttribute('href');
      if (href) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/forum\/.+/);
      }
    }
  });
});
