import { SampleRun } from "@/components/sample-run";
import { SiteHeader } from "@/components/site-header";

export default function MapPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
      <SiteHeader />
      <SampleRun />
    </main>
  );
}
