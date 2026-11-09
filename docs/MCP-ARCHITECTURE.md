# Architecture and threat model

## Current architecture

TanStack Start file routes → React UI / existing shadcn design tokens → authenticated `createServerFn` handlers → configuration-required response. Existing Supabase JWT verification and global auth attacher are retained; Start CSRF middleware remains active. Admin readiness uses server-controlled JWT app_metadata.role. A cached JWT role can be stale until refresh; sensitive admin operations must recheck current role membership in the database before release.

The independent `.server.ts` MCP adapter is **not reachable from a route**. It requires an injected TrustedEgress implementation and has no default global fetch. The catalogue is metadata, not a registry of authenticated connections. New agent fields are draft configuration, not execution guarantees.

Target: authenticated API → RLS-scoped transactional storage/approval/audit → durable queue → isolated egress worker → provider MCP. Secret manager is worker-only. UI receives reference/status metadata, never tokens. Tool output is external data, not an instruction source; no LLM calls currently consume it.

## Protocol / SDK boundary

- SDK: `@modelcontextprotocol/sdk` exactly **1.32.2**, pinned in package.json and bun.lock.
- Installed SDK's latest protocol constant: **2025-11-25**. The official SDK negotiates with its supported versions; the adapter exposes the actual `transport.protocolVersion`, server identity and capabilities after initialize. No connection means no protocol version in the UI.
- Streamable HTTP is implemented by the SDK. Pagination cursors are surfaced; complete multi-page discovery persistence is pending. Server-advertised tool safety annotations are never permission grants.
- AbortSignal and 15-second SDK request timeout are supplied. Tool output is text-only, at most 64 KiB after JSON encoding; schemas at most 16k characters and conservative subset/depth. The gateway must also cap bytes before SDK parsing, cap streaming duration and reject unsupported wire content.
- Remote SSE-only transports are not implemented. SSE framing within Streamable HTTP is distinct from the legacy SSE transport.
- stdio never runs in the browser or shared hosted app; future isolated self-hosted worker only. Roots, sampling, elicitation and experimental tasks are not advertised or enabled.
- A2A is a separate future protocol boundary, not an MCP transport or implemented feature.

Primary references: https://modelcontextprotocol.io/specification/2025-11-25 and https://github.com/modelcontextprotocol/typescript-sdk . Provider-specific details must be reverified before release. No claim is made that a provider account has authorized this app.

## Threats and controls

| Threat | Implemented today | Required before live execution |
|---|---|---|
| SSRF / DNS rebinding | HTTPS/public-host syntax gate; no endpoint fetch from browser or hosted handler; adapter rejects cross-endpoint requests/redirects | Gateway resolves ALL A/AAAA results; rejects private/reserved/link-local/mapped ranges; pins approved IP at socket connection; blocks metadata; endpoint allowlist; no redirects; defense-in-depth network policy |
| Token exfiltration | No credential fields; server secret-reference draft only; no live credentials in catalogue | Vault/KMS-backed encryption, restricted worker identity, key versions/rotation, OAuth PKCE/state binding, no arbitrary auth discovery fetch |
| Prompt injection | Plain text rendering, output tagged untrusted, no agent execution | Isolated result channel, no promotion into instructions, secret-free LLM context, review retrieved content/links |
| Tool schema abuse | Strict bounded Ajv schema subset; remote refs and regex prohibited | Reviewed immutable schema hashes, worker CPU/memory isolation, pre-parse byte/depth caps |
| Unauthorized writes | No invocation endpoint; pure owner/scope/allowlist policy; sensitive calls require matching approval prerequisite | Transactional exact-call/args-hash/tool-version approval, TTL and one-time consumption, revocation check at dispatch |
| Replay / duplicate side effects | Adapter disables transport reconnection retry; retry helper disallows writes | Durable request IDs, leases, provider idempotency only when verified, reconciliation of uncertain delivery |
| Denial of service | Draft limits and SDK timeout; no exposed executor | Distributed quotas/concurrency limits, bounded queues, rate limiting auth endpoints, circuit breakers, streaming limits |
| Audit leakage | Metadata helper excludes free text and sensitive keys | Structured event allowlists, immutable retention, log scrubbing at infra/error middleware, restricted audit access |
| Tenant crossover | Server auth middleware; all execution disabled | Composite owner FKs/RLS, policy-tested server RPCs; no service-role bypass for user operations |

The URL helper is NOT advertised as a complete SSRF defense. A malicious public DNS name can resolve to private addresses; it remains unsafe until the trusted gateway enforces the missing network controls. Redirects are denied altogether rather than followed without validation. SDK and output validators alone do not make execution safe.

## Shared clients / runtime constraints

This is TanStack Start on Vite/Nitro targeting Cloudflare, not Next.js App Router. No `app/` folder, Next middleware or `server-only` package. Node-only subprocesses, stdio, arbitrary sockets and desktop APIs do not belong in the hosted web process. The dedicated worker is a separate deployment prerequisite, not a second frontend.

`packages/contracts` is a private TypeScript workspace with credential-free wire types. Future Expo and Electron clients can consume it but must call the same authenticated API and cannot bypass RLS. No native apps, installers, signing, app-store shipping or Electron execution are implemented here. Model calls must remain on Lovable's gateway; do not introduce unreviewed provider SDK keys in clients.
