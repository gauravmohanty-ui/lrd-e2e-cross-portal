# lrd-e2e-cross-portal

End-to-end tests that span >= 2 LRD portals (client / admin / team / provider).

## Series
- **X-series** (`tests/x-series/`) — the customer lifecycle handoffs. Each test simulates one portal taking action and another portal observing the resulting state.
- **Y-series** (`tests/y-series/`) — cross-cutting concerns (mobile block, CSP, auth boundaries) verified across multiple portals in one spec.

## Run

```bash
bun install
npx playwright install chromium
bun run test
```

## Required env / secrets
Tests read AWS Secrets Manager via `lrd-e2e-common.getSecret()`. Required secret IDs:
- `lrd/e2e/client-real-creds`
- `lrd/e2e/admin`
- `lrd/e2e/admin-totp`
- `lrd/e2e/team`

## Operating mode
Pre-launch. All flows touch QC test fixtures only (firm `E2E-TEST-FIRM-001`, request `LRD-2026-E2E001`). Tests that would create new firms or invoke Donna are deliberately marked `.skip` until `is_test_firm_id` is extended to a prefix allowlist (see infrastructure repo's design doc Known limitations section).
