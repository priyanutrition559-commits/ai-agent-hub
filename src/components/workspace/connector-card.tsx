import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Connector } from "@/features/integrations/catalogue";
import { StatusBadge } from "./status-badge";
export function ConnectorCard({ connector: c }: { connector: Connector }) {
  return (
    <Link
      to="/integrations/$connectorId"
      params={{ connectorId: c.id }}
      className="surface-card group flex flex-col p-6 transition-colors hover:border-primary/40"
    >
      <div className="mb-5 flex items-center justify-between">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-xl border bg-background text-base font-bold text-primary"
        >
          {c.glyph}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          size={16}
          className="text-muted-foreground group-hover:text-primary"
        />
      </div>
      <h3 className="text-base font-semibold">{c.name}</h3>
      <p className="mt-1 text-[10px] font-medium text-muted-foreground">{c.category}</p>
      <p className="mt-4 flex-1 text-xs leading-6 text-muted-foreground">{c.purpose}</p>
      <div className="mt-5 border-t pt-4">
        <StatusBadge status="available" />
      </div>
    </Link>
  );
}
