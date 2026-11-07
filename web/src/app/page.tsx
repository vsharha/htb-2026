import { AudienceRun } from "@/components/audience-run";
import { HeatGlow } from "@/components/heat-glow";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="relative isolate flex-1">
      <HeatGlow />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 sm:px-8">
        <AudienceRun header={<SiteHeader />} />
      </main>
    </div>
  );
}
