import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Compass, Workflow, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Technology Universe | Your agent workspace" }] }),
  component: Index,
});
function Index() {
  return (
    <AppShell>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        A connected workspace, built with intention
      </p>
      <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        Your tools. Your agents.
        <br />
        <span className="text-muted-foreground">Your universe.</span>
      </h1>
      <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
        Explore technology, plan your agent workflows, and connect the tools that matter — with
        explicit permissions at every step.
      </p>
      <Link
        to="/integrations"
        className="mt-7 inline-flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm text-primary-foreground"
      >
        Explore integrations <ArrowUpRight size={16} />
      </Link>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          {
            to: "/explorer",
            title: "Discover your stack",
            body: "Search a curated starting catalogue. Review sources and unverified provider details.",
            icon: Compass,
          },
          {
            to: "/integrations",
            title: "Connect with control",
            body: "Find nine featured connectors and validate a custom remote MCP configuration.",
            icon: Workflow,
          },
          {
            to: "/agents",
            title: "Design an agent",
            body: "Set instructions, limits and approval requirements before granting tool access.",
            icon: Bot,
          },
        ].map(({ to, title, body, icon: Icon }) => (
          <Link key={to} to={to} className="rounded-xl border bg-card p-6 hover:bg-secondary/40">
            <Icon size={24} />
            <h2 className="mt-6 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </Link>
        ))}
      </div>
      <section className="mt-10 rounded-xl border p-6">
        <h2 className="font-semibold">Workspace setup is in progress</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          No accounts are connected and no agents are running. Lovable-managed database setup,
          secret storage, provider authorization, and a secure execution gateway are required before
          live workflows can be enabled. Payments remain off.
        </p>
        <Link to="/admin/integrations" className="mt-4 inline-block text-sm underline">
          Admin setup readiness →
        </Link>
      </section>
    </AppShell>
  );
}
