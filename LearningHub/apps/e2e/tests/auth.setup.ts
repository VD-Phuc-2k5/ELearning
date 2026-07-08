import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');

const timestamp = Date.now();
const TEST_USER = {
  username: `e2esetup${timestamp}`,
  email: `e2esetup${timestamp}@test.com`,
  password: 'E2eSetup@123',
};

setup('authenticate', async ({ page }) => {
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

  await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
  await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('/', { timeout: 15000 });
  await expect(page).toHaveURL('/');

  await page.context().storageState({ path: authFile });
});
