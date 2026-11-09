import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Compass, Bot, ShieldCheck, Check } from "lucide-react";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import { EcosystemHero } from "@/components/marketing/ecosystem-hero";
import { ArchitectureTabs } from "@/components/marketing/architecture-tabs";
import { BrandLogo } from "@/components/brand/brand-logo";
export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "Stack Atlas by Guidesoft | Map your engineering ecosystem" },
      {
        name: "description",
        content:
          "A focused workspace for engineering teams and AI builders. Discover tools, design permission-first agents, and understand your ecosystem.",
      },
      { property: "og:title", content: "Stack Atlas by Guidesoft" },
    ],
  }),
  component: Product,
});
function Product() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <a
        href="#marketing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-card focus:p-4"
      >
        Skip to content
      </a>
      <MarketingNavigation />
      <main id="marketing-main" tabIndex={-1} className="outline-none">
        <section className="marketing-hero relative border-b">
          <div className="mx-auto grid max-w-7xl items-center gap-3 px-5 py-12 md:px-8 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
            <div className="relative z-10">
              <p className="mb-7 inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-[10px] font-medium tracking-wide text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                FOR ENGINEERING TEAMS & AI BUILDERS
              </p>
              <h1 className="max-w-2xl text-[clamp(2.75rem,5.3vw,5.25rem)] font-semibold leading-[1.04] tracking-[-.055em]">
                Your tools.
                <br />
                Your agents.
                <br />
                <span className="text-primary">One clear atlas.</span>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground">
                Turn a scattered stack into a considered ecosystem. Discover the right tools, design
                your agent workflows, and make every permission an intentional choice.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
                >
                  Open Ecosystem Control Panel
                  <ArrowUpRight size={16} />
                </Link>
                <a
                  href="#architecture"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border bg-card/70 px-5 text-sm font-medium"
                >
                  Explore the architecture
                  <ArrowRight size={15} />
                </a>
              </div>
              <p className="mt-5 text-xs leading-6 text-muted-foreground">
                Explore without connecting an account. Live agent execution remains off.
              </p>
            </div>
            <EcosystemHero />
          </div>
        </section>
        <section
          id="features"
          className="mx-auto max-w-7xl scroll-mt-6 px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow mb-3">Less fragmentation. More intention.</p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Build with context.
                <br />
                Not another pile of tabs.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              From evaluating your next dependency to planning an agent’s access, keep the important
              decisions in view.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Know what belongs in your stack",
                description:
                  "Browse by category, compare provider details, and follow official sources. Unverified information stays clearly labelled.",
                icon: Compass,
                to: "/explorer",
                action: "Explore the catalogue",
              },
              {
                title: "Make the next step obvious",
                description:
                  "A guided agent builder turns broad goals into a purposeful configuration—with limits, tool boundaries and a review step.",
                icon: Bot,
                to: "/agents",
                action: "Design an agent",
              },
              {
                title: "Keep authority with people",
                description:
                  "Default-deny policies and explicit approval requirements shape the architecture. No tool gets access simply by appearing in a directory.",
                icon: ShieldCheck,
                to: "/docs/security",
                action: "Read the security guide",
              },
            ].map(({ title, description, icon: Icon, to, action }, i) => (
              <article key={title} className="surface-card flex flex-col p-7">
                <div className="mb-7 flex items-center justify-between">
                  <span className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon size={23} />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold leading-7">{title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">{description}</p>
                <Link
                  to={to}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-primary"
                >
                  {action}
                  <ArrowUpRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section id="architecture" className="border-y bg-card/40">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
            <p className="eyebrow mb-3">A transparent architecture</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Discover. Design. Protect.
            </h2>
            <p className="mb-8 max-w-2xl text-sm leading-7 text-muted-foreground">
              Built on this project’s TanStack Start runtime, with Supabase integration and the
              official MCP SDK. Explore implemented foundations and understand what still needs
              deployment.
            </p>
            <ArchitectureTabs />
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
              {[
                "Existing routes preserved",
                "No fabricated connections",
                "Reduced-motion friendly",
              ].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Check size={14} className="text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="marketing-hero surface-card grid items-center gap-8 p-7 md:p-12 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow mb-3">Your ecosystem starts here</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                See the whole stack.
                <br />
                Choose your next move.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                The control panel is ready to explore. Database persistence, provider authorization
                and autonomous execution are still being completed—review the roadmap before
                connecting production systems.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Open control panel
                <ArrowUpRight size={16} />
              </Link>
              <Link
                to="/roadmap"
                className="text-center text-xs font-medium text-muted-foreground underline underline-offset-4"
              >
                View implemented & pending work
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-8 md:px-8">
          <Link to="/product" className="flex items-center gap-3 text-sm font-semibold">
            <BrandLogo decorative className="size-9" />
            Stack Atlas <span className="font-normal text-muted-foreground">by Guidesoft</span>
          </Link>
          <nav
            aria-label="Marketing footer"
            className="flex flex-wrap gap-6 text-xs text-muted-foreground"
          >
            <Link to="/docs">Documentation</Link>
            <Link to="/docs/$slug" params={{ slug: "security" }}>
              Security
            </Link>
            <Link to="/roadmap">Roadmap</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
