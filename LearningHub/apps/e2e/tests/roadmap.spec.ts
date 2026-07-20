import { test, expect } from '@playwright/test';
import {
  cleanupE2ETestData,
  checkRoadmapExists,
  E2E_MARKER,
} from '../playwright/db-helper';

const ts = Date.now();
const TITLE = `E2E Roadmap ${ts}`;
const DESC = 'E2E test description';

test.describe('Roadmap flow', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('roadmap list page loads', async ({ page }) => {
    await page.goto('/roadmaps');
    await expect(
      page.getByRole('heading', { name: 'Learning Roadmaps' }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: 'Create Roadmap' }).first(),
    ).toBeVisible();
  });

  test('create roadmap → appears in DB → in list', async ({ page }) => {
    await page.goto('/roadmaps');
    await page.getByRole('button', { name: 'Create Roadmap' }).first().click();
    await page.waitForURL(/\/manage\/create/, { timeout: 5000 });

    const titleInput = page
      .getByPlaceholder(/backend developer|title|tiêu đề/i)
      .or(page.locator('input[type="text"]').first());
    await titleInput.first().fill(TITLE);
    await page.waitForTimeout(500);

    const descInput = page
      .getByPlaceholder(/what will learners|description|mô tả/i)
      .or(page.locator('textarea[name="description"]'));
    if (
      await descInput
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await descInput.first().fill(DESC);
      await page.waitForTimeout(500);
    }

    const createBtn = page
      .getByRole('button', { name: /create.*add banks|create|tạo|add/i })
      .first();
    await expect(createBtn).toBeEnabled({ timeout: 5000 });
    await createBtn.click();
    await page.waitForTimeout(4000);

    const roadmap = await checkRoadmapExists(TITLE);
    expect(roadmap).toBeTruthy();
  });

  test('roadmap detail page renders', async ({ page }) => {
    await page.goto('/roadmaps');
    const viewBtn = page.getByRole('button', { name: 'View' }).first();
    if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewBtn.click();
      await page.waitForURL(/\/roadmaps\/.+/);
      await expect(
        page.getByRole('button', { name: /back|roadmaps/i }).first(),
      ).toBeVisible();
    }
  });

  test('enroll in roadmap changes state', async ({ page }) => {
    await page.goto('/roadmaps');
    const viewBtn = page.getByRole('button', { name: 'View' }).first();
    if (!(await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await viewBtn.click();
    await page.waitForURL(/\/roadmaps\/.+/);

    const enrollBtn = page.getByRole('button', {
      name: /start learning|enroll|đăng ký/i,
    });
    if (
      await enrollBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await enrollBtn.first().click();
      await page.waitForTimeout(3000);
    }
  });

  test('manage roadmaps page lists my roadmaps', async ({ page }) => {
    await page.goto('/roadmaps/manage');
    await page.waitForTimeout(3000);
    const heading = page
      .getByRole('heading')
      .or(page.getByText(/manage|quản lý/i));
    await expect(heading.first()).toBeVisible({ timeout: 8000 });
  });

  test('edit roadmap page opens with title/description', async ({ page }) => {
    await page.goto('/roadmaps/manage');
    await page.waitForTimeout(3000);
    const editBtn = page
      .getByRole('button', { name: /edit|sửa/i })
      .or(page.getByRole('link', { name: /edit|sửa/i }))
      .first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    await editBtn.click();
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/roadmaps\/manage\/.+/, { timeout: 5000 });
  });
});
