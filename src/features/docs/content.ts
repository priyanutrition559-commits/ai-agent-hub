export const guides = [
  {
    slug: "getting-started",
    category: "Start here",
    title: "Your first steps",
    summary: "Understand what is available, what needs configuration, and where to begin.",
    minutes: 4,
    sections: [
      {
        heading: "Explore before connecting",
        body: "The directory contains nine bundled catalogue entries, not authenticated accounts. Search and filters work locally. Each detail page links to provider documentation and marks information as unverified. No credentials or discovered live tools are seeded.",
      },
      {
        heading: "Prepare the managed backend",
        body: "Ask Lovable to apply the schema and RLS plan in docs/DATABASE-HANDOFF.md. The original rejected search expression is not in the checkout. The handoff contains a candidate immutable expression and a trigger alternative, not an applied migration.",
      },
      {
        heading: "Configure identity and secrets",
        body: "Email authentication uses the configured Lovable/Supabase backend. Confirm allowed site URLs, recovery redirects and email delivery in the provider dashboard. Set provider secrets in server-only secret storage, never in a form, browser storage or repository.",
      },
      {
        heading: "Validate a draft",
        body: "Custom-server and agent forms validate configuration. They do not save or connect yet. Live execution is blocked until persistence, transactional approvals, audit logging and secure network execution have been deployed and tested.",
      },
    ],
  },
  {
    slug: "security",
    category: "Trust & access",
    title: "Permission first, by design",
    summary: "A practical explanation of the controls required before an agent can act.",
    minutes: 6,
    sections: [
      {
        heading: "Default deny",
        body: "New connectors and tools start disabled. A tool call must satisfy user ownership, agent allowlists, connector scopes and enabled-state checks. Provider descriptions and safety annotations do not grant permissions.",
      },
      {
        heading: "Sensitive actions need exact approval",
        body: "Write, delete, send, publish, deploy and payment actions require explicit approval. Production approvals must be bound to the exact arguments and tool version, expire, and be consumed once in a database transaction. That durable approval workflow is still pending.",
      },
      {
        heading: "Untrusted content stays untrusted",
        body: "Tool results are external data, not instructions. The adapter limits output to bounded text and validates arguments against a conservative schema subset. An agent must not promote tool instructions into system authority or include credentials in its context.",
      },
      {
        heading: "URL validation is not a network firewall",
        body: "The app rejects unsafe URL syntax and makes no browser request to custom endpoints. A public hostname can still resolve to a private address. A trusted gateway must validate all DNS answers, pin approved addresses at connection time, block redirects and limit streaming bytes before hosted execution is enabled.",
      },
    ],
  },
  {
    slug: "mcp",
    category: "Connections",
    title: "Understand MCP connections",
    summary:
      "Transports, negotiation, discovery and the difference between available and connected.",
    minutes: 5,
    sections: [
      {
        heading: "What the adapter implements",
        body: "The official MCP TypeScript SDK is pinned to 1.32.2. Its latest supported protocol constant is 2025-11-25. The adapter uses Streamable HTTP, negotiates capabilities, discovers tools/resources/prompts, supports cancellation and closes connections. No hosted route calls the adapter yet.",
      },
      {
        heading: "Bounded discovery",
        body: "Discovery follows at most five pages and accepts at most 200 records and 256 KiB of metadata per collection. Repeated cursors and partial snapshots are rejected. A shared 30-second deadline bounds discovery. Network-level limits are still a gateway prerequisite.",
      },
      {
        heading: "Transport boundaries",
        body: "Legacy SSE-only connections are not implemented. SSE framing inside Streamable HTTP is different from the legacy transport. stdio belongs only in a controlled self-hosted worker, never a browser or shared hosted process. A2A is a separate future interoperability protocol.",
      },
      {
        heading: "Provider setup is separate",
        body: "An entry in the catalogue does not authorize an external account. Each provider needs its own supported adapter, credentials, minimum scopes and revocation workflow. Arena-connected apps are separate from connections made by users of Technology Universe.",
      },
    ],
  },
  {
    slug: "roles",
    category: "Trust & access",
    title: "Roles and ownership",
    summary: "Who should be allowed to see, configure, approve and execute.",
    minutes: 4,
    sections: [
      {
        heading: "Visitors and members",
        body: "Visitors can browse public metadata and documentation. Members should access only their own profiles, collections, connectors, agent runs and orders. Database RLS and compound ownership constraints are required to enforce that boundary; these tables are not deployed yet.",
      },
      {
        heading: "Editors and administrators",
        body: "Editor is a proposed content-curation role, not an implemented permission. The current admin readiness function checks server-controlled app_metadata.role. Before sensitive admin mutations are added, current role membership must be verified in the database to avoid stale JWT grants.",
      },
      {
        heading: "Workers cannot approve themselves",
        body: "Execution workers must receive narrow, time-limited job permissions. They cannot assign roles, grant arbitrary connector access or approve their own calls. The queue and worker authorization model are pending deployment.",
      },
      {
        heading: "No role bypass",
        body: "Being an administrator must not silently bypass user consent, tool approval, RLS or audit requirements. All operations need explicit ownership and policy checks. User-editable profile metadata is never an authorization source.",
      },
    ],
  },
  {
    slug: "release-readiness",
    category: "Operations",
    title: "Before production",
    summary: "The outstanding release, legal and operational prerequisites.",
    minutes: 5,
    sections: [
      {
        heading: "Identity and tenant isolation",
        body: "Verify real email delivery, recovery links, session expiration, protected operations, role revocation and two-user RLS denial tests. Mock authentication tests cannot certify a production identity provider.",
      },
      {
        heading: "Execution safety",
        body: "Deploy and test secret rotation, DNS/IP pinning, approval replay protection, cancellation, quotas, concurrency, budget enforcement and circuit breakers. No agent execution or external payment should be enabled before these controls are effective.",
      },
      {
        heading: "Legal and business configuration",
        body: "The operating entity, support contact, data retention rules, subprocessors, privacy policy, terms and any commercial plans require owner and legal review. This guide is not a privacy policy or legal agreement. No prices or claims of compliance are invented.",
      },
      {
        heading: "Operational acceptance",
        body: "Review CI results, staged browser and accessibility tests, backup restore, rollback, monitoring and incident drills. Native Expo/Electron apps, signing and distribution are separate workstreams. Payments remain disabled.",
      },
    ],
  },
] as const;
