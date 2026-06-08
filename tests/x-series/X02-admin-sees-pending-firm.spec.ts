// tests/x-series/X02-admin-sees-pending-firm.spec.ts
import { test, expect } from '@playwright/test';
import { getSecret } from 'lrd-e2e-common';
import { authenticator } from 'otplib';

const ADMIN = 'https://admin.legalrecorddesk.com';

test('X02 — admin /pending-firms surfaces firms (cross-portal data path)', async ({ page }) => {
  const creds = await getSecret<{ username: string; password: string }>('lrd/e2e/admin');
  const totp = await getSecret<{ shared_secret_base32?: string; seed?: string }>('lrd/e2e/admin-totp');
  const totpSecret = totp.shared_secret_base32 || totp.seed || '';

  await page.goto(`${ADMIN}/login`);
  await page.locator('input[type="email"]').fill(creds.username);
  await page.locator('input[type="password"]').first().fill(creds.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  const totpInput = page.locator('input[placeholder="000000"]');
  await totpInput.waitFor({ state: 'visible', timeout: 10_000 });
  // TOTP can flake if the 30-sec window rolls between generate and submit.
  // Retry up to 3 times with a fresh code.
  let totpOk = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    await totpInput.fill('');
    await totpInput.fill(authenticator.generate(totpSecret));
    await page.locator('button[type="submit"]').first().click();
    try {
      await page.waitForURL(
        /\/(dashboard|pending-firms|requests|firms)/,
        { timeout: 12_000 },
      );
      totpOk = true;
      break;
    } catch {
      await page.waitForTimeout(2_000);
    }
  }
  expect(totpOk, 'admin TOTP login succeeded').toBe(true);

  await page.goto(`${ADMIN}/pending-firms`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 });

  const anyRow = page.locator('tr, [role="row"], [data-testid*="firm"]').first();
  await expect(anyRow).toBeVisible({ timeout: 15_000 });
});
