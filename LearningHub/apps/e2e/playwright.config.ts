import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  globalSetup: './playwright/global-setup',
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'echo "Using external server"',
    port: 8080,
    reuseExistingServer: true,
    timeout: 10000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'e2e',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /admin\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: path.resolve(
          __dirname,
          'playwright',
          '.auth',
          'user.json',
        ),
      },
    },
    {
      name: 'admin',
      testMatch: /admin\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:8081',
        storageState: undefined,
      },
    },
  ],
});
