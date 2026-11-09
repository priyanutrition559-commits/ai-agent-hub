import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { connectors } from "@/features/integrations/catalogue";
import { connectorAction } from "@/features/integrations/functions";
export const Route = createFileRoute("/integrations/$connectorId")({
  loader: ({ params }) => {
    const item = connectors.find((c) => c.id === params.connectorId);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Connector"} | Technology Universe` }],
  }),
  component: Detail,
});
function Detail() {
  const c = Route.useLoaderData();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(action: "connect" | "test" | "reauthorize") {
    setBusy(true);
    try {
      const result = await connectorAction({ data: { connectorId: c.id, action } });
      setMessage(result.message);
    } catch {
      setMessage(
        "Unable to continue. Sign in and configure Lovable Cloud first. No connection was established.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <Link to="/integrations" className="text-sm text-muted-foreground">
        ← All integrations
      </Link>
      <div className="my-8 flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-xl border text-xl font-bold">
          {c.glyph}
        </span>
        <div>
          <h1 className="text-3xl font-semibold">{c.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {c.category} · Available to configure
          </p>
        </div>
      </div>
      <p className="max-w-2xl text-muted-foreground">{c.purpose}</p>
      <p className="my-6 rounded-lg border p-4 text-sm">
        Unverified catalogue information. Confirm current capabilities, scopes and authentication in
        the official documentation. No tools have been discovered.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => act("connect")}>
          Connect
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => act("test")}>
          Test connection
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => act("reauthorize")}>
          Reauthorize
        </Button>
        <Button variant="outline" disabled title="No connection exists to disconnect">
          Disconnect
        </Button>
      </div>
      <p role="status" className="my-5 text-sm">
        {busy ? "Checking configuration…" : message}
      </p>
      <dl className="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2">
        {[
          ["Protocol / transport", c.protocol],
          ["Authentication", c.auth],
          ["Required access", c.scopes],
          ["Risk", c.risk],
          ["Last health check", "Never — not connected"],
          ["Negotiated protocol", "None — initialization has not run"],
          ["Enabled tools / capabilities", "None — new tools start disabled"],
          ["Icon source", "Local typographic placeholder; not a provider logo"],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Tools & permissions</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Connect and discover tools after backend setup. Permissions cannot be configured until
          tools have actually been discovered.
        </p>
        <Button className="mt-4" variant="outline" disabled>
          Configure permissions — setup required
        </Button>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Setup instructions</h2>
        <ol className="my-4 list-inside list-decimal space-y-3 text-sm text-muted-foreground">
          <li>Review the provider’s official requirements and least-privilege scopes.</li>
          <li>Deploy the managed schema and trusted egress gateway.</li>
          <li>Configure credentials in server-side secret storage, never in this form.</li>
          <li>Authenticate, test, discover, and explicitly enable reviewed tools.</li>
        </ol>
        <a href={c.docs} target="_blank" rel="noopener noreferrer" className="text-sm underline">
          Official documentation ↗
        </a>
      </section>
    </AppShell>
  );
}
