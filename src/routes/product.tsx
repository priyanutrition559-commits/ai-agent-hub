import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, ShieldCheck, Bot, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "A more intentional workspace | Technology Universe" },
      {
        name: "description",
        content:
          "Discover technology and design permission-first agents. Explore what is available and what is still being built.",
      },
    ],
  }),
  component: Product,
});
function Product() {
  return (
    <AppShell>
      <section className="hero-wash surface-card p-8 md:p-14">
        <StatusBadge status="partial" label="An evolving workspace" />
        <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-tight tracking-[-.04em] md:text-6xl">
          More intention.
          <br />
          Less tool overload.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">
          Technology Universe brings technology discovery and agent planning into one considered
          workspace. Start with understanding. Add access only when it is safe.
        </p>
        <Link
          to="/explorer"
          className="mt-8 inline-flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Explore the catalogue <ArrowRight size={16} />
        </Link>
      </section>
      <div className="my-9 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "For curious builders",
            text: "Compare tools, follow official sources and distinguish verified facts from catalogue metadata.",
            icon: Compass,
          },
          {
            title: "For deliberate teams",
            text: "Plan permissions and sensitive-action approvals before connecting private information.",
            icon: ShieldCheck,
          },
          {
            title: "For agent designers",
            text: "Draft purpose, instructions and limits. Live model calls and execution are still being built.",
            icon: Bot,
          },
        ].map(({ title, text, icon: Icon }) => (
          <section className="surface-card p-6" key={title}>
            <Icon size={24} className="text-primary" />
            <h2 className="mt-5 text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
      <section className="surface-card p-7">
        <h2 className="text-xl font-semibold">Useful today. Transparent about tomorrow.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          The catalogue, documentation and draft validation are available. Database persistence,
          autonomous workflows, paid plans and provider connections are not live. We publish that
          distinction instead of presenting a demo as a connected product.
        </p>
        <div className="mt-5 flex flex-wrap gap-6 text-sm font-medium text-primary">
          <Link to="/roadmap">View the roadmap →</Link>
          <Link to="/docs/$slug" params={{ slug: "release-readiness" }}>
            Release prerequisites →
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
