import { cn } from "@/lib/utils";

/**
 * Pinned to Bricolage Grotesque's largest optical size, whose narrower display
 * cut sets the name apart from headings in the same family at any rendered size.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading font-light tracking-[-0.03em] [font-variation-settings:'opsz'_96]", className)}>
      Placewise
    </span>
  );
}
