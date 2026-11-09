import { useHydrated } from "@/hooks/use-hydrated";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serverDraftSchema } from "@/features/integrations/policy";
import { validateServerDraft } from "@/features/integrations/functions";
export const Route = createFileRoute("/integrations/new")({ component: CustomServer });
function CustomServer() {
  const hydrated = useHydrated();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [auth, setAuth] = useState("none");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = serverDraftSchema.safeParse({
      name: form.get("name"),
      endpoint: form.get("endpoint"),
      transport: "streamable-http",
      authentication: auth,
      secretReference: form.get("secretReference") ?? "",
      scopes: String(form.get("scopes") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((i) => i.message).join(" "));
      return;
    }
    setBusy(true);
    try {
      const result = await validateServerDraft({ data: parsed.data });
      setMessage(result.message);
    } catch {
      setMessage(
        "Sign in and configure Lovable Cloud to validate this draft server-side. Nothing was saved or connected.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <Link to="/integrations" className="text-sm text-muted-foreground">
        ← Integrations
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Add a custom MCP server</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Define the connection, review access, then configure the backend. Validation never contacts
        your endpoint.
      </p>
      <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6 rounded-xl border p-6">
        <fieldset disabled={!hydrated || busy} className="contents">
          <h2 className="font-semibold">1. Server identity</h2>
          <label className="block text-sm">
            Server name
            <Input
              name="name"
              required
              minLength={2}
              maxLength={80}
              className="mt-2"
              placeholder="Research workspace"
            />
          </label>
          <label className="block text-sm">
            Endpoint URL
            <Input
              name="endpoint"
              required
              type="url"
              maxLength={2048}
              className="mt-2"
              placeholder="https://mcp.your-provider.com/mcp"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            HTTPS only. No IP literals, local/private targets, URL credentials, query strings or
            redirects. Public DNS still needs gateway review.
          </p>
          <label className="block text-sm">
            Transport
            <select
              className="mt-2 w-full rounded-md border bg-background p-2"
              aria-label="Transport"
            >
              <option>Streamable HTTP</option>
              <option disabled>Legacy SSE — not supported in hosted execution</option>
              <option disabled>stdio — self-hosted worker only</option>
            </select>
          </label>
          <h2 className="border-t pt-6 font-semibold">2. Authentication & access</h2>
          <label className="block text-sm">
            Authentication
            <select
              value={auth}
              onChange={(e) => setAuth(e.target.value)}
              className="mt-2 w-full rounded-md border bg-background p-2"
            >
              <option value="none">No authentication</option>
              <option value="bearer">Bearer token in secret storage</option>
            </select>
          </label>
          {auth === "bearer" && (
            <label className="block text-sm">
              Secret reference (not the secret value)
              <Input
                name="secretReference"
                required
                maxLength={120}
                placeholder="MCP_RESEARCH_TOKEN"
                className="mt-2"
              />
            </label>
          )}
          <label className="block text-sm">
            Requested scopes, comma-separated
            <Input name="scopes" maxLength={1600} className="mt-2" placeholder="read:documents" />
          </label>
          <p className="rounded-lg bg-secondary p-4 text-sm">
            3. Review: this server and every discovered tool will start disabled. Sensitive actions
            require approval bound to the exact call. No permissions are granted by this form.
          </p>
          <Button disabled={busy} type="submit">
            {busy ? "Validating…" : "Validate configuration"}
          </Button>
          <p role="status" className="text-sm">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            Saving and connecting are unavailable until managed backend setup is complete.
          </p>
        </fieldset>
      </form>
    </AppShell>
  );
}
