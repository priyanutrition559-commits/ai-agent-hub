export type Phase = {
  number: number;
  title: string;
  status: "blocked" | "partial";
  summary: string;
  tasks: { title: string; done: boolean }[];
};
export const phases: Phase[] = [
  {
    number: 1,
    title: "Database & authorization",
    status: "blocked",
    summary: "Lovable-managed deployment required. No migrations have been applied by this branch.",
    tasks: [
      { title: "Schema, catalogue search and RLS handoff documented", done: true },
      { title: "Apply schema and search fix through Lovable", done: false },
      { title: "Transactional ownership, role and approval APIs", done: false },
      { title: "Two-user RLS tests and backup restore verification", done: false },
    ],
  },
  {
    number: 2,
    title: "Identity & accounts",
    status: "partial",
    summary:
      "Authentication UI calls the configured provider. Live email delivery and recovery require deployment verification.",
    tasks: [
      { title: "Sign-up, sign-in and sign-out UI", done: true },
      { title: "Recovery request and password-update screens", done: true },
      { title: "Production email delivery and session lifecycle tests", done: false },
      { title: "Current-role checks, account deletion and identity rate limits", done: false },
    ],
  },
  {
    number: 3,
    title: "Reusable UI system",
    status: "partial",
    summary: "A shared visual language for navigation, page layouts and operational states.",
    tasks: [
      { title: "Page headers, status badges, empty states and pagination", done: true },
      { title: "Responsive shell and light/dark theme", done: true },
      { title: "Transactional confirmation and approval components", done: false },
      { title: "Audit tables and execution timeline", done: false },
    ],
  },
  {
    number: 4,
    title: "Technology Explorer",
    status: "partial",
    summary: "Search, sort and pagination operate on metadata—not live database records.",
    tasks: [
      { title: "Searchable catalogue and linked provider details", done: true },
      { title: "Sorting, pagination and reusable connector cards", done: true },
      { title: "Database search and content publishing workflow", done: false },
      { title: "Favourites, collections and stacks with RLS", done: false },
    ],
  },
  {
    number: 5,
    title: "Secure MCP connections",
    status: "partial",
    summary: "Tested SDK building blocks exist. Hosted execution is deliberately blocked.",
    tasks: [
      { title: "Pinned SDK, bounded discovery and policy tests", done: true },
      { title: "Persistent connector CRUD and secret rotation", done: false },
      { title: "Provider OAuth and real connection health", done: false },
      { title: "SSRF-safe egress gateway with DNS/IP pinning", done: false },
    ],
  },
  {
    number: 6,
    title: "Agent execution & approvals",
    status: "blocked",
    summary: "Draft configuration does not run an agent or grant tool access.",
    tasks: [
      { title: "Agent draft form with validated limits", done: true },
      { title: "Durable queue and model execution through Lovable", done: false },
      { title: "Exact-call approvals and immutable audit records", done: false },
      { title: "Enforced quotas, budgets, cancellation and circuit breakers", done: false },
    ],
  },
  {
    number: 7,
    title: "Product workflows",
    status: "blocked",
    summary: "Do not enable commerce or claim saved personal content before its backend exists.",
    tasks: [
      { title: "Learning progress and saved paths", done: false },
      { title: "Portfolio editor and public portfolios", done: false },
      { title: "Shop, cart and transactional unpaid orders", done: false },
      { title: "Full content, user and order administration", done: false },
    ],
  },
  {
    number: 8,
    title: "Product story & documentation",
    status: "partial",
    summary: "Useful product information without invented pricing, policies or compliance claims.",
    tasks: [
      { title: "Product overview and use cases", done: true },
      { title: "Searchable guides for setup, MCP, roles and security", done: true },
      { title: "Owner-approved legal policies and support contact", done: false },
      { title: "Production canonical URLs, sitemap and supplied brand assets", done: false },
    ],
  },
  {
    number: 9,
    title: "Accessibility & responsive UX",
    status: "partial",
    summary: "Automated checks supplement—not replace—manual accessibility review.",
    tasks: [
      { title: "Reduced motion, focus styles and mobile navigation", done: true },
      { title: "Hydration-safe forms and theme regression tests", done: true },
      { title: "Comprehensive contrast and screen-reader audit", done: false },
      { title: "Zoom, touch, slow-network and cross-browser acceptance", done: false },
    ],
  },
  {
    number: 10,
    title: "Release & operations",
    status: "partial",
    summary:
      "Production remains blocked until live authorization and execution controls pass acceptance.",
    tasks: [
      { title: "Typecheck, build, unit tests and browser CI", done: true },
      { title: "Staging deployment, monitoring and rollback drills", done: false },
      { title: "Live RLS, approval replay and quota-race tests", done: false },
      { title: "Security review, retention and incident-response signoff", done: false },
    ],
  },
];
