"use client";

import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES, INDUSTRIES, type Brief, type Industry } from "@/lib/contract";
import { cn } from "@/lib/utils";

// The select popups render in a portal, outside the sentence, so they repeat
// its type size rather than inheriting it.
const sentenceType = "font-heading text-[clamp(1.6rem,3.6vw,2.75rem)] font-medium tracking-tight";

const blank =
  "max-w-full rounded-none border-0 [field-sizing:content] border-b-2 border-foreground/25 bg-transparent px-1 text-foreground outline-none transition-colors placeholder:text-foreground/30 hover:border-foreground/50 focus-visible:border-heat-cool focus-visible:bg-heat-cool/5";

const trigger =
  "inline-flex h-auto gap-1.5 py-0 pr-0.5 pl-1 text-[1em] cursor-pointer data-[size=default]:h-auto focus-visible:ring-0 data-placeholder:text-foreground/30 data-popup-open:border-heat-cool group-data-attempted/form:data-placeholder:border-heat-hot [&_svg]:size-[0.5em] [&_svg]:translate-y-[0.06em] [&_svg]:stroke-[2.5] [&_svg]:text-foreground/45";

type Option = { value: string; label: string; disabled?: boolean };

function BlankSelect({
  name,
  label,
  options,
  defaultValue = null,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Select name={name} items={options} defaultValue={defaultValue} required={required}>
      <SelectTrigger aria-label={label} className={cn(blank, trigger)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn(sentenceType, "w-auto min-w-(--anchor-width) rounded-2xl p-1.5 shadow-xl ring-foreground/10")}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled} className="rounded-xl py-[0.15em] pr-[1.4em] pl-[0.35em] text-[1em] leading-[1.4] [&_svg]:size-[0.5em] [&>span:last-child]:right-[0.4em] [&>span:last-child]:size-auto">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Labels follow "in" in the sentence, so a few read differently from their values.
const INDUSTRY_LABELS: Partial<Record<Industry, string>> = {
  "Consumer app": "consumer apps",
  Other: "another field",
};
const INDUSTRY_OPTIONS = INDUSTRIES.map((i) => ({ value: i, label: INDUSTRY_LABELS[i] ?? i.toLowerCase() }));
const PER_OPTIONS = [
  { value: "month", label: "month" },
  { value: "purchase", label: "purchase" },
];
const CITY_OPTIONS: Option[] = [
  ...CITIES.map((c) => ({ value: c.id, label: c.name })),
  { value: "more", label: "more cities coming", disabled: true },
];

// Text inputs rather than type="number": they size to their content and have
// no spinner arrows. `pattern` keeps the browser's validation.
const money = { type: "text", inputMode: "decimal", required: true, autoComplete: "off" } as const;

const SAMPLE_BRIEF: Brief = {
  industry: "Fintech",
  description: "a budgeting app for shared flats",
  targetCustomer: "young professionals in tech who rent with roommates",
  customerPays: { amount: 12, per: "month" },
  monthlyBudget: 3000,
  city: CITIES[0].id,
  markets: [...CITIES[0].areas],
};

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
    const empty = ["industry", "description", "targetCustomer", "pays", "budget"]
      .every((name) => !data.get(name));
    if (empty && data.get("per") === "month" && data.get("city") === CITIES[0].id) {
      onSubmit(SAMPLE_BRIEF);
      return;
    }
    // A select's own input is hidden, so the browser's error bubble never shows
    // for it; data-attempted underlines an unpicked select instead.
    e.currentTarget.dataset.attempted = "";
    if (!e.currentTarget.reportValidity()) return;

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
    <form noValidate onSubmit={handleSubmit} className="group/form flex flex-col gap-16">
      <p className={cn(sentenceType, "leading-[1.55] text-balance")}>
        Our company is{" "}
        <label className="sr-only" htmlFor="description">What the company is, in a few words</label>
        <input id="description" name="description" required placeholder="a budgeting app" className={cn(blank, "min-w-[12ch]")} />{" "}
        in{" "}
        <span className="whitespace-nowrap">
          <BlankSelect name="industry" label="Industry" options={INDUSTRY_OPTIONS} placeholder="fintech" required />.
        </span>{" "}
        We want to reach{" "}
        <label className="sr-only" htmlFor="targetCustomer">The customers the company wants to reach</label>
        <input id="targetCustomer" name="targetCustomer" required placeholder="young renters in tech" className={cn(blank, "min-w-[12ch]")} />{" "}
        who would pay{" "}
        <label className="sr-only" htmlFor="pays">What a customer pays, in US dollars</label>
        <span className="whitespace-nowrap">
          $<input id="pays" name="pays" {...money} pattern="[0-9]+([.][0-9]{1,2})?" placeholder="12" className={cn(blank, "ml-1 min-w-[1ch] tabular-nums")} />
        </span>{" "}
        per{" "}
        <span className="whitespace-nowrap">
          <BlankSelect name="per" label="Paid per" options={PER_OPTIONS} defaultValue="month" />,
        </span>{" "}
        and we can spend{" "}
        <label className="sr-only" htmlFor="budget">Monthly advertising budget, in US dollars</label>
        <span className="whitespace-nowrap">
          $<input id="budget" name="budget" {...money} pattern="[0-9]+" placeholder="3000" className={cn(blank, "ml-1 min-w-[1ch] tabular-nums")} />
        </span>{" "}
        a month on ads in{" "}
        <span className="whitespace-nowrap">
          <BlankSelect name="city" label="City" options={CITY_OPTIONS} defaultValue={CITIES[0].id} />.
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy} className="h-14 gap-3 rounded-full pr-6 pl-7 text-lg [&_svg:not([class*='size-'])]:size-5">
          {busy ? "Mapping your audience…" : "Map my audience"}
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
