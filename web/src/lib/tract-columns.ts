import type { Measure } from "@/lib/contract";

/** One entry of `data/analysis/columns.json`, which `tools.analyze` writes. */
export type TractColumn = {
  name: string;
  /** The same column ranked across the city from 0 to 1, so weighted columns can be added. */
  scaled: string;
  description: string;
  measures: Measure;
};
