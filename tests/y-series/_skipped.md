# Skipped Y-series flows

- **Y01 auth boundary** — sentinel foreign case returns HTTP 200 + SPA shell showing "Loading…" forever. Backend probably denies properly, frontend has no error boundary. BUG-P2-02 in BUGS.md. Convert once a `<NotFound>` / `<Forbidden>` error boundary lands on the client portal.
- **Y03 CSP allows S3 iframe** — sentinel case is in `AM QC Review Required` state, has no Donna deliverables yet, so no S3 iframe is rendered. Add spec once a Delivered case exists with an S3 preview URL.
