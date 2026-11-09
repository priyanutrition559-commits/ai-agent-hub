# Technology Universe — implementation audit

Date: 2026-11-09. **Status: secure foundation, not production-ready.**

## Delivered in this branch

- Fixed unsupported `icon-sm` button sizes in `message.tsx` and the MotionStyle / CSSProperties incompatibility in `shimmer.tsx`. Shimmer respects reduced-motion preference.
- Replaced the blank starter with responsive navigation, overview, searchable/filterable metadata directory, linked connector details, custom MCP configuration validation, agent draft form, account screen and admin readiness screen.
- Preserved TanStack Start, Lovable integration middleware, shadcn components, existing theme tokens, CSRF protection and AI gateway conventions. No second app or fake brand asset.
- Nine featured metadata entries: GitHub, Supabase, Figma, Vercel, Notion, Lovable, TinyFish, Exa, custom MCP. Categories cover the requested taxonomy; empty categories show a real empty state.
- Real Supabase sign-up/sign-in/sign-out calls and auth-state subscription. Authenticated server functions validate configuration requests. Admin readiness checks server-controlled app_metadata.role, never user_metadata.
- Official `@modelcontextprotocol/sdk` pinned to 1.32.2, conservative Ajv validator pinned to 8.17.1. Worker adapter supports Streamable HTTP initialization, capability negotiation, first-page tool/resource/prompt discovery, abort signals, timeouts, tool calls and close. No hosted route invokes this adapter.
- Default-deny policy, scope/owner checks, exact-call approval prerequisite, no write retry, bounded text-only untrusted output and metadata redaction helpers.
- Platform-neutral workspace contracts prepared for later native clients. CI checks and Playwright specifications added.

## Actual local verification

| Check | Outcome |
|---|---|
| `npm run typecheck` | Pass |
| `npm run build` | Pass; production Cloudflare/Nitro output produced |
| `npm test` | Pass: 41 tests across 3 files |
| `npm run lint:hub` | Pass |
| `npm run lint` | Fail: 421 formatting errors, 13 warnings in existing files; no broad generated-file rewriting performed |
| `npm run test:e2e` | Blocked: all 5 specs fail at browser launch because Playwright Chromium is absent. No browser acceptance claim |
| HTTP preview smoke | Pass: eight routes return 200 and app content using the actual preview Host header; browser interaction not verified |
| Provider/live database integration tests | Not run: no authorized deployment/gateway/provider environment |

Initial `npm install --ignore-scripts` failed with an npm resolver error (`edgesOut`). `bun install` using the repository's lockfile succeeded. Use Bun 1.4.4 for reproducible installation. CI contains a separate failing repository-lint gate rather than hiding this debt. CI results must be checked after push; local passes do not imply remote passes.

## Critical limits / not delivered

This is **not** a complete dynamic MCP Hub. Server mutation functions deliberately return CONFIGURATION_REQUIRED after authentication/validation; they do not save, connect, discover or invoke. Agent drafts are not persisted. Disabled controls explicitly explain their prerequisite. There are no fabricated credentials, tools, health checks, approvals, audit logs, connection successes or agent runs.

1. Lovable-managed database migrations were NOT applied. `drizzle/schema.ts` is generated and blank. `AGENTS.md` reserves schema changes for Lovable. No original failing migration is present to rerun. See DATABASE-HANDOFF.md.
2. Durable connector CRUD, secret-manager adapter/rotation, OAuth/PKCE callbacks, provider auth, permission CRUD, approval consumption, audit persistence, run queue/cancellation, quotas, concurrency limits and circuit breakers remain unimplemented.
3. SSRF URL syntax checks are NOT DNS security. Connection-time DNS/IP validation and pinning, egress allowlists and streaming wire-byte caps require a trusted worker/gateway. Hosted execution is disabled until those controls exist.
4. Agent model calls and sequential workflows are not wired; no unattended or bulk task assignment is enabled. No budget/rate enforcement beyond draft validation exists yet.
5. RLS/ownership isolation, replay-safe approvals and full lifecycle/audit integration tests require the managed schema and worker. The adapter tests use an isolated protocol fixture, NOT real authenticated providers.
6. The Explorer currently searches bundled integration metadata, not database-backed general technology records. Provider capabilities and URLs are marked unverified; current provider documentation was not independently fetched in this restricted environment.
7. Favourites, collections, stacks, learning paths, portfolio, shop/orders, legal pages, complete role management and native clients remain pending. Payments stay off.
8. No Notion, calendar, Docs, WordPress or OpenCode account has been connected. Notion in Arena was reported disconnected; Lovable connector lookup was unsupported. Those Arena app connections are separate from product-user MCP connections.
9. No deployment/CD, live credentials, automatic main merge, or production certification. An existing tracked `.env` is Lovable-managed; no secret values were printed, added or changed. Review its history privately before production.

## Next safe phase

In the Lovable editor, apply DATABASE-HANDOFF.md and return the generated schema. Configure secrets privately in Lovable/your secret manager. Deploy and security-test the egress worker. Implement transactional authenticated CRUD/audit/approval RPCs and integration tests. Only then connect provider OAuth and wire the existing UI to durable operations. Production release must wait for all CI gates, browser tests and live RLS isolation tests to pass.
