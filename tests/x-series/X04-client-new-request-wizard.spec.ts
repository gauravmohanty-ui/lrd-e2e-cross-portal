// tests/x-series/X04-client-new-request-wizard.spec.ts
import { test, expect } from '@playwright/test';
import { getSecret } from 'lrd-e2e-common';

const CLIENT = 'https://portal.legalrecorddesk.com';

test('X04 — client portal new-request wizard step 1 renders', async ({ page }) => {
  const creds = await getSecret<{ username: string; password: string }>('lrd/e2e/client-real-creds');
  await page.goto(`${CLIENT}/login`);
  await page.locator('input[type="email"]').fill(creds.username);
  await page.locator('input[type="password"]').first().fill(creds.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 25_000 });

  await page.goto(`${CLIENT}/new-request`);
  // Plan 1 baseline confirmed "Firm Case ID" renders as text near a placeholder
  // input, not via a <label htmlFor=…> association — so use a text selector.
  await expect(page.locator('text=/Firm Case ID/i').first()).toBeVisible({ timeout: 15_000 });
});
