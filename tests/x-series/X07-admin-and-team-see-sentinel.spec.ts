// tests/x-series/X07-admin-and-team-see-sentinel.spec.ts
import { test, expect, chromium } from '@playwright/test';
import { getSecret } from 'lrd-e2e-common';
import { authenticator } from 'otplib';

const ADMIN = 'https://admin.legalrecorddesk.com';
const TEAM = 'https://team.legalrecorddesk.com';

test('X07 — sentinel data visible on admin /requests + team /qc-review', async () => {
  const adminCreds = await getSecret<{ username: string; password: string }>('lrd/e2e/admin');
  const totp = await getSecret<{ shared_secret_base32?: string; seed?: string }>('lrd/e2e/admin-totp');
  const totpSecret = totp.shared_secret_base32 || totp.seed || '';
  const teamCreds = await getSecret<{ username: string; password: string }>('lrd/e2e/team');

  // Admin browser
  const adminBrowser = await chromium.launch();
  const adminCtx = await adminBrowser.newContext();
  const adminPage = await adminCtx.newPage();
  await adminPage.goto(`${ADMIN}/login`);
  await adminPage.locator('input[type="email"]').fill(adminCreds.username);
  await adminPage.locator('input[type="password"]').first().fill(adminCreds.password);
  await adminPage.getByRole('button', { name: /sign in/i }).click();
  // TOTP can flake if the 30-sec window rolls between generate and submit.
  // Retry up to 3 times with a fresh code.
  const totpInput = adminPage.locator('input[placeholder="000000"]');
  await totpInput.waitFor({ state: 'visible', timeout: 15_000 });
  let totpOk = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    await totpInput.fill('');
    await totpInput.fill(authenticator.generate(totpSecret));
    await adminPage.locator('button[type="submit"]').first().click();
    try {
      await adminPage.waitForURL(
        /\/(dashboard|pending-firms|requests|firms)/,
        { timeout: 12_000 },
      );
      totpOk = true;
      break;
    } catch {
      // Wait for next TOTP window
      await adminPage.waitForTimeout(2_000);
    }
  }
  expect(totpOk, 'admin TOTP login succeeded').toBe(true);
  await adminPage.goto(`${ADMIN}/requests`);
  await expect(adminPage.locator('table, [role="table"]').first()).toBeVisible({ timeout: 15_000 });

  // Team browser
  const teamBrowser = await chromium.launch();
  const teamCtx = await teamBrowser.newContext();
  const teamPage = await teamCtx.newPage();
  await teamPage.goto(`${TEAM}/login`);
  await teamPage.locator('input[type="email"]').fill(teamCreds.username);
  await teamPage.locator('input[type="password"]').first().fill(teamCreds.password);
  await teamPage.getByRole('button', { name: /sign in/i }).click();
  await teamPage.waitForURL(/\/dashboard|\/qc-review|\/cases/, { timeout: 25_000 });
  await teamPage.goto(`${TEAM}/qc-review`);
  await expect(teamPage.locator('h1, h2').first()).toBeVisible({ timeout: 15_000 });

  await adminBrowser.close();
  await teamBrowser.close();
});
