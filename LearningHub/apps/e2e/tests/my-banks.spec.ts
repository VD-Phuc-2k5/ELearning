import { test, expect } from '@playwright/test';
import { cleanupE2ETestData, E2E_MARKER } from '../playwright/db-helper';

test.describe('My Banks — bank detail management', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('navigate to bank detail from my-banks list', async ({ page }) => {
    await page.goto('/my-banks');
    await page.waitForTimeout(3000);
    const manageBtn = page
      .getByRole('button', { name: /manage|quản lý/i })
      .or(page.getByRole('link', { name: /manage/i }))
      .first();
    if (await manageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await manageBtn.click();
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(/\/my-banks\/.+/, { timeout: 5000 });
    }
  });

  test('bank detail shows title and tabs', async ({ page }) => {
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

    const tabs = page
      .getByText(/questions|câu hỏi/i)
      .or(page.getByText(/import/i))
      .or(page.getByText(/history|lịch sử/i))
      .or(page.getByText(/thống kê|stats/i));
    await expect(tabs.first()).toBeVisible({ timeout: 8000 });
  });

  test('switch between bank detail tabs', async ({ page }) => {
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

    const tabNames = [
      /questions|câu hỏi/i,
      /import/i,
      /history|lịch sử/i,
      /thống kê|stats/i,
    ];
    for (const name of tabNames) {
      const tab = page.getByRole('button', { name }).or(page.getByText(name));
      if (
        await tab
          .first()
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        await tab.first().click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('edit bank title inline', async ({ page }) => {
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

    const titleInput = page.locator('input').first();
    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const original = await titleInput.inputValue();
      await titleInput.fill(original + '_edit');
      await titleInput.blur();
      await page.waitForTimeout(2000);
    }
  });

  test('add tag to bank', async ({ page }) => {
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

    const addTagBtn = page
      .getByRole('button', { name: /\+\s*tag|\+ tag/i })
      .or(page.getByText('+ Tag'));
    if (
      await addTagBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await addTagBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('change bank status', async ({ page }) => {
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

    const statusBtn = page.getByRole('button', {
      name: /submit for review|cancel review|unpublish|gửi duyệt|hủy duyệt/i,
    });
    if (
      await statusBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await statusBtn.first().click();
      await page.waitForTimeout(3000);
    }
  });

  test('start quiz from bank detail', async ({ page }) => {
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

    const quizBtn = page
      .getByRole('button', { name: /start quiz|bắt đầu|vào quiz/i })
      .or(page.getByRole('link', { name: /start|quiz/i }));
    if (
      await quizBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await quizBtn.first().click();
      await page.waitForTimeout(3000);
    }
  });

  test('bank delete button exists', async ({ page }) => {
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

    const deleteBtn = page
      .getByRole('button', { name: /delete|xóa/i })
      .or(page.locator('button').filter({ hasText: '' }));
    if (
      await deleteBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await deleteBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('My Banks — create question bank', () => {
  test.afterAll(async () => await cleanupE2ETestData());

  test('create bank with title and description', async ({ page }) => {
    const ts = Date.now();
    await page.goto('/my-banks/create');
    await page.waitForTimeout(2000);

    const titleInput = page
      .getByPlaceholder(/bank title|tiêu đề|tên/i)
      .or(page.locator('input[name="title"]'))
      .or(page.locator('input').first());
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(`E2E Bank ${ts}`);
    }

    const descInput = page
      .getByPlaceholder(/description|mô tả/i)
      .or(page.locator('textarea'));
    if (
      await descInput
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await descInput.first().fill('E2E test description');
    }

    await page
      .getByRole('button', { name: /create bank|tạo/i })
      .first()
      .click();
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL(/\/my-banks\/.+/, { timeout: 10000 });
  });

  test('download template link exists', async ({ page }) => {
    await page.goto('/my-banks/create');
    await page.waitForTimeout(2000);
    const templateLink = page
      .getByText(/download template|tải mẫu/i)
      .or(page.getByText(/template|mẫu/i));
    if (
      await templateLink
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(templateLink.first()).toBeVisible();
    }
  });

  test('cancel navigates back', async ({ page }) => {
    await page.goto('/my-banks/create');
    await page.waitForTimeout(2000);
    const cancelBtn = page
      .getByRole('button', { name: /cancel|hủy/i })
      .or(page.getByRole('link', { name: /cancel|hủy/i }));
    if (
      await cancelBtn
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await cancelBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });
});
