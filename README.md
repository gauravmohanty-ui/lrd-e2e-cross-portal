# lrd-e2e-cross-portal

End-to-end tests that span **two or more portals** of a production SaaS — verifying that an action taken in one portal produces the correct state in another (client · admin · team · provider).

> Part of a larger private product (Legal Record Desk). This repo is public as a
> representative sample of how I structure and operate cross-service E2E testing.

## What this demonstrates

- **Cross-portal integration testing** — not single-app happy paths, but real handoffs: one portal acts, another observes the resulting state.
- **Playwright + TypeScript**, Chromium, serial & deterministic (`workers: 1`, no flaky parallelism) with generous per-test timeouts for real network flows.
- **Failure-first artifacts** — traces, screenshots, and video are captured automatically on failure for fast diagnosis.
- **No hardcoded credentials** — test identities are pulled at runtime from a managed secret store, never committed to the repo.
- **MFA-aware** — flows that require TOTP are handled programmatically, so multi-factor auth doesn't block automation.

## Structure

- **X-series** (`tests/x-series/`) — customer-lifecycle handoffs. Each spec simulates one portal taking an action and another portal observing the resulting state (e.g. a new request created in one portal appearing for staff in another).
- **Y-series** (`tests/y-series/`) — cross-cutting guarantees verified across multiple portals in a single spec (auth boundaries, mobile-access blocking, security headers).

## Run

```bash
npm install
npx playwright install chromium
npm test          # full suite
npm run test:x    # X-series only
npm run test:y    # Y-series only
```

Test identities are resolved at runtime from a managed secret store; the suite runs
against isolated test fixtures only, never real customer data.

## Notes

Built and maintained solo as part of a production system. Specs that would create
new tenants or trigger downstream processing are gated behind an explicit test-fixture
allowlist so the suite can never touch live data.
