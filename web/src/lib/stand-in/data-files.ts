import { readFile } from "node:fs/promises";
import path from "node:path";

const ANALYSIS_DIR = path.join(process.cwd(), "..", "data", "analysis");

/** Parses the CSV files `tools.analyze` writes, which contain no quoted fields. */
export async function readAnalysisCsv(name: string) {
  const text = await readFile(path.join(ANALYSIS_DIR, name), "utf8");
  const [header, ...lines] = text.trim().split("\n");
  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(keys.map((k, i) => [k, values[i] ?? ""]));
  });
}

export async function readAnalysisJson<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(path.join(ANALYSIS_DIR, name), "utf8"));
}

/** A number from 0 to 1 that depends only on the string, so stand-in output is stable between runs. */
export function hashUnit(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
