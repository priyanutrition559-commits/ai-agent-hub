import { cn } from "@/lib/utils";
const labels = {
  available: "Available to configure",
  blocked: "Setup required",
  partial: "In progress",
  complete: "Implemented",
  disconnected: "Not connected",
};
export function StatusBadge({ status, label }: { status: keyof typeof labels; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        status === "complete"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-secondary text-secondary-foreground",
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label ?? labels[status]}
    </span>
  );
}
