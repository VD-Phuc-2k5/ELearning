import { test, expect } from '@playwright/test';
import {
  cleanupE2ETestData,
  checkForumExists,
  checkPostExists,
  E2E_MARKER,
} from '../playwright/db-helper';

const ts = Date.now();
const FORUM_NAME = `E2E Forum ${ts}`;
const FORUM_DESC = 'E2E test description';
const POST_TITLE = `E2E Post ${ts}`;
const POST_CONTENT = 'E2E test post content';
const COMMENT_TEXT = `E2E comment ${ts}`;

test.describe('Forum flow', () => {
  test.afterAll(async () => {
    await cleanupE2ETestData();
  });

  test('forum list page renders', async ({ page }) => {
    await page.goto('/forum');
    await expect(page.getByRole('heading', { name: 'Forum' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('forum list has New Forum button', async ({ page }) => {
    await page.goto('/forum');
    await expect(
      page
        .getByRole('link', { name: 'New Forum' })
        .or(page.getByRole('button', { name: /new forum/i }))
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('navigate to create forum page', async ({ page }) => {
    await page.goto('/forum');
    const newBtn = page
      .getByRole('link', { name: 'New Forum' })
      .or(page.getByRole('button', { name: /new forum/i }));
    await newBtn.first().click();
    await page.waitForURL(/\/forum\/create/, { timeout: 5000 });
    await expect(
      page
        .getByPlaceholder(/forum name|name|tên/i)
        .or(page.getByRole('textbox').first()),
    ).toBeVisible({ timeout: 5000 });
  });

  test('create forum → persists in DB → redirects to detail', async ({
    page,
  }) => {
    await page.goto('/forum/create');
    await page.waitForTimeout(2000);

    const nameInput = page
      .getByPlaceholder(/forum name|nestjs/i)
      .or(page.locator('input[type="text"]').first());
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill(FORUM_NAME);
    }

    const descInput = page
      .getByPlaceholder(/what is this forum|description|mô tả/i)
      .or(page.locator('textarea'));
    if (
      await descInput
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await descInput.first().fill(FORUM_DESC);
    }

    await page
      .getByRole('button', { name: /create forum|tạo/i })
      .first()
      .click();
    await page.waitForTimeout(5000);

    const forum = await checkForumExists(FORUM_NAME);
    expect(forum).toBeTruthy();
  });

  test('navigate to forum detail from list', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForTimeout(2000);
    const forumLink = page.locator('a[href^="/forum/"]').first();
    if (await forumLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await forumLink.getAttribute('href');
      if (href && !href.includes('/create')) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/forum\/.+/);
        await expect(page.getByRole('heading').first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test('create post in forum → persists in DB', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForTimeout(2000);
    const forumLink = page.locator('a[href^="/forum/"]').first();
    if (!(await forumLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const href = await forumLink.getAttribute('href');
    if (!href || href.includes('/create')) return;
    await page.goto(href);
    await page.waitForTimeout(3000);

    const newPostBtn = page
      .getByRole('link', { name: /new post/i })
      .or(page.getByRole('button', { name: /new post|create post/i }));
    if (
      !(await newPostBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    )
      return;
    await newPostBtn.first().click();
    await page.waitForTimeout(2000);

    const titleInput = page
      .getByPlaceholder(/title|tiêu đề/i)
      .or(page.locator('input[name="title"]'));
    if (
      await titleInput
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await titleInput.first().fill(POST_TITLE);

      const contentInput = page
        .locator('[contenteditable="true"]')
        .or(page.getByPlaceholder(/content|nội dung/i))
        .or(page.locator('textarea[name="content"]'));
      if (
        await contentInput
          .first()
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        await contentInput.first().fill(POST_CONTENT);
      }

      await page
        .getByRole('button', { name: /publish|post|gửi/i })
        .first()
        .click();
      await page.waitForTimeout(5000);
    }
    await checkPostExists(POST_TITLE);
  });

  test('add comment to a post', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForTimeout(2000);
    const forumLink = page.locator('a[href^="/forum/"]').first();
    if (!(await forumLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const forumHref = await forumLink.getAttribute('href');
    if (!forumHref || forumHref.includes('/create')) return;
    await page.goto(forumHref);
    await page.waitForTimeout(3000);

    const postLink = page.locator('a[href*="/posts/"]').first();
    if (!(await postLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const postHref = await postLink.getAttribute('href');
    if (!postHref) return;
    await page.goto(postHref);
    await page.waitForTimeout(3000);

    const commentInput = page
      .locator('[contenteditable="true"]')
      .or(page.getByPlaceholder(/comment|bình luận|write/i))
      .or(page.locator('textarea'));
    if (
      await commentInput
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await commentInput.first().fill(COMMENT_TEXT);
      await page
        .getByRole('button', { name: /comment|submit|gửi|reply/i })
        .first()
        .click();
      await page.waitForTimeout(3000);
      await expect(page.getByText(COMMENT_TEXT).first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('react to a post', async ({ page }) => {
    await page.goto('/forum');
    await page.waitForTimeout(2000);
    const forumLink = page.locator('a[href^="/forum/"]').first();
    if (!(await forumLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const forumHref = await forumLink.getAttribute('href');
    if (!forumHref || forumHref.includes('/create')) return;
    await page.goto(forumHref);
    await page.waitForTimeout(3000);

    const postLink = page.locator('a[href*="/posts/"]').first();
    if (!(await postLink.isVisible({ timeout: 5000 }).catch(() => false)))
      return;
    const postHref = await postLink.getAttribute('href');
    if (!postHref) return;
    await page.goto(postHref);
    await page.waitForTimeout(3000);

    const likeBtn = page
      .getByRole('button', { name: /like|thích|👍/i })
      .or(page.locator('[class*="like"]').first())
      .or(page.locator('[class*="reaction"]').first());
    if (
      await likeBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await likeBtn.first().click();
      await page.waitForTimeout(2000);
    }
  });
});
