import { cn } from "@/lib/utils";
export function BrandLogo({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <img
      src="/brand/guidesoft-mark.png"
      width={256}
      height={256}
      alt={decorative ? "" : "Guidesoft logo"}
      className={cn("size-10 shrink-0 object-contain", className)}
      decoding="async"
    />
  );
}
