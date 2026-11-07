"use client";

import { useEffect } from "react";

import { ResultsSplit } from "@/components/results-split";
import { useAudienceRun } from "@/components/use-audience-run";
import { BOROUGHS, type Brief } from "@/lib/contract";

const SAMPLE_BRIEF: Brief = {
  industry: "Fintech",
  description: "a budgeting app for shared flats",
  targetCustomer: "young professionals in tech who rent with roommates",
  customerPays: { amount: 12, per: "month" },
  monthlyBudget: 3000,
  city: "new-york",
  markets: [...BOROUGHS],
};

/** Runs a fixed brief on load, so the results can be designed without filling in the form. */
export function SampleRun() {
  const { run, start } = useAudienceRun();

  useEffect(() => {
    start(SAMPLE_BRIEF);
  }, [start]);

  return run && <ResultsSplit run={run} brief={SAMPLE_BRIEF} />;
}
