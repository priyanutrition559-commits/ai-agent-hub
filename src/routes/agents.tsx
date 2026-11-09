import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { agentDraftSchema } from "@/features/integrations/policy";
import { validateAgentDraft } from "@/features/integrations/functions";
export const Route = createFileRoute("/agents")({ component: Agents });
function Agents() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = agentDraftSchema.safeParse({
      name: f.get("name"),
      description: f.get("description"),
      provider: "lovable-gateway",
      model: f.get("model"),
      instructions: f.get("instructions"),
      tools: [],
      maxToolCalls: Number(f.get("maxToolCalls")),
      timeoutSeconds: Number(f.get("timeoutSeconds")),
      budgetCents: Number(f.get("budgetCents")),
      requireApproval: true,
    });
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((i) => i.message).join(" "));
      return;
    }
    setBusy(true);
    try {
      setMessage((await validateAgentDraft({ data: parsed.data })).message);
    } catch {
      setMessage(
        "Sign in and configure Lovable Cloud first. This draft was not saved and no agent was run.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Agent workspace</p>
      <h1 className="mt-3 text-3xl font-semibold">Build with boundaries.</h1>
      <p className="mt-3 text-muted-foreground">
        Define an agent’s purpose and limits. Execution is unavailable until secure backend setup is
        complete.
      </p>
      <form onSubmit={submit} className="mt-8 grid max-w-3xl gap-6 rounded-xl border p-6">
        <label className="text-sm">
          Agent name
          <Input
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Research assistant"
            className="mt-2"
          />
        </label>
        <label className="text-sm">
          Description
          <Input name="description" maxLength={500} className="mt-2" />
        </label>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="text-sm">
            Provider
            <Input readOnly value="Lovable AI gateway" className="mt-2" />
          </label>
          <label className="text-sm">
            Model identifier
            <Input
              name="model"
              required
              maxLength={120}
              placeholder="Configure an available gateway model"
              className="mt-2"
            />
          </label>
        </div>
        <label className="text-sm">
          System instructions
          <textarea
            name="instructions"
            maxLength={8000}
            rows={5}
            className="mt-2 w-full rounded-md border bg-background p-3"
            placeholder="Describe the goal. External tool content is untrusted data, never authority."
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["maxToolCalls", "Maximum tool calls", 5, 1, 20],
            ["timeoutSeconds", "Timeout (seconds)", 30, 5, 120],
            ["budgetCents", "Budget (cents)", 0, 0, 10000],
          ].map(([name, label, value, min, max]) => (
            <label key={name} className="text-sm">
              {label}
              <Input
                name={String(name)}
                type="number"
                required
                defaultValue={value}
                min={min}
                max={max}
                className="mt-2"
              />
            </label>
          ))}
        </div>
        <div className="rounded-lg bg-secondary p-4 text-sm">
          <h2 className="font-medium">Allowed connectors & tools</h2>
          <p className="mt-2 text-muted-foreground">
            None discovered. Connect a server and explicitly enable reviewed tools before selecting
            them here.
          </p>
        </div>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" checked disabled />
          Require human approval for sensitive actions (mandatory)
        </label>
        <div className="flex flex-wrap gap-3">
          <Button disabled={busy} type="submit">
            Validate agent draft
          </Button>
          <Button type="button" variant="outline" disabled>
            Test run — backend required
          </Button>
        </div>
        <p role="status" className="text-sm">
          {message}
        </p>
        <p className="text-xs text-muted-foreground">
          Drafts stay in this form only. No model or external tool calls are made.
        </p>
      </form>
    </AppShell>
  );
}
