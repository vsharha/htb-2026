import type { Metadata } from "next";

import { DeckLoader } from "@/components/presentation/deck-loader";

export const metadata: Metadata = {
  title: "Placewise pitch",
  description: "The Placewise pitch deck, with a live demo of the app.",
};

export default function PresentationPage() {
  return <DeckLoader />;
}
