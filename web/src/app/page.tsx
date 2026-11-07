import { AudienceRun } from "@/components/audience-run";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-8 sm:py-16">
      <header className="flex items-center justify-between gap-4 font-mono text-xs tracking-wide uppercase">
        <span>Audience heatmap · New York</span>
        <span className="rounded-full border border-dashed border-foreground/40 px-3 py-1 text-muted-foreground">
          Stand-in data
        </span>
      </header>
      <AudienceRun />
    </main>
  );
}
