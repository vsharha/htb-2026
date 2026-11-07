"use client";

import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CITIES, INDUSTRIES, type Brief, type Industry } from "@/lib/contract";
import { cn } from "@/lib/utils";

const blank =
  "max-w-full rounded-none border-0 [field-sizing:content] border-b-2 border-foreground/25 bg-transparent px-1 text-foreground outline-none transition-colors placeholder:text-foreground/30 hover:border-foreground/50 focus-visible:border-heat-cool focus-visible:bg-heat-cool/5";

// Text inputs rather than type="number": they size to their content and have
// no spinner arrows. `pattern` keeps the browser's validation.
const money = { type: "text", inputMode: "decimal", required: true, autoComplete: "off" } as const;

export function BriefForm({
  onSubmit,
  busy,
}: {
  onSubmit: (brief: Brief) => void;
  busy: boolean;
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const city = CITIES.find((c) => c.id === data.get("city")) ?? CITIES[0];
    onSubmit({
      industry: data.get("industry") as Industry,
      description: String(data.get("description")).trim(),
      targetCustomer: String(data.get("targetCustomer")).trim(),
      customerPays: {
        amount: Number(data.get("pays")),
        per: data.get("per") as "month" | "purchase",
      },
      monthlyBudget: Number(data.get("budget")),
      city: city.id,
      markets: [...city.areas],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <p className="font-heading text-[clamp(1.6rem,3.6vw,2.75rem)] leading-[1.55] font-medium tracking-tight text-balance">
        We&rsquo;re a{" "}
        <label className="sr-only" htmlFor="industry">Industry</label>
        {/* Unanswered, the select shows a grey example like the text inputs' placeholders. */}
        <select id="industry" name="industry" required defaultValue="" className={cn(blank, "cursor-pointer pr-2 invalid:text-foreground/30 [&>option]:text-foreground")}>
          <option value="" disabled hidden>fintech</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i.toLowerCase()}</option>
          ))}
        </select>{" "}
        startup building{" "}
        <label className="sr-only" htmlFor="description">What the startup builds, in one sentence</label>
        <span className="whitespace-nowrap">
          <input id="description" name="description" required placeholder="a budgeting app for shared flats" className={cn(blank, "min-w-[12ch] max-w-[calc(100%-1ch)]")} />.
        </span>{" "}
        Our customer is{" "}
        <label className="sr-only" htmlFor="targetCustomer">Target customer, in one sentence</label>
        <span className="whitespace-nowrap">
          <input id="targetCustomer" name="targetCustomer" required placeholder="young professionals who rent with roommates" className={cn(blank, "min-w-[16ch] max-w-[calc(100%-1ch)]")} />.
        </span>{" "}
        They pay{" "}
        <label className="sr-only" htmlFor="pays">What a customer pays, in US dollars</label>
        <span className="whitespace-nowrap">
          $<input id="pays" name="pays" {...money} pattern="[0-9]+([.][0-9]{1,2})?" placeholder="12" className={cn(blank, "ml-1 min-w-[1ch] tabular-nums")} />
        </span>{" "}
        per{" "}
        <label className="sr-only" htmlFor="per">Paid per</label>
        <span className="whitespace-nowrap">
          <select id="per" name="per" defaultValue="month" className={cn(blank, "cursor-pointer")}>
            <option value="month">month</option>
            <option value="purchase">purchase</option>
          </select>
          ,
        </span>{" "}
        and we can spend{" "}
        <label className="sr-only" htmlFor="budget">Monthly advertising budget, in US dollars</label>
        <span className="whitespace-nowrap">
          $<input id="budget" name="budget" {...money} pattern="[0-9]+" placeholder="3000" className={cn(blank, "ml-1 min-w-[1ch] tabular-nums")} />
        </span>{" "}
        a month on ads in{" "}
        <label className="sr-only" htmlFor="city">City</label>
        <span className="whitespace-nowrap">
          <select id="city" name="city" defaultValue={CITIES[0].id} className={cn(blank, "cursor-pointer")}>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option disabled>more cities coming</option>
          </select>
          .
        </span>
      </p>

      <ul aria-label="Boroughs mapped" className="flex flex-wrap gap-2">
        {CITIES[0].areas.map((area) => (
          <li key={area} className="rounded-full border-2 border-foreground/15 px-4 py-1.5 text-sm font-medium text-foreground/70">
            {area}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy} className="h-12 gap-2 rounded-full px-6 text-base">
          {busy ? "Mapping your audience…" : "Map my audience"}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </form>
  );
}
