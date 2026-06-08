// tests/y-series/Y02-mobile-block-protected.spec.ts
import { test, expect, devices } from '@playwright/test';

test('Y02-client — mobile viewport shows desktop-required block on portal', async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto('https://portal.legalrecorddesk.com/dashboard');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

  // Use heading-by-role to avoid strict-mode collision from Plan 1
  const heading = page.getByRole('heading', { name: /desktop required|desktop use|desktop only/i });
  await expect(heading).toBeVisible({ timeout: 10_000 });
  await ctx.close();
});

test('Y02-admin — mobile viewport shows desktop-required block on admin', async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto('https://admin.legalrecorddesk.com/dashboard');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

  const blocker = page.locator(
    'text=/desktop.*required|larger.*screen|designed for desktop|desktop use only/i'
  ).first();
  await expect(blocker).toBeVisible({ timeout: 10_000 });
  await ctx.close();
});

test('Y02-team — mobile viewport shows desktop-required block on team', async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto('https://team.legalrecorddesk.com/dashboard');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

  const blocker = page.locator(
    'text=/desktop.*required|larger.*screen|designed for desktop|desktop use only/i'
  ).first();
  await expect(blocker).toBeVisible({ timeout: 10_000 });
  await ctx.close();
});
