# Node worker egress transport: implemented controls and deployment boundary

## What this module is

`src/server/gateway/pinned-egress.server.ts` implements the `TrustedEgress` interface accepted by the existing official MCP SDK adapter. It is a **Node-only library for a future isolated worker**, not a network service, web route, authorization system or deployed execution engine. Do not import it into the TanStack/Cloudflare request path. It imports native HTTPS, DNS and streams which do not belong in that hosted entry.

No public listener was created. The app still returns configuration-required for connector and agent mutations. Deploying this module alone must not enable agent execution.

## Implemented controls

1. Operator-provided exact canonical HTTPS URL allowlist; port 443 only. The existing strict URL syntax validator rejects literals, embedded credentials, query strings, fragments and local hostnames.
2. DNS lookup of all answers, rejecting empty/oversized lists, family mismatches, mixed private/public answers and non-public addresses. Address parsing uses pinned `ipaddr.js` 2.2.0, not hand-written regexes.
3. Conservative public-unicast policy. IPv4 private/reserved/CGNAT/link-local/documentation/multicast/benchmark ranges are denied. IPv6 local, mapped and transition ranges are denied; accepted IPv6 is restricted to ordinary global-unicast space with additional special-purpose exclusions.
4. DNS is revalidated for every request. The connection destination is the chosen numeric address, preventing a second DNS lookup from changing the destination. TLS SNI/identity and HTTP Host use the original approved hostname. Certificate verification remains enabled, TLS >= 1.2, and no pooled connection is reused.
5. Redirects are rejected, not followed. No arbitrary OAuth metadata fetch or cross-endpoint request is permitted.
6. Only GET/POST/DELETE; JSON string request bodies up to 64 KiB. Limited MCP request headers; callers cannot supply Authorization, Cookie, Host or forwarding headers.
7. Optional server-owned credential callback is invoked only after endpoint/DNS authorization. Only bounded Bearer values without header injection are accepted. Callback failures are sanitized. No storage implementation or credential values are supplied by this repo.
8. Fifteen-second overall deadline through DNS/credential resolution/HTTP stream, caller cancellation, 16 KiB HTTP headers, at most 1 MiB response data, bounded stream buffering, and restricted JSON/SSE media types. Compressed responses are rejected. Redirects and invalid status codes fail closed.
9. Only content-type, MCP session ID and retry-after response headers are exposed. No cookies/authentication response headers are forwarded. No automatic retry.

Byte limits apply before SDK JSON/SSE parsing. These limits supplement the adapter's argument, schema, output and discovery limits. Long-lived SSE exceeding the deadline is intentionally terminated; connection recovery/reconciliation is a future orchestration concern, not an automatic write retry.

## Intentional limitations

- No worker service/queue, authenticated job protocol, job lease, tenant quotas, distributed concurrency, approval consumption, audit transactions, encryption/vault client or key rotation is implemented here.
- The authorization callback is an interface for server secret storage, **not an implemented secret manager**. Provider OAuth discovery/refresh remains out of scope; this transport supports server-resolved Bearer secrets only.
- A production worker must construct its allowlist and credential resolver from trusted operator configuration and authorized tenant/job references. Never accept these objects directly from a browser, model output or user-supplied JSON.
- DNS and socket dependencies are injectable for tests. Production must use the native defaults; a malicious injected requester can trivially invalidate the security boundary.
- Public addresses can still host attacker-controlled services or public reverse proxies. Operator allowlisting, least privilege, independent network policy and output isolation remain essential.
- Existing policy helpers do not atomically consume approvals or write audits. A caller must not interpret a successful fetch as permission to execute a tool.
- This is not an independent security audit. Network tests use deterministic DNS and HTTPS-stream fixtures, not real provider accounts, DNS rebinding infrastructure or production TLS probes.

## Verification

Address tests cover IPv4/IPv6 bypass classes and cancellation. HTTPS fixtures verify numeric destination + original SNI/Host, certificate verification settings, per-request DNS revalidation, no credential lookup after denied DNS, caller-header restrictions, redirect denial, size/content limits, SSE framing, safe response headers and sanitized secret errors. Existing SDK and UI tests remain in place.

Before release: perform real TLS hostname/mismatch tests, public-to-private DNS rebinding tests, chunked/slow-stream cancellation tests, network-policy enforcement, cross-tenant secret-isolation tests and job authorization/race tests in staging. Keep execution off until all succeed.
