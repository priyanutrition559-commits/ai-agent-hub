import { Link } from "@tanstack/react-router";
import { Bot, Compass, LayoutGrid, Moon, ShieldCheck, Sun, Workflow } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const preference = localStorage.getItem("tu-theme");
    const enabled = preference
      ? preference === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);
  const links = [
    { to: "/", label: "Overview", icon: LayoutGrid },
    { to: "/explorer", label: "Technology Explorer", icon: Compass },
    { to: "/integrations", label: "Integrations", icon: Workflow },
    { to: "/agents", label: "Agent builder", icon: Bot },
    { to: "/admin/integrations", label: "MCP & Agent Connections", icon: ShieldCheck },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a className="sr-only focus:not-sr-only focus:p-4" href="#main">
        Skip to content
      </a>
      <header className="flex h-20 items-center justify-between border-b px-5 lg:px-9">
        <Link to="/" className="flex items-center gap-3 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Workflow size={20} />
          </span>
          <span>
            Technology<span className="font-normal text-muted-foreground"> Universe</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            onClick={() => {
              const next = !dark;
              setDark(next);
              document.documentElement.classList.toggle("dark", next);
              localStorage.setItem("tu-theme", next ? "dark" : "light");
            }}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Link to="/sign-in" className="text-sm font-medium">
            Account →
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b p-5 lg:min-h-[calc(100vh-5rem)] lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 lg:p-6">
          <p className="mb-5 hidden text-xs font-medium tracking-widest text-muted-foreground lg:block">
            YOUR WORKSPACE
          </p>
          <nav aria-label="Main navigation" className="flex flex-wrap gap-2 lg:flex-col">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary"
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-14 hidden rounded-xl border p-4 lg:block">
            <ShieldCheck size={20} className="mb-3" />
            <p className="text-sm font-medium">Permission first.</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your agents only get the access you explicitly approve. New tools start disabled.
            </p>
          </div>
        </aside>
        <main id="main" className="min-w-0 flex-1 p-5 md:p-9 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
