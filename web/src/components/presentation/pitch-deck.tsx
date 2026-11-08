"use client";

import Image from "next/image";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Deck, Notes, Slide } from "spectacle";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { useSettings } from "@/lib/settings";

/**
 * Spectacle's theme points at the app's CSS variables rather than copying
 * their values, so the deck follows the light and dark tokens in globals.css.
 *
 * `backdropStyle` replaces Spectacle's default rather than merging with it, so
 * it has to repeat the fixed full-window box that the slide scaling measures.
 */
const theme = {
  colors: {
    primary: "var(--foreground)",
    secondary: "var(--foreground)",
    tertiary: "var(--background)",
    quaternary: "var(--muted-foreground)",
    quinary: "var(--heat-cool)",
  },
  fonts: {
    header: "var(--font-display), sans-serif",
    text: "var(--font-sans), sans-serif",
    monospace: "var(--font-mono), monospace",
  },
  backdropStyle: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "var(--background)",
  },
};

const SLIDE_COUNT = 5;

/**
 * Drawn inside each slide rather than as Spectacle's deck template, which
 * sits outside the scaled slide and so would not line up with its content.
 */
function SlideFooter({ number }: { number: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-24 pb-10 text-sm text-muted-foreground">
      <Wordmark className="text-lg text-foreground" />
      <span className="font-mono tabular-nums">
        {number} / {SLIDE_COUNT}
      </span>
    </div>
  );
}

/** Loading the app's settings applies the saved palette and night mode, so the deck follows the app's tokens. */
function useAppTheme() {
  useSettings();
}

function searchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Spectacle's export mode stacks every slide on its own page in the deck's
 * own colours. Arriving with `print=true` opens the print dialog once the
 * fonts have loaded, so one click gives a PDF.
 */
function useExportMode() {
  const exporting = searchParam("exportMode") === "true";
  useEffect(() => {
    if (!exporting || searchParam("print") !== "true") return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [exporting]);
  return exporting;
}

function openExport() {
  window.location.search = "?exportMode=true&print=true";
}

function backToSlides() {
  window.location.search = "";
}

function ExportControls({ exporting }: { exporting: boolean }) {
  if (exporting) {
    return (
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <Button variant="outline" onClick={backToSlides}>
          Back to slides
        </Button>
        <Button onClick={() => window.print()}>Print or save as PDF</Button>
      </div>
    );
  }
  return (
    <div className="fixed top-4 right-4 z-50 opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100 print:hidden">
      <Button variant="outline" onClick={openExport}>
        Export PDF
      </Button>
    </div>
  );
}

/** Small label above a slide's headline, naming the slide's topic. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-base tracking-wide text-muted-foreground uppercase">{children}</p>;
}

function SlideBody({ number, children }: { number: number; children: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col px-24 pt-20 pb-28 text-foreground">
      {children}
      <SlideFooter number={number} />
    </div>
  );
}

function drift(x: string, y: string, seconds: number): CSSProperties {
  return { "--drift-x": x, "--drift-y": y, "--drift-duration": `${seconds}s` } as CSSProperties;
}

/** The form page's heat glow, sized to the slide instead of the viewport. */
function SlideGlow() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-heat-cool">
      <div className="heat-glow-spin absolute inset-0">
        <div className="heat-glow-drift absolute -top-[20%] -right-[10%] size-[760px] rounded-full bg-[#5b86e5] blur-[120px]" style={drift("-560px", "300px", 8)} />
        <div className="heat-glow-drift absolute -bottom-[25%] -left-[15%] size-[820px] rounded-full bg-heat-hot blur-[140px]" style={drift("620px", "-260px", 10)} />
        <div className="heat-glow-drift absolute -right-[20%] -bottom-[30%] size-[820px] rounded-full bg-heat-mid blur-[140px]" style={drift("-480px", "-360px", 7)} />
      </div>
    </div>
  );
}

const sheet = "bg-card text-card-foreground shadow-[0_24px_60px_-20px_rgb(21_23_28/0.35)]";

function CoverSlide() {
  return (
    <Slide padding="0px">
      <div className="relative isolate flex h-full items-center justify-center px-24">
        <SlideGlow />
        <div className={`${sheet} relative max-w-[880px] rounded-[2rem] px-16 py-14`}>
          <Eyebrow>HackTheBurgh 2026</Eyebrow>
          <h1 className="mt-6 text-[9rem] leading-[0.9]">
            <Wordmark className="tracking-[-0.04em]" />
          </h1>
          <p className="mt-8 text-[2.1rem] leading-snug text-balance">
            Street advertising for startups, placed where your customers are and your competitors aren&rsquo;t.
          </p>
        </div>
      </div>
      <Notes>
        Placewise shows a startup where in New York its target customers live, work and pass through, where competitors
        already advertise to them, and which kiosks and bus shelters to buy in the gap between the two. It is for startups
        that want customers beyond Meta and Google but have no media agency and a limited budget.
      </Notes>
    </Slide>
  );
}

function ProblemSlide() {
  return (
    <Slide padding="0px">
      <SlideBody number={2}>
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-6 max-w-[740px] font-heading text-[4.75rem] leading-[1] font-bold tracking-[-0.03em] text-balance">
          Marketing is hard. Your audiences are not equally distributed.
        </h2>
        <Image
          src="/images/sf-startup-image-funny.webp"
          alt="Map of the San Francisco Bay Area covered in colourful location pins"
          width={640}
          height={671}
          className="absolute top-20 right-24 w-[340px] rounded-2xl border border-border"
        />
        <p className="mt-36 text-[1.9rem] leading-snug text-muted-foreground">
          <span className="font-bold text-heat-hot">5,556</span> street ad spots in New York. Which ones reach your
          customers?
        </p>
      </SlideBody>
      <Notes>
        A media agency would tell you where to advertise offline, but early startups don&rsquo;t have one. Prices for
        outdoor placements are mostly unpublished, and there is no public list of where competitors run campaigns. What is
        public is rich data about where people live, work and travel, and that is what Placewise starts from. The 5,556
        figure is New York&rsquo;s live LinkNYC kiosks plus its bus shelters, from the city&rsquo;s open data.
      </Notes>
    </Slide>
  );
}

