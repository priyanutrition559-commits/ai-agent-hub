import { useHydrated } from "@/hooks/use-hydrated";
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layers3, ShieldCheck, Workflow } from "lucide-react";
const panels = [
  {
    id: "discover",
    label: "Discover",
    title: "Context before another tool.",
    description:
      "Search the existing catalogue, follow official sources, and distinguish provider metadata from a real authenticated connection.",
    details: [
      "Instant local search and category filters",
      "Provider detail pages and official documentation",
      "Clear unverified and not-connected states",
    ],
    icon: Layers3,
  },
  {
    id: "design",
    label: "Design",
    title: "Give your agent a purpose. Then boundaries.",
    description:
      "Move from purpose to limits to review with a guided draft builder. Configuration previews are clearly separated from execution.",
    details: [
      "Progressive purpose, boundary and review steps",
      "Explicit tool allowlists and sensitive-action approval policy",
      "No fabricated runs or connected accounts",
    ],
    icon: Workflow,
  },
  {
    id: "protect",
    label: "Protect",
    title: "A deliberate boundary around execution.",
    description:
      "The tested MCP adapter and worker transport are foundations, not a deployed autonomous service. Backend setup and durable authorization are prerequisites.",
    details: [
      "Official MCP SDK and bounded discovery",
      "DNS/IP-pinned worker transport with TLS verification",
      "Live approvals, persistence and deployment still required",
    ],
    icon: ShieldCheck,
  },
] as const;
export function ArchitectureTabs() {
  const hydrated = useHydrated();
  const [value, setValue] = useState<string>("discover");
  const reduced = useReducedMotion();
  const id = useId();
  const panel = panels.find((p) => p.id === value) ?? panels[0];
  const Icon = panel.icon;
  return (
    <Tabs value={value} onValueChange={setValue} className="min-w-0">
      <TabsList
        aria-label="Workspace capabilities"
        className="mb-6 flex h-auto w-fit max-w-full flex-wrap gap-1 bg-secondary p-1.5"
      >
        {panels.map((p) => (
          <TabsTrigger
            key={p.id}
            disabled={!hydrated}
            value={p.id}
            className="relative isolate min-h-10 bg-transparent px-5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <span className="relative z-10">{p.label}</span>
            {value === p.id && (
              <motion.span
                layoutId={`${id}-tab`}
                className="absolute inset-0 -z-0 rounded-md border bg-card shadow-sm"
                transition={
                  reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }
                }
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      <AnimatePresence initial={false} mode="wait">
        <TabsContent key={value} value={value} forceMount asChild>
          <motion.div
            className="surface-card grid items-start gap-8 p-6 md:grid-cols-[1fr_1fr] md:p-10"
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -6 }}
            transition={{ duration: reduced ? 0 : 0.16 }}
          >
            <div>
              <Icon className="mb-6 text-primary" size={27} />
              <h3 className="text-2xl font-semibold tracking-tight">{panel.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{panel.description}</p>
            </div>
            <ol className="space-y-3">
              {panel.details.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-4 rounded-xl border bg-background p-4"
                >
                  <span className="mt-0.5 font-mono text-[10px] text-primary">0{i + 1}</span>
                  <span className="text-sm leading-6">{item}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
}
