import { Button } from "@/components/ui/button";
export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Results pagination"
      className="mt-7 flex items-center justify-between gap-3 border-t pt-5"
    >
      <Button
        variant="outline"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-xs text-muted-foreground" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
