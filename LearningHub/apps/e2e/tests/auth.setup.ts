import { test as setup, expect } from '@playwright/test';
import path from 'path';
import {
  checkUserExists,
  cleanupOldSetupUsers,
  grantRoleToUser,
} from '../playwright/db-helper';

const authFile = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');

const timestamp = Date.now();
const TEST_USER = {
  username: `e2esetup${timestamp}`,
  email: `e2esetup${timestamp}@e2e-setup.test`,
  password: 'E2eSetup@123',
};

setup('authenticate', async ({ page }) => {
  await cleanupOldSetupUsers();

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

  await page.context().storageState({ path: authFile });

  await grantRoleToUser(TEST_USER.email, 'OWNER');
});

setup.afterAll(async () => {
  // Cleanup must not run here — e2e tests depend on this user's auth tokens.
  // cleanupE2ETestData() runs in each describe block's afterAll for admin tests.
});
