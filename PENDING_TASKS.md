# Pending tasks — Technology Universe phases 1–10

**Not production-ready. No autonomous or payment execution enabled.**

## 1. Database & RLS — blocked on managed deployment
- [ ] Apply `docs/DATABASE-HANDOFF.md` in Lovable, including review of the original failed search expression.
- [ ] Create/recover product and MCP tables; regenerate managed types.
- [ ] Implement roles, RLS, composite ownership constraints, transactional approval/audit/order APIs.
- [ ] Verify two-user isolation, policy denial, migration rollback and backup restore.

## 2. Identity & RBAC — partially implemented
- [ ] Verify production sign-up, confirmation, recovery delivery, callback origins and session revocation.
- [ ] Add current database-backed role checks, protected-route behavior and role assignment/revocation.
- [ ] Account settings/deletion, identity rate limiting and data-retention workflows.
- [ ] Keep worker identities separate from user and administrator privileges.

## 3. Design system — partially implemented
- [ ] Consolidate remaining screens onto shared components.
- [ ] Build real approval/confirmation/audit components when backend contracts exist.
- [ ] Review any decorative glass/canvas effects for performance/accessibility; no 3D hero implemented.

## 4. Explorer — metadata UI implemented, persistence pending
- [ ] Database-backed search, provenance review and content publishing.
- [ ] Favourites, collections and stacks with ownership/RLS tests.
- [ ] Verify current provider information rather than treating catalogue entries as live connections.

## 5. MCP / egress — tested transport library, not a deployed hub
- [ ] Deploy the isolated Node worker and its independent network restrictions.
- [ ] Real TLS, DNS rebinding, slow/chunked stream and cancellation tests against staging infrastructure.
- [ ] Wire authenticated tenant-scoped jobs to operator-owned endpoint policies.
- [ ] Implement encrypted secret storage/vault integration, versioned references, rotation and revocation.
- [ ] Provider OAuth, persistent connector CRUD/discovery, permissions and health checks.
- [ ] End-to-end connect/disconnect/read-only/error-path lifecycle tests.

## 6. Agents & approvals — execution blocked
- [ ] Persist profiles and reviewed per-agent/per-tool grants.
- [ ] Implement Lovable gateway model calls, sequential workflows and durable queue/leases.
- [ ] Atomically consume exact-call approvals with TTL/schema/arguments binding.
- [ ] Durable audit transactions, budgets, quotas, concurrency, circuit breakers and cancellation.
- [ ] Real diagnostics/test-run panel; never generate fake execution results.

## 7. Product workflows — pending
- [ ] Saved learning-path progress and portfolio editor/public profiles.
- [ ] Products, cart, checkout, unpaid orders and administration backed by transactions.
- [ ] Keep demo records labelled and real payments disabled. No fake paid orders.

## 8. Marketing/docs/legal — partial
- [ ] Owner-approved support details, operating entity, privacy/terms and retention/subprocessor policies.
- [ ] Actual brand assets, production SEO/canonical URLs/sitemap and any approved pricing plans.
- [ ] Update documentation as deployed behavior changes; do not claim compliance from templates.

## 9. Accessibility / responsiveness — automated baseline present
- [ ] Manual screen reader, zoom, touch, slow-network and complete page/device audits.
- [ ] Firefox/WebKit coverage; current browser acceptance is Chromium-only.
- [ ] Native wrappers and signed Expo/Electron distribution remain separate deferred work.

## 10. CI/CD & release — validation only
- [ ] Confirm this branch's GitHub jobs, including the new Docker validation job.
- [ ] Fix 13 remaining Fast Refresh warnings where appropriate.
- [ ] Configure approved staging/production deployment, secret injection, alerts and traces.
- [ ] Security review, approval/tenant/quota race tests, incident drills, rollback and backup restoration.
- [ ] No production release until the above critical controls are tested and signed off.

## Immediate next action

Use the Lovable editor to apply the managed schema handoff, then provide regenerated schema/types through the repository. Configure secrets privately in the deployment secret manager—never in chat. The new egress library is not permission to enable live tool invocation before the missing authorization/audit/approval systems exist.
