import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Compass, Search, Workflow, Bot, ListChecks, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { connectors } from "@/features/integrations/catalogue";
import { guides } from "@/features/docs/content";
import { useHydrated } from "@/hooks/use-hydrated";

/** Local navigation only. Search text never becomes a URL or remote tool call. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const navigate = useNavigate();
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        !event.isComposing &&
        !event.altKey &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, []);
  const commands = [
    {
      title: "Explore technologies",
      keywords: "find tools catalogue search",
      to: "/explorer",
      icon: Compass,
    },
    {
      title: "Browse integrations",
      keywords: "connect connectors plugins mcp",
      to: "/integrations",
      icon: Workflow,
    },
    {
      title: "Add custom MCP server",
      keywords: "configure endpoint",
      to: "/integrations/new",
      icon: Workflow,
    },
    { title: "Design an agent", keywords: "build workflow instructions", to: "/agents", icon: Bot },
    { title: "Read documentation", keywords: "help learn guides", to: "/docs", icon: BookOpen },
    {
      title: "View pending tasks",
      keywords: "roadmap status phases",
      to: "/roadmap",
      icon: ListChecks,
    },
    {
      title: "Recover your account",
      keywords: "forgot reset password",
      to: "/account/forgot-password",
      icon: KeyRound,
    },
  ] as const;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!hydrated}
          aria-label="Open command palette"
          aria-keyshortcuts="Meta+K Control+K"
          className="h-10 gap-3 rounded-full px-3 text-muted-foreground"
        >
          <Search size={16} aria-hidden="true" />
          <span className="hidden text-xs xl:inline">Jump to…</span>
          <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] lg:inline">⌘ K</kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Workspace command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search pages, guides and catalogue connectors. This is local navigation, not an AI agent
          or tool executor.
        </DialogDescription>
        <Command className="rounded-2xl">
          <CommandInput
            aria-label="Search commands"
            placeholder="Find a page, connector, or guide…"
            className="h-14 pr-9"
          />
          <CommandList className="max-h-[min(55vh,400px)] p-2">
            <CommandEmpty>
              <div role="option" aria-disabled="true" aria-selected="false">
                No matching command. Try “agent”, “GitHub”, or “security”.
              </div>
            </CommandEmpty>
            <CommandGroup heading="Workspace">
              {commands.map(({ title, keywords, to, icon: Icon }) => (
                <CommandItem
                  key={to}
                  value={title}
                  keywords={keywords.split(" ")}
                  onSelect={() => {
                    setOpen(false);
                    void navigate({ to });
                  }}
                >
                  <Icon />
                  <span>{title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Connectors · not connected">
              {connectors.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`Connector ${c.name}`}
                  keywords={[c.category, c.purpose]}
                  onSelect={() => {
                    setOpen(false);
                    void navigate({
                      to: "/integrations/$connectorId",
                      params: { connectorId: c.id },
                    });
                  }}
                >
                  <Workflow />
                  <span>{c.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">Catalogue</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Guides">
              {guides.map((g) => (
                <CommandItem
                  key={g.slug}
                  value={g.title}
                  keywords={[g.category, g.summary]}
                  onSelect={() => {
                    setOpen(false);
                    void navigate({ to: "/docs/$slug", params: { slug: g.slug } });
                  }}
                >
                  <BookOpen />
                  <span>{g.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="flex justify-between gap-3 border-t px-4 py-3 text-[10px] text-muted-foreground">
            <span>↑ ↓ to navigate · Enter to open · Esc to close</span>
            <span className="hidden sm:inline">Local search only</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
