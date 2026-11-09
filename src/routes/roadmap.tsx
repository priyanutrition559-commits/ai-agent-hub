import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { Button } from "@/components/ui/button";
import { phases } from "@/features/docs/roadmap";
import { useHydrated } from "@/hooks/use-hydrated";
export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Build roadmap | Technology Universe" }] }),
  component: Roadmap,
});
function Roadmap() {
  const [pending, setPending] = useState(false);
  const hydrated = useHydrated();
  const tasks = phases.flatMap((p) => p.tasks);
  return (
    <AppShell>
      <PageHeader
        eyebrow="Build / Implementation status"
        title="The whole picture. Not just the highlights."
        description="A versioned implementation checklist for all ten phases. This is a code-maintained status report, not live deployment telemetry."
      />
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {[
          [tasks.filter((t) => t.done).length, "Implemented checklist items"],
          [tasks.filter((t) => !t.done).length, "Remaining checklist items"],
          [phases.filter((p) => p.status === "blocked").length, "Blocked phases"],
        ].map(([count, label]) => (
          <div className="surface-card p-5" key={label}>
            <p className="text-3xl font-semibold">{count}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Completing a checklist item does not certify production readiness.
        </p>
        <Button
          variant="outline"
          disabled={!hydrated}
          aria-pressed={pending}
          onClick={() => setPending(!pending)}
        >
          {pending ? "Show all tasks" : "Show pending only"}
        </Button>
      </div>
      <div className="space-y-4">
        {phases.map((p) => (
          <section className="surface-card p-6" key={p.number}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Phase {String(p.number).padStart(2, "0")}</p>
                <h2 className="text-lg font-semibold">{p.title}</h2>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{p.summary}</p>
            <ul className="mt-5 grid gap-3 border-t pt-5 md:grid-cols-2">
              {p.tasks
                .filter((t) => !pending || !t.done)
                .map((t) => (
                  <li key={t.title} className="flex items-start gap-2.5 text-xs leading-6">
                    {t.done ? (
                      <Check
                        size={15}
                        className="mt-1 shrink-0 text-primary"
                        aria-label="Implemented"
                      />
                    ) : (
                      <Circle
                        size={13}
                        className="mt-1.5 shrink-0 text-muted-foreground"
                        aria-label="Pending"
                      />
                    )}
                    {t.title}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
