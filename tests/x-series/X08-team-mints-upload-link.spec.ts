// tests/x-series/X08-team-mints-upload-link.spec.ts
import { test, expect } from '@playwright/test';
import { getSecret } from 'lrd-e2e-common';

const TEAM = 'https://team.legalrecorddesk.com';

test('X08 — team portal mints fresh upload link for sentinel case', async ({ page }) => {
  const creds = await getSecret<{ username: string; password: string; sentinelCaseId: string }>('lrd/e2e/team');

  await page.goto(`${TEAM}/login`);
  await page.locator('input[type="email"]').fill(creds.username);
  await page.locator('input[type="password"]').first().fill(creds.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard|\/qc-review|\/cases/, { timeout: 25_000 });

  const idToken = await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      if (k.includes('CognitoIdentityServiceProvider') && k.endsWith('.idToken')) {
        return localStorage.getItem(k) || '';
      }
    }
    return '';
  });
  expect(idToken).toBeTruthy();

  // Body shape per Plan 1 baseline — the upload-link API requires
  // caseId / recipientEmail / recipientName / expiryHours, not ttl_seconds.
  const resp = await page.request.post(
    `${TEAM}/api/v1/requests/${creds.sentinelCaseId}/upload-link`,
    {
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      data: {
        caseId: 'X-SERIES-CROSS-PORTAL',
        recipientEmail: 'x-series-provider@legalrecorddesk-test.invalid',
        recipientName: 'X-Series Provider',
        customMessage: 'X-series cross-portal upload-link mint verification',
        expiryHours: 0.5,
      },
    }
  );
  // Accept 200 (OK) or 201 (Created) — both are valid for resource creation.
  expect([200, 201]).toContain(resp.status());
  const body = await resp.json() as { token?: string; uploadUrl?: string };
  const url = body.uploadUrl || (body.token ? `https://upload.legalrecorddesk.com/upload/${body.token}` : '');
  expect(url).toContain('upload.legalrecorddesk.com/upload/');
});
