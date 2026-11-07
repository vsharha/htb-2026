"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BOROUGHS,
  INDUSTRIES,
  type Borough,
  type Brief,
  type Industry,
} from "@/lib/contract";
import { cn } from "@/lib/utils";

const blank =
  "max-w-full rounded-none border-0 [field-sizing:content] border-b-2 border-foreground/25 bg-transparent px-1 text-foreground outline-none transition-colors placeholder:text-foreground/30 hover:border-foreground/50 focus-visible:border-heat-cool focus-visible:bg-heat-cool/5";

export function BriefForm({
  onSubmit,
  busy,
}: {
  onSubmit: (brief: Brief) => void;
  busy: boolean;
}) {
  const [markets, setMarkets] = useState<Borough[]>([...BOROUGHS]);
  const [error, setError] = useState<string | null>(null);

  function toggleMarket(b: Borough) {
    setMarkets((m) => (m.includes(b) ? m.filter((x) => x !== b) : [...m, b]));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (markets.length === 0) {
      setError("Pick at least one borough to map.");
      return;
    }
    setError(null);
    onSubmit({
      industry: data.get("industry") as Industry,
      description: String(data.get("description")).trim(),
      targetCustomer: String(data.get("targetCustomer")).trim(),
      customerPays: {
        amount: Number(data.get("pays")),
        per: data.get("per") as "month" | "purchase",
      },
      monthlyBudget: Number(data.get("budget")),
      markets: BOROUGHS.filter((b) => markets.includes(b)),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <p className="font-heading text-[clamp(1.6rem,3.6vw,2.75rem)] leading-[1.55] font-medium tracking-tight text-balance">
        We&rsquo;re a{" "}
        <label className="sr-only" htmlFor="industry">Industry</label>
        <select id="industry" name="industry" required defaultValue="" className={cn(blank, "cursor-pointer pr-2")}>
          <option value="" disabled>pick an industry</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i.toLowerCase()}</option>
          ))}
        </select>{" "}
        startup building{" "}
        <label className="sr-only" htmlFor="description">What the startup builds, in one sentence</label>
        <input id="description" name="description" required placeholder="a budgeting app for shared flats" className={cn(blank, "min-w-[12ch]")} />
        . Our customer is{" "}
        <label className="sr-only" htmlFor="targetCustomer">Target customer, in one sentence</label>
        <input id="targetCustomer" name="targetCustomer" required placeholder="young professionals who rent with roommates" className={cn(blank, "min-w-[16ch]")} />
        . They pay ${" "}
        <label className="sr-only" htmlFor="pays">What a customer pays, in US dollars</label>
        <input id="pays" name="pays" type="number" min={0} step="any" required placeholder="12" className={cn(blank, "min-w-[3ch] tabular-nums")} />{" "}
        per{" "}
        <label className="sr-only" htmlFor="per">Paid per</label>
        <select id="per" name="per" defaultValue="month" className={cn(blank, "cursor-pointer")}>
          <option value="month">month</option>
          <option value="purchase">purchase</option>
        </select>
        , and we can spend ${" "}
        <label className="sr-only" htmlFor="budget">Monthly advertising budget, in US dollars</label>
        <input id="budget" name="budget" type="number" min={0} step={100} required placeholder="3000" className={cn(blank, "min-w-[4ch] tabular-nums")} />{" "}
        a month on ads in:
      </p>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Boroughs to map
        </legend>
        <div className="flex flex-wrap gap-2">
          {BOROUGHS.map((b) => {
            const on = markets.includes(b);
            return (
              <button
                key={b}
                type="button"
                aria-pressed={on}
                onClick={() => toggleMarket(b)}
                className={cn(
                  "rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/25 text-foreground/60 hover:border-foreground/50",
                )}
              >
                {b}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy} className="h-12 gap-2 rounded-full px-6 text-base">
          {busy ? "Mapping your audience…" : "Map my audience"}
          <ArrowRight data-icon="inline-end" />
        </Button>
        {error && (
          <p role="alert" className="text-sm text-heat-hot">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
