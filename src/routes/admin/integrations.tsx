import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getAdminReadiness } from "@/features/integrations/functions";
export const Route = createFileRoute("/admin/integrations")({ component: Admin });
function Admin() {
  const [status, setStatus] = useState("Sign in with an administrator account to check readiness.");
  const [checks, setChecks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      const data = await getAdminReadiness();
      setStatus(data.message);
      setChecks(data.checks);
    } catch {
      setChecks([]);
      setStatus(
        "Access denied or backend unavailable. An authenticated administrator account is required.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">MCP & Agent Connections</h1>
      <p className="mt-4 text-muted-foreground">
        Protected operational data requires server-verified administrator access.
      </p>
      <div className="mt-8 rounded-xl border p-6">
        <h2 className="font-semibold">Deployment readiness</h2>
        <p role="status" className="my-4 text-sm">
          {status}
        </p>
        <ul className="mb-4 space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <Button disabled={busy} onClick={load}>
            {busy ? "Checking…" : "Check admin readiness"}
          </Button>
          <Link to="/sign-in" className="text-sm underline">
            Sign in
          </Link>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {["Approval queue", "Execution & audit logs"].map((title) => (
          <section key={title} className="rounded-xl border p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Unavailable until the managed database and authorization workflow are deployed. No
              records are fabricated or exposed.
            </p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
