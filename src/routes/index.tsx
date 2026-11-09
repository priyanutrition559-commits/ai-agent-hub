import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  Compass,
  Workflow,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CircleDot,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { connectors } from "@/features/integrations/catalogue";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Technology Universe | Your agent workspace" }] }),
  component: Index,
});
function Index() {
  return (
    <AppShell>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Your workspace, thoughtfully connected</p>
        <StatusBadge status="partial" label="Foundation preview" />
      </div>
      <section className="hero-wash surface-card grid overflow-hidden p-7 md:p-10 xl:grid-cols-[1.3fr_1fr] xl:gap-10">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" />A little less friction. A lot more
            possibility.
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-[-.045em] md:text-5xl">
            Great work starts
            <br />
            with the right
            <br />
            <span className="text-primary">connections.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
            A considered space to discover technology, design your agents, and bring your tools
            together. On your terms, with your permission.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              to="/integrations"
              className="inline-flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              Explore integrations <ArrowRight size={16} />
            </Link>
            <Link to="/product" className="inline-flex items-center gap-2 text-xs font-semibold">
              Meet your workspace <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div
          className="mt-10 flex flex-col justify-center xl:mt-0"
          aria-label="Illustrative workflow, not a live execution"
        >
          <div className="rounded-2xl border bg-background/70 p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="eyebrow">An intentional workflow</span>
              <span className="text-[10px] text-muted-foreground">Illustration</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold">Your research assistant</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A purpose. Clear limits. Your control.
                </p>
              </div>
            </div>
            <div className="ml-9 h-8 border-l border-dashed border-primary/40" />
            <div className="ml-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck size={16} />
                Permission & approval gate
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Only explicitly allowed tools. Sensitive actions wait for you.
              </p>
            </div>
            <div className="ml-9 h-8 border-l border-dashed border-primary/40" />
            <div className="grid grid-cols-3 gap-2">
              {["GitHub", "Notion", "Exa"].map((name) => (
                <div key={name} className="rounded-xl border bg-card p-3 text-center">
                  <p className="text-xs font-semibold">{name}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">Not connected</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            A design example. No agents or tools are executing.
          </p>
        </div>
      </section>
      <div className="my-6 grid gap-3 sm:grid-cols-3">
        {[
          [String(connectors.length).padStart(2, "0"), "Connectors to explore"],
          ["0", "Live connections"],
          ["You", "In control of every permission"],
        ].map(([value, label]) => (
          <div className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4" key={label}>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mb-5 mt-10 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">Make it your own</p>
          <h2 className="text-xl font-semibold tracking-tight">Where would you like to begin?</h2>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">
          One thoughtful step at a time.
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            to: "/explorer",
            title: "Discover your next tool",
            body: "Browse the catalogue. Compare sources and find what belongs in your stack.",
            icon: Compass,
          },
          {
            to: "/agents",
            title: "Give your agent a purpose",
            body: "Draft instructions and set boundaries before any tool can be used.",
            icon: Bot,
          },
          {
            to: "/docs",
            title: "Build your understanding",
            body: "Learn how connections, permissions and safe agent workflows fit together.",
            icon: BookOpen,
          },
        ].map(({ to, title, body, icon: Icon }, i) => (
          <Link
            key={to}
            to={to}
            className="surface-card group p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-7 flex items-center justify-between">
              <span className="rounded-xl bg-secondary p-3 text-primary">
                <Icon size={20} />
              </span>
              <span className="text-[10px] text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">{body}</p>
            <ArrowUpRight size={16} className="mt-5 text-primary" />
          </Link>
        ))}
      </div>
      <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <CircleDot size={18} className="mt-1 shrink-0 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Built transparently. Still in progress.</h2>
            <p className="mt-1 max-w-xl text-xs leading-6 text-muted-foreground">
              Database setup and secure execution are pending. No connected accounts, autonomous
              runs or payments are implied.
            </p>
          </div>
        </div>
        <Link
          to="/roadmap"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
        >
          See the build roadmap <ArrowRight size={14} />
        </Link>
      </section>
    </AppShell>
  );
}
