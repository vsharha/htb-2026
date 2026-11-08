"use client";

import Image from "next/image";
import { useState } from "react";

import { logoUrl, monogram } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** A competitor's brand mark, or its initials when the site has no usable icon. */
export function CompetitorLogo({ name, website, className }: { name: string; website: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(website);

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
    >
      {src && !failed ? (
        <Image src={src} alt="" width={64} height={64} unoptimized className="size-full object-contain p-1.5" onError={() => setFailed(true)} />
      ) : (
        <span className="font-heading text-xs font-semibold text-muted-foreground">{monogram(name)}</span>
      )}
    </span>
  );
}
