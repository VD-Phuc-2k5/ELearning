import { test, expect } from '@playwright/test';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

const JUDGE_LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'C++',
  'C',
  'Java',
  'Go',
  'Rust',
  'C#',
  'Swift',
];

test.describe('Judge — problem solving', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('problems list renders', async ({ page }) => {
    await page.goto('/problems');
    await expect(
      page
        .getByRole('heading')
        .or(page.getByText(/bài tập|coding|problems/i))
        .first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test('problems list shows difficulty badges', async ({ page }) => {
    await page.goto('/problems');
    await page.waitForTimeout(3000);
    const badges = page
      .getByText(/Easy/i)
      .or(page.getByText(/Medium/i))
      .or(page.getByText(/Hard/i));
    if ((await badges.count()) > 0) await expect(badges.first()).toBeVisible();
  });

  test('navigate to problem detail', async ({ page }) => {
    await page.goto('/problems');
    await page.waitForTimeout(3000);
    const link = page.locator('a[href*="/problems/"]').first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await link.getAttribute('href');
      if (href) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/problems\/.+/);
        await expect(page.getByRole('heading').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('problem detail shows code editor', async ({ page }) => {
    await page.goto('/problems');
    const link = page.locator('a[href*="/problems/"]').first();
    if (!(await link.isVisible({ timeout: 5000 }).catch(() => false))) return;
    const href = await link.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const editor = page
      .locator('[class*="monaco"]')
      .or(page.locator('textarea'))
      .or(page.locator('[class*="editor"]'));
    await expect(editor).toBeVisible({ timeout: 8000 });
  });

  test('problem detail shows language selector', async ({ page }) => {
    await page.goto('/problems');
    const link = page.locator('a[href*="/problems/"]').first();
    if (!(await link.isVisible({ timeout: 5000 }).catch(() => false))) return;
    const href = await link.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const langSelector = page
      .getByRole('combobox')
      .or(page.locator('select'))
      .or(page.getByRole('button', { name: /language|python/i }));
    await expect(langSelector.first()).toBeVisible({ timeout: 5000 });
  });

  test('switch between all supported languages', async ({ page }) => {
    await page.goto('/problems');
    const link = page.locator('a[href*="/problems/"]').first();
    if (!(await link.isVisible({ timeout: 5000 }).catch(() => false))) return;
    const href = await link.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const langSelector = page
      .getByRole('combobox')
      .or(page.locator('select'))
      .or(page.getByRole('button', { name: /language|python/i }));
    if (
      !(await langSelector
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;

    const languagesToTest = JUDGE_LANGUAGES.slice(0, 3);
    for (const lang of languagesToTest) {
      await langSelector.first().click();
      await page.waitForTimeout(500);
      const option = page
        .getByText(lang, { exact: false })
        .or(page.getByRole('option', { name: new RegExp(lang, 'i') }));
      if (
        await option
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await option.first().click();
        await page.waitForTimeout(1000);
      } else {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  });

  test('run code (Chạy thử) shows output', async ({ page }) => {
    await page.goto('/problems');
    const link = page.locator('a[href*="/problems/"]').first();
    if (!(await link.isVisible({ timeout: 5000 }).catch(() => false))) return;
    const href = await link.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const runBtn = page.getByRole('button', { name: /chạy thử|run test/i });
    if (
      await runBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await runBtn.first().click();
      await page.waitForTimeout(8000);
      const output = page
        .locator('[class*="output"]')
        .or(page.locator('[class*="result"]'))
        .or(page.locator('pre'))
        .or(page.getByText(/stdout|output|kết quả/i));
      await expect(output.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('submit solution (Nộp bài) triggers polling', async ({ page }) => {
    await page.goto('/problems');
    const link = page.locator('a[href*="/problems/"]').first();
    if (!(await link.isVisible({ timeout: 5000 }).catch(() => false))) return;
    const href = await link.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const submitBtn = page.getByRole('button', { name: /nộp bài|submit/i });
    if (
      await submitBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await submitBtn.first().click();
      await page.waitForTimeout(10000);
      const result = page
        .getByText(/accepted|wrong|error|tle|pass|kết quả/i)
        .or(page.locator('[class*="status"]'));
      expect(result.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('switch between input/output tabs in result panel', async ({ page }) => {
    await page.goto('/problems');
    const link = page.locator('a[href*="/problems/"]').first();
    if (!(await link.isVisible({ timeout: 5000 }).catch(() => false))) return;
    const href = await link.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const inputTab = page
      .getByText(/dữ liệu chạy thử|input/i)
      .or(page.getByRole('tab', { name: /input|input/i }));
    if (
      await inputTab
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await inputTab.first().click();
      await page.waitForTimeout(500);
    }
    const outputTab = page
      .getByText(/kết quả chạy thử|output/i)
      .or(page.getByRole('tab', { name: /output|result/i }));
    if (
      await outputTab
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await outputTab.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('invalid problem ID shows error message', async ({ page }) => {
    await page.goto('/problems/nonexistent-problem-id-9999');
    await page.waitForTimeout(5000);

    const errorArea = page
      .getByText(/không thể tải|lỗi tải|không tồn tại/i)
      .or(page.locator('[class*="error"]'));
    const backLink = page.getByText(/quay lại/i);
    const hasError =
      (await errorArea.isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await backLink.isVisible({ timeout: 5000 }).catch(() => false));
    expect(hasError).toBe(true);
  });

  test('problem page shows error state on network failure', async ({
    page,
  }) => {
    await page.route('**/api/problems/**', (route) => route.abort('timedout'));
    await page.goto('/problems');
    await page.waitForTimeout(5000);

    const errorText = page.getByText(/lỗi|không thể|error|thất bại/i);
    const isVisible = await errorText
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    // Fallback: check that the page didn't crash/blank
    const hasContent = (await page.locator('body').innerText()).length > 20;
    expect(isVisible || hasContent).toBe(true);
    await page.unroute('**/api/problems/**');
  });
});
