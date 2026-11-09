import { BrandLogo } from "@/components/brand/brand-logo";
import { CommandPalette } from "@/components/workspace/command-palette";
import { useHydrated } from "@/hooks/use-hydrated";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "@tanstack/react-router";
import {
  Bot,
  BookOpen,
  Compass,
  LayoutGrid,
  Moon,
  ShieldCheck,
  Sun,
  Workflow,
  ArrowUpRight,
  ListChecks,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const { dark, toggle } = useTheme();
  const links = [
    { to: "/", label: "Overview", icon: LayoutGrid },
    { to: "/explorer", label: "Technology Explorer", icon: Compass },
    { to: "/integrations", label: "Integrations", icon: Workflow },
    { to: "/agents", label: "Agent builder", icon: Bot },
    { to: "/docs", label: "Learning & docs", icon: BookOpen },
    { to: "/roadmap", label: "Build roadmap", icon: ListChecks },
    { to: "/admin/integrations", label: "MCP & Agent Connections", icon: ShieldCheck },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-4"
        href="#main"
      >
        Skip to content
      </a>
      <header className="flex h-[76px] items-center justify-between gap-3 border-b bg-card px-4 sm:px-7">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight">
          <BrandLogo decorative className="size-10" />
          <span className="text-sm font-semibold sm:text-base">
            Stack Atlas
            <span className="block text-[9px] font-medium uppercase tracking-[.18em] text-muted-foreground">
              by Guidesoft
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-5">
          <Link to="/product" className="hidden text-xs font-medium text-muted-foreground sm:block">
            About the workspace
          </Link>
          <CommandPalette />
          <Button
            variant="ghost"
            size="icon"
            disabled={!hydrated}
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            onClick={toggle}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Link
            to="/sign-in"
            aria-label="Account"
            className="rounded-full border bg-background px-3 py-2.5 text-xs font-semibold sm:px-4"
          >
            <span className="hidden sm:inline">Account ↗</span>
            <UserRound size={17} className="sm:hidden" aria-hidden="true" />
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1720px] flex-col lg:flex-row">
        <aside className="border-b bg-card px-4 py-3 lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
          <Link
            to="/product"
            className="mb-7 hidden flex-col items-start gap-3 px-3 lg:flex"
            aria-label="Stack Atlas by Guidesoft marketing page"
          >
            <BrandLogo className="size-16" />
            <span className="text-lg font-semibold tracking-tight">Stack Atlas</span>
          </Link>
          <div className="mb-8 hidden rounded-xl border bg-background p-3 lg:block">
            <p className="text-xs font-semibold">Personal workspace</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Preview · execution disabled
            </p>
          </div>
          <p className="eyebrow mb-4 hidden px-3 lg:block">Workspace</p>
          <nav
            aria-label="Main navigation"
            className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
          >
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "!bg-primary/10 !text-primary" }}
                className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden pt-10 lg:block">
            <div className="rounded-xl border bg-background p-4">
              <ShieldCheck className="mb-3 text-primary" size={20} />
              <p className="text-xs font-semibold">Permission first. Always.</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Connect intentionally. Review every tool. Keep sensitive actions in your hands.
              </p>
              <Link
                to="/docs/$slug"
                params={{ slug: "security" }}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary"
              >
                Our security approach <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <main id="main" tabIndex={-1} className="min-h-[75vh] p-5 outline-none md:p-8 xl:p-12">
            {children}
          </main>
          <footer className="mx-5 flex flex-wrap items-center justify-between gap-4 border-t py-6 text-[11px] text-muted-foreground md:mx-8 xl:mx-12">
            <span>Stack Atlas by Guidesoft · Built with intention.</span>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
              <Link to="/docs/$slug" params={{ slug: "getting-started" }}>
                Setup guide
              </Link>
              <Link to="/docs/$slug" params={{ slug: "security" }}>
                Security
              </Link>
              <Link to="/docs/$slug" params={{ slug: "release-readiness" }}>
                Release status
              </Link>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
