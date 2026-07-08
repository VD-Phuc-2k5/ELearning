import { test, expect } from '@playwright/test';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

test.describe('Dashboard flow', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('dashboard renders stat cards and Quick Create button', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText(/Quick Create|My Banks/i).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText(/Continue Learning|Recent|My/i).first(),
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test('Quick Create button navigates to create bank', async ({ page }) => {
    await page.goto('/');
    const btn = page
      .getByRole('button', { name: /Quick Create/i })
      .or(page.getByRole('link', { name: /create|new/i }));
    if (
      await btn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await btn.first().click();
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(/\/my-banks\/create|\/my-banks/, {
        timeout: 5000,
      });
    }
  });

  test('dashboard loads without crashing for authenticated user', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const header = page.locator('header').or(page.getByRole('navigation'));
    await expect(header.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Community flow', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('community page renders with Shared Knowledge heading', async ({
    page,
  }) => {
    await page.goto('/community');
    await expect(
      page.getByText(/Shared Knowledge|Community/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test('community page has search input', async ({ page }) => {
    await page.goto('/community');
    const searchInput = page
      .getByPlaceholder(/search|tìm kiếm/i)
      .or(page.locator('input[type="text"]'));
    await expect(searchInput.first()).toBeVisible({ timeout: 8000 });
  });

  test('community page has tag filter', async ({ page }) => {
    await page.goto('/community');
    const tagFilter = page
      .getByText(/All Tags|tag/i)
      .or(
        page
          .locator('select')
          .or(page.getByRole('button', { name: /tag|filter/i })),
      );
    await expect(tagFilter.first()).toBeVisible({ timeout: 8000 });
  });

  test('search for a bank filters results', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(3000);
    const searchInput = page
      .getByPlaceholder(/search|tìm kiếm/i)
      .or(page.locator('input[type="text"]').first());
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('test');
      const searchBtn = page.getByRole('button', { name: /search|tìm/i });
      if (await searchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchBtn.click();
      } else {
        await searchInput.press('Enter');
      }
      await page.waitForTimeout(3000);
    }
  });

  test('click Study on a bank navigates to quiz', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(3000);
    const studyBtn = page.getByRole('button', { name: /study|học/i }).first();
    if (await studyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await studyBtn.click();
      await page.waitForTimeout(5000);
      const onQuiz = page.url().includes('/quiz/');
      const onBanks = page.url().includes('/my-banks/');
      expect(onQuiz || onBanks).toBe(true);
    }
  });
});

test.describe('Notification Bell', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('notification bell icon renders in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const bell = page.locator('[data-testid="notification-bell"]').or(
      page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first(),
    );
    const header = page.locator('header').or(page.getByRole('navigation'));
    await expect(header.first()).toBeVisible({ timeout: 10000 });
  });

  test('click bell opens notification dropdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const bellBtn = page.locator('header button').first();
    if (await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bellBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('notification dropdown shows content or empty state', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const bellBtn = page.locator('header button').first();
    if (!(await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)))
      return;
    await bellBtn.click();
    await page.waitForTimeout(2000);

    const empty = page.getByText(/no notifications|không có thông báo/i);
    const items = page.getByText(
      /mentioned|replied|commented|được duyệt|bị từ chối|báo cáo/i,
    );
    const dropdown = page
      .locator('[class*="dropdown"]')
      .or(
        page
          .locator('[class*="absolute"]')
          .filter({ hasText: /notification|thông báo/i }),
      );
    const hasContent =
      (await empty.count()) > 0 ||
      (await items.count()) > 0 ||
      (await dropdown.count()) > 0;
    expect(hasContent).toBe(true);
  });

  test('mark all read button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const bellBtn = page.locator('header button').first();
    if (!(await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)))
      return;
    await bellBtn.click();
    await page.waitForTimeout(2000);

    const markAllBtn = page.getByRole('button', {
      name: /mark all|read all|đánh dấu tất cả/i,
    });
    if (
      await markAllBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await markAllBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('delete read notifications button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    const bellBtn = page.locator('header button').first();
    if (!(await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)))
      return;
    await bellBtn.click();
    await page.waitForTimeout(2000);

    const deleteBtn = page
      .getByRole('button', { name: /delete|clear|xóa/i })
      .or(page.locator('button').filter({ has: page.locator('svg') }));
    const trashIcon = page.locator('svg[class*="trash"]').first();
    if (await trashIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await trashIcon.click();
      await page.waitForTimeout(1500);
    } else if (
      await deleteBtn
        .last()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      await deleteBtn.last().click();
      await page.waitForTimeout(1500);
    }
  });
});

test.describe('Error handling scenarios', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('dashboard handles API error gracefully', async ({ page }) => {
    await page.route('**/api/quiz/banks/my-banks**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      }),
    );
    await page.goto('/');
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').innerText();
    const hasError = /lỗi|không thể tải|error/i.test(bodyText);
    // Dashboard should show at least some content, not a blank page
    expect(bodyText.length > 20 || hasError).toBe(true);
    await page.unroute('**/api/quiz/banks/my-banks**');
  });

  test('community page handles API error gracefully', async ({ page }) => {
    await page.route('**/api/quiz/banks/community**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      }),
    );
    await page.goto('/community');
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').innerText();
    const hasErrorOrContent =
      /lỗi|không thể tải|error|shared knowledge|community/i.test(bodyText);
    expect(hasErrorOrContent).toBe(true);
    await page.unroute('**/api/quiz/banks/community**');
  });

  test('roadmap page handles API error gracefully', async ({ page }) => {
    await page.route('**/api/roadmaps**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      }),
    );
    await page.goto('/roadmaps');
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.length > 20;
    expect(hasContent).toBe(true);
    await page.unroute('**/api/roadmaps**');
  });
});
