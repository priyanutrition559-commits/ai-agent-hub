# Local setup and operator runbook

## Local development

1. Use Node 22+ and Bun 1.4.4. Run `bun install --frozen-lockfile`.
2. Existing `.env` is Lovable-managed. Never paste credentials in chat, source, tickets or logs. `.env.example` lists variable names without values. Configure new values in Lovable Secrets or your production secret manager; never put private variables behind `VITE_`.
3. Run `bun run dev -- --host 0.0.0.0`. Browser-to-app requests use TanStack same-origin server functions. Do not configure a browser to call a sandbox localhost backend.
4. `bun run typecheck`, `bun run lint:hub`, `bun run lint`, `bun run test`, `bun run build`.
5. Where browser downloads are allowed: `bunx playwright install --with-deps chromium`, then `bun run test:e2e`. Standard browser CDN downloads are unavailable in this sandbox. For local verification, Chromium 141 was provisioned outside the repo from `@sparticuz/chromium@141.0.0` via the npm registry, including its bundled al2023 libraries. Run with `LD_LIBRARY_PATH=/tmp/al2023/lib PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium bun run test:e2e` after local provisioning. These temporary paths are not deployment configuration and must be reprovisioned when the sandbox resets. CI uses Playwright’s default pinned browser on Ubuntu 24.04.
6. No custom-server draft produces an external network request. Live authentication requires the real Lovable/Supabase configuration and allowed email/redirect settings. Email confirmation and production delivery have not been verified here.

## Deployment prerequisite checklist — all must be complete

- Have Lovable apply DATABASE-HANDOFF.md and regenerate types through its managed workflow.
- Keep repository-wide lint passing, run browser flows and two-user RLS integration suites. Enable required CI checks on the PR. Do not merge a red check as production-ready.
- Implement atomic persistence, approvals and audit RPCs. Every live mutation must fail closed if durable auditing fails.
- Provision an isolated gateway/worker and test DNS/IP pinning, redirects, IPv4/IPv6 bypasses, streaming limits, credentials and timeout/cancellation handling. No shared hosted-process stdio.
- Implement secret references against a vault/KMS. Rotate by creating a new version, reauthorizing, verifying scope/health, atomically switching reference and revoking the old version. Revoke queued jobs on disconnect. Never display token values.
- Register OAuth apps with exact redirect origins, state/PKCE, least-privilege scopes, CSRF and current user binding. Add provider adapters and explicit setup instructions after checking current official docs.
- Configure gateway model availability through Lovable. Enforce distributed budgets, per-user quotas, concurrency and circuit breakers before agent runs.
- Configure alerts for auth failures, health failure rates, denied calls, approval latency, queue age and quota exhaustion. Use trace IDs, not raw inputs/results or secrets.
- Supply the actual GS favicon asset through the project. Current generic icon is not a replacement brand design.
- Verify legal/privacy terms, retention/deletion procedures, support recovery, backup restore and dependency security review before release. Payments stay disabled until separately integrated and audited.

## Incident response target

Disable connector and revoke grants; cancel queued runs; stop worker dispatch; revoke provider tokens via secret manager; preserve redacted audit trail. Reconcile uncertain external side effects rather than blindly retrying. Rotate affected secret versions. Test cross-tenant isolation and approval replay protection before re-enabling. These run controls must be built before this procedure can be operated from the UI.

## Connecting requested services

Directory presence does not connect GitHub, Notion, Docs, calendars, WordPress, TinyFish, Exa or OpenCode. Pick the actual provider and supported official API/MCP adapter; configure its credentials privately. Arena-connected apps and Technology Universe user connections are independent. Notion is currently disconnected in this Arena session. Lovable schema changes must be performed in the Lovable editor because its connector is unavailable here. No keys should be sent in chat.

## Release / GitHub

Work only on the active Arena session branch. The current continuation branch is `arena/30fd11f7-ai-agent-hub`; the earlier branch was merged. Changes may be pushed to the active branch and reviewed in a PR targeting main. No force pushes, no history rewrites, no direct main push. CI is validation only; automatic production deployment is intentionally not configured. Review checks and complete the blocked backend phase before a production merge.


For recovery email configuration, component behavior, and accessibility coverage, see [UX and component contracts](UX-AND-COMPONENTS.md). For current delivered/pending work, see [the phase matrix](PHASES-1-10-STATUS.md).


The latest worker-only egress library and its deployment boundaries are described in [GATEWAY-SECURITY.md](GATEWAY-SECURITY.md). Root [DONE.md](../DONE.md) and [PENDING_TASKS.md](../PENDING_TASKS.md) record the current verification and remaining prerequisites.


For the optional controlled-worker encrypted file store, master-key rotation, stale-lock recovery and the exact-call approval database contract, read [SECRETS-AND-APPROVALS.md](SECRETS-AND-APPROVALS.md) before deployment. No worker bootstrap or production key loader is configured yet.
