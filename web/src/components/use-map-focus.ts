"use client";

import { useCallback, useState } from "react";

/**
 * Which map item the pointer is over, and which was last clicked and where,
 * shared by the map markers and the sidebar rows. A click in the list moves
 * the map to the item; a click on the map scrolls the list to its row.
 * Placements and campaigns each get their own instance.
 */
export type MapFocus = {
  hovered: string | null;
  selected: { id: string; from: "map" | "list"; at: number } | null;
  hover: (id: string | null) => void;
  select: (id: string, from: "map" | "list") => void;
};

export function useMapFocus(): MapFocus {
  const [hovered, hover] = useState<string | null>(null);
  const [selected, setSelected] = useState<MapFocus["selected"]>(null);
  const select = useCallback((id: string, from: "map" | "list") => {
    setSelected({ id, from, at: Date.now() });
  }, []);
  return { hovered, selected, hover, select };
}
