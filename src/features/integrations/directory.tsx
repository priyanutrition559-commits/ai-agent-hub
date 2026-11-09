import { useHydrated } from "@/hooks/use-hydrated";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/app-shell";
import { categories, searchConnectors } from "./catalogue";

export function Directory({ explorer = false }: { explorer?: boolean }) {
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const results = searchConnectors(query, category);
  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">
            Workspace / {explorer ? "Explore" : "Integrations"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {explorer ? "Technology Explorer" : "Connect your universe."}
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            {explorer
              ? "Discover the tools behind your next workflow. Catalogue information is unverified until reviewed against provider documentation."
              : "Give your agents the right tools. Explore connections, control permissions, and keep every action in your hands."}
          </p>
        </div>
        <Link
          to="/integrations/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          <Plus size={16} />
          Add custom MCP
        </Link>
      </div>
      <div className="mb-9 grid gap-4 sm:grid-cols-3">
        {[
          ["09", "Catalogue connectors"],
          ["00", "Authenticated connections"],
          ["Default deny", "Your permission policy"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 flex items-start gap-3 rounded-xl border bg-secondary/40 p-4 text-sm">
        <ShieldCheck className="mt-0.5 shrink-0" size={18} />
        <p>
          <strong>Available doesn’t mean connected.</strong> No external accounts are connected.
          Database and secure gateway setup are required before enabling connections.
        </p>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {explorer ? "Technology catalogue" : "Connector directory"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A starting point for a more capable workspace.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute top-3 left-3 text-muted-foreground" />
          <Input
            disabled={!hydrated}
            aria-label="Search connectors"
            className="pl-9"
            placeholder="Search tools and connections…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-7 flex gap-2 overflow-x-auto pb-2" aria-label="Connector categories">
        {categories.map((c) => (
          <button
            key={c}
            disabled={!hydrated}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "connector" : "connectors"} · Metadata only ·
        Provider requirements need verification
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((c) => (
          <Link
            to="/integrations/$connectorId"
            params={{ connectorId: c.id }}
            key={c.id}
            className="group flex flex-col rounded-xl border bg-card p-6 transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div className="mb-5 flex items-center justify-between">
              <span
                aria-hidden
                className="flex size-12 items-center justify-center rounded-xl border bg-background text-lg font-bold"
              >
                {c.glyph}
              </span>
              <ArrowUpRight size={17} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <span className="mt-1 text-xs text-muted-foreground">{c.category}</span>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{c.purpose}</p>
            <div className="mt-6 flex items-center gap-2 border-t pt-4 text-xs">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              Available to configure
            </div>
          </Link>
        ))}
      </div>
      {!results.length && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="font-medium">No connectors found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another search or category. No live connectors have been installed.
          </p>
        </div>
      )}
      <p className="mt-8 text-xs text-muted-foreground">
        Provider initials and generic symbols are used instead of brand logos. No GS brand asset has
        been supplied.
      </p>
    </AppShell>
  );
}
