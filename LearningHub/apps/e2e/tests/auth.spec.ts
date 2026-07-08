import { test, expect } from '@playwright/test';

const timestamp = Date.now();
const TEST_USER = {
  username: `e2euser${timestamp}`,
  email: `e2e${timestamp}@test.com`,
  password: 'E2eTest@123',
};

test.describe('Auth flow', () => {
  test('register → login → redirect to home', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();

    await page.getByPlaceholder('John Doe').fill(TEST_USER.username);
    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('/auth?registered=true', { timeout: 10000 });
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/auth');
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill('nonexistent@test.com');
    await page.getByPlaceholder('••••••••').fill('WrongPass@123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByText('Sign in failed. Please try again.'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('register with empty fields shows validation errors', async ({
    page,
  }) => {
    await page.goto('/auth/register');
    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(
      page.getByText(/required|must|phải|tối thiểu|ít nhất|không/i),
    ).toBeVisible({ timeout: 3000 });
  });
});
