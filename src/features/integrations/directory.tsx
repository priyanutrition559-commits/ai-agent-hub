import { useHydrated } from "@/hooks/use-hydrated";
import { Link } from "@tanstack/react-router";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/workspace/page-header";
import { EmptyState } from "@/components/workspace/empty-state";
import { ConnectorCard } from "@/components/workspace/connector-card";
import { Pagination } from "@/components/workspace/pagination";
import { categories, connectors } from "./catalogue";
import { cataloguePage, type CatalogueSort } from "./catalogue-view";
export function Directory({ explorer = false }: { explorer?: boolean }) {
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<CatalogueSort>("featured");
  const result = cataloguePage(query, category, sort, page);
  function clear() {
    setQuery("");
    setCategory("All categories");
    setSort("featured");
    setPage(1);
  }
  return (
    <AppShell>
      <PageHeader
        eyebrow={`Workspace / ${explorer ? "Explore" : "Integrations"}`}
        title={explorer ? "Technology Explorer" : "Connect your universe."}
        description={
          explorer
            ? "Discover the tools behind your next workflow. Browse deliberately, compare sources, and know what has yet to be verified."
            : "Bring the right tools into your workspace. Start with understanding, connect with intention, and keep every permission in your hands."
        }
        actions={
          <Link
            to="/integrations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs font-medium text-primary-foreground"
          >
            <Plus size={15} />
            Add custom MCP
          </Link>
        }
      />
      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        {[
          [String(connectors.length).padStart(2, "0"), "Catalogue connectors"],
          ["00", "Authenticated connections"],
          ["Default deny", "Your permission policy"],
        ].map(([value, label]) => (
          <div key={label} className="surface-card flex items-center gap-4 px-5 py-4">
            <p className="text-xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-6">
        <ShieldCheck className="mt-1 shrink-0 text-primary" size={17} />
        <p>
          <strong>Available doesn’t mean connected.</strong> No external accounts are connected.
          Database and secure gateway setup are required before enabling connections.
        </p>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {explorer ? "Technology catalogue" : "Connector directory"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Good tools. Thoughtful connections.</p>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-64">
            <Search
              size={16}
              className="absolute top-3 left-3 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              disabled={!hydrated}
              aria-label="Search connectors"
              className="bg-card pl-9"
              placeholder="Find your next connection…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            aria-label="Sort connectors"
            disabled={!hydrated}
            className="h-10 rounded-md border bg-card px-3 text-xs"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as CatalogueSort);
              setPage(1);
            }}
          >
            <option value="featured">Featured</option>
            <option value="name-asc">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
          </select>
        </div>
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Connector categories">
        {categories.map((c) => (
          <button
            type="button"
            key={c}
            disabled={!hydrated}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
            aria-pressed={category === c}
            className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground" aria-live="polite">
          {result.total} {result.total === 1 ? "connector" : "connectors"} · Metadata only ·
          Provider requirements need verification
        </p>
        {(query || category !== "All categories" || sort !== "featured") && (
          <Button size="sm" variant="ghost" onClick={clear}>
            Clear filters
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.items.map((c) => (
          <ConnectorCard key={c.id} connector={c} />
        ))}
      </div>
      {!result.total && (
        <EmptyState
          title="No connectors found"
          description="Try another search or category. No live connectors have been installed."
          action={
            <Button variant="outline" onClick={clear}>
              Reset search
            </Button>
          }
        />
      )}
      <Pagination
        page={result.page}
        totalPages={result.pages}
        onPageChange={setPage}
        disabled={!hydrated}
      />
      <p className="mt-7 text-[11px] text-muted-foreground">
        Provider initials and generic symbols are local placeholders, not brand logos. Catalogue
        search is currently local; persistent records are pending.
      </p>
    </AppShell>
  );
}
