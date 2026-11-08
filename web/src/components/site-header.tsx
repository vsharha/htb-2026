import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header>
      <Wordmark className={cn("text-2xl", className)} />
    </header>
  );
}
