import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/workspace/page-header";
import { EmptyState } from "@/components/workspace/empty-state";
import { Input } from "@/components/ui/input";
import { guides } from "@/features/docs/content";
import { useHydrated } from "@/hooks/use-hydrated";
export const Route = createFileRoute("/docs/")({
  head: () => ({ meta: [{ title: "Learning & docs | Technology Universe" }] }),
  component: Docs,
});
function Docs() {
  const [query, setQuery] = useState("");
  const hydrated = useHydrated();
  const results = guides.filter((g) =>
    `${g.title} ${g.summary} ${g.category}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <AppShell>
      <PageHeader
        eyebrow="Learn / Documentation"
        title="A little context goes a long way."
        description="Understand your workspace before you give it access. Practical guides, honest limitations, and clear next steps."
      />
      <Input
        className="mb-7 max-w-md bg-card"
        aria-label="Search documentation"
        placeholder="Search guides…"
        disabled={!hydrated}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((g) => (
          <Link
            key={g.slug}
            to="/docs/$slug"
            params={{ slug: g.slug }}
            className="surface-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-6 flex items-center justify-between text-primary">
              <BookOpen size={22} />
              <ArrowUpRight size={16} />
            </div>
            <p className="eyebrow mb-2">
              {g.category} · {g.minutes} min read
            </p>
            <h2 className="text-lg font-semibold">{g.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{g.summary}</p>
          </Link>
        ))}
      </div>
      {!results.length && (
        <EmptyState
          title="No guides found"
          description="Try a topic such as security, connections or roles."
        />
      )}
      <p className="mt-7 text-xs text-muted-foreground">
        Reading guides is available now. Saved learning-path progress is not yet implemented.
      </p>
    </AppShell>
  );
}
