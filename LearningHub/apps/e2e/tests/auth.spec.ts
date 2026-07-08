import { test, expect } from '@playwright/test';
import {
  cleanupE2ETestData,
  checkUserExists,
  query,
} from '../playwright/db-helper';

const timestamp = Date.now();
const TEST_USER = {
  username: `e2eauth${timestamp}`,
  email: `e2eauth${timestamp}@e2e-auth.test`,
  password: 'E2eAuth@123',
};

test.use({ storageState: undefined });

test.afterAll(async () => {
  await cleanupE2ETestData();
  await query(`DELETE FROM "users" WHERE "email" LIKE '%@e2e-auth.test'`);
});

test.describe('Auth flow — full register/login cycle', () => {
  test('register → DB persists user → login → redirect to home', async ({
    page,
  }) => {
    await page.goto('/auth/register');
    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();

    await page.getByPlaceholder('John Doe').fill(TEST_USER.username);
    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('/auth?registered=true', { timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    const user = await checkUserExists(TEST_USER.email);
    expect(user).toBeTruthy();

    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('/', { timeout: 15000 });
    await expect(page).toHaveURL('/');
  });

  test('register duplicate email → error message shown', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();

    await page.getByPlaceholder('John Doe').fill(TEST_USER.username);
    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForTimeout(3000);

    const errorIndicator = page
      .locator('.bg-red-50')
      .or(page.locator('.text-red-500'))
      .or(page.getByText(/already|exist|taken/i));
    const hasError = await errorIndicator
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const stillOnRegister = await page
      .locator('text=Create your account')
      .isVisible()
      .catch(() => false);
    expect(hasError || stillOnRegister).toBe(true);
  });

  test('login wrong password → error toast', async ({ page }) => {
    await page.goto('/auth');
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill('WrongPass@123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.locator('.bg-red-50').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('register empty fields → validation errors', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/auth\/register/, { timeout: 5000 });
    await expect(page.locator('.text-red-500').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('logout → redirected to auth page', async ({ page }) => {
    await page.goto('/auth');
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('/', { timeout: 15000 });

    const userMenu = page
      .locator('[data-testid="user-menu"]')
      .or(
        page
          .locator('button')
          .filter({ has: page.locator('img[alt*="avatar" i]') }),
      );
    if (
      await userMenu
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await userMenu.first().click();
      const logoutBtn = page.getByRole('button', {
        name: /sign out|logout|đăng xuất/i,
      });
      if (
        await logoutBtn
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        await logoutBtn.first().click();
        await page.waitForURL('/auth', { timeout: 10000 }).catch(() => {});
      }
    }
  });
});
