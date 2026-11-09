# Lovable-managed database handoff — NOT an applied migration

The repo's AGENTS.md forbids manual changes to `drizzle/`, `supabase/migrations/` and generated schema/types. Ask Lovable to perform this change in the existing project, not a new project. No database access or migration success is claimed here.

## Catalogue search failure

The rejected SQL is not in this checkout, so its exact cause cannot be confirmed. If the failure was a generated-column immutability error from `concat_ws`, avoid that function. For actual column names `name`, `description`, `category`, use an explicitly configured immutable expression:

```sql
-- Review against actual column names and types in Lovable before applying.
search_document tsvector GENERATED ALWAYS AS (
  to_tsvector('english'::regconfig,
    coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')
  )
) STORED
```

Add a GIN index on search_document. Query with parameterized `websearch_to_tsquery('english', input)`. Do not interpolate SQL. Re-run the original transaction on staging, inspect every table/policy/function, then promote. If enum-to-text casts or joined data remain non-immutable, use a BEFORE INSERT/UPDATE trigger with a stored tsvector instead of a generated column. Verify null values and updates in regression tests.

## Required integration tables

All IDs UUID, timestamps timestamptz in UTC, FKs indexed. Owner-scoped rows carry `owner_id` referencing auth.users. Foreign references must include the owner in composite constraints so a caller cannot associate another user's connector/agent/tool. Never persist secret material in these tables.

| Table | Required fields beyond IDs/timestamps |
|---|---|
| mcp_servers | owner_id, provider_id, name, endpoint, transport, auth_mode, enabled default false, connection_status default disconnected, gateway_policy_id, version |
| mcp_credentials_metadata | owner_id, server_id, secret_reference, key_version, provider_subject_hash, granted_scopes, expires_at, revoked_at; no token values |
| mcp_server_capabilities | owner_id, server_id unique, negotiated_protocol_version, sanitized capabilities, discovered_at |
| mcp_tools | owner_id, server_id, name, bounded description, reviewed JSON input schema, schema_hash, risk, approval_policy default always, enabled default false, discovered_at, health; unique(server_id,name) |
| mcp_resources | owner_id, server_id, URI, name, content_type, discovered_at; bounded untrusted metadata |
| mcp_prompts | owner_id, server_id, name, bounded arguments_schema, discovered_at |
| agent_profiles | owner_id, name, description, gateway_model_id, instructions, max_tool_calls, timeout_seconds, budget_cents, rate_limit, enabled default false |
| agent_connector_permissions | owner_id, agent_id, server_id, allowed_scopes; unique(agent_id,server_id) |
| agent_tool_permissions | owner_id, agent_id, tool_id, enabled default false; unique(agent_id,tool_id) |
| agent_runs | owner_id, agent_id, state, request_id unique per owner, cancellation_requested, budget_reserved, deadline, trace_id |
| agent_tool_calls | owner_id, run_id, tool_id, server_id, reviewed_schema_hash, canonical_arguments_hash, status, idempotency_key, result_reference, duration; encrypted raw inputs outside normal rows |
| tool_approvals | owner_id, call_id unique, approver_id, decision, expires_at, consumed_at, arguments_hash, tool_version; terminal decisions immutable |
| integration_health_checks | owner_id, server_id, outcome, checked_at, latency_ms, safe error_code, trace_id |
| integration_audit_logs | owner_id, actor_id, agent_id, server_id, tool_id, event_type, occurred_at, outcome, allowlisted redacted metadata, trace_id; append-only |

Also recover/create the requested product tables in Lovable: profiles, server-managed roles, technologies/categories/tags, favourites, collections and collection items, stacks/items, learning paths/steps/progress, portfolios/items, products, carts/items, orders/items, and order events. These are a design request, not implemented schema. Demo seed records must carry `is_demo=true`, verification status and provenance URLs; never seed connected credentials or invented live tools.

## RLS matrix to implement and test

| Data | Anonymous | Owner | Other user | Admin | Worker |
|---|---|---|---|---|---|
| Published catalogue/demo products | Read published only | Read | Read published | Curate through audited API | No need |
| Servers, profiles, collections | Deny | Read own; mutate through authenticated API | Deny | Support metadata through audited API | Task-scoped access |
| Credential metadata | Deny | Read safe reference status only | Deny | Safe status, never values | Resolve references through secret manager |
| Tools/resources/prompts | Deny | Read own; enable only via policy-checked API | Deny | Audit support only | Upsert after bounded discovery |
| Agent permissions | Deny | Read own; mutate via validated API | Deny | No cross-tenant implicit grant | Read task-scoped grants |
| Runs/calls | Deny | Read own; create/cancel via API | Deny | Redacted operational data | Transition only with lease/token |
| Approvals | Deny | Read own; decide only authorized exact call | Deny | Explicit delegated approval only | Atomically consume, never self-approve |
| Audit/health | Deny | Read own safe fields | Deny | Read redacted | Append only |
| Orders/items/events | Deny | Read own; place through transactional RPC | Deny | Audited fulfillment | Payment disabled |

Enable and FORCE RLS on all user tables; add USING and WITH CHECK clauses tied to auth.uid(). Revoke direct browser mutations on execution/audit/approval tables. Functions must use safe search_path, validate auth.uid(), reject caller-supplied owner IDs, and limit EXECUTE grants. Service-role credentials are worker-only; the web path must not bypass RLS. Roles are server-controlled, not editable user metadata.

## Atomic workflows

- Connect/disconnect: persist status and audit together; revoked tokens stop queued work; only mark connected after authenticated initialization. Failed audits fail the operation closed.
- Discovery: bound/paginate metadata; new or changed tool schemas disable grants and invalidate pending approvals.
- Invocation: lock call and quota rows; recheck ownership, connector state, agent grants, scopes, schema hash, budget and deadline. Consume one unexpired exact-call approval atomically. Reserve quota; dispatch once through a leased worker. Never auto-retry writes after uncertain delivery.
- Cancellation: change run state atomically, signal in-flight work, persist outcome. Cancellation cannot promise reversal of an external side effect.
- Orders: transaction derives prices from server product rows, locks inventory, requires a unique client request ID, snapshots totals/items, decrements stock atomically, and emits an order event. Ignore client totals. Demo products remain marked; payment state stays disabled/unpaid. Never fabricate a paid order.

Acceptance: two-user cross-tenant tests, anonymous denial, malicious owner FK attempts, self-escalation denial, approval replay/race tests, disconnect/invoke race, quota races, duplicate order prevention, inventory rollback, failed-audit rollback and demo search/update tests. Record migration/version evidence before enabling the application backend.
