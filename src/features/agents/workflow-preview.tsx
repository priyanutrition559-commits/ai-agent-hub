import { Bot, ShieldCheck, Wrench, LockKeyhole, ArrowDown } from "lucide-react";
import { StatusBadge } from "@/components/workspace/status-badge";
export function WorkflowPreview({
  name,
  model,
  maxToolCalls,
  timeoutSeconds,
  budgetCents,
}: {
  name: string;
  model: string;
  maxToolCalls: number;
  timeoutSeconds: number;
  budgetCents: number;
}) {
  const nodes = [
    {
      title: name.trim() || "Your agent",
      description: model.trim() ? `Requested model: ${model}` : "Model not configured",
      icon: Bot,
    },
    {
      title: "Human approval",
      description: "Sensitive actions require exact-call approval.",
      icon: ShieldCheck,
    },
    {
      title: "Allowlisted tools only",
      description: "No tools available. No tool access is granted.",
      icon: Wrench,
    },
    {
      title: "Execution unavailable",
      description: "Database, audit workflow and secure worker required.",
      icon: LockKeyhole,
    },
  ];
  return (
    <aside className="surface-card p-5 lg:sticky lg:top-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Workflow preview</h2>
        <StatusBadge status="partial" label="Draft" />
      </div>
      <ol aria-label="Draft workflow nodes">
        {nodes.map(({ title, description, icon: Icon }, i) => (
          <li key={i}>
            {i > 0 && (
              <ArrowDown
                className="mx-auto my-2 text-muted-foreground"
                size={16}
                aria-hidden="true"
              />
            )}
            <div className="flex gap-3 rounded-xl border bg-background/70 p-4">
              <Icon className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="break-words text-xs font-semibold">{title}</h3>
                <p className="mt-1 break-words text-[11px] leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-center">
        {[
          [String(maxToolCalls), "Max calls"],
          [`${timeoutSeconds}s`, "Timeout"],
          [`${budgetCents}¢`, "Budget"],
        ].map(([value, label]) => (
          <div key={label}>
            <dt className="text-[10px] text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
        Configuration preview only. These limits are not enforced by a running worker yet. No live
        execution diagnostics are available.
      </p>
    </aside>
  );
}
