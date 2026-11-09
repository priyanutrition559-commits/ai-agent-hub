/** Catalogue metadata only. Presence never implies a live connection. */
export const categories = [
  "All categories",
  "Developer tools",
  "Source control",
  "Design",
  "Databases",
  "Cloud / hosting",
  "Observability",
  "Productivity",
  "Research / search",
  "Communication",
  "Commerce / payments",
  "Storage",
  "Custom MCP",
] as const;
export type Connector = {
  id: string;
  name: string;
  category: string;
  purpose: string;
  docs: string;
  auth: string;
  protocol: string;
  scopes: string;
  risk: string;
  glyph: string;
};
export const connectors: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    category: "Source control",
    purpose: "Bring repositories, issues and pull requests into your agent workflows.",
    docs: "https://github.com/github/github-mcp-server",
    auth: "Provider token / OAuth setup required",
    protocol: "Remote MCP / Streamable HTTP",
    scopes: "Start with selected repositories and read-only access",
    risk: "High when write tools are enabled",
    glyph: "GH",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Databases",
    purpose: "Explore database projects and documentation with scoped access.",
    docs: "https://supabase.com/docs/guides/getting-started/mcp",
    auth: "Provider authorization required",
    protocol: "Remote MCP / Streamable HTTP",
    scopes: "Project-scoped, read-only recommended",
    risk: "High: database access",
    glyph: "S",
  },
  {
    id: "figma",
    name: "Figma",
    category: "Design",
    purpose: "Give agents design context from your team's files and components.",
    docs: "https://developers.figma.com/docs/figma-mcp-server/",
    auth: "Provider authorization required",
    protocol: "Remote MCP; verify current provider requirements",
    scopes: "Selected design files; confirm with provider",
    risk: "Private design data",
    glyph: "F",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Cloud / hosting",
    purpose: "Understand projects and deployments before taking action.",
    docs: "https://vercel.com/docs/mcp",
    auth: "Provider authorization required",
    protocol: "Remote MCP; verify current provider requirements",
    scopes: "Selected team and projects",
    risk: "High: deployment actions",
    glyph: "▲",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Productivity",
    purpose: "Connect workspace knowledge, documents and project context.",
    docs: "https://developers.notion.com/docs/mcp",
    auth: "Provider authorization required",
    protocol: "Remote MCP; verify current provider requirements",
    scopes: "Selected pages; read-only by default",
    risk: "Private workspace data",
    glyph: "N",
  },
  {
    id: "lovable",
    name: "Lovable",
    category: "Developer tools",
    purpose: "Coordinate application development through the Lovable platform.",
    docs: "https://docs.lovable.dev/",
    auth: "Lovable-managed connector configuration",
    protocol: "Provider-specific; verify in official documentation",
    scopes: "Project-specific; verify in dashboard",
    risk: "High: application changes",
    glyph: "L",
  },
  {
    id: "tinyfish",
    name: "TinyFish",
    category: "Research / search",
    purpose: "Explore web automation for research and structured information.",
    docs: "https://docs.tinyfish.ai/",
    auth: "API credential required",
    protocol: "Provider API; MCP adapter not verified",
    scopes: "Verify supported scopes with provider",
    risk: "External web content and actions",
    glyph: "TF",
  },
  {
    id: "exa",
    name: "Exa",
    category: "Research / search",
    purpose: "Find relevant sources and add web research to your workflows.",
    docs: "https://docs.exa.ai/",
    auth: "API credential required",
    protocol: "Provider API / MCP; verify endpoint with provider",
    scopes: "Search-only access recommended",
    risk: "Untrusted external content",
    glyph: "E",
  },
  {
    id: "custom",
    name: "Custom MCP",
    category: "Custom MCP",
    purpose: "Bring your own remote server through an approved secure gateway.",
    docs: "https://modelcontextprotocol.io/specification/2025-11-25",
    auth: "None or server-side bearer secret reference",
    protocol: "Streamable HTTP only in hosted runtime",
    scopes: "Explicit per-server and per-tool allowlist",
    risk: "Unverified server: default deny",
    glyph: "⌘",
  },
];
export function searchConnectors(query: string, category: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return connectors.filter(
    (c) =>
      (category === "All categories" || c.category === category) &&
      `${c.name} ${c.purpose} ${c.category}`.toLocaleLowerCase().includes(normalized),
  );
}
