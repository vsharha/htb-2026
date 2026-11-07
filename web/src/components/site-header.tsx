import { ChevronDown, MapPin } from "lucide-react";

import { CITIES } from "@/lib/contract";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <span className="font-heading text-2xl font-bold tracking-tight">Placewise</span>
      <label className="relative flex items-center gap-2 rounded-full border-2 border-foreground/25 py-1.5 pr-3 pl-3 text-sm font-medium transition-colors focus-within:border-heat-cool hover:border-foreground/50">
        <MapPin className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">City</span>
        <select
          name="city"
          defaultValue={CITIES[0].id}
          className="cursor-pointer appearance-none bg-transparent pr-5 outline-none"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option disabled>More cities coming</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 size-4" aria-hidden />
      </label>
    </header>
  );
}
