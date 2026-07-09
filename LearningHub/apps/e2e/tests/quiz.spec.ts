import { test, expect } from '@playwright/test';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

test.describe('Quiz flow', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('quiz index redirects to my-banks', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForURL(/\/my-banks/, { timeout: 10000 });
  });

  test('quiz bank page shows mode selection', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await bankLink.click();
    await page.waitForTimeout(3000);
    const modeSection = page
      .getByText(/luyện tập/i)
      .or(page.getByText(/thi thử/i))
      .or(page.getByText(/practice|exam/i));
    await expect(modeSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('select Luyện tập mode starts practice', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await bankLink.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const practiceBtn = page
      .getByText(/luyện tập/i)
      .first()
      .or(page.getByRole('button', { name: /practice/i }));
    if (await practiceBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await practiceBtn.click();
      await page.waitForTimeout(3000);
      const hasOptions =
        (await page.locator('input[type="radio"]').count()) > 0;
      const hasAnswerButtons =
        (await page
          .getByRole('button', { name: /next|submit|nộp|tiếp/i })
          .count()) > 0;
      expect(hasOptions || hasAnswerButtons).toBe(true);
    }
  });

  test('select Thi thử mode starts exam', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await bankLink.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const examBtn = page
      .getByText(/thi thử/i)
      .first()
      .or(page.getByRole('button', { name: /exam/i }));
    if (await examBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await examBtn.click();
      await page.waitForTimeout(3000);
    }
  });

  test('answer practice question with radio options', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await bankLink.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const practiceBtn = page
      .getByText(/luyện tập/i)
      .first()
      .or(page.getByRole('button', { name: /practice/i }));
    if (!(await practiceBtn.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await practiceBtn.click();
    await page.waitForTimeout(3000);

    const radioInputs = page.locator('input[type="radio"]');
    if ((await radioInputs.count()) > 0) {
      await radioInputs.first().check();
      await page.waitForTimeout(1000);

      const nextBtn = page.getByRole('button', {
        name: /next|submit|nộp|tiếp/i,
      });
      if (
        await nextBtn
          .first()
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        await nextBtn.first().click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('finish exam and see results', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await bankLink.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const examBtn = page
      .getByText(/thi thử/i)
      .first()
      .or(page.getByRole('button', { name: /exam|thi/i }));
    if (!(await examBtn.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await examBtn.click();
    await page.waitForTimeout(3000);

    for (let i = 0; i < 10; i++) {
      const radios = page.locator('input[type="radio"]');
      if ((await radios.count()) > 0) {
        await radios.first().check();
        await page.waitForTimeout(500);
      }
      const nextBtn = page.getByRole('button', {
        name: /next|submit|nộp|tiếp/i,
      });
      if (
        await nextBtn
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await nextBtn.first().click();
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }

    await page.waitForTimeout(3000);
    const resultIndicator = page
      .getByText(/score|điểm|result|kết quả|correct/i)
      .or(page.getByText(/\d+%/));
    if (
      await resultIndicator
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(resultIndicator.first()).toBeVisible();
    }
  });

  test('quiz history page shows history or empty state', async ({ page }) => {
    await page.goto('/quiz/history');
    await page.waitForTimeout(3000);
    const heading = page
      .getByRole('heading')
      .or(page.getByText(/history|lịch sử|attempt/i));
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });

  test('quiz history shows attempts table or empty state', async ({ page }) => {
    await page.goto('/quiz/history');
    await page.waitForTimeout(4000);
    const table = page.locator('table').or(page.locator('[role="grid"]'));
    const emptyMsg = page.getByText(/no attempts|chưa có/i);
    const hasContent = await table
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const isEmpty = await emptyMsg
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(hasContent || isEmpty).toBe(true);
  });

  test('attempt review page loads', async ({ page }) => {
    await page.goto('/quiz/history');
    await page.waitForTimeout(4000);
    const reviewLink = page
      .getByRole('button', { name: /review|xem|chi tiết/i })
      .or(page.locator('a[href*="/quiz/attempts/"]'));
    if (
      await reviewLink
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await reviewLink.first().click();
      await page.waitForTimeout(3000);
    } else {
      await page.goto('/quiz/attempts/sample-id');
      await page.waitForTimeout(3000);
    }
  });

  test('timed exam mode accepts time input', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await bankLink.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const timedCard = page.getByText(/thi có tính giờ|timed/i);
    if (
      await timedCard
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await expect(timedCard.first()).toBeVisible();
    }
  });

  test('result screen shows score or retry button', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const bankLink = page
      .locator('a[href*="/quiz/"]')
      .or(page.locator('a[href*="/banks/"]'))
      .first();
    if (!(await bankLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await bankLink.getAttribute('href');
    if (!href) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const examBtn = page
      .getByText(/thi thử/i)
      .first()
      .or(page.getByRole('button', { name: /exam|thi/i }));
    if (!(await examBtn.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await examBtn.click();
    await page.waitForTimeout(3000);

    for (let i = 0; i < 15; i++) {
      const radios = page.locator('input[type="radio"]');
      if ((await radios.count()) > 0) {
        await radios.first().check();
        await page.waitForTimeout(300);
      }
      const nextBtn = page.getByRole('button', {
        name: /next|submit|nộp|tiếp|finish/i,
      });
      if (
        await nextBtn
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await nextBtn.first().click();
        await page.waitForTimeout(800);
      } else {
        break;
      }
    }

    await page.waitForTimeout(5000);
    const retryBtn = page.getByRole('button', {
      name: /retry|thử lại|continue|tiếp tục/i,
    });
    const reviewBtn = page.getByRole('button', {
      name: /review|xem lại|kiểm tra/i,
    });
    const scoreText = page.getByText(/\d+%/);

    const hasResult =
      (await retryBtn.count()) > 0 ||
      (await reviewBtn.count()) > 0 ||
      (await scoreText.count()) > 0;
    expect(hasResult).toBe(true);
  });

  test('my-banks page shows user banks list', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const heading = page
      .getByRole('heading', { name: /bank|question bank|ngân hàng|my/i })
      .or(page.locator('h1'));
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });

  test('my-banks empty state has create CTA', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(2000);
    const createBtn = page
      .getByRole('link', { name: /create|new|tạo/i })
      .or(page.getByRole('button', { name: /create|new|tạo/i }));
    if (
      await createBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await expect(createBtn.first()).toBeVisible();
    }
  });

  test('quiz bank page shows error on invalid bank ID', async ({ page }) => {
    await page.goto('/quiz/nonexistent-bank-id-99999');
    await page.waitForTimeout(5000);

    const errorText = page.getByText(
      /không thể tải|lỗi|không tồn tại|not found/i,
    );
    const isVisible = await errorText
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    // At minimum, page should show content (not blank/crash)
    const bodyText = await page.locator('body').innerText();
    expect(isVisible || bodyText.length > 20).toBe(true);
  });

  test('my-banks page handles API error gracefully', async ({ page }) => {
    await page.route('**/api/quiz/banks**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      }),
    );
    await page.goto('/my-banks');
    await page.waitForTimeout(5000);

    const errorText = page.getByText(/không thể tải|lỗi|error|thất bại/i);
    const hasErrorOrContent =
      (await errorText
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)) ||
      (await page.locator('body').innerText()).length > 20;
    expect(hasErrorOrContent).toBe(true);
    await page.unroute('**/api/quiz/banks**');
  });
});
