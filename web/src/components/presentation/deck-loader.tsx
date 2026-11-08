"use client";

import dynamic from "next/dynamic";

/**
 * Spectacle reads `window.location` and `matchMedia` while it renders, so the
 * deck is loaded in the browser only and never prerendered.
 */
const PitchDeck = dynamic(() => import("./pitch-deck").then((module) => module.PitchDeck), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-background" />,
});

export function DeckLoader() {
  return <PitchDeck />;
}
