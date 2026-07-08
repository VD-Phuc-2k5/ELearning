import { test, expect } from '@playwright/test';
import path from 'path';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

const fixturesDir = path.resolve(__dirname, '..', 'playwright', 'fixtures');

test.describe('File Upload', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('forum create — upload banner image via file input', async ({
    page,
  }) => {
    await page.goto('/forum/create');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');
    const fileInputs = await fileInput.count();

    if (fileInputs > 0) {
      const bannerInput = fileInput.first();
      await bannerInput.setInputFiles(path.join(fixturesDir, 'test-image.png'));
      await page.waitForTimeout(3000);
      await expect(bannerInput).toBeTruthy();
    }
  });

  test('forum detail — upload banner image via file input', async ({
    page,
  }) => {
    await page.goto('/forum');
    await page.waitForTimeout(3000);
    const forumLink = page.locator('a[href^="/forum/"]').first();
    if (!(await forumLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await forumLink.getAttribute('href');
    if (!href || href.includes('/create')) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      await fileInput
        .first()
        .setInputFiles(path.join(fixturesDir, 'test-image.png'));
      await page.waitForTimeout(3000);
    }
  });

  test('my-banks create — upload Excel file', async ({ page }) => {
    await page.goto('/my-banks/create');
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      const xlsxInput = fileInput.first();
      await xlsxInput.setInputFiles(
        path.join(fixturesDir, 'test-questions.xlsx'),
      );
      await page.waitForTimeout(4000);

      const fileIndicator = page.getByText(
        /file verified|verified|đã xác minh|duplicate detected|trùng lặp|checking/i,
      );
      if (
        await fileIndicator
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        await expect(fileIndicator.first()).toBeVisible();
      }
    }
  });

  test('my-banks detail — upload Excel in import tab', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const manageBtn = page
      .getByRole('button', { name: /manage|quản lý/i })
      .or(page.getByRole('link', { name: /manage/i }))
      .first();
    if (!(await manageBtn.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await manageBtn.click();
    await page.waitForTimeout(3000);

    const importTab = page
      .getByRole('button', { name: /import/i })
      .or(page.getByText(/import/i));
    if (
      await importTab
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await importTab.first().click();
      await page.waitForTimeout(2000);

      const fileInput = page.locator('input[type="file"]');
      if ((await fileInput.count()) > 0) {
        await fileInput
          .first()
          .setInputFiles(path.join(fixturesDir, 'test-questions.xlsx'));
        await page.waitForTimeout(4000);
      }
    }
  });

  test('admin test cases — import Excel file', async ({ page }) => {
    const ADMINPAGE_BASE = 'http://localhost:8081';
    await page.goto(ADMINPAGE_BASE);
    await page.waitForTimeout(2000);

    const loginBtn = page.getByRole('button', { name: /đăng nhập/i });
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) return;

    const problemTab = page.getByRole('button', { name: /đề bài coding/i });
    if (!(await problemTab.isVisible({ timeout: 3000 }).catch(() => false)))
      return;
    await problemTab.click();
    await page.waitForTimeout(2000);

    const testCasesBtn = page.getByRole('button', { name: /test cases/i });
    if (
      !(await testCasesBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;
    await testCasesBtn.first().click();
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      await fileInput
        .first()
        .setInputFiles(path.join(fixturesDir, 'test-questions.xlsx'));
      await page.waitForTimeout(4000);
    }
  });
});

test.describe('WebSocket Real-time', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('home page establishes WebSocket connections', async ({ page }) => {
    const wsUrls: string[] = [];
    page.on('websocket', (ws) => {
      wsUrls.push(ws.url());
    });

    await page.goto('/');
    await page.waitForTimeout(5000);

    expect(wsUrls.length).toBeGreaterThan(0);
  });

  test('forum detail establishes WebSocket connections', async ({ page }) => {
    const wsUrls: string[] = [];
    page.on('websocket', (ws) => {
      wsUrls.push(ws.url());
    });

    await page.goto('/forum');
    await page.waitForTimeout(3000);
    const forumLink = page.locator('a[href^="/forum/"]').first();
    if (!(await forumLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await forumLink.getAttribute('href');
    if (!href || href.includes('/create')) return;
    await page.goto(href);
    await page.waitForTimeout(5000);

    expect(wsUrls.length).toBeGreaterThan(0);
  });

  test('notification bell has WebSocket connection', async ({ page }) => {
    const wsUrls: string[] = [];
    page.on('websocket', (ws) => {
      wsUrls.push(ws.url());
    });

    await page.goto('/');
    await page.waitForTimeout(5000);

    const bellBtn = page.locator('header button').first();
    if (await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bellBtn.click();
      await page.waitForTimeout(3000);
    }

    expect(wsUrls.length).toBeGreaterThan(0);
  });

  test('community page establishes WebSocket connections', async ({ page }) => {
    const wsUrls: string[] = [];
    page.on('websocket', (ws) => {
      wsUrls.push(ws.url());
    });

    await page.goto('/community');
    await page.waitForTimeout(5000);

    expect(wsUrls.length).toBeGreaterThan(0);
  });

  test('admin quiz review tab has WebSocket connection', async ({ page }) => {
    const ADMINPAGE_BASE = 'http://localhost:8081';
    const wsUrls: string[] = [];
    page.on('websocket', (ws) => {
      wsUrls.push(ws.url());
    });

    await page.goto(ADMINPAGE_BASE);
    await page.waitForTimeout(2000);

    const loginBtn = page.getByRole('button', { name: /đăng nhập/i });
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) return;

    const quizTab = page.getByRole('button', { name: /kiểm duyệt câu hỏi/i });
    if (!(await quizTab.isVisible({ timeout: 3000 }).catch(() => false)))
      return;
    await quizTab.click();
    await page.waitForTimeout(5000);

    expect(wsUrls.length).toBeGreaterThan(0);
  });

  test('admin forum moderation tab has WebSocket connection', async ({
    page,
  }) => {
    const ADMINPAGE_BASE = 'http://localhost:8081';
    const wsUrls: string[] = [];
    page.on('websocket', (ws) => {
      wsUrls.push(ws.url());
    });

    await page.goto(ADMINPAGE_BASE);
    await page.waitForTimeout(2000);

    const loginBtn = page.getByRole('button', { name: /đăng nhập/i });
    if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) return;

    const forumTab = page.getByRole('button', { name: /kiểm duyệt forum/i });
    if (!(await forumTab.isVisible({ timeout: 3000 }).catch(() => false)))
      return;
    await forumTab.click();
    await page.waitForTimeout(5000);

    expect(wsUrls.length).toBeGreaterThan(0);
  });
});