const steps = [
  {
    name: "Describe",
    detail: "One sentence about your startup and its customer, what they pay, and your monthly budget.",
  },
  {
    name: "Customers",
    detail: "Jev turns the sentence into weights on 21 census, jobs and subway measures, then scores all 2,327 census tracts.",
  },
  {
    name: "Competitors",
    detail: "An agent searches press, trade sites and social media for competitors’ outdoor campaigns and pins each one.",
  },
  {
    name: "Gap",
    detail: "Strong audience, no competitor ads. Up to 12 kiosks and bus shelters to buy there, each with a way to measure it.",
  },
];

function HowItWorksSlide() {
  return (
    <Slide padding="0px">
      <SlideBody number={3}>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-6 max-w-[1000px] font-heading text-[3.75rem] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
          One sentence about your customer becomes a list of places to advertise.
        </h2>
        <div className="mt-auto pt-10">
          <div className="h-2 rounded-full bg-gradient-to-r from-heat-cool via-heat-mid to-heat-hot" />
          <ol className="mt-8 grid grid-cols-4 gap-10">
            {steps.map((step, index) => (
              <li key={step.name}>
                <p className="font-mono text-base text-muted-foreground">{index + 1}</p>
                <p className="mt-2 font-heading text-[2.1rem] font-bold tracking-tight">{step.name}</p>
                <p className="mt-3 text-[1.3rem] leading-snug text-muted-foreground">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </SlideBody>
      <Notes>
        The startup fills in one fill-in-the-blank sentence. Jev, TypeSafe AI&rsquo;s decision model, scores how strongly
        the target customer implies each of 21 measures, like age, income, industry of work and subway traffic, and the app
        weights every census tract by them. Meanwhile a research agent finds competitors and searches for their subway ads
        and billboards in the city. Where high audience fit meets no observed competition, the app picks up to 12 kiosks and
        bus shelters, spread at least 500 metres apart.
      </Notes>
    </Slide>
  );
}

function DemoSlide() {
  return (
    <Slide padding="0px">
      <div className="relative flex h-full flex-col px-24 pt-12 pb-24 text-foreground">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-[2.6rem] font-bold tracking-tight">Live demo</h2>
          <p className="text-base text-muted-foreground">A budgeting app for people who share a flat</p>
        </div>
        {/*
          The app is laid out at 1.4 times the frame's size and scaled back down,
          so it gets a laptop-sized viewport inside the 1366-wide slide.
        */}
        <div className={`${sheet} relative mt-6 flex-1 overflow-hidden rounded-2xl border border-border`}>
          <iframe
            src="/"
            title="Placewise app"
            className="absolute top-0 left-0 h-[140%] w-[140%] origin-top-left scale-[calc(1/1.4)]"
          />
        </div>
        <SlideFooter number={4} />
      </div>
      <Notes>
        Submit the empty form to run the sample brief: a fintech budgeting app for young professionals in tech who rent with
        roommates, at $12 a month with a $3,000 monthly budget. Show the Customers tab first, then Competitors while the agent
        searches. Gap opens on its own once a campaign has a precise location. Hover a placement to match it between map and
        list. Click outside the app before pressing the arrow keys, or they scroll the app instead of changing slides.
      </Notes>
    </Slide>
  );
}

const nextSteps = [
  {
    name: "Real prices",
    detail: "Verified placement prices and minimum spends. Costs per audience member are estimates today.",
  },
  {
    name: "Stores and offices",
    detail: "Competitors’ stores and offices as presence evidence, alongside their campaigns.",
  },
  {
    name: "More cities",
    detail: "The method works in any city that publishes data on residents, jobs, trips and ad sites.",
  },
];

function NextStepsSlide() {
  return (
    <Slide padding="0px">
      <SlideBody number={5}>
        <Eyebrow>Next steps</Eyebrow>
        <h2 className="mt-6 max-w-[1050px] font-heading text-[4.75rem] leading-[1] font-bold tracking-[-0.03em] text-balance">
          From a map of the gap to a plan you can buy.
        </h2>
        <ul className="mt-auto grid grid-cols-3 gap-8">
          {nextSteps.map((step) => (
            <li key={step.name} className="rounded-2xl border border-border bg-card px-8 py-7 text-card-foreground">
              <p className="font-heading text-[1.8rem] font-bold tracking-tight">{step.name}</p>
              <p className="mt-3 text-[1.3rem] leading-snug text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ul>
      </SlideBody>
      <Notes>
        Placement pricing is the main piece still mocked: the costs shown are estimates, and real prices and minimum spends
        need media owners&rsquo; rate cards. Next, competitors&rsquo; stores and offices add presence evidence where no
        campaign is found. The pipeline is one script per public data source, so a new city means pointing those scripts at
        its open data. Close by thanking the judges and inviting questions.
      </Notes>
    </Slide>
  );
}

export function PitchDeck() {
  useAppTheme();
  const exporting = useExportMode();

  return (
    <>
      <style>{`@media print { html { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }`}</style>
      <ExportControls exporting={exporting} />
      <Deck theme={theme} template={<></>}>
        <CoverSlide />
        <ProblemSlide />
        <HowItWorksSlide />
        <DemoSlide />
        <NextStepsSlide />
      </Deck>
    </>
  );
}
