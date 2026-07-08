# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> smoke - page loads
- Location: apps/e2e/tests/smoke.spec.ts:3:5

# Error details

```
TimeoutError: page.goto: Timeout 15000ms exceeded.
Call log:
  - navigating to "http://localhost:3002/", waiting until "domcontentloaded"

```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('smoke - page loads', async ({ page }) => {
> 4 |   await page.goto('/', { timeout: 15000, waitUntil: 'domcontentloaded' });
    |              ^ TimeoutError: page.goto: Timeout 15000ms exceeded.
  5 |   await expect(page.locator('body')).toBeVisible();
  6 | });
  7 |
```
