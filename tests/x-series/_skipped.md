# Skipped X-series flows

These 6 X-series flows from Plan 1 are NOT in the permanent suite. Each is
deferred for an explicit reason. Convert to a permanent spec once the
listed prerequisite lands.

- **X01 attorney signs up firm via /register** — would create a real DDB row. Requires `is_test_firm_id` to be extended to a prefix allowlist so ephemeral test firms safely short-circuit `record_usage`.
- **X03 firm-admin completes BAA + picks Starter plan** — requires real DocuSign signing roundtrip. Permanently manual.
- **X05 SES email to patient with /sign/:token link** — requires the Cognito-signed patient-sign flow to fire. Currently dormant pre-launch (last invocation 2026-06-01). Test once patient-sign volume exists.
- **X06 patient signs auth at /sign/:token** — Sentinel cases have signing_token=null (test fixtures created without going through the real emitter). Test once an end-to-end sentinel includes a real signing token.
- **X09 matcher → PHI strip → Donna → cert** — would invoke Donna on real Bedrock. Requires `is_test_firm_id` prefix extension.
- **X10 client downloads + pays invoice via Stripe TEST** — E2E-TEST-FIRM-001 has no Stripe Customer/Subscription. Requires test firm setup with Stripe TEST mode customer.
